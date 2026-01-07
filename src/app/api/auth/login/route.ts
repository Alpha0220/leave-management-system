/**
 * Login API Route
 * POST /api/auth/login
 */

import { NextResponse } from 'next/server';
import { login } from '@/services/auth.service';

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { empId, password } = body;

    // Validate input
    if (!empId || !password) {
      return NextResponse.json(
        { success: false, error: 'กรุณากรอก Employee ID และรหัสผ่าน' },
        { status: 400 }
      );
    }

    // Attempt login
    const user = await login({ empId, password });

    return NextResponse.json({
      success: true,
      user,
      message: 'เข้าสู่ระบบสำเร็จ',
    });
  } catch (error) {
    console.error('Login error:', error);

    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : 'เข้าสู่ระบบไม่สำเร็จ',
      },
      { status: 401 }
    );
  }
}
