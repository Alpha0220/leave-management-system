/**
 * Google Sheets Setup Service
 * Auto-creates sheets and initializes data on first run
 */

'use server';

import {
  sheetExists,
  createSheet,
  writeSheet,
  appendSheet
} from '@/lib/google-sheets';
import { SHEET_NAMES, DEFAULT_ADMIN, DEFAULT_HOLIDAYS_2025 } from '@/lib/constants';

/**
 * Initialize all required sheets
 */
export async function initializeSheets(): Promise<void> {
  console.log('🔄 Checking Google Sheets setup...');

  try {
    await createUsersSheetIfNotExists();
    await createLeavesSheetIfNotExists();
    await createSettingsSheetIfNotExists();
    await createHolidaysSheetIfNotExists();

    console.log('✅ Google Sheets setup complete!');
  } catch (error) {
    console.error('❌ Error initializing sheets:', error);
    throw new Error('Failed to initialize Google Sheets');
  }
}

/**
 * Create Users sheet with headers and default admin
 */
async function createUsersSheetIfNotExists() {
  const exists = await sheetExists(SHEET_NAMES.USERS);

  if (!exists) {
    console.log('📝 Creating Users sheet...');
    
    await createSheet(SHEET_NAMES.USERS);

    // Add headers
    const headers = [
      'empId',
      'name',
      'password',
      'role',
      'leaveQuota',
      'sickLeaveQuota',
      'personalLeaveQuota',
      'isRegistered',
      'createdAt'
    ];

    await writeSheet(SHEET_NAMES.USERS, 'A1:I1', [headers]);

    // Add default admin user
    const adminRow = [
      DEFAULT_ADMIN.empId,
      DEFAULT_ADMIN.name,
      DEFAULT_ADMIN.password,
      DEFAULT_ADMIN.role,
      DEFAULT_ADMIN.leaveQuota,
      DEFAULT_ADMIN.sickLeaveQuota,
      DEFAULT_ADMIN.personalLeaveQuota,
      DEFAULT_ADMIN.isRegistered.toString(),
      new Date().toISOString()
    ];

    await appendSheet(SHEET_NAMES.USERS, [adminRow]);

    console.log('✅ Users sheet created with default admin');
  } else {
    console.log('✓ Users sheet already exists');
  }
}

/**
 * Create Leaves sheet with headers
 */
async function createLeavesSheetIfNotExists() {
  const exists = await sheetExists(SHEET_NAMES.LEAVES);

  if (!exists) {
    console.log('📝 Creating Leaves sheet...');
    
    await createSheet(SHEET_NAMES.LEAVES);

    const headers = [
      'id',
      'empId',
      'type',
      'startDate',
      'endDate',
      'totalDays',
      'reason',
      'status',
      'approverNote',
      'createdAt',
      'updatedAt'
    ];

    await writeSheet(SHEET_NAMES.LEAVES, 'A1:K1', [headers]);

    console.log('✅ Leaves sheet created');
  } else {
    console.log('✓ Leaves sheet already exists');
  }
}

/**
 * Create Settings sheet with headers and default values
 */
async function createSettingsSheetIfNotExists() {
  const exists = await sheetExists(SHEET_NAMES.SETTINGS);

  if (!exists) {
    console.log('📝 Creating Settings sheet...');
    
    await createSheet(SHEET_NAMES.SETTINGS);

    const headers = ['key', 'value', 'year'];
    await writeSheet(SHEET_NAMES.SETTINGS, 'A1:C1', [headers]);

    // Add default settings for 2025
    const currentYear = new Date().getFullYear();
    const defaultSettings = [
      ['annualLeaveMax', '10', currentYear.toString()],
      ['sickLeaveMax', '30', currentYear.toString()],
      ['personalLeaveMax', '6', currentYear.toString()],
      ['minAdvanceNoticeDays', '3', currentYear.toString()],
      ['carryOverEnabled', 'false', currentYear.toString()],
      ['carryOverMaxDays', '5', currentYear.toString()]
    ];

    await appendSheet(SHEET_NAMES.SETTINGS, defaultSettings);

    console.log('✅ Settings sheet created with default values');
  } else {
    console.log('✓ Settings sheet already exists');
  }
}

/**
 * Create Holidays sheet with Thai public holidays
 */
async function createHolidaysSheetIfNotExists() {
  const exists = await sheetExists(SHEET_NAMES.HOLIDAYS);

  if (!exists) {
    console.log('📝 Creating Holidays sheet...');
    
    await createSheet(SHEET_NAMES.HOLIDAYS);

    const headers = ['date', 'name'];
    await writeSheet(SHEET_NAMES.HOLIDAYS, 'A1:B1', [headers]);

    // Add Thai public holidays for 2025
    const holidayRows = DEFAULT_HOLIDAYS_2025.map(h => [h.date, h.name]);
    await appendSheet(SHEET_NAMES.HOLIDAYS, holidayRows);

    console.log(`✅ Holidays sheet created with ${DEFAULT_HOLIDAYS_2025.length} holidays`);
  } else {
    console.log('✓ Holidays sheet already exists');
  }
}

/**
 * Check if sheets are initialized
 */
export async function checkSheetsInitialized(): Promise<boolean> {
  try {
    const usersExists = await sheetExists(SHEET_NAMES.USERS);
    const leavesExists = await sheetExists(SHEET_NAMES.LEAVES);
    const settingsExists = await sheetExists(SHEET_NAMES.SETTINGS);
    const holidaysExists = await sheetExists(SHEET_NAMES.HOLIDAYS);

    return usersExists && leavesExists && settingsExists && holidaysExists;
  } catch (error) {
    console.error('Error checking sheets:', error);
    return false;
  }
}
