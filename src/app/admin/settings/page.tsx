'use client';

import { useState, useEffect } from 'react';
import { ProtectedRoute } from '@/components/auth/protected-route';
import { Settings as SettingsIcon, Save, AlertTriangle } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Card, CardHeader, CardContent } from '@/components/ui/card';
import { useToast } from '@/contexts/toast.context';

export default function AdminSettingsPage() {
  return (
    <ProtectedRoute requireAdmin>
      <AdminSettingsContent />
    </ProtectedRoute>
  );
}

function AdminSettingsContent() {
  const toast = useToast();
  const [loading, setLoading] = useState(false);
  const [settings, setSettings] = useState({
    defaultAnnualLeave: 10,
    defaultSickLeave: 30,
    defaultPersonalLeave: 6,
    defaultMaternityLeave: 120,
    defaultSterilizationLeave: 999,
    defaultUnpaidLeave: 999,
    defaultCompassionateLeave: 3,
  });

  // Load settings on mount
  useEffect(() => {
    const fetchSettings = async () => {
      try {
        const response = await fetch('/api/settings');
        const data = await response.json();

        if (data.success && data.settings) {
          setSettings({
            defaultAnnualLeave: data.settings.annualLeaveMax || 10,
            defaultSickLeave: data.settings.sickLeaveMax || 30,
            defaultPersonalLeave: data.settings.personalLeaveMax || 6,
            defaultMaternityLeave: data.settings.maternityLeaveMax || 120,
            defaultSterilizationLeave: data.settings.sterilizationLeaveMax || 999,
            defaultUnpaidLeave: data.settings.unpaidLeaveMax || 999,
            defaultCompassionateLeave: data.settings.compassionateLeaveMax || 3,
          });
        }
      } catch (error) {
        console.error('Error fetching settings:', error);
      }
    };

    fetchSettings();
  }, []);

  const handleSave = async () => {
    setLoading(true);
    try {
      const response = await fetch('/api/settings', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(settings),
      });

      const data = await response.json();

      if (data.success) {
        toast.success('บันทึกการตั้งค่าสำเร็จ');
      } else {
        toast.error(data.error || 'เกิดข้อผิดพลาดในการบันทึก');
      }
    } catch (error) {
      console.error('Error saving settings:', error);
      toast.error('เกิดข้อผิดพลาดในการบันทึก');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-8">
      {/* Page Title & Actions */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-black text-gray-900 tracking-tight">ตั้งค่าระบบ</h1>
          <p className="text-gray-500 mt-1 uppercase text-xs font-bold tracking-widest">การกำหนดนโยบายและพื้นฐานข้อมูลขององค์กร</p>
        </div>
        <Button
          onClick={handleSave}
          className="bg-green-600 hover:bg-green-700 text-white font-black rounded-2xl px-8 py-6 shadow-lg shadow-green-100 transition-all active:scale-95"
          disabled={loading}
        >
          <Save className="w-6 h-6 mr-2" />
          บันทึกการตั้งค่า
        </Button>
      </div>

      <div className="max-w-5xl space-y-8">
        {/* Default Leave Quotas */}
        <Card className="border-none shadow-sm rounded-3xl overflow-hidden">
          <CardHeader className="bg-white border-b border-gray-50 px-8 py-6">
            <div className="flex items-center space-x-4">
              <div className="p-3 bg-green-50 rounded-2xl text-green-600">
                <SettingsIcon className="w-6 h-6" />
              </div>
              <div>
                <h2 className="text-xl font-black text-gray-900">โควตาการลาเริ่มต้น</h2>
                <p className="text-sm text-gray-500">กำหนดโควตาที่พนักงานใหม่จะได้รับ</p>
              </div>
            </div>
          </CardHeader>
          <CardContent className="p-8">
            <div className="grid md:grid-cols-3 gap-8">
              <div className="space-y-2">
                <p className="text-xs font-black text-gray-400 uppercase tracking-widest">ลาพักร้อน (วัน/ปี)</p>
                <Input
                  type="number"
                  min={0}
                  value={settings.defaultAnnualLeave}
                  onChange={(e) => setSettings({ ...settings, defaultAnnualLeave: parseInt(e.target.value) || 0 })}
                  className="border-2 focus:border-green-500 rounded-xl h-12 text-lg font-bold"
                />
              </div>

              <div className="space-y-2">
                <p className="text-xs font-black text-gray-400 uppercase tracking-widest">ลาป่วย (วัน/ปี)</p>
                <Input
                  type="number"
                  min={0}
                  value={settings.defaultSickLeave}
                  onChange={(e) => setSettings({ ...settings, defaultSickLeave: parseInt(e.target.value) || 0 })}
                  className="border-2 focus:border-green-500 rounded-xl h-12 text-lg font-bold"
                />
              </div>

              <div className="space-y-2">
                <p className="text-xs font-black text-gray-400 uppercase tracking-widest">ลากิจ (วัน/ปี)</p>
                <Input
                  type="number"
                  min={0}
                  value={settings.defaultPersonalLeave}
                  onChange={(e) => setSettings({ ...settings, defaultPersonalLeave: parseInt(e.target.value) || 0 })}
                  className="border-2 focus:border-green-500 rounded-xl h-12 text-lg font-bold"
                />
              </div>

              <div className="space-y-2">
                <p className="text-xs font-black text-gray-400 uppercase tracking-widest">ลาคลอด (วัน/ปี)</p>
                <Input
                  type="number"
                  min={0}
                  value={settings.defaultMaternityLeave}
                  onChange={(e) => setSettings({ ...settings, defaultMaternityLeave: parseInt(e.target.value) || 0 })}
                  className="border-2 focus:border-green-500 rounded-xl h-12 text-lg font-bold"
                />
              </div>

              <div className="space-y-2">
                <p className="text-xs font-black text-gray-400 uppercase tracking-widest">ลาทำหมัน (วัน/ปี)</p>
                <Input
                  type="number"
                  min={0}
                  value={settings.defaultSterilizationLeave}
                  onChange={(e) => setSettings({ ...settings, defaultSterilizationLeave: parseInt(e.target.value) || 0 })}
                  className="border-2 focus:border-green-500 rounded-xl h-12 text-lg font-bold"
                />
              </div>

              <div className="space-y-2">
                <p className="text-xs font-black text-gray-400 uppercase tracking-widest">ลาไม่รับค่าจ้าง (วัน/ปี)</p>
                <Input
                  type="number"
                  min={0}
                  value={settings.defaultUnpaidLeave}
                  onChange={(e) => setSettings({ ...settings, defaultUnpaidLeave: parseInt(e.target.value) || 0 })}
                  className="border-2 focus:border-green-500 rounded-xl h-12 text-lg font-bold"
                />
              </div>

              <div className="space-y-2">
                <p className="text-xs font-black text-gray-400 uppercase tracking-widest">ลาฌาปนกิจ (วัน/ปี)</p>
                <Input
                  type="number"
                  min={0}
                  value={settings.defaultCompassionateLeave}
                  onChange={(e) => setSettings({ ...settings, defaultCompassionateLeave: parseInt(e.target.value) || 0 })}
                  className="border-2 focus:border-green-500 rounded-xl h-12 text-lg font-bold"
                />
              </div>
            </div>

            <div className="mt-8 bg-amber-50 rounded-2xl p-6 flex items-start space-x-4 border border-amber-100 text-amber-900">
              <AlertTriangle className="w-6 h-6 shrink-0 mt-0.5" />
              <div>
                <p className="font-black text-sm">ข้อควรระวัง</p>
                <p className="text-xs font-medium mt-1 leading-relaxed opacity-80">
                  การเปลี่ยนแปลงนี้จะมีผลเฉพาะกับ **พนักงานที่เพิ่มใหม่เท่านั้น** โดยที่พนักงานปัจจุบันจะยังคงใช้โควตาเดิมที่ระบุในฐานข้อมูลรายบุคคล
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Company Holidays */}
        <Card className="border-none shadow-sm rounded-3xl overflow-hidden opacity-60">
          <CardHeader className="bg-white border-b border-gray-50 px-8 py-6">
            <div className="flex items-center space-x-4">
              <div className="p-3 bg-blue-50 rounded-2xl text-blue-600">
                <SettingsIcon className="w-6 h-6" />
              </div>
              <div>
                <h2 className="text-xl font-black text-gray-900">วันหยุดประจำปี</h2>
                <p className="text-sm text-gray-500">วันหยุดนักขัตฤกษ์และวันหยุดบริษัท</p>
              </div>
            </div>
          </CardHeader>
          <CardContent className="p-12 text-center">
            <div className="w-16 h-16 bg-gray-50 rounded-full flex items-center justify-center mx-auto mb-4">
              <SettingsIcon className="w-8 h-8 text-gray-300 animate-spin-slow" />
            </div>
            <p className="text-gray-400 font-black uppercase text-xs tracking-widest">Feature Under Development</p>
            <p className="text-gray-500 mt-2 text-sm max-w-xs mx-auto">ระบบจัดการวันหยุดแบบกำหนดเองกำลังอยู่ในช่วงปรับปรุง จะพร้อมใช้งานในเร็วๆ นี้</p>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}