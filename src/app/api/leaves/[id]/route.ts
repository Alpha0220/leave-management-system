/**
 * Update Leave Status API Route
 * PATCH /api/leaves/[id]
 */

import { NextResponse } from 'next/server';
import { updateLeaveStatus } from '@/services/leave.service';

export async function PATCH(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const body = await request.json();
    const { status, approverNote } = body;

    // Validate input
    if (!status || !['approved', 'rejected'].includes(status)) {
      return NextResponse.json(
        { success: false, error: 'สถานะไม่ถูกต้อง' },
        { status: 400 }
      );
    }

    // Update leave status
    await updateLeaveStatus(id, status, approverNote);

    return NextResponse.json({
      success: true,
      message: status === 'approved' ? 'อนุมัติคำขอลาสำเร็จ' : 'ปฏิเสธคำขอลาสำเร็จ',
    });
  } catch (error) {
    console.error('Update leave status error:', error);

    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : 'อัพเดทสถานะไม่สำเร็จ',
      },
      { status: 500 }
    );
  }
}
