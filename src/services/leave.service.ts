/**
 * Leave Service
 * Handles CRUD operations for leave requests in Google Sheets
 */

'use server';

import { readSheet, writeSheet, appendSheet } from '@/lib/google-sheets';
import { SHEET_NAMES } from '@/lib/constants';
import { calculateBusinessDays, generateUUID } from '@/lib/utils';
import type { LeaveRequest, LeaveRequestInput, LeaveStatistics } from '@/types';
import { getHolidays } from './settings.service';

/**
 * Get all leave requests
 */
export async function getAllLeaves(): Promise<LeaveRequest[]> {
  const rows = await readSheet(SHEET_NAMES.LEAVES);

  if (rows.length <= 1) {
    return [];
  }

  // Skip header row and filter out empty rows
  return rows.slice(1)
    .filter(row => row && row[0] && String(row[0]).trim() !== '')
    .map(rowToLeave);
}

/**
 * Get leave requests by employee ID
 */
export async function getLeavesByEmpId(empId: string): Promise<LeaveRequest[]> {
  const leaves = await getAllLeaves();
  return leaves.filter(l => l.empId === empId);
}

/**
 * Get leave request by ID
 */
export async function getLeaveById(id: string): Promise<LeaveRequest | null> {
  const leaves = await getAllLeaves();
  return leaves.find(l => l.id === id) || null;
}

/**
 * Create a new leave request
 */
export async function createLeave(input: LeaveRequestInput): Promise<LeaveRequest> {
  // Get holidays for business day calculation
  const currentYear = new Date().getFullYear();
  const holidays = await getHolidays(currentYear);
  const holidayDates = holidays.map(h => h.date);

  // Calculate business days
  const totalDays = calculateBusinessDays(
    input.startDate,
    input.endDate,
    holidayDates
  );

  const newLeave: LeaveRequest = {
    id: generateUUID(),
    empId: input.empId,
    type: input.type,
    startDate: input.startDate,
    endDate: input.endDate,
    totalDays,
    reason: input.reason,
    status: 'pending',
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  };

  const row = leaveToRow(newLeave);
  await appendSheet(SHEET_NAMES.LEAVES, [row]);

  return newLeave;
}

/**
 * Update leave status (approve/reject)
 */
export async function updateLeaveStatus(
  id: string,
  status: 'approved' | 'rejected',
  approverNote?: string
): Promise<LeaveRequest> {
  const leaves = await getAllLeaves();
  const leaveIndex = leaves.findIndex(l => l.id === id);

  if (leaveIndex === -1) {
    throw new Error(`Leave request with id ${id} not found`);
  }

  const updatedLeave: LeaveRequest = {
    ...leaves[leaveIndex],
    status,
    approverNote,
    updatedAt: new Date().toISOString()
  };

  // Update in sheet (row index + 2 because of header and 1-based indexing)
  const rowNumber = leaveIndex + 2;
  const row = leaveToRow(updatedLeave);
  await writeSheet(SHEET_NAMES.LEAVES, `A${rowNumber}:K${rowNumber}`, [row]);

  return updatedLeave;
}

/**
 * Get leaves by date range
 */
export async function getLeavesByDateRange(
  startDate: string,
  endDate: string
): Promise<LeaveRequest[]> {
  const leaves = await getAllLeaves();
  
  return leaves.filter(leave => {
    const leaveStart = new Date(leave.startDate);
    const leaveEnd = new Date(leave.endDate);
    const rangeStart = new Date(startDate);
    const rangeEnd = new Date(endDate);

    // Check if leave overlaps with date range
    return (
      (leaveStart >= rangeStart && leaveStart <= rangeEnd) ||
      (leaveEnd >= rangeStart && leaveEnd <= rangeEnd) ||
      (leaveStart <= rangeStart && leaveEnd >= rangeEnd)
    );
  });
}

/**
 * Get leave statistics
 */
export async function getLeaveStatistics(): Promise<LeaveStatistics> {
  const leaves = await getAllLeaves();

  const totalRequests = leaves.length;
  const pendingRequests = leaves.filter(l => l.status === 'pending').length;
  const approvedRequests = leaves.filter(l => l.status === 'approved').length;
  const rejectedRequests = leaves.filter(l => l.status === 'rejected').length;

  const approvalRate = totalRequests > 0 
    ? Math.round((approvedRequests / totalRequests) * 100) 
    : 0;

  return {
    totalRequests,
    pendingRequests,
    approvedRequests,
    rejectedRequests,
    approvalRate
  };
}

/**
 * Get pending leave requests
 */
export async function getPendingLeaves(): Promise<LeaveRequest[]> {
  const leaves = await getAllLeaves();
  return leaves.filter(l => l.status === 'pending');
}

/**
 * Get approved leaves for current month
 */
export async function getApprovedLeavesThisMonth(): Promise<LeaveRequest[]> {
  const leaves = await getAllLeaves();
  const now = new Date();
  const firstDay = new Date(now.getFullYear(), now.getMonth(), 1);
  const lastDay = new Date(now.getFullYear(), now.getMonth() + 1, 0);

  return leaves.filter(leave => {
    if (leave.status !== 'approved') return false;
    
    const leaveStart = new Date(leave.startDate);
    const leaveEnd = new Date(leave.endDate);

    return (
      (leaveStart >= firstDay && leaveStart <= lastDay) ||
      (leaveEnd >= firstDay && leaveEnd <= lastDay) ||
      (leaveStart <= firstDay && leaveEnd >= lastDay)
    );
  });
}

// Helper functions

function rowToLeave(row: (string | number | boolean)[]): LeaveRequest {
  return {
    id: String(row[0] || ''),
    empId: String(row[1] || ''),
    type: String(row[2] || 'annual') as 'annual' | 'sick' | 'personal',
    startDate: String(row[3] || ''),
    endDate: String(row[4] || ''),
    totalDays: typeof row[5] === 'number' ? row[5] : parseInt(String(row[5])) || 0,
    reason: String(row[6] || ''),
    status: String(row[7] || 'pending') as 'pending' | 'approved' | 'rejected',
    approverNote: row[8] ? String(row[8]) : undefined,
    createdAt: String(row[9] || new Date().toISOString()),
    updatedAt: String(row[10] || new Date().toISOString())
  };
}

function leaveToRow(leave: LeaveRequest): (string | number | boolean)[] {
  return [
    leave.id,
    leave.empId,
    leave.type,
    leave.startDate,
    leave.endDate,
    leave.totalDays,
    leave.reason,
    leave.status,
    leave.approverNote || '',
    leave.createdAt,
    leave.updatedAt
  ];
}
