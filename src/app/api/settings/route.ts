/**
 * Settings API Route
 * POST /api/settings - Save settings
 * GET /api/settings - Get settings
 */

import { NextResponse } from 'next/server';
import { getPolicySettings } from '@/services/settings.service';

export async function GET() {
  try {
    const currentYear = new Date().getFullYear();
    const settings = await getPolicySettings(currentYear);

    return NextResponse.json({
      success: true,
      settings,
    });
  } catch (error) {
    console.error('Get settings error:', error);

    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : 'ไม่สามารถโหลดการตั้งค่าได้',
      },
      { status: 500 }
    );
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { 
      defaultAnnualLeave, 
      defaultSickLeave, 
      defaultPersonalLeave,
      defaultMaternityLeave,
      defaultSterilizationLeave,
      defaultUnpaidLeave,
      defaultCompassionateLeave
    } = body;
    const currentYear = new Date().getFullYear();

    // Update all settings at once
    const { updateSettings } = await import('@/services/settings.service');
    await updateSettings([
      { key: 'annualLeaveMax', value: String(defaultAnnualLeave ?? 10) },
      { key: 'sickLeaveMax', value: String(defaultSickLeave ?? 30) },
      { key: 'personalLeaveMax', value: String(defaultPersonalLeave ?? 6) },
      { key: 'maternityLeaveMax', value: String(defaultMaternityLeave ?? 120) },
      { key: 'sterilizationLeaveMax', value: String(defaultSterilizationLeave ?? 999) },
      { key: 'unpaidLeaveMax', value: String(defaultUnpaidLeave ?? 999) },
      { key: 'compassionateLeaveMax', value: String(defaultCompassionateLeave ?? 3) },
    ], currentYear);

    return NextResponse.json({
      success: true,
      message: 'บันทึกการตั้งค่าสำเร็จ',
    });
  } catch (error) {
    console.error('Update settings error:', error);

    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : 'บันทึกการตั้งค่าไม่สำเร็จ',
      },
      { status: 500 }
    );
  }
}
