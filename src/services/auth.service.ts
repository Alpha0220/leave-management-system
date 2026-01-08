/**
 * Authentication Service
 * Simple authentication without external libraries
 */

import { getUserByEmpId, updateUser } from './user.service';

export interface LoginCredentials {
  empId: string;
  password: string;
}

export interface RegisterData {
  empId: string;
  password: string;
  confirmPassword: string;
}

export interface AuthUser {
  empId: string;
  name: string;
  role: 'admin' | 'employee';
  leaveQuota: number;
  sickLeaveQuota: number;
  personalLeaveQuota: number;
  maternityLeaveQuota: number;
  sterilizationLeaveQuota: number;
  unpaidLeaveQuota: number;
}

/**
 * Login user with employee ID and password
 */
export async function login(credentials: LoginCredentials): Promise<AuthUser> {
  const { empId, password } = credentials;

  // Validate input
  if (!empId || !password) {
    throw new Error('กรุณากรอก Employee ID และรหัสผ่าน');
  }

  // Get user from Google Sheets
  const user = await getUserByEmpId(empId);

  if (!user) {
    throw new Error('ไม่พบ Employee ID นี้ในระบบ');
  }

  // Check if user is registered
  if (!user.isRegistered) {
    throw new Error('กรุณาลงทะเบียนก่อนเข้าสู่ระบบ');
  }

  // Verify password (plain text comparison)
  if (user.password !== password) {
    throw new Error('รหัสผ่านไม่ถูกต้อง');
  }

  // Return user data (without password)
  return {
    empId: user.empId,
    name: user.name,
    role: user.role,
    leaveQuota: user.leaveQuota,
    sickLeaveQuota: user.sickLeaveQuota,
    personalLeaveQuota: user.personalLeaveQuota,
    maternityLeaveQuota: user.maternityLeaveQuota,
    sterilizationLeaveQuota: user.sterilizationLeaveQuota,
    unpaidLeaveQuota: user.unpaidLeaveQuota,
  };
}

/**
 * Register new user (first-time password setup)
 */
export async function register(data: RegisterData): Promise<{ success: boolean; user: AuthUser }> {
  const { empId, password, confirmPassword } = data;

  // Validate input
  if (!empId || !password || !confirmPassword) {
    throw new Error('กรุณากรอกข้อมูลให้ครบถ้วน');
  }

  if (password !== confirmPassword) {
    throw new Error('รหัสผ่านไม่ตรงกัน');
  }

  if (password.length < 4) {
    throw new Error('รหัสผ่านต้องมีอย่างน้อย 4 ตัวอักษร');
  }

  // Get user from Google Sheets
  const user = await getUserByEmpId(empId);

  if (!user) {
    throw new Error('ไม่พบ Employee ID นี้ในระบบ กรุณาติดต่อ HR');
  }

  // Check if already registered
  if (user.isRegistered) {
    throw new Error('Employee ID นี้ลงทะเบียนแล้ว กรุณาเข้าสู่ระบบ');
  }

  // Update user with password and set isRegistered = true
  await updateUser(empId, {
    password,
    isRegistered: true,
  });

  // Return success with user data
  return {
    success: true,
    user: {
      empId: user.empId,
      name: user.name,
      role: user.role,
      leaveQuota: user.leaveQuota,
      sickLeaveQuota: user.sickLeaveQuota,
      personalLeaveQuota: user.personalLeaveQuota,
      maternityLeaveQuota: user.maternityLeaveQuota,
      sterilizationLeaveQuota: user.sterilizationLeaveQuota,
      unpaidLeaveQuota: user.unpaidLeaveQuota,
    },
  };
}

/**
 * Verify if user session is valid
 */
export async function verifySession(empId: string): Promise<AuthUser | null> {
  try {
    const user = await getUserByEmpId(empId);

    if (!user || !user.isRegistered) {
      return null;
    }

    return {
      empId: user.empId,
      name: user.name,
      role: user.role,
      leaveQuota: user.leaveQuota,
      sickLeaveQuota: user.sickLeaveQuota,
      personalLeaveQuota: user.personalLeaveQuota,
      maternityLeaveQuota: user.maternityLeaveQuota,
      sterilizationLeaveQuota: user.sterilizationLeaveQuota,
      unpaidLeaveQuota: user.unpaidLeaveQuota,
    };
  } catch {
    return null;
  }
}
