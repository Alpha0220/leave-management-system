'use client';

import { useState } from 'react';
import { ProtectedRoute } from '@/components/auth/protected-route';
import { useAuth } from '@/contexts/auth.context';
import { useToast } from '@/contexts/toast.context';
import { useRouter } from 'next/navigation';
import { User, Calendar, FileText, BarChart } from 'lucide-react';
import { LeaveRequestForm } from '@/components/features/leave-request-form';

export default function DashboardPage() {
  return (
    <ProtectedRoute>
      <DashboardContent />
    </ProtectedRoute>
  );
}

function DashboardContent() {
  const { user } = useAuth();
  const toast = useToast();
  const router = useRouter();
  const [showLeaveForm, setShowLeaveForm] = useState(false);

  const handleSuccess = () => {
    toast.success('ส่งคำขอลาสำเร็จ!');
  };

  return (
    <div className="space-y-8">
      {/* Page Title */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-black text-gray-900 tracking-tight">แดชบอร์ด</h1>
          <p className="text-gray-500 mt-1 uppercase text-xs font-bold tracking-widest">ยินดีต้อนรับสู่ระบบจัดการการลา</p>
        </div>
        {user?.role === 'admin' && (
          <button
            onClick={() => router.push('/admin/dashboard')}
            className="px-6 py-3 bg-purple-600 text-white font-black rounded-xl hover:bg-purple-700 transition-colors shadow-lg shadow-purple-100 flex items-center"
          >
            เข้าสู่ระบบ Admin
          </button>
        )}
      </div>

      {/* User Info Card */}
      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
        <div className="flex items-center space-x-6">
          <div className="w-20 h-20 bg-linear-to-br from-blue-100 to-indigo-100 rounded-2xl flex items-center justify-center border border-blue-50">
            <User className="w-10 h-10 text-blue-600" />
          </div>
          <div>
            <h2 className="text-2xl font-black text-gray-900">{user?.name}</h2>
            <div className="flex items-center space-x-3 mt-1">
              <p className="text-sm font-medium text-gray-500">Employee ID: <span className="text-gray-900 font-bold">{user?.empId}</span></p>
              <div className="w-1 h-1 bg-gray-300 rounded-full"></div>
              <span className={`px-2 py-0.5 rounded text-[10px] font-black uppercase tracking-wider ${
                user?.role === 'admin' 
                  ? 'bg-purple-100 text-purple-700' 
                  : 'bg-blue-100 text-blue-700'
              }`}>
                {user?.role === 'admin' ? 'Admin' : 'Employee'}
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Leave Quota Cards */}
      <div className="grid md:grid-cols-3 gap-6">
        {[
          { title: 'ลาพักร้อน', value: user?.leaveQuota, icon: Calendar, color: 'text-blue-600', bg: 'bg-blue-50' },
          { title: 'ลาป่วย', value: user?.sickLeaveQuota, icon: FileText, color: 'text-green-600', bg: 'bg-green-50' },
          { title: 'ลากิจ', value: user?.personalLeaveQuota, icon: BarChart, color: 'text-orange-600', bg: 'bg-orange-50' },
        ].map((item) => (
          <div key={item.title} className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6 group hover:border-blue-200 transition-all">
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-bold text-gray-900">{item.title}</h3>
              <div className={`p-2 ${item.bg} rounded-lg ${item.color}`}>
                <item.icon className="w-5 h-5" />
              </div>
            </div>
            <p className={`text-4xl font-black ${item.color}`}>{item.value || 0}</p>
            <p className="text-xs font-bold text-gray-400 mt-1 uppercase tracking-wider">วันคงเหลือ</p>
          </div>
        ))}
      </div>

      {/* Quick Actions */}
      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-8">
        <h3 className="font-black text-gray-900 mb-6 text-xl">ทางลัดการใช้งาน</h3>
        <div className="grid md:grid-cols-3 gap-6">
          <button 
            onClick={() => setShowLeaveForm(true)}
            className="group p-6 border-2 border-gray-50 rounded-2xl hover:border-blue-500 hover:bg-blue-50 transition-all text-left relative overflow-hidden"
          >
            <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:scale-125 transition-transform">
              <Calendar className="w-20 h-20 text-blue-600" />
            </div>
            <div className="w-12 h-12 bg-blue-100 rounded-xl flex items-center justify-center text-blue-600 mb-4 group-hover:bg-blue-600 group-hover:text-white transition-colors">
              <Calendar className="w-6 h-6" />
            </div>
            <p className="font-black text-lg text-gray-900">ขอลา</p>
            <p className="text-sm text-gray-500 mt-1">สร้างคำขอลาใหม่ทันที</p>
          </button>

          <button 
            onClick={() => router.push('/leave/history')}
            className="group p-6 border-2 border-gray-50 rounded-2xl hover:border-green-500 hover:bg-green-50 transition-all text-left relative overflow-hidden"
          >
            <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:scale-125 transition-transform">
              <FileText className="w-20 h-20 text-green-600" />
            </div>
            <div className="w-12 h-12 bg-green-100 rounded-xl flex items-center justify-center text-green-600 mb-4 group-hover:bg-green-600 group-hover:text-white transition-colors">
              <FileText className="w-6 h-6" />
            </div>
            <p className="font-black text-lg text-gray-900">ประวัติการลา</p>
            <p className="text-sm text-gray-500 mt-1">ตรวจสอบรายการลาทั้งหมด</p>
          </button>

          <button 
            onClick={() => router.push('/calendar')}
            className="group p-6 border-2 border-gray-50 rounded-2xl hover:border-purple-500 hover:bg-purple-50 transition-all text-left relative overflow-hidden"
          >
            <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:scale-125 transition-transform">
              <Calendar className="w-20 h-20 text-purple-600" />
            </div>
            <div className="w-12 h-12 bg-purple-100 rounded-xl flex items-center justify-center text-purple-600 mb-4 group-hover:bg-purple-600 group-hover:text-white transition-colors">
              <Calendar className="w-6 h-6" />
            </div>
            <p className="font-black text-lg text-gray-900">ปฏิทินการลา</p>
            <p className="text-sm text-gray-500 mt-1">ดูวันลาของเพื่อนร่วมทีม</p>
          </button>
        </div>
      </div>


      {/* Leave Request Form Modal */}
      <LeaveRequestForm
        open={showLeaveForm}
        onClose={() => setShowLeaveForm(false)}
        onSuccess={handleSuccess}
      />
    </div>
  );
}
