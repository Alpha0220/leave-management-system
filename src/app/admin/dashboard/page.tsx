'use client';

import { useState, useEffect } from 'react';
import { ProtectedRoute } from '@/components/auth/protected-route';
import { useAuth } from '@/contexts/auth.context';
import { useRouter } from 'next/navigation';
import { Users, FileText, Settings, BarChart, TrendingUp } from 'lucide-react';

interface LeaveRequest {
  id: string;
  empId: string;
  status: 'pending' | 'approved' | 'rejected';
  createdAt: string;
}

export default function AdminDashboardPage() {
  return (
    <ProtectedRoute requireAdmin>
      <AdminDashboardContent />
    </ProtectedRoute>
  );
}

function AdminDashboardContent() {
  const { user } = useAuth();
  const router = useRouter();
  const [stats, setStats] = useState({
    totalEmployees: 0,
    pendingRequests: 0,
    approvedRequests: 0,
    thisMonthRequests: 0,
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchStats();
  }, []);

  const fetchStats = async () => {
    try {
      setLoading(true);
      const [usersRes, leavesRes] = await Promise.all([
        fetch('/api/users'),
        fetch('/api/leaves'),
      ]);

      const usersData = await usersRes.json();
      const leavesData = await leavesRes.json();

      if (usersData.success && leavesData.success) {
        const users = usersData.users || [];
        const leaves = leavesData.leaves || [];

        const currentMonth = new Date().getMonth();
        const currentYear = new Date().getFullYear();

        const thisMonthLeaves = leaves.filter((leave: LeaveRequest) => {
          const leaveDate = new Date(leave.createdAt);
          return leaveDate.getMonth() === currentMonth && 
                 leaveDate.getFullYear() === currentYear;
        });

        setStats({
          totalEmployees: users.length,
          pendingRequests: leaves.filter((l: LeaveRequest) => l.status === 'pending').length,
          approvedRequests: leaves.filter((l: LeaveRequest) => l.status === 'approved').length,
          thisMonthRequests: thisMonthLeaves.length,
        });
      }
    } catch (error) {
      console.error('Error fetching stats:', error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-8">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-black text-gray-900 tracking-tight">แผงควบคุมผู้ดูแลระบบ</h1>
        <p className="text-gray-500 mt-1 uppercase text-xs font-bold tracking-widest">ยินดีต้อนรับ, {user?.name}</p>
      </div>

      {/* Stats Cards */}
      <div className="grid md:grid-cols-4 gap-6">
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-bold text-gray-700">พนักงานทั้งหมด</h3>
            <div className="p-2 bg-blue-50 rounded-lg text-blue-600">
              <Users className="w-6 h-6" />
            </div>
          </div>
          <p className="text-3xl font-black text-blue-600">
            {loading ? '...' : stats.totalEmployees}
          </p>
          <p className="text-[10px] font-bold text-gray-400 mt-1 uppercase tracking-wider">พนักงานทั้งหมด</p>
        </div>

        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-bold text-gray-700">รออนุมัติ</h3>
            <div className="p-2 bg-yellow-50 rounded-lg text-yellow-600">
              <FileText className="w-6 h-6" />
            </div>
          </div>
          <p className="text-3xl font-black text-yellow-600">
            {loading ? '...' : stats.pendingRequests}
          </p>
          <p className="text-[10px] font-bold text-gray-400 mt-1 uppercase tracking-wider">รออนุมัติ</p>
        </div>

        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-bold text-gray-700">อนุมัติแล้ว</h3>
            <div className="p-2 bg-green-50 rounded-lg text-green-600">
              <BarChart className="w-6 h-6" />
            </div>
          </div>
          <p className="text-3xl font-black text-green-600">
            {loading ? '...' : stats.approvedRequests}
          </p>
          <p className="text-[10px] font-bold text-gray-400 mt-1 uppercase tracking-wider">อนุมัติแล้ว</p>
        </div>

        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6 transition-all hover:border-purple-200">
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-bold text-gray-700">คำขอเดือนนี้</h3>
            <div className="p-2 bg-purple-50 rounded-lg text-purple-600">
              <TrendingUp className="w-6 h-6" />
            </div>
          </div>
          <p className="text-3xl font-black text-purple-600">
            {loading ? '...' : stats.thisMonthRequests}
          </p>
          <p className="text-[10px] font-bold text-gray-400 mt-1 uppercase tracking-wider">คำขอเดือนนี้</p>
        </div>
      </div>

      {/* Admin Actions */}
      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-8">
        <h3 className="font-black text-gray-900 mb-6 text-xl">การจัดการระบบ</h3>
        <div className="grid md:grid-cols-3 gap-6">
          <button 
            onClick={() => router.push('/admin/employees')}
            className="group p-6 border-2 border-gray-50 rounded-2xl hover:border-purple-500 hover:bg-purple-50 transition-all text-left relative"
          >
            <div className="w-12 h-12 bg-purple-100 rounded-xl flex items-center justify-center text-purple-600 mb-4 group-hover:bg-purple-600 group-hover:text-white transition-colors">
              <Users className="w-6 h-6" />
            </div>
            <p className="font-black text-lg text-gray-900">จัดการพนักงาน</p>
            <p className="text-sm text-gray-500 mt-1">เพิ่ม แก้ไข หรือระงับบัญชีพนักงาน</p>
          </button>

          <button 
            onClick={() => router.push('/admin/leaves')}
            className="group p-6 border-2 border-gray-50 rounded-2xl hover:border-blue-500 hover:bg-blue-50 transition-all text-left"
          >
            <div className="w-12 h-12 bg-blue-100 rounded-xl flex items-center justify-center text-blue-600 mb-4 group-hover:bg-blue-600 group-hover:text-white transition-colors">
              <FileText className="w-6 h-6" />
            </div>
            <p className="font-black text-lg text-gray-900">อนุมัติคำขอลา</p>
            <p className="text-sm text-gray-500 mt-1">ตรวจสอบและดำเนินการคำขอลาที่ค้างอยู่</p>
          </button>

          <button 
            onClick={() => router.push('/admin/settings')}
            className="group p-6 border-2 border-gray-50 rounded-2xl hover:border-green-500 hover:bg-green-50 transition-all text-left"
          >
            <div className="w-12 h-12 bg-green-100 rounded-xl flex items-center justify-center text-green-600 mb-4 group-hover:bg-green-600 group-hover:text-white transition-colors">
              <Settings className="w-6 h-6" />
            </div>
            <p className="font-black text-lg text-gray-900">ตั้งค่าระบบ</p>
            <p className="text-sm text-gray-500 mt-1">จัดการนโยบายการลาและวันหยุดนักขัตฤกษ์</p>
          </button>
        </div>
      </div>

      {/* Notifications */}
      {!loading && stats.pendingRequests > 0 && (
        <div className="bg-linear-to-r from-yellow-500 to-amber-500 rounded-2xl p-8 text-white shadow-xl shadow-yellow-100 flex items-center justify-between">
          <div className="flex items-center space-x-4">
            <div className="w-14 h-14 bg-white/20 rounded-xl flex items-center justify-center backdrop-blur-md">
              <FileText className="w-8 h-8" />
            </div>
            <div>
              <h3 className="text-2xl font-black">มีคำขอรอดำเนินการ</h3>
              <p className="text-yellow-50 text-sm mt-1">มีพนักงานรอการอนุมัติวันลาทั้งหมด {stats.pendingRequests} รายการ</p>
            </div>
          </div>
          <button
            onClick={() => router.push('/admin/leaves')}
            className="px-6 py-3 bg-white text-yellow-600 font-black rounded-xl hover:bg-yellow-50 transition-colors shadow-lg"
          >
            ไปที่หน้าอนุมัติ
          </button>
        </div>
      )}
    </div>
  );
}
