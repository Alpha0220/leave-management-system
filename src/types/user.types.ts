/**
 * User-related type definitions
 */

export type Role = 'admin' | 'employee';

export interface User {
  empId: string;
  name: string;
  password: string;
  role: Role;
  leaveQuota: number;
  sickLeaveQuota: number;
  personalLeaveQuota: number;
  isRegistered: boolean;
  createdAt: string;
}

export interface Session {
  empId: string;
  name: string;
  role: Role;
}

export interface UserCreateInput {
  empId: string;
  name: string;
  role: Role;
  leaveQuota?: number;
  sickLeaveQuota?: number;
  personalLeaveQuota?: number;
}

export interface UserUpdateInput {
  name?: string;
  password?: string;
  leaveQuota?: number;
  sickLeaveQuota?: number;
  personalLeaveQuota?: number;
  isRegistered?: boolean;
}
