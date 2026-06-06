/**
 * Migration API Route
 * Migrate data from localStorage to Google Sheets
 * GET /api/migrate
 */

import { NextResponse } from 'next/server';
import { initializeSheets } from '@/services/sheets-setup.service';
import { createUser } from '@/services/user.service';
import { createLeave } from '@/services/leave.service';

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { users, leaves } = body;

    console.log('🔄 Starting migration to Google Sheets...');

    // Step 1: Initialize Google Sheets (create sheets and default admin)
    console.log('📝 Step 1: Initializing Google Sheets...');
    await initializeSheets();
    console.log('✅ Sheets initialized');

    // Step 2: Migrate Users (skip default admin)
    console.log('📝 Step 2: Migrating users...');
    let migratedUsers = 0;
    
    if (users && Array.isArray(users)) {
      for (const user of users) {
        // Skip default admin (already created)
        if (user.empId === 'ADMIN001') {
          console.log('⏭️  Skipping default admin');
          continue;
        }

        try {
          await createUser({
            empId: user.empId,
            name: user.name,
            role: user.role,
            leaveQuota: user.leaveQuota,
            sickLeaveQuota: user.sickLeaveQuota,
            personalLeaveQuota: user.personalLeaveQuota || user.leaveQuota // fallback
          });

          // If user is registered, update password
          if (user.isRegistered && user.password) {
            const { updateUser } = await import('@/services/user.service');
            await updateUser(user.empId, {
              password: user.password,
              isRegistered: true
            });
          }

          migratedUsers++;
          console.log(`✅ Migrated user: ${user.empId} - ${user.name}`);
        } catch (error) {
          console.error(`❌ Failed to migrate user ${user.empId}:`, error);
        }
      }
    }

    // Step 3: Migrate Leave Requests
    console.log('📝 Step 3: Migrating leave requests...');
    let migratedLeaves = 0;

    if (leaves && Array.isArray(leaves)) {
      for (const leave of leaves) {
        try {
          await createLeave({
            empId: leave.empId,
            type: leave.type,
            startDate: leave.startDate,
            endDate: leave.endDate,
            reason: leave.reason
          });

          // If leave is approved/rejected, update status
          if (leave.status !== 'pending') {
            const { updateLeaveStatus } = await import('@/services/leave.service');
            const { getAllLeaves } = await import('@/services/leave.service');
            const allLeaves = await getAllLeaves();
            const createdLeave = allLeaves[allLeaves.length - 1]; // Get last created

            if (createdLeave) {
              await updateLeaveStatus(
                createdLeave.id,
                leave.status,
                leave.approverNote
              );
            }
          }

          migratedLeaves++;
          console.log(`✅ Migrated leave: ${leave.id} (${leave.type})`);
        } catch (error) {
          console.error(`❌ Failed to migrate leave ${leave.id}:`, error);
        }
      }
    }

    console.log('✅ Migration completed!');

    return NextResponse.json({
      success: true,
      message: 'Migration completed successfully!',
      data: {
        migratedUsers,
        migratedLeaves,
        totalUsers: users?.length || 0,
        totalLeaves: leaves?.length || 0
      }
    });

  } catch (error) {
    console.error('❌ Migration failed:', error);
    
    return NextResponse.json({
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error',
      details: String(error)
    }, { status: 500 });
  }
}

// Support GET for database schema migration
export async function GET() {
  try {
    const { runMigration } = await import('@/services/sheets-setup.service');
    const result = await runMigration();
    
    return NextResponse.json(result);
  } catch (error) {
    return NextResponse.json({
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 });
  }
}
