/**
 * Debug API - Check environment variables and connection
 * GET /api/debug
 */

import { NextResponse } from 'next/server';

export async function GET() {
  const debug = {
    timestamp: new Date().toISOString(),
    environment: {
      hasServiceAccountEmail: !!process.env.GOOGLE_SERVICE_ACCOUNT_EMAIL,
      hasPrivateKey: !!process.env.GOOGLE_PRIVATE_KEY,
      hasSheetId: !!process.env.GOOGLE_SHEET_ID,
      serviceAccountEmail: process.env.GOOGLE_SERVICE_ACCOUNT_EMAIL || 'NOT SET',
      sheetId: process.env.GOOGLE_SHEET_ID || 'NOT SET',
      privateKeyLength: process.env.GOOGLE_PRIVATE_KEY?.length || 0,
      privateKeyPreview: process.env.GOOGLE_PRIVATE_KEY?.substring(0, 50) + '...' || 'NOT SET'
    },
    issues: [] as string[]
  };

  // Check for common issues
  if (!process.env.GOOGLE_SERVICE_ACCOUNT_EMAIL) {
    debug.issues.push('❌ GOOGLE_SERVICE_ACCOUNT_EMAIL is not set');
  }

  if (!process.env.GOOGLE_PRIVATE_KEY) {
    debug.issues.push('❌ GOOGLE_PRIVATE_KEY is not set');
  } else {
    if (!process.env.GOOGLE_PRIVATE_KEY.includes('BEGIN PRIVATE KEY')) {
      debug.issues.push('⚠️ GOOGLE_PRIVATE_KEY might be malformed (missing BEGIN PRIVATE KEY)');
    }
    if (!process.env.GOOGLE_PRIVATE_KEY.includes('\\n')) {
      debug.issues.push('⚠️ GOOGLE_PRIVATE_KEY might be missing \\n characters');
    }
  }

  if (!process.env.GOOGLE_SHEET_ID) {
    debug.issues.push('❌ GOOGLE_SHEET_ID is not set');
  } else {
    // Extract sheet ID from URL if full URL was provided
    const sheetIdMatch = process.env.GOOGLE_SHEET_ID.match(/\/d\/([a-zA-Z0-9-_]+)/);
    if (sheetIdMatch) {
      debug.issues.push(`ℹ️ Sheet ID extracted from URL: ${sheetIdMatch[1]}`);
    }
  }

  if (debug.issues.length === 0) {
    debug.issues.push('✅ All environment variables are set');
  }

  return NextResponse.json(debug);
}
