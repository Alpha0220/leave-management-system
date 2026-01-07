/**
 * Leaves API Route
 * GET /api/leaves?empId=xxx - Get leaves
 * POST /api/leaves - Create leave request
 */

import { NextResponse } from 'next/server';
import { getLeavesByEmpId, getAllLeaves, createLeave } from '@/services/leave.service';

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const empId = searchParams.get('empId');

    let leaves;
    
    if (empId) {
      // Get leaves for specific employee
      leaves = await getLeavesByEmpId(empId);
    } else {
      // Get all leaves (for admin)
      leaves = await getAllLeaves();
    }

    return NextResponse.json({
      success: true,
      leaves,
    });
  } catch (error) {
    console.error('Get leaves error:', error);

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
    const { empId, type, startDate, endDate, reason } = body;

    // Validate input
    if (!empId || !type || !startDate || !endDate || !reason) {
      return NextResponse.json(
        { success: false, error: 'กรุณากรอกข้อมูลให้ครบถ้วน' },
        { status: 400 }
      );
    }

    // Create leave request
    const leave = await createLeave({
      empId,
      type,
      startDate,
      endDate,
      reason,
    });

    return NextResponse.json({
      success: true,
      leave,
      message: 'ส่งคำขอลาสำเร็จ',
    });
  } catch (error) {
    console.error('Create leave error:', error);

    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : 'ส่งคำขอลาไม่สำเร็จ',
      },
      { status: 400 }
    );
  }
}
