'use client';

import { useState, useEffect } from 'react';
import { Database, Upload, CheckCircle, XCircle, Loader2, ArrowRight, Users, FileText } from 'lucide-react';

const STORAGE_KEYS = {
  USERS: 'lms_users',
  LEAVES: 'lms_leaves',
};

interface LocalUser {
  empId: string;
  name: string;
  role: string;
  leaveQuota: number;
  sickLeaveQuota: number;
  personalLeaveQuota?: number;
  isRegistered?: boolean;
  password?: string;
}

interface LocalLeave {
  id: string;
  empId: string;
  type: string;
  startDate: string;
  endDate: string;
  reason: string;
  status: 'pending' | 'approved' | 'rejected';
  approverNote?: string;
}

interface LocalData {
  users: LocalUser[];
  leaves: LocalLeave[];
}

interface MigrationResult {
  success: boolean;
  message: string;
  data: {
    migratedUsers: number;
    migratedLeaves: number;
    totalUsers: number;
    totalLeaves: number;
  };
}

export default function MigratePage() {
  const [localData, setLocalData] = useState<LocalData | null>(null);
  const [migrating, setMigrating] = useState(false);
  const [result, setResult] = useState<MigrationResult | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    // Load data from localStorage
    try {
      const users = localStorage.getItem(STORAGE_KEYS.USERS);
      const leaves = localStorage.getItem(STORAGE_KEYS.LEAVES);

      setLocalData({
        users: users ? JSON.parse(users) : [],
        leaves: leaves ? JSON.parse(leaves) : []
      });
    } catch (err) {
      console.error('Error loading localStorage:', err);
    }
  }, []);

  const handleMigrate = async () => {
    if (!localData) return;

    setMigrating(true);
    setResult(null);
    setError(null);

    try {
      const response = await fetch('/api/migrate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(localData)
      });

      const data = await response.json();

      if (data.success) {
        setResult(data);
      } else {
        setError(data.error || 'Migration failed');
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to migrate');
    } finally {
      setMigrating(false);
    }
  };

  const userCount = localData?.users?.length || 0;
  const leaveCount = localData?.leaves?.length || 0;
  const hasData = userCount > 0 || leaveCount > 0;

  return (
    <div className="min-h-screen bg-linear-to-br from-purple-50 via-white to-pink-50 p-8">
      <div className="max-w-5xl mx-auto">
        {/* Header */}
        <div className="text-center mb-12">
          <div className="inline-flex items-center justify-center w-20 h-20 bg-linear-to-br from-purple-600 to-pink-600 rounded-2xl mb-6 shadow-xl">
            <Upload className="w-10 h-10 text-white" />
          </div>
          <h1 className="text-4xl font-extrabold text-gray-900 mb-3">
            Migrate to Google Sheets
          </h1>
          <p className="text-lg text-gray-600">
            ย้ายข้อมูลจาก localStorage ไปยัง Google Sheets
          </p>
        </div>

        {/* Data Summary */}
        <div className="grid md:grid-cols-2 gap-6 mb-8">
          <div className="bg-white rounded-2xl shadow-lg p-8 border border-gray-100">
            <div className="flex items-center justify-between mb-6">
              <div className="flex items-center space-x-3">
                <div className="p-3 bg-blue-100 rounded-xl">
                  <Users className="w-6 h-6 text-blue-600" />
                </div>
                <div>
                  <h3 className="font-bold text-gray-900">Users</h3>
                  <p className="text-sm text-gray-500">ข้อมูลพนักงาน</p>
                </div>
              </div>
              <span className="text-4xl font-black text-blue-600">{userCount}</span>
            </div>
            
            {localData?.users && localData.users.length > 0 && (
              <div className="space-y-2 max-h-40 overflow-y-auto">
                {localData.users.map((user: LocalUser) => (
                  <div key={user.empId} className="flex items-center justify-between p-2 bg-gray-50 rounded-lg text-sm">
                    <span className="font-medium text-gray-700">{user.name}</span>
                    <span className="text-gray-500">{user.empId}</span>
                  </div>
                ))}
              </div>
            )}
          </div>

          <div className="bg-white rounded-2xl shadow-lg p-8 border border-gray-100">
            <div className="flex items-center justify-between mb-6">
              <div className="flex items-center space-x-3">
                <div className="p-3 bg-green-100 rounded-xl">
                  <FileText className="w-6 h-6 text-green-600" />
                </div>
                <div>
                  <h3 className="font-bold text-gray-900">Leave Requests</h3>
                  <p className="text-sm text-gray-500">คำขอลา</p>
                </div>
              </div>
              <span className="text-4xl font-black text-green-600">{leaveCount}</span>
            </div>

            {localData?.leaves && localData.leaves.length > 0 && (
              <div className="space-y-2 max-h-40 overflow-y-auto">
                {localData.leaves.slice(0, 5).map((leave: LocalLeave) => (
                  <div key={leave.id} className="flex items-center justify-between p-2 bg-gray-50 rounded-lg text-sm">
                    <span className="font-medium text-gray-700">{leave.type}</span>
                    <span className={`px-2 py-0.5 rounded text-xs font-bold ${
                      leave.status === 'approved' ? 'bg-green-100 text-green-700' :
                      leave.status === 'rejected' ? 'bg-red-100 text-red-700' :
                      'bg-yellow-100 text-yellow-700'
                    }`}>
                      {leave.status}
                    </span>
                  </div>
                ))}
                {localData.leaves.length > 5 && (
                  <p className="text-xs text-gray-400 text-center pt-2">
                    และอีก {localData.leaves.length - 5} รายการ...
                  </p>
                )}
              </div>
            )}
          </div>
        </div>

        {/* Migration Flow */}
        <div className="bg-white rounded-2xl shadow-xl p-8 mb-8 border border-gray-100">
          <div className="flex items-center justify-center space-x-4 mb-8">
            <div className="flex items-center space-x-2">
              <Database className="w-8 h-8 text-gray-400" />
              <span className="font-bold text-gray-600">localStorage</span>
            </div>
            <ArrowRight className="w-8 h-8 text-blue-600" />
            <div className="flex items-center space-x-2">
              <Database className="w-8 h-8 text-green-600" />
              <span className="font-bold text-green-600">Google Sheets</span>
            </div>
          </div>

          <button
            onClick={handleMigrate}
            disabled={migrating || !hasData}
            className="w-full bg-linear-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-white font-bold py-4 px-6 rounded-xl transition-all shadow-lg hover:shadow-xl disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center space-x-3"
          >
            {migrating ? (
              <>
                <Loader2 className="w-6 h-6 animate-spin" />
                <span>กำลัง Migrate...</span>
              </>
            ) : (
              <>
                <Upload className="w-6 h-6" />
                <span>เริ่ม Migration</span>
              </>
            )}
          </button>

          {!hasData && (
            <p className="text-center text-gray-500 mt-4 text-sm">
              ไม่พบข้อมูลใน localStorage
            </p>
          )}
        </div>

        {/* Success Result */}
        {result && result.success && (
          <div className="bg-green-50 border-2 border-green-200 rounded-2xl p-8 animate-in fade-in slide-in-from-bottom duration-300">
            <div className="flex items-center space-x-3 mb-6">
              <CheckCircle className="w-8 h-8 text-green-600" />
              <h2 className="text-2xl font-bold text-green-900">
                Migration สำเร็จ! 🎉
              </h2>
            </div>

            <div className="grid md:grid-cols-2 gap-4">
              <div className="bg-white rounded-xl p-6 shadow-sm">
                <h3 className="font-bold text-gray-900 mb-3">Users Migrated</h3>
                <div className="space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span className="text-gray-600">Total</span>
                    <span className="font-bold text-gray-900">{result.data.totalUsers}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Migrated</span>
                    <span className="font-bold text-green-600">{result.data.migratedUsers}</span>
                  </div>
                </div>
              </div>

              <div className="bg-white rounded-xl p-6 shadow-sm">
                <h3 className="font-bold text-gray-900 mb-3">Leaves Migrated</h3>
                <div className="space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span className="text-gray-600">Total</span>
                    <span className="font-bold text-gray-900">{result.data.totalLeaves}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Migrated</span>
                    <span className="font-bold text-green-600">{result.data.migratedLeaves}</span>
                  </div>
                </div>
              </div>
            </div>

            <div className="mt-6 p-4 bg-white rounded-xl">
              <p className="text-sm text-gray-700">
                ✅ ข้อมูลทั้งหมดถูก migrate ไปยัง Google Sheets เรียบร้อยแล้ว!
              </p>
              <p className="text-sm text-gray-500 mt-2">
                คุณสามารถตรวจสอบข้อมูลได้ที่ <a href="/test-sheets" className="text-blue-600 hover:underline font-medium">หน้าทดสอบ</a>
              </p>
            </div>
          </div>
        )}

        {/* Error Result */}
        {error && (
          <div className="bg-red-50 border-2 border-red-200 rounded-2xl p-8 animate-in fade-in slide-in-from-bottom duration-300">
            <div className="flex items-center space-x-3 mb-4">
              <XCircle className="w-8 h-8 text-red-600" />
              <h2 className="text-2xl font-bold text-red-900">
                Migration ไม่สำเร็จ
              </h2>
            </div>
            <div className="bg-white rounded-xl p-6">
              <p className="font-mono text-sm text-red-700 whitespace-pre-wrap">
                {error}
              </p>
            </div>

            <div className="mt-6 p-4 bg-yellow-50 rounded-xl border border-yellow-200">
              <h3 className="font-bold text-yellow-900 mb-2">💡 วิธีแก้ไข:</h3>
              <ul className="text-sm text-yellow-800 space-y-1 list-disc list-inside">
                <li>ตรวจสอบว่าตั้งค่า .env.local ครบถ้วน</li>
                <li>ตรวจสอบว่าแชร์ Google Sheet กับ Service Account แล้ว</li>
                <li>ลองทดสอบการเชื่อมต่อที่ <a href="/test-sheets" className="text-blue-600 hover:underline">หน้าทดสอบ</a></li>
              </ul>
            </div>
          </div>
        )}

        {/* Instructions */}
        <div className="bg-linear-to-br from-blue-50 to-indigo-50 rounded-2xl p-8 border border-blue-100">
          <h2 className="text-xl font-bold text-gray-900 mb-4">
            📝 ขั้นตอนการ Migration
          </h2>
          <ol className="space-y-3 text-sm text-gray-700">
            <li className="flex items-start">
              <span className="inline-flex items-center justify-center w-6 h-6 bg-blue-600 text-white rounded-full text-xs mr-3 mt-0.5 shrink-0">1</span>
              <span>ตรวจสอบข้อมูลใน localStorage (แสดงด้านบน)</span>
            </li>
            <li className="flex items-start">
              <span className="inline-flex items-center justify-center w-6 h-6 bg-blue-600 text-white rounded-full text-xs mr-3 mt-0.5 shrink-0">2</span>
              <span>ตรวจสอบว่าตั้งค่า Google Sheets เรียบร้อยแล้ว</span>
            </li>
            <li className="flex items-start">
              <span className="inline-flex items-center justify-center w-6 h-6 bg-blue-600 text-white rounded-full text-xs mr-3 mt-0.5 shrink-0">3</span>
              <span>คลิกปุ่ม &ldquo;เริ่ม Migration&rdquo; เพื่อย้ายข้อมูล</span>
            </li>
            <li className="flex items-start">
              <span className="inline-flex items-center justify-center w-6 h-6 bg-blue-600 text-white rounded-full text-xs mr-3 mt-0.5 shrink-0">4</span>
              <span>ระบบจะสร้าง Sheets อัตโนมัติและย้ายข้อมูลทั้งหมด</span>
            </li>
          </ol>
        </div>
      </div>
    </div>
  );
}
