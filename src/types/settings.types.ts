/**
 * Settings and Holiday type definitions
 */

export interface Setting {
  key: string;
  value: string;
  year: number;
}

export interface Holiday {
  date: string; // YYYY-MM-DD
  name: string;
}

export interface PolicySettings {
  annualLeaveMax: number;
  sickLeaveMax: number;
  personalLeaveMax: number;
  maternityLeaveMax: number;
  sterilizationLeaveMax: number;
  unpaidLeaveMax: number;
  compassionateLeaveMax: number;
  minAdvanceNoticeDays: number;
  carryOverEnabled: boolean;
  carryOverMaxDays: number;
}
