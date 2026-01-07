/**
 * User Management API Route
 * PATCH /api/users/[empId] - Update user
 * DELETE /api/users/[empId] - Delete user
 */

import { NextResponse } from 'next/server';
import { updateUser, deleteUser } from '@/services/user.service';
import type { UserUpdateInput } from '@/types';

export async function PATCH(
  request: Request,
  { params }: { params: Promise<{ empId: string }> }
) {
  try {
    const { empId } = await params;
    const body = await request.json();
    const { 
      name, 
      role, 
      leaveQuota, 
      sickLeaveQuota, 
      personalLeaveQuota,
      password,
      isRegistered
    } = body;

    // Construct updates object
    const updates: UserUpdateInput = {};
    if (name !== undefined) updates.name = name;
    if (role !== undefined) updates.role = role;
    if (leaveQuota !== undefined) updates.leaveQuota = leaveQuota;
    if (sickLeaveQuota !== undefined) updates.sickLeaveQuota = sickLeaveQuota;
    if (personalLeaveQuota !== undefined) updates.personalLeaveQuota = personalLeaveQuota;
    if (password !== undefined) updates.password = password;
    if (isRegistered !== undefined) updates.isRegistered = isRegistered;

    // Update user
    await updateUser(empId, updates);

    return NextResponse.json({
      success: true,
      message: 'อัพเดทข้อมูลสำเร็จ',
    });
  } catch (error) {
    console.error('Update user error:', error);

    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : 'อัพเดทข้อมูลไม่สำเร็จ',
      },
      { status: 500 }
    );
  }
}

export async function DELETE(
  request: Request,
  { params }: { params: Promise<{ empId: string }> }
) {
  try {
    const { empId } = await params;

    // Prevent deleting default admin
    if (empId === 'ADMIN001') {
      return NextResponse.json(
        { success: false, error: 'ไม่สามารถลบผู้ดูแลระบบหลักได้' },
        { status: 403 }
      );
    }

    // Delete user
    await deleteUser(empId);

    return NextResponse.json({
      success: true,
      message: 'ลบพนักงานสำเร็จ',
    });
  } catch (error) {
    console.error('Delete user error:', error);

    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : 'ลบพนักงานไม่สำเร็จ',
      },
      { status: 500 }
    );
  }
}
