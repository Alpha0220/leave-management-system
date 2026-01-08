'use client';

import { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/auth.context';
import { Badge } from '@/components/ui/badge';
import { Loader2, FileText } from 'lucide-react';

interface LeaveRequest {
  id: string;
  empId: string;
  type: 'annual' | 'sick' | 'personal' | 'maternity' | 'sterilization' | 'unpaid';
  startDate: string;
  endDate: string;
  totalDays: number;
  reason: string;
  status: 'pending' | 'approved' | 'rejected';
  approverNote?: string;
  createdAt: string;
  updatedAt: string;
}

const LEAVE_TYPE_LABELS = {
  annual: 'ลาพักร้อน',
  sick: 'ลาป่วย',
  personal: 'ลากิจ',
  maternity: 'ลาคลอด',
  sterilization: 'ลาทำหมัน',
  unpaid: 'ลาไม่รับค่าจ้าง',
};

const STATUS_VARIANTS = {
  pending: 'warning' as const,
  approved: 'success' as const,
  rejected: 'danger' as const,
};

const STATUS_LABELS = {
  pending: 'รออนุมัติ',
  approved: 'อนุมัติแล้ว',
  rejected: 'ปฏิเสธ',
};

export function LeaveHistoryTable() {
  const { user } = useAuth();
  const [leaves, setLeaves] = useState<LeaveRequest[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetchLeaves();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const fetchLeaves = async () => {
    if (!user) return;

    try {
      setLoading(true);
      const response = await fetch(`/api/leaves?empId=${user.empId}`);
      const data = await response.json();

      if (data.success) {
        setLeaves(data.leaves || []);
      } else {
        setError(data.error || 'ไม่สามารถโหลดข้อมูลได้');
      }
    } catch {
      setError('เกิดข้อผิดพลาดในการโหลดข้อมูล');
    } finally {
      setLoading(false);
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('th-TH', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    });
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <Loader2 className="w-8 h-8 animate-spin text-blue-600" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-red-50 border border-red-200 rounded-lg p-4 text-center">
        <p className="text-red-700">{error}</p>
      </div>
    );
  }

  if (leaves.length === 0) {
    return (
      <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-12 text-center">
        <div className="inline-flex p-4 bg-gray-50 rounded-full mb-4">
          <FileText className="w-8 h-8 text-gray-300" />
        </div>
        <p className="text-gray-500 font-medium">ไม่มีประวัติการลาในขณะนี้</p>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
      <div className="overflow-x-auto">
        <table className="w-full text-left">
          <thead className="bg-gray-50 border-b border-gray-100">
            <tr>
              <th className="px-6 py-4 text-xs font-bold text-gray-500 uppercase tracking-wider">
                ประเภท
              </th>
              <th className="px-6 py-4 text-xs font-bold text-gray-500 uppercase tracking-wider">
                วันที่
              </th>
              <th className="px-6 py-4 text-xs font-bold text-gray-500 uppercase tracking-wider text-center">
                จำนวนวัน
              </th>
              <th className="px-6 py-4 text-xs font-bold text-gray-500 uppercase tracking-wider">
                เหตุผล
              </th>
              <th className="px-6 py-4 text-xs font-bold text-gray-500 uppercase tracking-wider">
                สถานะ
              </th>
              <th className="px-6 py-4 text-xs font-bold text-gray-500 uppercase tracking-wider">
                หมายเหตุ
              </th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100">
            {leaves.map((leave) => (
              <tr key={leave.id} className="hover:bg-gray-50 transition-colors">
                <td className="px-6 py-4 font-bold text-gray-900">
                  {LEAVE_TYPE_LABELS[leave.type]}
                </td>
                <td className="px-6 py-4 text-sm text-gray-600">
                  <div>{formatDate(leave.startDate)}</div>
                  <div className="text-gray-400 text-xs">
                    ถึง {formatDate(leave.endDate)}
                  </div>
                </td>
                <td className="px-6 py-4 text-center font-bold text-blue-600">
                  {leave.totalDays}
                </td>
                <td className="px-6 py-4 text-sm text-gray-600 max-w-xs truncate">
                  {leave.reason}
                </td>
                <td className="px-6 py-4">
                  <Badge variant={STATUS_VARIANTS[leave.status]}>
                    {STATUS_LABELS[leave.status]}
                  </Badge>
                </td>
                <td className="px-6 py-4 text-sm text-gray-500 max-w-xs truncate">
                  {leave.approverNote || '-'}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}