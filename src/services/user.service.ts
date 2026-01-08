/**
 * User Service
 * Handles CRUD operations for users in Google Sheets
 */

'use server';

import { readSheet, writeSheet, appendSheet, clearSheet } from '@/lib/google-sheets';
import { SHEET_NAMES, DEFAULT_QUOTAS } from '@/lib/constants';
import type { User, UserCreateInput, UserUpdateInput } from '@/types';

/**
 * Get all users from Google Sheets
 */
export async function getAllUsers(): Promise<User[]> {
  const rows = await readSheet(SHEET_NAMES.USERS);

  if (rows.length <= 1) {
    return []; // Only headers or empty
  }

  // Skip header row and filter out empty rows
  return rows.slice(1)
    .filter(row => row && row[0] && String(row[0]).trim() !== '')
    .map(rowToUser);
}

/**
 * Get user by employee ID
 */
export async function getUserByEmpId(empId: string): Promise<User | null> {
  const users = await getAllUsers();
  return users.find(u => u.empId === empId) || null;
}

/**
 * Create a new user
 */
export async function createUser(input: UserCreateInput): Promise<User> {
  // Check if user already exists
  const existing = await getUserByEmpId(input.empId);
  if (existing) {
    throw new Error(`User with empId ${input.empId} already exists`);
  }

  const newUser: User = {
    empId: input.empId,
    name: input.name,
    password: '', // Will be set during registration
    role: input.role,
    leaveQuota: input.leaveQuota ?? DEFAULT_QUOTAS.ANNUAL_LEAVE,
    sickLeaveQuota: input.sickLeaveQuota ?? DEFAULT_QUOTAS.SICK_LEAVE,
    personalLeaveQuota: input.personalLeaveQuota ?? DEFAULT_QUOTAS.PERSONAL_LEAVE,
    maternityLeaveQuota: input.maternityLeaveQuota ?? DEFAULT_QUOTAS.MATERNITY_LEAVE,
    sterilizationLeaveQuota: input.sterilizationLeaveQuota ?? DEFAULT_QUOTAS.STERILIZATION_LEAVE,
    unpaidLeaveQuota: input.unpaidLeaveQuota ?? DEFAULT_QUOTAS.UNPAID_LEAVE,
    isRegistered: false,
    createdAt: new Date().toISOString()
  };

  const row = userToRow(newUser);
  await appendSheet(SHEET_NAMES.USERS, [row]);

  return newUser;
}

/**
 * Update user information
 */
export async function updateUser(
  empId: string,
  updates: UserUpdateInput
): Promise<User> {
  const users = await getAllUsers();
  const userIndex = users.findIndex(u => u.empId === empId);

  if (userIndex === -1) {
    throw new Error(`User with empId ${empId} not found`);
  }

  const updatedUser: User = {
    ...users[userIndex],
    ...updates
  };

  // Update in sheet (row index + 2 because of header and 1-based indexing)
  const rowNumber = userIndex + 2;
  const row = userToRow(updatedUser);
  await writeSheet(SHEET_NAMES.USERS, `A${rowNumber}:L${rowNumber}`, [row]);

  return updatedUser;
}

/**
 * Update user quota
 */
export async function updateUserQuota(
  empId: string,
  quotaType: 'leaveQuota' | 'sickLeaveQuota' | 'personalLeaveQuota' | 'maternityLeaveQuota' | 'sterilizationLeaveQuota' | 'unpaidLeaveQuota',
  amount: number
): Promise<void> {
  const user = await getUserByEmpId(empId);
  
  if (!user) {
    throw new Error(`User with empId ${empId} not found`);
  }

  await updateUser(empId, {
    [quotaType]: amount
  });
}

/**
 * Deduct quota from user
 */
export async function deductUserQuota(
  empId: string,
  quotaType: 'leaveQuota' | 'sickLeaveQuota' | 'personalLeaveQuota' | 'maternityLeaveQuota' | 'sterilizationLeaveQuota' | 'unpaidLeaveQuota',
  days: number
): Promise<void> {
  const user = await getUserByEmpId(empId);
  
  if (!user) {
    throw new Error(`User with empId ${empId} not found`);
  }

  const currentQuota = user[quotaType];
  const newQuota = Math.max(0, currentQuota - days);

  await updateUserQuota(empId, quotaType, newQuota);
}

/**
 * Check if user exists
 */
export async function checkUserExists(empId: string): Promise<boolean> {
  const user = await getUserByEmpId(empId);
  return user !== null;
}

/**
 * Reset user password
 */
export async function resetPassword(
  empId: string,
  newPassword: string
): Promise<void> {
  await updateUser(empId, { password: newPassword });
}

/**
 * Register user (set password and mark as registered)
 */
export async function registerUser(
  empId: string,
  password: string
): Promise<User> {
  const user = await getUserByEmpId(empId);

  if (!user) {
    throw new Error('Employee ID not found');
  }

  if (user.isRegistered) {
    throw new Error('User already registered');
  }

  return await updateUser(empId, {
    password,
    isRegistered: true
  });
}

/**
 * Delete user
 */
export async function deleteUser(empId: string): Promise<void> {
  const users = await getAllUsers();
  const userIndex = users.findIndex(u => u.empId === empId);

  if (userIndex === -1) {
    throw new Error(`User with empId ${empId} not found`);
  }

  // Remove user from array
  const updatedUsers = users.filter(u => u.empId !== empId);

  // Clear sheet first to prevent ghost rows
  await clearSheet(SHEET_NAMES.USERS);

  // Rewrite entire sheet with updated users
  const rows = [
    ['empId', 'name', 'password', 'role', 'leaveQuota', 'sickLeaveQuota', 'personalLeaveQuota', 'maternityLeaveQuota', 'sterilizationLeaveQuota', 'unpaidLeaveQuota', 'isRegistered', 'createdAt'],
    ...updatedUsers.map(userToRow)
  ];

  await writeSheet(SHEET_NAMES.USERS, 'A1:L' + (rows.length), rows);
}

// Helper functions

function rowToUser(row: (string | number | boolean)[]): User {
  return {
    empId: String(row[0] || ''),
    name: String(row[1] || ''),
    password: String(row[2] || ''),
    role: (String(row[3]) || 'employee') as 'admin' | 'employee',
    leaveQuota: typeof row[4] === 'number' ? row[4] : parseInt(String(row[4])) || 0,
    sickLeaveQuota: typeof row[5] === 'number' ? row[5] : parseInt(String(row[5])) || 0,
    personalLeaveQuota: typeof row[6] === 'number' ? row[6] : parseInt(String(row[6])) || 0,
    maternityLeaveQuota: typeof row[7] === 'number' ? row[7] : parseInt(String(row[7])) || DEFAULT_QUOTAS.MATERNITY_LEAVE,
    sterilizationLeaveQuota: typeof row[8] === 'number' ? row[8] : parseInt(String(row[8])) || DEFAULT_QUOTAS.STERILIZATION_LEAVE,
    unpaidLeaveQuota: typeof row[9] === 'number' ? row[9] : parseInt(String(row[9])) || DEFAULT_QUOTAS.UNPAID_LEAVE,
    isRegistered: String(row[10]).toLowerCase() === 'true' || row[10] === true,
    createdAt: String(row[11] || new Date().toISOString())
  };
}

function userToRow(user: User): (string | number | boolean)[] {
  return [
    user.empId,
    user.name,
    user.password,
    user.role,
    user.leaveQuota,
    user.sickLeaveQuota,
    user.personalLeaveQuota,
    user.maternityLeaveQuota,
    user.sterilizationLeaveQuota,
    user.unpaidLeaveQuota,
    user.isRegistered.toString(),
    user.createdAt
  ];
}
