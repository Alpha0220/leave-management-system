/**
 * Settings Service
 * Handles settings and holidays management in Google Sheets
 */

'use server';

import { readSheet, writeSheet, appendSheet } from '@/lib/google-sheets';
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
    return parseInt(setting.value) || defaultValue;
  };

  return {
    annualLeaveMax: getValue('annualLeaveMax', 10) as number,
    sickLeaveMax: getValue('sickLeaveMax', 30) as number,
    personalLeaveMax: getValue('personalLeaveMax', 6) as number,
    minAdvanceNoticeDays: getValue('minAdvanceNoticeDays', 3) as number,
    carryOverEnabled: getValue('carryOverEnabled', false) as boolean,
    carryOverMaxDays: getValue('carryOverMaxDays', 5) as number
  };
}

/**
 * Update a setting
 */
export async function updateSetting(
  key: string,
  value: string,
  year: number
): Promise<void> {
  const settings = await getSettings(year);
  const settingIndex = settings.findIndex(s => s.key === key);

  if (settingIndex === -1) {
    // Add new setting
    const newSetting: Setting = { key, value, year };
    const row = settingToRow(newSetting);
    await appendSheet(SHEET_NAMES.SETTINGS, [row]);
  } else {
    // Update existing setting
    const allRows = await readSheet(SHEET_NAMES.SETTINGS);
    const rowIndex = allRows.slice(1).findIndex(
      row => String(row[0]) === key && parseInt(String(row[2])) === year
    );
    
    if (rowIndex !== -1) {
      const rowNumber = rowIndex + 2; // +1 for header, +1 for 1-based indexing
      const updatedSetting: Setting = { key, value, year };
      const row = settingToRow(updatedSetting);
      await writeSheet(SHEET_NAMES.SETTINGS, `A${rowNumber}:C${rowNumber}`, [row]);
    }
  }
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
    return String(row[0]) !== date;
  });

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
