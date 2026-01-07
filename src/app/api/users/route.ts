/**
 * Users API Route
 * GET /api/users - Get all users
 * POST /api/users - Create new user
 */

import { NextResponse } from 'next/server';
import { getAllUsers, createUser } from '@/services/user.service';

export async function GET() {
  try {
    const users = await getAllUsers();

    // Return users without passwords
    const safeUsers = users.map(user => ({
      empId: user.empId,
      name: user.name,
      role: user.role,
      isRegistered: user.isRegistered,
      leaveQuota: user.leaveQuota,
      sickLeaveQuota: user.sickLeaveQuota,
      personalLeaveQuota: user.personalLeaveQuota,
    }));

    return NextResponse.json({
      success: true,
      users: safeUsers,
    });
  } catch (error) {
    console.error('Get users error:', error);

    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : 'ไม่สามารถโหลดข้อมูลได้',
      },
      { status: 500 }
    );
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { empId, name, role, leaveQuota, sickLeaveQuota, personalLeaveQuota } = body;

    // Validate input
    if (!empId || !name || !role) {
      return NextResponse.json(
        { success: false, error: 'กรุณากรอกข้อมูลให้ครบถ้วน' },
        { status: 400 }
      );
    }

    // Create user
    const user = await createUser({
      empId,
      name,
      role,
      leaveQuota: leaveQuota || 10,
      sickLeaveQuota: sickLeaveQuota || 30,
      personalLeaveQuota: personalLeaveQuota || 6,
    });

    return NextResponse.json({
      success: true,
      user,
      message: 'เพิ่มพนักงานสำเร็จ',
    });
  } catch (error) {
    console.error('Create user error:', error);

    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : 'เพิ่มพนักงานไม่สำเร็จ',
      },
      { status: 400 }
    );
  }
}
