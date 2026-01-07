/**
 * Logout API Route
 * POST /api/auth/logout
 */

import { NextResponse } from 'next/server';

export async function POST() {
  // For simple auth, logout is handled client-side
  // This endpoint exists for consistency and future enhancements
  return NextResponse.json({
    success: true,
    message: 'ออกจากระบบสำเร็จ',
  });
}
