'use client';

import { useState } from 'react';
import { useAuth } from '@/contexts/auth.context';
import { Dialog } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Select } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { Button } from '@/components/ui/button';
import { Calendar, AlertCircle } from 'lucide-react';
// Leave type labels will be defined inline

interface LeaveRequestFormProps {
  open: boolean;
  onClose: () => void;
  onSuccess?: () => void;
}

export function LeaveRequestForm({ open, onClose, onSuccess }: LeaveRequestFormProps) {
  const { user } = useAuth();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [formData, setFormData] = useState({
    type: 'annual' as 'annual' | 'sick' | 'personal' | 'maternity' | 'sterilization' | 'unpaid',
    startDate: '',
    endDate: '',
    reason: '',
  });

  const calculateDays = () => {
    if (!formData.startDate || !formData.endDate) return 0;
    
    const start = new Date(formData.startDate);
    const end = new Date(formData.endDate);
    let count = 0;
    const current = new Date(start);

    while (current <= end) {
      const dayOfWeek = current.getDay();
      if (dayOfWeek !== 0 && dayOfWeek !== 6) {
        count++;
      }
      current.setDate(current.getDate() + 1);
    }
    return count;
  };

  const totalDays = calculateDays();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      const response = await fetch('/api/leaves', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...formData,
          empId: user?.empId,
        }),
      });

      const data = await response.json();

      if (data.success) {
        setFormData({ type: 'annual', startDate: '', endDate: '', reason: '' });
        onSuccess?.();
        onClose();
      } else {
        setError(data.error || 'ส่งคำขอลาไม่สำเร็จ');
      }
    } catch {
      setError('เกิดข้อผิดพลาด กรุณาลองใหม่อีกครั้ง');
    } finally {
      setLoading(false);
    }
  };

  const getQuotaForType = () => {
    if (!user) return 0;
    switch (formData.type) {
      case 'annual':
        return user.leaveQuota;
      case 'sick':
        return user.sickLeaveQuota;
      case 'personal':
        return user.personalLeaveQuota;
      case 'maternity':
        return user.maternityLeaveQuota;
      case 'sterilization':
        return user.sterilizationLeaveQuota;
      case 'unpaid':
        return user.unpaidLeaveQuota;
      default:
        return 0;
    }
  };

  const quota = getQuotaForType();
  const isQuotaExceeded = totalDays > quota;

  return (
    <Dialog open={open} onClose={onClose} title="ยื่นคำขอลา" size="md">
      <form onSubmit={handleSubmit} className="p-6 space-y-6">
        {/* Error Message */}
        {error && (
          <div className="bg-red-50 border border-red-200 rounded-lg p-4 flex items-start space-x-3">
            <AlertCircle className="w-5 h-5 text-red-600 mt-0.5 shrink-0" />
            <p className="text-sm text-red-700">{error}</p>
          </div>
        )}

        {/* Leave Type */}
        <Select
          label="ประเภทการลา"
          required
          value={formData.type}
          onChange={(e) => setFormData({ ...formData, type: e.target.value as 'annual' | 'sick' | 'personal' | 'maternity' | 'sterilization' | 'unpaid' })}
          options={[
            { value: 'annual', label: 'ลาพักร้อน' },
            { value: 'sick', label: 'ลาป่วย' },
            { value: 'personal', label: 'ลากิจ' },
            { value: 'maternity', label: 'ลาคลอด' },
            { value: 'sterilization', label: 'ลาทำหมัน' },
            { value: 'unpaid', label: 'ลาไม่รับค่าจ้าง' },
          ]}
        />

        {/* Quota Display */}
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
          <p className="text-sm font-bold text-blue-900">โควตาคงเหลือ</p>
          <p className="text-2xl font-black text-blue-600 mt-1">
            {quota} <span className="text-sm font-normal text-blue-700">วัน</span>
          </p>
        </div>

        {/* Date Range */}
        <div className="grid grid-cols-2 gap-4">
          <Input
            type="date"
            label="วันที่เริ่มต้น"
            required
            value={formData.startDate}
            onChange={(e) => setFormData({ ...formData, startDate: e.target.value })}
          />
          <Input
            type="date"
            label="วันที่สิ้นสุด"
            required
            value={formData.endDate}
            onChange={(e) => setFormData({ ...formData, endDate: e.target.value })}
            min={formData.startDate}
          />
        </div>

        {/* Days Calculation */}
        {totalDays > 0 && (
          <div className={`p-4 rounded-lg border ${isQuotaExceeded ? 'bg-red-50 border-red-200' : 'bg-green-50 border-green-200'}`}>
            <div className="flex items-center justify-between">
              <span className={`text-sm font-bold ${isQuotaExceeded ? 'text-red-900' : 'text-green-900'}`}>
                จำนวนวันลา (ไม่รวมเสาร์-อาทิตย์)
              </span>
              <span className={`text-2xl font-black ${isQuotaExceeded ? 'text-red-600' : 'text-green-600'}`}>
                {totalDays} วัน
              </span>
            </div>
            {isQuotaExceeded && (
              <p className="text-xs text-red-700 mt-2">
                ⚠️ จำนวนวันลาเกินโควตาที่มี
              </p>
            )}
          </div>
        )}

        {/* Reason */}
        <Textarea
          label="เหตุผลการลา"
          required
          value={formData.reason}
          onChange={(e) => setFormData({ ...formData, reason: e.target.value })}
          placeholder="กรุณาระบุเหตุผลการลา..."
          helperText="อธิบายเหตุผลการลาอย่างชัดเจน"
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
            type="submit"
            className="flex-1"
            loading={loading}
            disabled={isQuotaExceeded || totalDays === 0}
          >
            <Calendar className="w-4 h-4 mr-2" />
            ส่งคำขอลา
          </Button>
        </div>
      </form>
    </Dialog>
  );
}
