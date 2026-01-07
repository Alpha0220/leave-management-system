'use client';

import { useState } from 'react';
import { ProtectedRoute } from '@/components/auth/protected-route';
import { useAuth } from '@/contexts/auth.context';
import { useToast } from '@/contexts/toast.context';
import { useRouter } from 'next/navigation';
import { LogOut, User, Calendar, FileText, BarChart } from 'lucide-react';
import { LeaveRequestForm } from '@/components/features/leave-request-form';

export default function DashboardPage() {
  return (
    <ProtectedRoute>
      <DashboardContent />
    </ProtectedRoute>
  );
}

function DashboardContent() {
  const { user, logout } = useAuth();
  const toast = useToast();
  const router = useRouter();
  const [showLeaveForm, setShowLeaveForm] = useState(false);

  const handleLogout = () => {
    logout();
    toast.success('ออกจากระบบสำเร็จ');
    router.push('/login');
  };

  const handleSuccess = () => {
    toast.success('ส่งคำขอลาสำเร็จ!');
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow-sm border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-bold text-gray-900">Dashboard</h1>
              <p className="text-sm text-gray-600">ยินดีต้อนรับ, {user?.name}</p>
            </div>
            <button
              onClick={handleLogout}
              className="flex items-center space-x-2 px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded-lg transition-colors"
            >
              <LogOut className="w-4 h-4" />
              <span>ออกจากระบบ</span>
            </button>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* User Info Card */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 mb-8">
          <div className="flex items-center space-x-4">
            <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center">
              <User className="w-8 h-8 text-blue-600" />
            </div>
            <div>
              <h2 className="text-xl font-bold text-gray-900">{user?.name}</h2>
              <p className="text-sm text-gray-600">Employee ID: {user?.empId}</p>
              <span className={`inline-block mt-1 px-2 py-1 rounded text-xs font-bold ${
                user?.role === 'admin' 
                  ? 'bg-purple-100 text-purple-700' 
                  : 'bg-blue-100 text-blue-700'
              }`}>
                {user?.role === 'admin' ? 'Admin' : 'Employee'}
              </span>
            </div>
          </div>
        </div>

        {/* Leave Quota Cards */}
        <div className="grid md:grid-cols-3 gap-6 mb-8">
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-bold text-gray-900">ลาพักร้อน</h3>
              <Calendar className="w-5 h-5 text-blue-600" />
            </div>
            <p className="text-3xl font-black text-blue-600">{user?.leaveQuota || 0}</p>
            <p className="text-sm text-gray-500 mt-1">วันคงเหลือ</p>
          </div>

          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-bold text-gray-900">ลาป่วย</h3>
              <FileText className="w-5 h-5 text-green-600" />
            </div>
            <p className="text-3xl font-black text-green-600">{user?.sickLeaveQuota || 0}</p>
            <p className="text-sm text-gray-500 mt-1">วันคงเหลือ</p>
          </div>

          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-bold text-gray-900">ลากิจ</h3>
              <BarChart className="w-5 h-5 text-orange-600" />
            </div>
            <p className="text-3xl font-black text-orange-600">{user?.personalLeaveQuota || 0}</p>
            <p className="text-sm text-gray-500 mt-1">วันคงเหลือ</p>
          </div>
        </div>

        {/* Quick Actions */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <h3 className="font-bold text-gray-900 mb-4">Quick Actions</h3>
          <div className="grid md:grid-cols-3 gap-4">
            <button 
              onClick={() => setShowLeaveForm(true)}
              className="p-4 border-2 border-gray-200 rounded-lg hover:border-blue-500 hover:bg-blue-50 transition-all text-left"
            >
              <Calendar className="w-6 h-6 text-blue-600 mb-2" />
              <p className="font-bold text-gray-900">ขอลา</p>
              <p className="text-sm text-gray-600">สร้างคำขอลาใหม่</p>
            </button>

            <button 
              onClick={() => router.push('/leave/history')}
              className="p-4 border-2 border-gray-200 rounded-lg hover:border-green-500 hover:bg-green-50 transition-all text-left"
            >
              <FileText className="w-6 h-6 text-green-600 mb-2" />
              <p className="font-bold text-gray-900">ประวัติการลา</p>
              <p className="text-sm text-gray-600">ดูประวัติการลาทั้งหมด</p>
            </button>

            <button 
              onClick={() => router.push('/calendar')}
              className="p-4 border-2 border-gray-200 rounded-lg hover:border-purple-500 hover:bg-purple-50 transition-all text-left"
            >
              <Calendar className="w-6 h-6 text-purple-600 mb-2" />
              <p className="font-bold text-gray-900">ปฏิทินการลา</p>
              <p className="text-sm text-gray-600">ดูวันลาของทีม</p>
            </button>
          </div>
        </div>

        {/* Admin Link */}
        {user?.role === 'admin' && (
          <div className="mt-6 bg-purple-50 border-2 border-purple-200 rounded-xl p-6">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="font-bold text-purple-900">Admin Panel</h3>
                <p className="text-sm text-purple-700">จัดการพนักงานและอนุมัติคำขอลา</p>
              </div>
              <button
                onClick={() => router.push('/admin/dashboard')}
                className="px-4 py-2 bg-purple-600 hover:bg-purple-700 text-white rounded-lg transition-colors"
              >
                ไปที่ Admin Panel
              </button>
            </div>
          </div>
        )}
      </main>

      {/* Leave Request Form Modal */}
      <LeaveRequestForm
        open={showLeaveForm}
        onClose={() => setShowLeaveForm(false)}
        onSuccess={handleSuccess}
      />
    </div>
  );
}
