'use client';

import { useState, useEffect } from 'react';
import { ProtectedRoute } from '@/components/auth/protected-route';
import { Info } from 'lucide-react';
import { LeaveCalendar } from '@/components/features/leave-calendar';

interface Leave {
  id: string;
  empId: string;
  type: 'annual' | 'sick' | 'personal';
  startDate: string;
  endDate: string;
  totalDays: number;
  reason: string;
  status: 'pending' | 'approved' | 'rejected';
}

interface User {
  empId: string;
  name: string;
}

export default function CalendarPage() {
  return (
    <ProtectedRoute>
      <CalendarContent />
    </ProtectedRoute>
  );
}

function CalendarContent() {
  const [leaves, setLeaves] = useState<Leave[]>([]);
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);

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

  const leavesWithNames = leaves.map(leave => ({
    ...leave,
    employeeName: getUserName(leave.empId),
  }));

  return (
    <div className="space-y-8">
      {/* Page Title */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-black text-gray-900 tracking-tight">ปฏิทินการลา</h1>
          <p className="text-gray-500 mt-1 uppercase text-xs font-bold tracking-widest">ตรวจสอบวันหยุดและตารางการลาของพนักงานทั้งทีม</p>
        </div>
        <div className="hidden md:flex items-center space-x-2 bg-blue-50 px-4 py-2 rounded-2xl border border-blue-100">
          <Info className="w-4 h-4 text-blue-600" />
          <span className="text-xs font-bold text-blue-800 uppercase tracking-wide">Team View Only</span>
        </div>
      </div>

      {/* Calendar Card */}
      <div className="bg-white rounded-3xl shadow-sm border border-gray-100 overflow-hidden">
        {loading ? (
          <div className="p-24 text-center">
            <div className="inline-block w-10 h-10 border-4 border-blue-600 border-t-transparent rounded-full animate-spin mb-4"></div>
            <p className="text-gray-500 font-bold">กำลังประมวลผลข้อมูลปฏิทิน...</p>
          </div>
        ) : (
          <div className="p-4 sm:p-8">
            <LeaveCalendar leaves={leavesWithNames} />
          </div>
        )}
      </div>

      {/* Legend Card */}
      <div className="bg-gray-50 rounded-2xl p-6 flex flex-wrap items-center justify-center gap-6 border border-gray-100">
        <div className="flex items-center space-x-2">
          <div className="w-3 h-3 bg-blue-500 rounded-full"></div>
          <span className="text-xs font-bold text-gray-600 uppercase tracking-widest">ลาพักร้อน</span>
        </div>
        <div className="flex items-center space-x-2">
          <div className="w-3 h-3 bg-green-500 rounded-full"></div>
          <span className="text-xs font-bold text-gray-600 uppercase tracking-widest">ลาป่วย</span>
        </div>
        <div className="flex items-center space-x-2">
          <div className="w-3 h-3 bg-orange-500 rounded-full"></div>
          <span className="text-xs font-bold text-gray-600 uppercase tracking-widest">ลากิจ</span>
        </div>
        <div className="flex items-center space-x-2">
          <div className="w-3 h-3 bg-gray-300 rounded-full"></div>
          <span className="text-xs font-bold text-gray-600 uppercase tracking-widest">รอยืนยัน</span>
        </div>
      </div>
    </div>
  );
}
