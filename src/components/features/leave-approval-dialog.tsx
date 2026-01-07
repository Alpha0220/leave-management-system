'use client';

import { useState } from 'react';
import { Dialog } from '@/components/ui/dialog';
import { Textarea } from '@/components/ui/textarea';
import { Button } from '@/components/ui/button';
import { Check, X } from 'lucide-react';

interface LeaveApprovalDialogProps {
  leave: {
    id: string;
    empId: string;
    employeeName?: string;
    type: string;
    startDate: string;
    endDate: string;
    totalDays: number;
    reason: string;
  } | null;
  onClose: () => void;
  onApprove: (leaveId: string, note?: string) => Promise<void>;
  onReject: (leaveId: string, note: string) => Promise<void>;
}

export function LeaveApprovalDialog({
  leave,
  onClose,
  onApprove,
  onReject,
}: LeaveApprovalDialogProps) {
  const [note, setNote] = useState('');
  const [loading, setLoading] = useState(false);
  const [action, setAction] = useState<'approve' | 'reject' | null>(null);

  if (!leave) return null;

  const handleApprove = async () => {
    setLoading(true);
    setAction('approve');
    try {
      await onApprove(leave.id, note);
      setNote('');
      onClose();
    } finally {
      setLoading(false);
      setAction(null);
    }
  };

  const handleReject = async () => {
    if (!note.trim()) {
      alert('กรุณาระบุเหตุผลในการปฏิเสธ');
      return;
    }
    
    setLoading(true);
    setAction('reject');
    try {
      await onReject(leave.id, note);
      setNote('');
      onClose();
    } finally {
      setLoading(false);
      setAction(null);
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('th-TH', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    });
  };

  return (
    <Dialog open={!!leave} onClose={onClose} title="พิจารณาคำขอลา" size="md">
      <div className="p-6 space-y-6">
        {/* Leave Details */}
        <div className="bg-gray-50 rounded-lg p-4 space-y-3">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <p className="text-xs text-gray-500 mb-1">พนักงาน</p>
              <p className="font-bold text-gray-900">{leave.employeeName}</p>
              <p className="text-xs text-gray-500">{leave.empId}</p>
            </div>
            <div>
              <p className="text-xs text-gray-500 mb-1">ประเภทการลา</p>
              <p className="font-bold text-gray-900">{leave.type}</p>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <p className="text-xs text-gray-500 mb-1">วันที่เริ่มต้น</p>
              <p className="font-medium text-gray-900">{formatDate(leave.startDate)}</p>
            </div>
            <div>
              <p className="text-xs text-gray-500 mb-1">วันที่สิ้นสุด</p>
              <p className="font-medium text-gray-900">{formatDate(leave.endDate)}</p>
            </div>
          </div>

          <div>
            <p className="text-xs text-gray-500 mb-1">จำนวนวัน</p>
            <p className="text-2xl font-black text-blue-600">{leave.totalDays} วัน</p>
          </div>

          <div>
            <p className="text-xs text-gray-500 mb-1">เหตุผล</p>
            <p className="text-gray-900">{leave.reason}</p>
          </div>
        </div>

        {/* Approver Note */}
        <Textarea
          label="หมายเหตุจากผู้อนุมัติ"
          value={note}
          onChange={(e) => setNote(e.target.value)}
          placeholder="ระบุหมายเหตุ (ถ้าปฏิเสธต้องระบุเหตุผล)"
          rows={3}
        />

        {/* Actions */}
        <div className="flex space-x-3 pt-4">
          <Button
            type="button"
            variant="outline"
            onClick={onClose}
            className="flex-1"
            disabled={loading}
          >
            ยกเลิก
          </Button>
          <Button
            type="button"
            variant="destructive"
            onClick={handleReject}
            className="flex-1"
            loading={loading && action === 'reject'}
            disabled={loading}
          >
            <X className="w-4 h-4 mr-2" />
            ปฏิเสธ
          </Button>
          <Button
            type="button"
            variant="success"
            onClick={handleApprove}
            className="flex-1"
            loading={loading && action === 'approve'}
            disabled={loading}
          >
            <Check className="w-4 h-4 mr-2" />
            อนุมัติ
          </Button>
        </div>
      </div>
    </Dialog>
  );
}
