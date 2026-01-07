'use client';

import { useState, useEffect } from 'react';
import { ProtectedRoute } from '@/components/auth/protected-route';
import { CheckCircle, Clock, Users, FileText, Filter } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { LeaveApprovalDialog } from '@/components/features/leave-approval-dialog';
import { LeaveDetailsDialog } from '@/components/features/leave-details-dialog';

interface LeaveRequest {
  id: string;
  empId: string;
  type: 'annual' | 'sick' | 'personal';
  startDate: string;
  endDate: string;
  totalDays: number;
  reason: string;
  status: 'pending' | 'approved' | 'rejected';
  approverNote?: string;
  createdAt: string;
}

interface User {
  empId: string;
  name: string;
}

const LEAVE_TYPE_LABELS = {
  annual: 'ลาพักร้อน',
  sick: 'ลาป่วย',
  personal: 'ลากิจ',
};

export default function AdminLeavesPage() {
  return (
    <ProtectedRoute requireAdmin>
      <AdminLeavesContent />
    </ProtectedRoute>
  );
}

function AdminLeavesContent() {
  const [leaves, setLeaves] = useState<LeaveRequest[]>([]);
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedLeave, setSelectedLeave] = useState<{
    id: string;
    empId: string;
    employeeName: string;
    type: string;
    startDate: string;
    endDate: string;
    totalDays: number;
    reason: string;
    status: 'pending' | 'approved' | 'rejected';
    approverNote?: string;
  } | null>(null);
  const [viewingLeave, setViewingLeave] = useState<{
    id: string;
    empId: string;
    employeeName: string;
    type: string;
    startDate: string;
    endDate: string;
    totalDays: number;
    reason: string;
    status: 'pending' | 'approved' | 'rejected';
    approverNote?: string;
  } | null>(null);
  const [filter, setFilter] = useState<'all' | 'pending' | 'approved' | 'rejected'>('pending');
  const [selectedMonth, setSelectedMonth] = useState<number | 'all'>(new Date().getMonth());
  const [selectedYear, setSelectedYear] = useState<number>(new Date().getFullYear());

  const THAI_MONTHS = [
    'มกราคม', 'กุมภาพันธ์', 'มีนาคม', 'เมษายน', 'พฤษภาคม', 'มิถุนายน',
    'กรกฎาคม', 'สิงหาคม', 'กันยายน', 'ตุลาคม', 'พฤศจิกายน', 'ธันวาคม'
  ];

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      setLoading(true);
      const [leavesRes, usersRes] = await Promise.all([
        fetch('/api/leaves'),
        fetch('/api/users'),
      ]);

      const leavesData = await leavesRes.json();
      const usersData = await usersRes.json();

      if (leavesData.success) setLeaves(leavesData.leaves || []);
      if (usersData.success) setUsers(usersData.users || []);
    } catch (error) {
      console.error('Error fetching data:', error);
    } finally {
      setLoading(false);
    }
  };

  const getUserName = (empId: string) => {
    const user = users.find(u => u.empId === empId);
    return user?.name || empId;
  };

  const handleApprove = async (leaveId: string, note?: string) => {
    try {
      const response = await fetch(`/api/leaves/${leaveId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: 'approved', approverNote: note }),
      });
      if (response.ok) await fetchData();
    } catch (error) {
      console.error('Error approving leave:', error);
    }
  };

  const handleReject = async (leaveId: string, note: string) => {
    try {
      const response = await fetch(`/api/leaves/${leaveId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: 'rejected', approverNote: note }),
      });
      if (response.ok) await fetchData();
    } catch (error) {
      console.error('Error rejecting leave:', error);
    }
  };

  const filteredLeaves = leaves.filter(leave => {
    const statusMatch = filter === 'all' || leave.status === filter;
    
    // If not 'pending', we also filter by month/year based on startDate
    const date = new Date(leave.startDate);
    const monthMatch = selectedMonth === 'all' || date.getMonth() === Number(selectedMonth);
    const yearMatch = date.getFullYear() === selectedYear;

    if (filter === 'pending') return statusMatch; // For pending, show all pending
    return statusMatch && monthMatch && yearMatch;
  });

  const pendingCount = leaves.filter(l => l.status === 'pending').length;
  const approvedCount = leaves.filter(l => l.status === 'approved').length;

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('th-TH', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    });
  };

  return (
    <div className="space-y-6">
      {/* Page Title */}
      <div>
        <h1 className="text-3xl font-black text-gray-900 tracking-tight">อนุมัติคำขอลา</h1>
        <p className="text-gray-500 mt-1 uppercase text-xs font-bold tracking-widest">การพิจารณาตรวจสอบคำขอลาของพนักงาน</p>
      </div>

      {/* Stats Summary */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {[
          { label: 'รออนุมัติ', count: pendingCount, color: 'text-yellow-600', bg: 'bg-yellow-50', icon: Clock },
          { label: 'อนุมัติแล้ว', count: approvedCount, color: 'text-green-600', bg: 'bg-green-50', icon: CheckCircle },
          { label: 'ปฏิเสธแล้ว', count: leaves.filter(l => l.status === 'rejected').length, color: 'text-red-600', bg: 'bg-red-50', icon: FileText },
          { label: 'ทั้งหมด', count: leaves.length, color: 'text-blue-600', bg: 'bg-blue-50', icon: Users },
        ].map((stat) => (
          <div key={stat.label} className="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm transition-all hover:shadow-md">
            <div className="flex items-center justify-between mb-3">
              <p className="text-sm font-black text-gray-900 uppercase tracking-wider">{stat.label}</p>
              <stat.icon className={`w-5 h-5 ${stat.color}`} />
            </div>
            <p className={`text-4xl font-black ${stat.color}`}>{stat.count}</p>
          </div>
        ))}
      </div>

      {/* Filter Toolbar */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        {/* Status Filter Tabs */}
        <div className="flex items-center space-x-2 bg-gray-100/10 p-1.5 rounded-2xl w-fit border border-gray-200">
          {(['pending', 'approved', 'rejected', 'all'] as const).map((id) => {
            const labels = { pending: 'รอพิจารณา', approved: 'อนุมัติแล้ว', rejected: 'ปฏิเสธ', all: 'ทั้งหมด' };
            return (
              <button
                key={id}
                onClick={() => setFilter(id)}
                className={`px-6 py-2.5 rounded-xl text-base font-black uppercase tracking-wider transition-all ${
                  filter === id 
                    ? 'bg-white text-gray-900 shadow-sm border border-gray-100' 
                    : 'text-gray-500 hover:text-gray-700'
                }`}
              >
                {labels[id]} {id === 'pending' && <span className="ml-1 opacity-60">({pendingCount})</span>}
              </button>
            );
          })}
        </div>

        {/* Month/Year Selectors - Only show if not filtering pending */}
        {filter !== 'pending' && (
          <div className="flex items-center space-x-2">
            <div className="relative group">
              <select
                value={selectedMonth}
                onChange={(e) => setSelectedMonth(e.target.value === 'all' ? 'all' : parseInt(e.target.value))}
                className="appearance-none bg-white border border-gray-200 rounded-xl px-4 py-2.5 pr-10 text-sm font-black text-gray-900 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent cursor-pointer shadow-sm min-w-[140px]"
              >
                <option value="all">ทุกเดือน</option>
                {THAI_MONTHS.map((month, index) => (
                  <option key={month} value={index}>{month}</option>
                ))}
              </select>
              <div className="absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none text-gray-400 group-hover:text-gray-600 transition-colors">
                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M19 9l-7 7-7-7" />
                </svg>
              </div>
            </div>

            <div className="relative group">
              <select
                value={selectedYear}
                onChange={(e) => setSelectedYear(parseInt(e.target.value))}
                className="appearance-none bg-white border border-gray-200 rounded-xl px-4 py-2.5 pr-10 text-sm font-black text-gray-900 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent cursor-pointer shadow-sm"
              >
                {[selectedYear - 1, selectedYear, selectedYear + 1].map((year) => (
                  <option key={year} value={year}>{year + 543}</option>
                ))}
              </select>
              <div className="absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none text-gray-400 group-hover:text-gray-600 transition-colors">
                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M19 9l-7 7-7-7" />
                </svg>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Table Card */}
      <div className="bg-white rounded-3xl shadow-sm border border-gray-100 overflow-hidden">
        {loading ? (
          <div className="p-20 text-center">
            <div className="inline-block w-8 h-8 border-4 border-blue-600 border-t-transparent rounded-full animate-spin mb-4"></div>
            <p className="text-gray-500 font-medium text-lg">กำลังดึงข้อมูลคำขอลา...</p>
          </div>
        ) : filteredLeaves.length === 0 ? (
          <div className="p-20 text-center">
            <Filter className="w-16 h-16 text-gray-100 mx-auto mb-4" />
            <p className="text-gray-900 font-black text-xl">ไม่พบข้อมูลคำขอในหมวดนี้</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-gray-50/50">
                  <th className="px-8 py-5 text-sm font-black text-gray-900 uppercase tracking-widest leading-none">id</th>
                  <th className="px-8 py-5 text-sm font-black text-gray-900 uppercase tracking-widest leading-none">ชื่อ</th>
                  <th className="px-8 py-5 text-sm font-black text-gray-900 uppercase tracking-widest leading-none">ประเภท</th>
                  <th className="px-8 py-5 text-sm font-black text-gray-900 uppercase tracking-widest leading-none">ระยะเวลา</th>
                  <th className="px-8 py-5 text-sm font-black text-gray-900 uppercase tracking-widest leading-none">เหตุผล</th>
                  <th className="px-8 py-5 text-sm font-black text-gray-900 uppercase tracking-widest leading-none">สถานะ</th>
                  <th className="px-8 py-5 text-sm font-black text-gray-900 uppercase tracking-widest leading-none text-right">ดำเนินการ</th>
                  {filter !== 'pending' && (
                    <th className="px-8 py-5 text-sm font-black text-gray-900 uppercase tracking-widest leading-none text-right">รายละเอียด</th>
                  )}
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-50">
                {filteredLeaves.map((leave) => (
                  <tr key={leave.id} className="group hover:bg-gray-50/50 transition-colors">
                    <td className="px-8 py-5 whitespace-nowrap">
                      <span className="font-black text-gray-900 text-base">{leave.empId}</span>
                    </td>
                    <td className="px-8 py-5 whitespace-nowrap">
                      <span className="font-bold text-gray-600 text-base">{getUserName(leave.empId)}</span>
                    </td>
                    <td className="px-8 py-5 whitespace-nowrap">
                      <span className={`px-3 py-1.5 rounded-lg text-xs font-black uppercase tracking-wider ${
                        leave.type === 'annual' ? 'bg-blue-100 text-blue-700' :
                        leave.type === 'sick' ? 'bg-green-100 text-green-700' : 'bg-orange-100 text-orange-700'
                      }`}>
                        {LEAVE_TYPE_LABELS[leave.type]}
                      </span>
                    </td>
                    <td className="px-8 py-5 whitespace-nowrap">
                      <div className="flex flex-col justify-center">
                        <p className="font-black text-gray-900 text-base leading-none">{leave.totalDays} วัน</p>
                        <p className="text-[10px] font-bold text-gray-400 mt-1.5">
                          {formatDate(leave.startDate)} - {formatDate(leave.endDate)}
                        </p>
                      </div>
                    </td>
                    <td className="px-8 py-5">
                      <p className="text-sm font-bold text-gray-600 max-w-[200px] truncate" title={leave.reason}>
                        {leave.reason}
                      </p>
                    </td>
                    <td className="px-8 py-5 whitespace-nowrap">
                      <Badge
                        variant={
                          leave.status === 'pending' ? 'warning' :
                          leave.status === 'approved' ? 'success' : 'danger'
                        }
                        className="font-black uppercase tracking-wider text-[10px] px-3 py-1"
                      >
                        {leave.status === 'pending' ? 'Pending' :
                         leave.status === 'approved' ? 'Approved' : 'Rejected'}
                      </Badge>
                    </td>
                    <td className="px-8 py-5 text-right whitespace-nowrap">
                      {leave.status === 'pending' ? (
                        <Button
                          onClick={() => setSelectedLeave({
                            ...leave,
                            employeeName: getUserName(leave.empId),
                            type: LEAVE_TYPE_LABELS[leave.type],
                          })}
                          className="bg-gray-900 hover:bg-black text-white font-black rounded-xl text-[10px] px-4 py-2 uppercase shadow-md transition-all active:scale-95"
                        >
                          พิจารณา
                        </Button>
                      ) : (
                        <span className="text-xs font-bold text-gray-300">-</span>
                      )}
                    </td>
                    {filter !== 'pending' && (
                      <td className="px-8 py-5 text-right whitespace-nowrap">
                        {leave.status !== 'pending' ? (
                          <Button
                            onClick={() => setViewingLeave({
                              ...leave,
                              employeeName: getUserName(leave.empId),
                              type: LEAVE_TYPE_LABELS[leave.type],
                            })}
                            variant="outline"
                            className="border-gray-200 text-gray-700 font-bold rounded-xl text-[10px] px-4 py-2 hover:bg-gray-50 transition-all active:scale-95"
                          >
                            รายละเอียด
                          </Button>
                        ) : (
                          <span className="text-xs font-bold text-gray-300">-</span>
                        )}
                      </td>
                    )}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      <LeaveApprovalDialog
        leave={selectedLeave}
        onClose={() => setSelectedLeave(null)}
        onApprove={handleApprove}
        onReject={handleReject}
      />

      <LeaveDetailsDialog
        leave={viewingLeave}
        onClose={() => setViewingLeave(null)}
      />
    </div>
  );
}
