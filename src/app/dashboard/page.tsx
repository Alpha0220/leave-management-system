'use client';

import { useState, useEffect } from 'react';
import { ProtectedRoute } from '@/components/auth/protected-route';
import { useAuth } from '@/contexts/auth.context';
import { useToast } from '@/contexts/toast.context';
import { useRouter } from 'next/navigation';
import { User, Calendar, FileText } from 'lucide-react';
import { LeaveRequestForm } from '@/components/features/leave-request-form';

export default function DashboardPage() {
  return (
    <ProtectedRoute>
      <DashboardContent />
    </ProtectedRoute>
  );
}

function DashboardContent() {
  const { user, refreshUser } = useAuth();
  const toast = useToast();
  const router = useRouter();
  const [showLeaveForm, setShowLeaveForm] = useState(false);

  // Refresh user data when dashboard loads
  useEffect(() => {
    refreshUser();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []); // Only run on mount

  const handleSuccess = () => {
    toast.success('ส่งคำขอลาสำเร็จ!');
    // Refresh user data after submitting leave request
    refreshUser();
  };

  return (
    <div className="space-y-8">
      {/* User Info Card */}
      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
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

          {user?.role === 'admin' && (
            <button
              onClick={() => router.push('/admin/dashboard')}
              className="px-6 py-3 bg-purple-600 text-white font-black rounded-xl hover:bg-purple-700 transition-colors shadow-lg shadow-purple-100 flex items-center self-end md:self-center"
            >
              เข้าสู่ระบบ Admin
            </button>
          )}
        </div>
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

      {/* Leave Quota Card */}
      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
        <div className="px-6 py-4 border-b border-gray-100">
          <h3 className="font-black text-gray-900 text-lg">โควตาการลา</h3>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full">
            <tbody className="divide-y divide-gray-100">
              {[
                { title: 'ลาพักร้อน', quota: user?.leaveQuota || 0, used: 0 },
                { title: 'ลาป่วย', quota: user?.sickLeaveQuota || 0, used: 0 },
                { title: 'ลากิจ', quota: user?.personalLeaveQuota || 0, used: 0 },
                { title: 'ลาคลอด', quota: user?.maternityLeaveQuota || 0, used: 0 },
                { title: 'ลาทำหมัน', quota: user?.sterilizationLeaveQuota || 0, used: 0 },
                { title: 'ลาไม่รับค่าจ้าง', quota: user?.unpaidLeaveQuota || 0, used: 0 },
                { title: 'ลาฌาปนกิจ', quota: user?.compassionateLeaveQuota || 0, used: 0 },
              ].map((item) => (
                <tr key={item.title} className="hover:bg-gray-50">
                  <td className="px-6 py-4 font-medium text-gray-900">{item.title}</td>
                  <td className="px-6 py-4 text-right font-bold text-gray-900">
                    {item.quota < 999 ? item.quota : 'ไม่จำกัด'}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
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
