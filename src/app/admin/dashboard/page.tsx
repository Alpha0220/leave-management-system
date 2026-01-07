'use client';

import { useState, useEffect } from 'react';
import { ProtectedRoute } from '@/components/auth/protected-route';
import { useAuth } from '@/contexts/auth.context';
import { useRouter } from 'next/navigation';
import { LogOut, Users, FileText, Settings, BarChart, TrendingUp } from 'lucide-react';

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
  const { user, logout } = useAuth();
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
      
      // Fetch users and leaves
      const [usersRes, leavesRes] = await Promise.all([
        fetch('/api/users'),
        fetch('/api/leaves'),
      ]);

      const usersData = await usersRes.json();
      const leavesData = await leavesRes.json();

      if (usersData.success && leavesData.success) {
        const users = usersData.users || [];
        const leaves = leavesData.leaves || [];

        // Calculate stats
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

  const handleLogout = () => {
    logout();
    router.push('/login');
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-linear-to-r from-purple-600 to-pink-600 text-white shadow-lg">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold">Admin Dashboard</h1>
              <p className="text-purple-100 mt-1">ยินดีต้อนรับ, {user?.name}</p>
            </div>
            <div className="flex items-center space-x-4">
              <button
                onClick={() => router.push('/dashboard')}
                className="px-4 py-2 bg-white/20 hover:bg-white/30 rounded-lg transition-colors"
              >
                Employee View
              </button>
              <button
                onClick={handleLogout}
                className="flex items-center space-x-2 px-4 py-2 bg-red-600 hover:bg-red-700 rounded-lg transition-colors"
              >
                <LogOut className="w-4 h-4" />
                <span>ออกจากระบบ</span>
              </button>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Stats Cards */}
        <div className="grid md:grid-cols-4 gap-6 mb-8">
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-bold text-gray-700">Total Employees</h3>
              <Users className="w-6 h-6 text-blue-600" />
            </div>
            <p className="text-3xl font-black text-blue-600">
              {loading ? '...' : stats.totalEmployees}
            </p>
            <p className="text-sm text-gray-500 mt-1">พนักงานทั้งหมด</p>
          </div>

          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-bold text-gray-700">Pending Requests</h3>
              <FileText className="w-6 h-6 text-yellow-600" />
            </div>
            <p className="text-3xl font-black text-yellow-600">
              {loading ? '...' : stats.pendingRequests}
            </p>
            <p className="text-sm text-gray-500 mt-1">รออนุมัติ</p>
          </div>

          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-bold text-gray-700">Approved</h3>
              <BarChart className="w-6 h-6 text-green-600" />
            </div>
            <p className="text-3xl font-black text-green-600">
              {loading ? '...' : stats.approvedRequests}
            </p>
            <p className="text-sm text-gray-500 mt-1">อนุมัติแล้ว</p>
          </div>

          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-bold text-gray-700">This Month</h3>
              <TrendingUp className="w-6 h-6 text-purple-600" />
            </div>
            <p className="text-3xl font-black text-purple-600">
              {loading ? '...' : stats.thisMonthRequests}
            </p>
            <p className="text-sm text-gray-500 mt-1">คำขอเดือนนี้</p>
          </div>
        </div>

        {/* Admin Actions */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 mb-8">
          <h3 className="font-bold text-gray-900 mb-4">Admin Actions</h3>
          <div className="grid md:grid-cols-3 gap-4">
            <button 
              onClick={() => router.push('/admin/employees')}
              className="p-4 border-2 border-gray-200 rounded-lg hover:border-purple-500 hover:bg-purple-50 transition-all text-left"
            >
              <Users className="w-6 h-6 text-purple-600 mb-2" />
              <p className="font-bold text-gray-900">จัดการพนักงาน</p>
              <p className="text-sm text-gray-600">เพิ่ม แก้ไข ลบพนักงาน</p>
            </button>

            <button 
              onClick={() => router.push('/admin/leaves')}
              className="p-4 border-2 border-gray-200 rounded-lg hover:border-blue-500 hover:bg-blue-50 transition-all text-left"
            >
              <FileText className="w-6 h-6 text-blue-600 mb-2" />
              <p className="font-bold text-gray-900">อนุมัติคำขอลา</p>
              <p className="text-sm text-gray-600">ดูและอนุมัติคำขอ</p>
            </button>

            <button 
              onClick={() => router.push('/admin/settings')}
              className="p-4 border-2 border-gray-200 rounded-lg hover:border-green-500 hover:bg-green-50 transition-all text-left"
            >
              <Settings className="w-6 h-6 text-green-600 mb-2" />
              <p className="font-bold text-gray-900">ตั้งค่าระบบ</p>
              <p className="text-sm text-gray-600">จัดการวันหยุด โควตา</p>
            </button>
          </div>
        </div>

        {/* Quick Stats */}
        {!loading && stats.pendingRequests > 0 && (
          <div className="bg-yellow-50 border-2 border-yellow-200 rounded-xl p-6">
            <div className="flex items-start space-x-3">
              <FileText className="w-6 h-6 text-yellow-600 mt-0.5" />
              <div>
                <h3 className="font-bold text-yellow-900 mb-1">
                  มีคำขอลารออนุมัติ {stats.pendingRequests} รายการ
                </h3>
                <p className="text-sm text-yellow-700 mb-3">
                  กรุณาตรวจสอบและอนุมัติคำขอลาที่รออยู่
                </p>
                <button
                  onClick={() => router.push('/admin/leaves')}
                  className="px-4 py-2 bg-yellow-600 hover:bg-yellow-700 text-white rounded-lg transition-colors text-sm font-medium"
                >
                  ไปที่หน้าอนุมัติคำขอ
                </button>
              </div>
            </div>
          </div>
        )}
      </main>
    </div>
  );
}
