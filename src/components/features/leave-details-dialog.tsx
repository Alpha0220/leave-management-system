'use client';

import { Dialog } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Calendar, Clock, User, FileText, CheckCircle, XCircle } from 'lucide-react';

interface LeaveDetailsDialogProps {
  leave: {
    id: string;
    empId: string;
    employeeName?: string;
    type: string;
    startDate: string;
    endDate: string;
    totalDays: number;
    reason: string;
    status: 'pending' | 'approved' | 'rejected';
    approverNote?: string;
  } | null;
  onClose: () => void;
}

export function LeaveDetailsDialog({
  leave,
  onClose,
}: LeaveDetailsDialogProps) {
  if (!leave) return null;

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('th-TH', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    });
  };

  const STATUS_LABELS = {
    pending: 'รอพิจารณา',
    approved: 'อนุมัติแล้ว',
    rejected: 'ปฏิเสธ/ยกเลิก',
  };

  const STATUS_VARIANTS = {
    pending: 'warning',
    approved: 'success',
    rejected: 'danger',
  } as const;

  return (
    <Dialog open={!!leave} onClose={onClose} title="รายละเอียดคำขอลา" size="md">
      <div className="p-6 space-y-6">
        {/* Status Header */}
        <div className="flex items-center justify-between p-4 bg-gray-50 rounded-xl border border-gray-100">
          <div className="flex items-center space-x-3">
            <div className={`p-2 rounded-lg ${
              leave.status === 'approved' ? 'bg-green-100 text-green-600' : 
              leave.status === 'rejected' ? 'bg-red-100 text-red-600' : 'bg-yellow-100 text-yellow-600'
            }`}>
              {leave.status === 'approved' ? <CheckCircle className="w-5 h-5" /> : 
               leave.status === 'rejected' ? <XCircle className="w-5 h-5" /> : <Clock className="w-5 h-5" />}
            </div>
            <div>
              <p className="text-[11px] font-semibold text-gray-500 uppercase tracking-wide leading-none">สถานะปัจจุบัน</p>
              <p className="text-base font-bold text-gray-900 mt-1">{STATUS_LABELS[leave.status]}</p>
            </div>
          </div>
          <Badge variant={STATUS_VARIANTS[leave.status]} className="px-3 py-1.5 rounded-lg font-bold uppercase text-[10px] tracking-wide">
            {leave.status}
          </Badge>
        </div>

        {/* Info Grid */}
        <div className="grid grid-cols-2 gap-5">
          <div className="space-y-2">
            <div className="flex items-center text-gray-500 space-x-2">
              <User className="w-4 h-4" />
              <p className="text-[11px] font-semibold uppercase tracking-wide">พนักงาน</p>
            </div>
            <p className="text-base font-bold text-gray-900">{leave.employeeName}</p>
            <p className="text-xs font-medium text-gray-600">{leave.empId}</p>
          </div>
          <div className="space-y-2">
            <div className="flex items-center text-gray-500 space-x-2">
              <FileText className="w-4 h-4" />
              <p className="text-[11px] font-semibold uppercase tracking-wide">ประเภทการลา</p>
            </div>
            <p className="text-base font-bold text-gray-900">{leave.type}</p>
          </div>
        </div>

        {/* Date Section */}
        <div className="bg-blue-50/50 p-5 rounded-2xl border border-blue-100/50 space-y-4">
          <div className="flex items-center justify-between">
            <div className="space-y-1">
              <p className="text-[11px] font-semibold text-blue-500 uppercase tracking-wide">ระยะเวลาการลา</p>
              <p className="text-2xl font-bold text-blue-600 leading-none">{leave.totalDays} วัน</p>
            </div>
            <Calendar className="w-8 h-8 text-blue-200" />
          </div>
          <div className="grid grid-cols-2 gap-4 pt-3 border-t border-blue-100">
            <div>
              <p className="text-[11px] font-semibold text-blue-500 uppercase mb-1">เริ่มต้น</p>
              <p className="text-sm font-bold text-gray-900">{formatDate(leave.startDate)}</p>
            </div>
            <div>
              <p className="text-[11px] font-semibold text-blue-500 uppercase mb-1">สิ้นสุด</p>
              <p className="text-sm font-bold text-gray-900">{formatDate(leave.endDate)}</p>
            </div>
          </div>
        </div>

        {/* Reason */}
        <div className="space-y-2">
          <p className="text-[11px] font-semibold text-gray-500 uppercase tracking-wide">เหตุผลการลา</p>
          <div className="p-4 bg-gray-50 rounded-xl border border-gray-100 text-sm font-medium text-gray-700 leading-relaxed">
            {leave.reason}
          </div>
        </div>

        {/* Approver Remark */}
        {leave.status !== 'pending' && (
          <div className="space-y-2">
            <p className="text-[11px] font-semibold text-gray-500 uppercase tracking-wide">หมายเหตุจากผู้อนุมัติ</p>
            <div className={`p-4 rounded-xl border text-sm font-medium leading-relaxed ${
              leave.status === 'approved' ? 'bg-green-50 border-green-100 text-green-800' : 'bg-red-50 border-red-100 text-red-800'
            }`}>
              {leave.approverNote || 'ไม่มีหมายเหตุ'}
            </div>
          </div>
        )}

        {/* Close Button */}
        <div className="pt-4">
          <Button
            onClick={onClose}
            className="w-full bg-gray-900 hover:bg-black text-white font-bold py-3 rounded-xl shadow-md transition-all active:scale-[0.98] text-sm"
          >
            ปิดหน้าต่าง
          </Button>
        </div>
      </div>
    </Dialog>
  );
}
