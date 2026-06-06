/**
 * Leave-related type definitions
 */

export type LeaveType = 'annual' | 'sick' | 'personal' | 'maternity' | 'sterilization' | 'unpaid' | 'compassionate';
export type LeaveStatus = 'pending' | 'approved' | 'rejected';

export interface LeaveRequest {
  id: string;
  empId: string;
  type: LeaveType;
  startDate: string;
  endDate: string;
  totalDays: number;
  reason: string;
  status: LeaveStatus;
  approverNote?: string;
  createdAt: string;
  updatedAt: string;
}

export interface LeaveRequestInput {
  empId: string;
  type: LeaveType;
  startDate: string;
  endDate: string;
  reason: string;
}

export interface LeaveApprovalInput {
  leaveId: string;
  status: 'approved' | 'rejected';
  approverNote?: string;
}

export interface LeaveStatistics {
  totalRequests: number;
  pendingRequests: number;
  approvedRequests: number;
  rejectedRequests: number;
  approvalRate: number;
}

export const LEAVE_TYPE_LABELS: Record<LeaveType, string> = {
  annual: 'ลาพักร้อน',
  sick: 'ลาป่วย',
  personal: 'ลากิจ',
  maternity: 'ลาคลอด',
  sterilization: 'ลาทำหมัน',
  unpaid: 'ลาไม่รับค่าจ้าง',
  compassionate: 'ลาฌาปนกิจ'
};

export const LEAVE_STATUS_LABELS: Record<LeaveStatus, string> = {
  pending: 'รออนุมัติ',
  approved: 'อนุมัติแล้ว',
  rejected: 'ปฏิเสธ'
};
