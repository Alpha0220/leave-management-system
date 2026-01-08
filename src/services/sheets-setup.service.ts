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
      'maternityLeaveQuota',
      'sterilizationLeaveQuota',
      'unpaidLeaveQuota',
      'compassionateLeaveQuota',
      'isRegistered',
      'createdAt'
    ];

    await writeSheet(SHEET_NAMES.USERS, 'A1:M1', [headers]);

    // Add default admin user
    const adminRow = [
      DEFAULT_ADMIN.empId,
      DEFAULT_ADMIN.name,
      DEFAULT_ADMIN.password,
      DEFAULT_ADMIN.role,
      DEFAULT_ADMIN.leaveQuota,
      DEFAULT_ADMIN.sickLeaveQuota,
      DEFAULT_ADMIN.personalLeaveQuota,
      DEFAULT_ADMIN.maternityLeaveQuota,
      DEFAULT_ADMIN.sterilizationLeaveQuota,
      DEFAULT_ADMIN.unpaidLeaveQuota,
      DEFAULT_ADMIN.compassionateLeaveQuota,
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
 * Run migration to update existing sheets to latest version
 */
export async function runMigration(): Promise<{ success: boolean; message: string }> {
  console.log('🔄 Starting database migration...');
  
  try {
    const { readSheet, writeSheet, clearSheet } = await import('@/lib/google-sheets');
    const { DEFAULT_QUOTAS } = await import('@/lib/constants');

    // 1. Update Users Sheet
    const userRows = await readSheet(SHEET_NAMES.USERS);
    const targetHeader = [
      'empId', 'name', 'password', 'role', 
      'leaveQuota', 'sickLeaveQuota', 'personalLeaveQuota', 
      'maternityLeaveQuota', 'sterilizationLeaveQuota', 'unpaidLeaveQuota', 'compassionateLeaveQuota',
      'isRegistered', 'createdAt'
    ];

    if (userRows.length > 0) {
      const currentHeader = userRows[0];
      const isHeaderCorrect = targetHeader.every((h, i) => currentHeader[i] === h);
      
      if (!isHeaderCorrect || currentHeader.length < 13) {
        console.log('📝 Migrating Users sheet schema and fixing headers...');
        
        const updatedRows = userRows.slice(1).map(row => {
          // If the row already has 13 columns but perhaps wrong headers, we need to decide how to keep data
          // If it was 9 columns: 
          // 0:empId, 1:name, 2:password, 3:role, 4:lQ, 5:sLQ, 6:pLQ, 7:isReg, 8:cAt
          
          let isReg = 'false';
          let cat = new Date().toISOString();
          let maternity: number = DEFAULT_QUOTAS.MATERNITY_LEAVE;
          let sterilization: number = DEFAULT_QUOTAS.STERILIZATION_LEAVE;
          let unpaid: number = DEFAULT_QUOTAS.UNPAID_LEAVE;
          let compassionate: number = DEFAULT_QUOTAS.COMPASSIONATE_LEAVE;

          if (row.length <= 10) {
            // Old 9-col (or 10-col) format
            isReg = String(row[7] || 'false');
            cat = String(row[8] || new Date().toISOString());
          } else {
            // Current messy 13-col format or something else
            // Let's try to preserve what looks like quota data
            maternity = parseInt(String(row[7])) || DEFAULT_QUOTAS.MATERNITY_LEAVE;
            sterilization = parseInt(String(row[8])) || DEFAULT_QUOTAS.STERILIZATION_LEAVE;
            unpaid = parseInt(String(row[9])) || DEFAULT_QUOTAS.UNPAID_LEAVE;
            compassionate = parseInt(String(row[10])) || DEFAULT_QUOTAS.COMPASSIONATE_LEAVE;
            isReg = String(row[11] || 'false');
            cat = String(row[12] || new Date().toISOString());
          }
          
          return [
            row[0] || '', // empId
            row[1] || '', // name
            row[2] || '', // password
            row[3] || 'employee', // role
            row[4] || 0,  // leaveQuota
            row[5] || 0,  // sickLeaveQuota
            row[6] || 0,  // personalLeaveQuota
            maternity,
            sterilization,
            unpaid,
            compassionate,
            isReg,
            cat
          ];
        });

        const finalRows = [targetHeader, ...updatedRows] as (string | number | boolean)[][];
        await clearSheet(SHEET_NAMES.USERS);
        await writeSheet(SHEET_NAMES.USERS, `A1:M${finalRows.length}`, finalRows);
        console.log('✅ Users sheet migrated and headers corrected');
      }
    }

    // 2. Update Settings Sheet (Add new leave type defaults if missing)
    const settingsRows = await readSheet(SHEET_NAMES.SETTINGS);
    if (settingsRows.length > 0) {
      const existingKeys = new Set(settingsRows.slice(1).map(r => String(r[0])));
      const currentYear = new Date().getFullYear().toString();
      const newSettings = [];

      if (!existingKeys.has('maternityLeaveMax')) newSettings.push(['maternityLeaveMax', '120', currentYear]);
      if (!existingKeys.has('sterilizationLeaveMax')) newSettings.push(['sterilizationLeaveMax', '999', currentYear]);
      if (!existingKeys.has('unpaidLeaveMax')) newSettings.push(['unpaidLeaveMax', '999', currentYear]);
      if (!existingKeys.has('compassionateLeaveMax')) newSettings.push(['compassionateLeaveMax', '3', currentYear]);

      if (newSettings.length > 0) {
        console.log('📝 Adding new default settings...');
        await appendSheet(SHEET_NAMES.SETTINGS, newSettings);
        console.log('✅ Settings sheet updated');
      }
    }

    return { 
      success: true, 
      message: 'Database migrated successfully to version 2.0' 
    };
  } catch (error) {
    console.error('❌ Migration error:', error);
    return { 
      success: false, 
      message: error instanceof Error ? error.message : 'Unknown migration error' 
    };
  }
}
