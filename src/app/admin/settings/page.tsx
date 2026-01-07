'use client';

import { useState } from 'react';
import { ProtectedRoute } from '@/components/auth/protected-route';
import { useAuth } from '@/contexts/auth.context';
import { useRouter } from 'next/navigation';
import { LogOut, Settings as SettingsIcon, Save } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Card, CardHeader, CardContent } from '@/components/ui/card';

export default function AdminSettingsPage() {
  return (
    <ProtectedRoute requireAdmin>
      <AdminSettingsContent />
    </ProtectedRoute>
  );
}

function AdminSettingsContent() {
  const { logout } = useAuth();
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [settings, setSettings] = useState({
    defaultAnnualLeave: 10,
    defaultSickLeave: 30,
    defaultPersonalLeave: 6,
  });

  const handleSave = async () => {
    setLoading(true);
    try {
      const response = await fetch('/api/settings', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(settings),
      });

      if (response.ok) {
        alert('บันทึกการตั้งค่าสำเร็จ');
      }
    } catch (error) {
      console.error('Error saving settings:', error);
      alert('เกิดข้อผิดพลาดในการบันทึก');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-linear-to-r from-green-600 to-teal-600 text-white shadow-lg">
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
                <h1 className="text-3xl font-bold">ตั้งค่าระบบ</h1>
                <p className="text-green-100 mt-1">จัดการการตั้งค่าต่างๆ ของระบบ</p>
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
      <main className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="space-y-6">
          {/* Default Leave Quotas */}
          <Card>
            <CardHeader>
              <div className="flex items-center space-x-3">
                <SettingsIcon className="w-6 h-6 text-green-600" />
                <div>
                  <h2 className="text-xl font-bold text-gray-900">โควตาการลาเริ่มต้น</h2>
                  <p className="text-sm text-gray-600">กำหนดจำนวนวันลาเริ่มต้นสำหรับพนักงานใหม่</p>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <div className="grid md:grid-cols-3 gap-6">
                <Input
                  type="number"
                  label="ลาพักร้อน"
                  min={0}
                  value={settings.defaultAnnualLeave}
                  onChange={(e) => setSettings({ ...settings, defaultAnnualLeave: parseInt(e.target.value) || 0 })}
                  helperText="วันต่อปี"
                />

                <Input
                  type="number"
                  label="ลาป่วย"
                  min={0}
                  value={settings.defaultSickLeave}
                  onChange={(e) => setSettings({ ...settings, defaultSickLeave: parseInt(e.target.value) || 0 })}
                  helperText="วันต่อปี"
                />

                <Input
                  type="number"
                  label="ลากิจ"
                  min={0}
                  value={settings.defaultPersonalLeave}
                  onChange={(e) => setSettings({ ...settings, defaultPersonalLeave: parseInt(e.target.value) || 0 })}
                  helperText="วันต่อปี"
                />
              </div>

              <div className="mt-6 bg-blue-50 border border-blue-200 rounded-lg p-4">
                <p className="text-xs font-bold text-blue-900 mb-1">ℹ️ หมายเหตุ:</p>
                <p className="text-xs text-blue-700">
                  การตั้งค่านี้จะมีผลกับพนักงานที่เพิ่มใหม่เท่านั้น ไม่มีผลกับพนักงานที่มีอยู่แล้ว
                </p>
              </div>
            </CardContent>
          </Card>

          {/* Company Holidays */}
          <Card>
            <CardHeader>
              <div className="flex items-center space-x-3">
                <SettingsIcon className="w-6 h-6 text-green-600" />
                <div>
                  <h2 className="text-xl font-bold text-gray-900">วันหยุดประจำปี</h2>
                  <p className="text-sm text-gray-600">จัดการวันหยุดนักขัตฤกษ์และวันหยุดบริษัท</p>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <div className="bg-gray-50 rounded-lg p-8 text-center">
                <p className="text-gray-500">ฟีเจอร์นี้กำลังพัฒนา</p>
                <p className="text-sm text-gray-400 mt-2">
                  จะสามารถเพิ่ม แก้ไข และลบวันหยุดได้ในเวอร์ชันถัดไป
                </p>
              </div>
            </CardContent>
          </Card>

          {/* System Information */}
          <Card>
            <CardHeader>
              <div className="flex items-center space-x-3">
                <SettingsIcon className="w-6 h-6 text-green-600" />
                <div>
                  <h2 className="text-xl font-bold text-gray-900">ข้อมูลระบบ</h2>
                  <p className="text-sm text-gray-600">รายละเอียดเกี่ยวกับระบบ</p>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <div className="grid md:grid-cols-2 gap-4">
                <div className="bg-gray-50 rounded-lg p-4">
                  <p className="text-xs text-gray-500 mb-1">เวอร์ชัน</p>
                  <p className="font-bold text-gray-900">4.0.0</p>
                </div>

                <div className="bg-gray-50 rounded-lg p-4">
                  <p className="text-xs text-gray-500 mb-1">ฐานข้อมูล</p>
                  <p className="font-bold text-gray-900">Google Sheets</p>
                </div>

                <div className="bg-gray-50 rounded-lg p-4">
                  <p className="text-xs text-gray-500 mb-1">สถานะ</p>
                  <p className="font-bold text-green-600">ออนไลน์</p>
                </div>

                <div className="bg-gray-50 rounded-lg p-4">
                  <p className="text-xs text-gray-500 mb-1">อัพเดทล่าสุด</p>
                  <p className="font-bold text-gray-900">2026-01-07</p>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Save Button */}
          <div className="flex justify-end">
            <Button
              onClick={handleSave}
              loading={loading}
              size="lg"
            >
              <Save className="w-4 h-4 mr-2" />
              บันทึกการตั้งค่า
            </Button>
          </div>
        </div>
      </main>
    </div>
  );
}
