/**
 * Register API Route
 * POST /api/auth/register
 */

import { NextResponse } from 'next/server';
import { register } from '@/services/auth.service';

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { empId, password, confirmPassword } = body;

    // Validate input
    if (!empId || !password || !confirmPassword) {
      return NextResponse.json(
        { success: false, error: 'กรุณากรอกข้อมูลให้ครบถ้วน' },
        { status: 400 }
      );
    }

    // Attempt registration
    const result = await register({ empId, password, confirmPassword });

    return NextResponse.json({
      success: true,
      user: result.user,
      message: 'ลงทะเบียนสำเร็จ',
    });
  } catch (error) {
    console.error('Registration error:', error);

    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : 'ลงทะเบียนไม่สำเร็จ',
      },
      { status: 400 }
    );
  }
}
