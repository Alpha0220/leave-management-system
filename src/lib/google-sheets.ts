/**
 * Google Sheets Client
 * Handles connection and operations with Google Sheets API
 */

import { google } from 'googleapis';
import { retryWithBackoff } from './utils';

const SCOPES = ['https://www.googleapis.com/auth/spreadsheets'];

let sheetsClient: ReturnType<typeof google.sheets> | null = null;
let lastInitTime = 0;
const CACHE_DURATION = 30000; // 30 seconds

/**
 * Initialize Google Sheets client with Service Account
 */
export function getGoogleSheetsClient() {
  // Return cached client if still valid
  if (sheetsClient && Date.now() - lastInitTime < CACHE_DURATION) {
    return sheetsClient;
  }

  const email = process.env.GOOGLE_SERVICE_ACCOUNT_EMAIL;
  const privateKey = process.env.GOOGLE_PRIVATE_KEY?.replace(/\\n/g, '\n');

  if (!email || !privateKey) {
    throw new Error(
      'Missing Google Sheets credentials. Please set GOOGLE_SERVICE_ACCOUNT_EMAIL and GOOGLE_PRIVATE_KEY in .env.local'
    );
  }

  const auth = new google.auth.JWT({
    email,
    key: privateKey,
    scopes: SCOPES
  });

  sheetsClient = google.sheets({ version: 'v4', auth });
  lastInitTime = Date.now();

  return sheetsClient;
}

/**
 * Get spreadsheet ID from environment
 */
export function getSpreadsheetId(): string {
  const sheetId = process.env.GOOGLE_SHEET_ID;
  
  if (!sheetId) {
    throw new Error('Missing GOOGLE_SHEET_ID in .env.local');
  }
  
  return sheetId;
}

/**
 * Read data from a sheet
 */
export async function readSheet(sheetName: string, range?: string) {
  const sheets = getGoogleSheetsClient();
  const spreadsheetId = getSpreadsheetId();
  const fullRange = range ? `${sheetName}!${range}` : sheetName;

  return retryWithBackoff(async () => {
    const response = await sheets.spreadsheets.values.get({
      spreadsheetId,
      range: fullRange
    });

    return response.data.values || [];
  });
}

/**
 * Write data to a sheet
 */
export async function writeSheet(
  sheetName: string,
  range: string,
  values: (string | number | boolean)[][]
) {
  const sheets = getGoogleSheetsClient();
  const spreadsheetId = getSpreadsheetId();

  return retryWithBackoff(async () => {
    await sheets.spreadsheets.values.update({
      spreadsheetId,
      range: `${sheetName}!${range}`,
      valueInputOption: 'RAW',
      requestBody: { values }
    });
  });
}

/**
 * Append data to a sheet
 */
export async function appendSheet(sheetName: string, values: (string | number | boolean)[][]) {
  const sheets = getGoogleSheetsClient();
  const spreadsheetId = getSpreadsheetId();

  return retryWithBackoff(async () => {
    await sheets.spreadsheets.values.append({
      spreadsheetId,
      range: sheetName,
      valueInputOption: 'RAW',
      requestBody: { values }
    });
  });
}

/**
 * Clear a sheet range
 */
export async function clearSheet(sheetName: string, range?: string) {
  const sheets = getGoogleSheetsClient();
  const spreadsheetId = getSpreadsheetId();
  const fullRange = range ? `${sheetName}!${range}` : sheetName;

  return retryWithBackoff(async () => {
    await sheets.spreadsheets.values.clear({
      spreadsheetId,
      range: fullRange
    });
  });
}

/**
 * Create a new sheet in the spreadsheet
 */
export async function createSheet(sheetName: string) {
  const sheets = getGoogleSheetsClient();
  const spreadsheetId = getSpreadsheetId();

  return retryWithBackoff(async () => {
    await sheets.spreadsheets.batchUpdate({
      spreadsheetId,
      requestBody: {
        requests: [
          {
            addSheet: {
              properties: {
                title: sheetName
              }
            }
          }
        ]
      }
    });
  });
}

/**
 * Check if a sheet exists
 */
export async function sheetExists(sheetName: string): Promise<boolean> {
  const sheets = getGoogleSheetsClient();
  const spreadsheetId = getSpreadsheetId();

  try {
    const response = await sheets.spreadsheets.get({
      spreadsheetId
    });

    const sheetTitles = response.data.sheets?.map(
      sheet => sheet.properties?.title
    ) || [];

    return sheetTitles.includes(sheetName);
  } catch (error) {
    console.error('Error checking sheet existence:', error);
    return false;
  }
}

/**
 * Update a specific cell
 */
export async function updateCell(
  sheetName: string,
  row: number,
  col: number,
  value: string | number | boolean
) {
  const colLetter = String.fromCharCode(65 + col); // A=0, B=1, etc.
  const range = `${colLetter}${row + 1}`;
  await writeSheet(sheetName, range, [[String(value)]]);
}

/**
 * Batch update multiple ranges
 */
export async function batchUpdate(
  updates: Array<{ sheetName: string; range: string; values: (string | number | boolean)[][] }>
) {
  const sheets = getGoogleSheetsClient();
  const spreadsheetId = getSpreadsheetId();

  const data = updates.map(update => ({
    range: `${update.sheetName}!${update.range}`,
    values: update.values
  }));

  return retryWithBackoff(async () => {
    await sheets.spreadsheets.values.batchUpdate({
      spreadsheetId,
      requestBody: {
        valueInputOption: 'RAW',
        data
      }
    });
  });
}
