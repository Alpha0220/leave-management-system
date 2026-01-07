'use client';

import { ProtectedRoute } from '@/components/auth/protected-route';
import { useAuth } from '@/contexts/auth.context';
import { useRouter } from 'next/navigation';
import { LogOut, Users, FileText, Settings, BarChart } from 'lucide-react';

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
            <p className="text-3xl font-black text-gray-900">-</p>
            <p className="text-sm text-gray-500 mt-1">พนักงานทั้งหมด</p>
          </div>

          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-bold text-gray-700">Pending Requests</h3>
              <FileText className="w-6 h-6 text-yellow-600" />
            </div>
            <p className="text-3xl font-black text-gray-900">-</p>
            <p className="text-sm text-gray-500 mt-1">รออนุมัติ</p>
          </div>

          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-bold text-gray-700">Approved</h3>
              <BarChart className="w-6 h-6 text-green-600" />
            </div>
            <p className="text-3xl font-black text-gray-900">-</p>
            <p className="text-sm text-gray-500 mt-1">อนุมัติแล้ว</p>
          </div>

          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-bold text-gray-700">This Month</h3>
              <Settings className="w-6 h-6 text-purple-600" />
            </div>
            <p className="text-3xl font-black text-gray-900">-</p>
            <p className="text-sm text-gray-500 mt-1">เดือนนี้</p>
          </div>
        </div>

        {/* Admin Actions */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 mb-8">
          <h3 className="font-bold text-gray-900 mb-4">Admin Actions</h3>
          <div className="grid md:grid-cols-3 gap-4">
            <button className="p-4 border-2 border-gray-200 rounded-lg hover:border-purple-500 hover:bg-purple-50 transition-all text-left">
              <Users className="w-6 h-6 text-purple-600 mb-2" />
              <p className="font-bold text-gray-900">จัดการพนักงาน</p>
              <p className="text-sm text-gray-600">เพิ่ม แก้ไข ลบพนักงาน</p>
            </button>

            <button className="p-4 border-2 border-gray-200 rounded-lg hover:border-blue-500 hover:bg-blue-50 transition-all text-left">
              <FileText className="w-6 h-6 text-blue-600 mb-2" />
              <p className="font-bold text-gray-900">อนุมัติคำขอลา</p>
              <p className="text-sm text-gray-600">ดูและอนุมัติคำขอ</p>
            </button>

            <button className="p-4 border-2 border-gray-200 rounded-lg hover:border-green-500 hover:bg-green-50 transition-all text-left">
              <Settings className="w-6 h-6 text-green-600 mb-2" />
              <p className="font-bold text-gray-900">ตั้งค่าระบบ</p>
              <p className="text-sm text-gray-600">จัดการวันหยุด โควตา</p>
            </button>
          </div>
        </div>

        {/* Info Box */}
        <div className="bg-blue-50 border-2 border-blue-200 rounded-xl p-6">
          <h3 className="font-bold text-blue-900 mb-2">🎉 Authentication System Complete!</h3>
          <p className="text-blue-700 mb-4">
            ระบบ Authentication พร้อมใช้งานแล้ว! คุณสามารถ:
          </p>
          <ul className="text-sm text-blue-700 space-y-1 list-disc list-inside">
            <li>Login/Logout ได้สำเร็จ</li>
            <li>ระบบแยก role (Admin/Employee) ได้ถูกต้อง</li>
            <li>Protected routes ทำงานได้ปกติ</li>
            <li>Session ถูกเก็บใน localStorage</li>
          </ul>
          <p className="text-sm text-blue-600 mt-4">
            ขั้นตอนต่อไป: สร้าง UI Components และ Pages สำหรับจัดการพนักงานและคำขอลา
          </p>
        </div>
      </main>
    </div>
  );
}
