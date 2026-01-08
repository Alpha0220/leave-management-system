/**
 * Settings Service
 * Handles settings and holidays management in Google Sheets
 */

'use server';

import { readSheet, writeSheet, appendSheet, clearSheet } from '@/lib/google-sheets';
import { SHEET_NAMES } from '@/lib/constants';
import type { Setting, Holiday, PolicySettings } from '@/types';

/**
 * Get all settings for a specific year
 */
export async function getSettings(year: number): Promise<Setting[]> {
  const rows = await readSheet(SHEET_NAMES.SETTINGS);

  if (rows.length <= 1) {
    return [];
  }

  return rows
    .slice(1)
    .filter(row => row && row[0])
    .map(rowToSetting)
    .filter(s => s.year === year);
}

/**
 * Get policy settings for a specific year
 */
export async function getPolicySettings(year: number): Promise<PolicySettings> {
  const settings = await getSettings(year);

  const getValue = (key: string, defaultValue: number | boolean) => {
    const setting = settings.find(s => s.key === key);
    if (!setting) return defaultValue;
    
    if (typeof defaultValue === 'boolean') {
      return setting.value === 'true';
    }
    const val = parseInt(setting.value);
    return isNaN(val) ? defaultValue : val;
  };

  return {
    annualLeaveMax: getValue('annualLeaveMax', 10) as number,
    sickLeaveMax: getValue('sickLeaveMax', 30) as number,
    personalLeaveMax: getValue('personalLeaveMax', 6) as number,
    maternityLeaveMax: getValue('maternityLeaveMax', 120) as number,
    sterilizationLeaveMax: getValue('sterilizationLeaveMax', 999) as number,
    unpaidLeaveMax: getValue('unpaidLeaveMax', 999) as number,
    compassionateLeaveMax: getValue('compassionateLeaveMax', 3) as number,
    minAdvanceNoticeDays: getValue('minAdvanceNoticeDays', 3) as number,
    carryOverEnabled: getValue('carryOverEnabled', false) as boolean,
    carryOverMaxDays: getValue('carryOverMaxDays', 5) as number
  };
}

/**
 * Update multiple settings at once
 */
export async function updateSettings(
  updates: { key: string; value: string }[],
  year: number
): Promise<void> {
  const allRows = await readSheet(SHEET_NAMES.SETTINGS);
  const header = allRows[0] || ['key', 'value', 'year'];
  const settingsRows = allRows.slice(1);
  
  // Track which keys we updated
  const updatedKeys = new Set<string>();

  // Update existing rows
  const newRows = settingsRows.map(row => {
    const key = String(row[0]);
    const rowYear = parseInt(String(row[2]));
    
    const update = updates.find(u => u.key === key && rowYear === year);
    if (update) {
      updatedKeys.add(key);
      return [update.key, update.value, year];
    }
    return row;
  });

  // Add new rows for keys that weren't in the sheet for this year
  const rowsToAdd = updates
    .filter(u => !updatedKeys.has(u.key))
    .map(u => [u.key, u.value, year]);

  const finalRows = [header, ...newRows, ...rowsToAdd] as (string | number | boolean)[][];

  // Rewrite the whole sheet (more efficient for multiple updates)
  await clearSheet(SHEET_NAMES.SETTINGS);
  await writeSheet(SHEET_NAMES.SETTINGS, `A1:C${finalRows.length}`, finalRows);
}

/**
 * Update a single setting (delegates to updateSettings)
 */
export async function updateSetting(
  key: string,
  value: string,
  year: number
): Promise<void> {
  await updateSettings([{ key, value }], year);
}

/**
 * Get all holidays for a specific year
 */
export async function getHolidays(year: number): Promise<Holiday[]> {
  const rows = await readSheet(SHEET_NAMES.HOLIDAYS);

  if (rows.length <= 1) {
    return [];
  }

  return rows
    .slice(1)
    .filter(row => row && row[0])
    .map(rowToHoliday)
    .filter(h => {
      const holidayYear = new Date(h.date).getFullYear();
      return holidayYear === year;
    });
}

/**
 * Add a new holiday
 */
export async function addHoliday(date: string, name: string): Promise<Holiday> {
  const newHoliday: Holiday = { date, name };
  const row = holidayToRow(newHoliday);
  await appendSheet(SHEET_NAMES.HOLIDAYS, [row]);
  return newHoliday;
}

/**
 * Delete a holiday by date
 */
export async function deleteHoliday(date: string): Promise<void> {
  const rows = await readSheet(SHEET_NAMES.HOLIDAYS);
  
  // Filter out the holiday to delete
  const filteredRows = rows.filter((row, index) => {
    if (index === 0) return true; // Keep header
    return row && row[0] && String(row[0]) !== date;
  });

  // Clear sheet first to prevent ghost rows
  await clearSheet(SHEET_NAMES.HOLIDAYS);

  // Rewrite the entire sheet
  if (filteredRows.length > 0) {
    await writeSheet(SHEET_NAMES.HOLIDAYS, `A1:B${filteredRows.length}`, filteredRows as (string | number | boolean)[][]);
  }
}

// Helper functions

function rowToSetting(row: (string | number | boolean)[]): Setting {
  return {
    key: String(row[0] || ''),
    value: String(row[1] || ''),
    year: typeof row[2] === 'number' ? row[2] : parseInt(String(row[2])) || new Date().getFullYear()
  };
}

function settingToRow(setting: Setting): (string | number | boolean)[] {
  return [setting.key, setting.value, setting.year];
}

function rowToHoliday(row: (string | number | boolean)[]): Holiday {
  return {
    date: String(row[0] || ''),
    name: String(row[1] || '')
  };
}

function holidayToRow(holiday: Holiday): (string | number | boolean)[] {
  return [holiday.date, holiday.name];
}
