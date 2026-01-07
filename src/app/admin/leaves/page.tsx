'use client';

import { useState, useEffect } from 'react';
import { ProtectedRoute } from '@/components/auth/protected-route';
import { useAuth } from '@/contexts/auth.context';
import { useRouter } from 'next/navigation';
import { LogOut, CheckCircle, Clock, Users } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { LeaveApprovalDialog } from '@/components/features/leave-approval-dialog';

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
  const { logout } = useAuth();
  const router = useRouter();
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
  } | null>(null);
  const [filter, setFilter] = useState<'all' | 'pending' | 'approved' | 'rejected'>('pending');

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      setLoading(true);
      
      // Fetch all leaves
      const leavesRes = await fetch('/api/leaves');
      const leavesData = await leavesRes.json();
      
      // Fetch all users
      const usersRes = await fetch('/api/users');
      const usersData = await usersRes.json();

      if (leavesData.success) {
        setLeaves(leavesData.leaves || []);
      }
      
      if (usersData.success) {
        setUsers(usersData.users || []);
      }
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

      if (response.ok) {
        await fetchData();
      }
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

      if (response.ok) {
        await fetchData();
      }
    } catch (error) {
      console.error('Error rejecting leave:', error);
    }
  };

  const filteredLeaves = leaves.filter(leave => {
    if (filter === 'all') return true;
    return leave.status === filter;
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
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-linear-to-r from-purple-600 to-pink-600 text-white shadow-lg">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <button
                onClick={() => router.push('/admin/dashboard')}
                className="text-white/80 hover:text-white transition-colors"
              >
                ← กลับ
              </button>
              <div>
                <h1 className="text-3xl font-bold">จัดการคำขอลา</h1>
                <p className="text-purple-100 mt-1">อนุมัติและปฏิเสธคำขอลา</p>
              </div>
            </div>
            <button
              onClick={() => { logout(); router.push('/login'); }}
              className="flex items-center space-x-2 px-4 py-2 bg-red-600 hover:bg-red-700 rounded-lg transition-colors"
            >
              <LogOut className="w-4 h-4" />
              <span>ออกจากระบบ</span>
            </button>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Stats */}
        <div className="grid md:grid-cols-3 gap-6 mb-8">
          <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-500 mb-1">รออนุมัติ</p>
                <p className="text-3xl font-black text-yellow-600">{pendingCount}</p>
              </div>
              <Clock className="w-8 h-8 text-yellow-600" />
            </div>
          </div>

          <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-500 mb-1">อนุมัติแล้ว</p>
                <p className="text-3xl font-black text-green-600">{approvedCount}</p>
              </div>
              <CheckCircle className="w-8 h-8 text-green-600" />
            </div>
          </div>

          <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-500 mb-1">ทั้งหมด</p>
                <p className="text-3xl font-black text-blue-600">{leaves.length}</p>
              </div>
              <Users className="w-8 h-8 text-blue-600" />
            </div>
          </div>
        </div>

        {/* Filter Tabs */}
        <div className="flex space-x-2 mb-6 bg-gray-100 p-1.5 rounded-xl w-fit">
          <button
            onClick={() => setFilter('pending')}
            className={`px-6 py-2.5 rounded-lg text-sm font-bold transition-all ${
              filter === 'pending' ? 'bg-white text-yellow-600 shadow-sm' : 'text-gray-500 hover:text-gray-700'
            }`}
          >
            รออนุมัติ ({pendingCount})
          </button>
          <button
            onClick={() => setFilter('approved')}
            className={`px-6 py-2.5 rounded-lg text-sm font-bold transition-all ${
              filter === 'approved' ? 'bg-white text-green-600 shadow-sm' : 'text-gray-500 hover:text-gray-700'
            }`}
          >
            อนุมัติแล้ว
          </button>
          <button
            onClick={() => setFilter('rejected')}
            className={`px-6 py-2.5 rounded-lg text-sm font-bold transition-all ${
              filter === 'rejected' ? 'bg-white text-red-600 shadow-sm' : 'text-gray-500 hover:text-gray-700'
            }`}
          >
            ปฏิเสธ
          </button>
          <button
            onClick={() => setFilter('all')}
            className={`px-6 py-2.5 rounded-lg text-sm font-bold transition-all ${
              filter === 'all' ? 'bg-white text-blue-600 shadow-sm' : 'text-gray-500 hover:text-gray-700'
            }`}
          >
            ทั้งหมด
          </button>
        </div>

        {/* Leaves Table */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
          {loading ? (
            <div className="p-12 text-center">
              <p className="text-gray-500">กำลังโหลด...</p>
            </div>
          ) : filteredLeaves.length === 0 ? (
            <div className="p-12 text-center">
              <p className="text-gray-500">ไม่มีคำขอลาในหมวดนี้</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left">
                <thead className="bg-gray-50 border-b border-gray-100">
                  <tr>
                    <th className="px-6 py-4 text-xs font-bold text-gray-500 uppercase">พนักงาน</th>
                    <th className="px-6 py-4 text-xs font-bold text-gray-500 uppercase">ประเภท</th>
                    <th className="px-6 py-4 text-xs font-bold text-gray-500 uppercase">วันที่</th>
                    <th className="px-6 py-4 text-xs font-bold text-gray-500 uppercase">เหตุผล</th>
                    <th className="px-6 py-4 text-xs font-bold text-gray-500 uppercase">สถานะ</th>
                    <th className="px-6 py-4 text-xs font-bold text-gray-500 uppercase">การจัดการ</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                  {filteredLeaves.map((leave) => (
                    <tr key={leave.id} className="hover:bg-gray-50 transition-colors">
                      <td className="px-6 py-4">
                        <div className="font-bold text-gray-900">{getUserName(leave.empId)}</div>
                        <div className="text-xs text-gray-400">{leave.empId}</div>
                      </td>
                      <td className="px-6 py-4 font-medium text-gray-700">
                        {LEAVE_TYPE_LABELS[leave.type]}
                      </td>
                      <td className="px-6 py-4 text-sm">
                        <div className="font-bold text-blue-600">{leave.totalDays} วัน</div>
                        <div className="text-xs text-gray-500">
                          {formatDate(leave.startDate)} - {formatDate(leave.endDate)}
                        </div>
                      </td>
                      <td className="px-6 py-4 text-sm text-gray-600 max-w-xs truncate">
                        {leave.reason}
                      </td>
                      <td className="px-6 py-4">
                        <Badge
                          variant={
                            leave.status === 'pending' ? 'warning' :
                            leave.status === 'approved' ? 'success' : 'danger'
                          }
                        >
                          {leave.status === 'pending' ? 'รออนุมัติ' :
                           leave.status === 'approved' ? 'อนุมัติแล้ว' : 'ปฏิเสธ'}
                        </Badge>
                      </td>
                      <td className="px-6 py-4">
                        {leave.status === 'pending' ? (
                          <Button
                            size="sm"
                            onClick={() => setSelectedLeave({
                              ...leave,
                              employeeName: getUserName(leave.empId),
                              type: LEAVE_TYPE_LABELS[leave.type],
                            })}
                          >
                            พิจารณา
                          </Button>
                        ) : (
                          <span className="text-xs text-gray-400">
                            {leave.approverNote || '-'}
                          </span>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </main>

      {/* Approval Dialog */}
      <LeaveApprovalDialog
        leave={selectedLeave}
        onClose={() => setSelectedLeave(null)}
        onApprove={handleApprove}
        onReject={handleReject}
      />
    </div>
  );
}
