/**
 * Get User by Employee ID API Route
 * GET /api/users/[empId]
 */

import { NextResponse } from 'next/server';
import { getUserByEmpId } from '@/services/user.service';

export async function GET(
  request: Request,
  { params }: { params: { empId: string } }
) {
  try {
    const { empId } = params;

    if (!empId) {
      return NextResponse.json(
        { success: false, error: 'Employee ID is required' },
        { status: 400 }
      );
    }

    const user = await getUserByEmpId(empId);

    if (!user) {
      return NextResponse.json(
        { success: false, error: 'User not found' },
        { status: 404 }
      );
    }

    // Return user data without password
    return NextResponse.json({
      success: true,
      user: {
        empId: user.empId,
        name: user.name,
        role: user.role,
        isRegistered: user.isRegistered,
        leaveQuota: user.leaveQuota,
        sickLeaveQuota: user.sickLeaveQuota,
        personalLeaveQuota: user.personalLeaveQuota,
      },
    });
  } catch (error) {
    console.error('Get user error:', error);

    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : 'Failed to get user',
      },
      { status: 500 }
    );
  }
}
