/**
 * Test Google Sheets Connection
 * GET /api/test-sheets
 */

import { NextResponse } from 'next/server';
import { initializeSheets, checkSheetsInitialized } from '@/services/sheets-setup.service';
import { getAllUsers } from '@/services/user.service';

export async function GET() {
  try {
    console.log('🔍 Testing Google Sheets connection...');

    // Check if sheets are already initialized
    const isInitialized = await checkSheetsInitialized();
    
    if (!isInitialized) {
      console.log('📝 Sheets not initialized. Creating sheets...');
      await initializeSheets();
      console.log('✅ Sheets created successfully!');
    } else {
      console.log('✅ Sheets already exist');
    }

    // Try to read users
    const users = await getAllUsers();
    console.log(`📊 Found ${users.length} users in the system`);

    return NextResponse.json({
      success: true,
      message: 'Google Sheets connection successful!',
      data: {
        isInitialized: true,
        userCount: users.length,
        users: users.map(u => ({
          empId: u.empId,
          name: u.name,
          role: u.role,
          isRegistered: u.isRegistered
        }))
      }
    });

  } catch (error) {
    console.error('❌ Error testing Google Sheets:', error);
    
    return NextResponse.json({
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error',
      details: String(error)
    }, { status: 500 });
  }
}
