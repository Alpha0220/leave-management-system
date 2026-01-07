/**
 * Application constants
 */

export const SHEET_NAMES = {
  USERS: 'Users',
  LEAVES: 'Leaves',
  SETTINGS: 'Settings',
  HOLIDAYS: 'Holidays'
} as const;

export const DEFAULT_QUOTAS = {
  ANNUAL_LEAVE: 10,
  SICK_LEAVE: 30,
  PERSONAL_LEAVE: 6
} as const;

export const DEFAULT_ADMIN = {
  empId: 'ADMIN001',
  name: 'ผู้ดูแลระบบ',
  password: 'admin123',
  role: 'admin' as const,
  leaveQuota: 0,
  sickLeaveQuota: 0,
  personalLeaveQuota: 0,
  isRegistered: true
} as const;

export const ROUTES = {
  LOGIN: '/login',
  REGISTER: '/register',
  DASHBOARD: '/dashboard',
  LEAVE_REQUEST: '/leave/request',
  LEAVE_HISTORY: '/leave/history',
  CALENDAR: '/calendar',
  ADMIN_DASHBOARD: '/admin/dashboard',
  ADMIN_EMPLOYEES: '/admin/employees',
  ADMIN_LEAVES: '/admin/leaves',
  ADMIN_SETTINGS: '/admin/settings'
} as const;

export const PUBLIC_ROUTES = ['/login', '/register'];
export const EMPLOYEE_ROUTES = ['/dashboard', '/leave', '/calendar'];
export const ADMIN_ROUTES = ['/admin'];

// Thai Public Holidays 2025
export const DEFAULT_HOLIDAYS_2025 = [
  { date: '2025-01-01', name: 'วันขึ้นปีใหม่' },
  { date: '2025-02-12', name: 'วันตรุษจีน' },
  { date: '2025-04-06', name: 'วันจักรี' },
  { date: '2025-04-13', name: 'วันสงกรานต์' },
  { date: '2025-04-14', name: 'วันสงกรานต์' },
  { date: '2025-04-15', name: 'วันสงกรานต์' },
  { date: '2025-05-01', name: 'วันแรงงานแห่งชาติ' },
  { date: '2025-05-05', name: 'วันฉัตรมงคล' },
  { date: '2025-05-12', name: 'วันพืชมงคล (ชดเชย)' },
  { date: '2025-06-03', name: 'วันเฉลิมพระชนมพรรษาสมเด็จพระนางเจ้าสุทิดา' },
  { date: '2025-07-28', name: 'วันเฉลิมพระชนมพรรษาพระบาทสมเด็จพระเจ้าอยู่หัว' },
  { date: '2025-07-29', name: 'วันเฉลิมพระชนมพรรษาพระบาทสมเด็จพระเจ้าอยู่หัว (ชดเชย)' },
  { date: '2025-08-12', name: 'วันแม่แห่งชาติ' },
  { date: '2025-10-13', name: 'วันคล้ายวันสวรรคตพระบาทสมเด็จพระบรมชนกาธิเบศร มหาภูมิพลอดุลยเดชมหาราช บรมนาถบพิตร' },
  { date: '2025-10-23', name: 'วันปิยมหาราช' },
  { date: '2025-12-05', name: 'วันพ่อแห่งชาติ' },
  { date: '2025-12-10', name: 'วันรัฐธรรมนูญ' },
  { date: '2025-12-31', name: 'วันสิ้นปี' }
];
