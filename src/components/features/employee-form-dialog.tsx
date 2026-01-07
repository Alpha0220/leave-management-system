'use client';

import { useState, useEffect } from 'react';
import { Dialog } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Select } from '@/components/ui/select';
import { Button } from '@/components/ui/button';
import { UserPlus, AlertCircle } from 'lucide-react';

interface EmployeeFormDialogProps {
  open: boolean;
  onClose: () => void;
  onSuccess: () => void;
  employee?: {
    empId: string;
    name: string;
    role: 'admin' | 'employee';
    leaveQuota: number;
    sickLeaveQuota: number;
    personalLeaveQuota: number;
  } | null;
}

export function EmployeeFormDialog({ open, onClose, onSuccess, employee }: EmployeeFormDialogProps) {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [formData, setFormData] = useState({
    empId: '',
    name: '',
    role: 'employee' as 'admin' | 'employee',
    leaveQuota: 10,
    sickLeaveQuota: 30,
    personalLeaveQuota: 6,
  });

  const isEditMode = !!employee;

  // Fetch default settings when dialog opens for new employee
  useEffect(() => {
    const fetchDefaultSettings = async () => {
      if (open && !employee) {
        try {
          const response = await fetch('/api/settings');
          const data = await response.json();

          if (data.success && data.settings) {
            setFormData({
              empId: '',
              name: '',
              role: 'employee',
              leaveQuota: data.settings.annualLeaveMax || 10,
              sickLeaveQuota: data.settings.sickLeaveMax || 30,
              personalLeaveQuota: data.settings.personalLeaveMax || 6,
            });
          }
        } catch (error) {
          console.error('Error fetching default settings:', error);
          // Fallback to hardcoded defaults
          setFormData({
            empId: '',
            name: '',
            role: 'employee',
            leaveQuota: 10,
            sickLeaveQuota: 30,
            personalLeaveQuota: 6,
          });
        }
      }
    };

    fetchDefaultSettings();
  }, [open, employee]);

  // Sync form data when employee prop changes (edit mode)
  useEffect(() => {
    if (open && employee) {
      setFormData({
        empId: employee.empId || '',
        name: employee.name || '',
        role: employee.role || 'employee',
        leaveQuota: employee.leaveQuota ?? 10,
        sickLeaveQuota: employee.sickLeaveQuota ?? 30,
        personalLeaveQuota: employee.personalLeaveQuota ?? 6,
      });
      setError(null);
    }
  }, [open, employee]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      const url = isEditMode ? `/api/users/${employee.empId}` : '/api/users';
      const method = isEditMode ? 'PATCH' : 'POST';

      const response = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      });

      const data = await response.json();

      if (data.success) {
        onSuccess();
        onClose();
      } else {
        setError(data.error || 'บันทึกข้อมูลไม่สำเร็จ');
      }
    } catch {
      setError('เกิดข้อผิดพลาด กรุณาลองใหม่อีกครั้ง');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog 
      open={open} 
      onClose={onClose} 
      title={isEditMode ? 'แก้ไขข้อมูลพนักงาน' : 'เพิ่มพนักงานใหม่'} 
      size="md"
    >
      <form onSubmit={handleSubmit} className="p-6 space-y-6">
        {/* Error Message */}
        {error && (
          <div className="bg-red-50 border border-red-200 rounded-lg p-4 flex items-start space-x-3">
            <AlertCircle className="w-5 h-5 text-red-600 mt-0.5 shrink-0" />
            <p className="text-sm text-red-700">{error}</p>
          </div>
        )}

        {/* Employee ID */}
        <Input
          label="Employee ID"
          required
          value={formData.empId}
          onChange={(e) => setFormData({ ...formData, empId: e.target.value })}
          placeholder="EMP001"
          disabled={isEditMode}
          helperText={isEditMode ? 'ไม่สามารถแก้ไข Employee ID ได้' : 'รหัสพนักงานต้องไม่ซ้ำกัน'}
        />

        {/* Name */}
        <Input
          label="ชื่อ-นามสกุล"
          required
          value={formData.name}
          onChange={(e) => setFormData({ ...formData, name: e.target.value })}
          placeholder="นายสมชาย ใจดี"
        />

        {/* Role */}
        <Select
          label="บทบาท"
          required
          value={formData.role}
          onChange={(e) => setFormData({ ...formData, role: e.target.value as 'admin' | 'employee' })}
          options={[
            { value: 'employee', label: 'พนักงาน' },
            { value: 'admin', label: 'ผู้ดูแลระบบ' },
          ]}
        />

        {/* Leave Quotas */}
        <div className="space-y-4">
          <h3 className="font-bold text-gray-900">โควตาการลา</h3>
          
          <div className="grid grid-cols-3 gap-4">
            <Input
              type="number"
              label="ลาพักร้อน"
              required
              min={0}
              value={formData.leaveQuota}
              onChange={(e) => setFormData({ ...formData, leaveQuota: parseInt(e.target.value) || 0 })}
              helperText="วัน"
            />

            <Input
              type="number"
              label="ลาป่วย"
              required
              min={0}
              value={formData.sickLeaveQuota}
              onChange={(e) => setFormData({ ...formData, sickLeaveQuota: parseInt(e.target.value) || 0 })}
              helperText="วัน"
            />

            <Input
              type="number"
              label="ลากิจ"
              required
              min={0}
              value={formData.personalLeaveQuota}
              onChange={(e) => setFormData({ ...formData, personalLeaveQuota: parseInt(e.target.value) || 0 })}
              helperText="วัน"
            />
          </div>
        </div>

        {/* Info */}
        {!isEditMode && (
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
            <p className="text-xs font-bold text-blue-900 mb-1">ℹ️ หมายเหตุ:</p>
            <p className="text-xs text-blue-700">
              พนักงานจะต้องลงทะเบียนด้วยตัวเองที่หน้า Register เพื่อตั้งรหัสผ่าน
            </p>
          </div>
        )}

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
          >
            <UserPlus className="w-4 h-4 mr-2" />
            {isEditMode ? 'บันทึกการแก้ไข' : 'เพิ่มพนักงาน'}
          </Button>
        </div>
      </form>
    </Dialog>
  );
}
