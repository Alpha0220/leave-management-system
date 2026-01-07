/**
 * Settings API Route
 * POST /api/settings - Save settings
 * GET /api/settings - Get settings
 */

import { NextResponse } from 'next/server';
import { getPolicySettings, updateSetting } from '@/services/settings.service';

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
    const { defaultAnnualLeave, defaultSickLeave, defaultPersonalLeave } = body;
    const currentYear = new Date().getFullYear();

    // Update each setting
    await updateSetting('annualLeaveMax', String(defaultAnnualLeave || 10), currentYear);
    await updateSetting('sickLeaveMax', String(defaultSickLeave || 30), currentYear);
    await updateSetting('personalLeaveMax', String(defaultPersonalLeave || 6), currentYear);

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
