/**
 * Create Leave Request API Route
 * POST /api/leaves
 */

import { NextResponse } from 'next/server';
import { createLeave } from '@/services/leave.service';

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
