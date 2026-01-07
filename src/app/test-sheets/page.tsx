'use client';

import { useState } from 'react';
import { CheckCircle, XCircle, Loader2, Database, Users, Settings } from 'lucide-react';

export default function TestSheetsPage() {
  const [testing, setTesting] = useState(false);
  const [result, setResult] = useState<{
    success: boolean;
    message: string;
    data: {
      isInitialized: boolean;
      userCount: number;
      users: Array<{
        empId: string;
        name: string;
        role: string;
        isRegistered: boolean;
      }>;
    };
  } | null>(null);
  const [error, setError] = useState<string | null>(null);

  const testConnection = async () => {
    setTesting(true);
    setResult(null);
    setError(null);

    try {
      const response = await fetch('/api/test-sheets');
      const data = await response.json();

      if (data.success) {
        setResult(data);
      } else {
        setError(data.error || 'Unknown error');
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to connect');
    } finally {
      setTesting(false);
    }
  };

  return (
    <div className="min-h-screen bg-linear-to-br from-blue-50 via-white to-indigo-50 p-8">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="text-center mb-12">
          <div className="inline-flex items-center justify-center w-20 h-20 bg-blue-600 rounded-2xl mb-6 shadow-lg">
            <Database className="w-10 h-10 text-white" />
          </div>
          <h1 className="text-4xl font-extrabold text-gray-900 mb-3">
            Google Sheets Connection Test
          </h1>
          <p className="text-lg text-gray-600">
            ทดสอบการเชื่อมต่อกับ Google Sheets API
          </p>
        </div>

        {/* Test Button */}
        <div className="bg-white rounded-2xl shadow-xl p-8 mb-8 border border-gray-100">
          <button
            onClick={testConnection}
            disabled={testing}
            className="w-full bg-linear-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white font-bold py-4 px-6 rounded-xl transition-all shadow-lg hover:shadow-xl disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center space-x-3"
          >
            {testing ? (
              <>
                <Loader2 className="w-6 h-6 animate-spin" />
                <span>กำลังทดสอบ...</span>
              </>
            ) : (
              <>
                <Database className="w-6 h-6" />
                <span>ทดสอบการเชื่อมต่อ</span>
              </>
            )}
          </button>

          {/* Environment Check */}
          <div className="mt-6 p-4 bg-gray-50 rounded-lg">
            <h3 className="font-bold text-sm text-gray-700 mb-3">Environment Variables:</h3>
            <div className="space-y-2 text-sm">
              <div className="flex items-center justify-between">
                <span className="text-gray-600">GOOGLE_SERVICE_ACCOUNT_EMAIL</span>
                <span className={`font-mono ${process.env.NEXT_PUBLIC_HAS_EMAIL ? 'text-green-600' : 'text-red-600'}`}>
                  {typeof window !== 'undefined' && process.env.GOOGLE_SERVICE_ACCOUNT_EMAIL ? '✓ Set' : '✗ Not Set'}
                </span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-gray-600">GOOGLE_PRIVATE_KEY</span>
                <span className={`font-mono ${process.env.NEXT_PUBLIC_HAS_KEY ? 'text-green-600' : 'text-red-600'}`}>
                  {typeof window !== 'undefined' && process.env.GOOGLE_PRIVATE_KEY ? '✓ Set' : '✗ Not Set'}
                </span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-gray-600">GOOGLE_SHEET_ID</span>
                <span className={`font-mono ${process.env.NEXT_PUBLIC_HAS_SHEET ? 'text-green-600' : 'text-red-600'}`}>
                  {typeof window !== 'undefined' && process.env.GOOGLE_SHEET_ID ? '✓ Set' : '✗ Not Set'}
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Success Result */}
        {result && result.success && (
          <div className="bg-green-50 border-2 border-green-200 rounded-2xl p-8 mb-8 animate-in fade-in slide-in-from-bottom duration-300">
            <div className="flex items-center space-x-3 mb-6">
              <CheckCircle className="w-8 h-8 text-green-600" />
              <h2 className="text-2xl font-bold text-green-900">
                เชื่อมต่อสำเร็จ! 🎉
              </h2>
            </div>

            <div className="space-y-4">
              <div className="bg-white rounded-xl p-6 shadow-sm">
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center space-x-3">
                    <Users className="w-6 h-6 text-blue-600" />
                    <h3 className="font-bold text-gray-900">Users in System</h3>
                  </div>
                  <span className="text-3xl font-black text-blue-600">
                    {result.data.userCount}
                  </span>
                </div>

                {result.data.users && result.data.users.length > 0 && (
                  <div className="space-y-2">
                    {result.data.users.map((user: {
                      empId: string;
                      name: string;
                      role: string;
                      isRegistered: boolean;
                    }) => (
                      <div
                        key={user.empId}
                        className="flex items-center justify-between p-3 bg-gray-50 rounded-lg"
                      >
                        <div>
                          <p className="font-bold text-gray-900">{user.name}</p>
                          <p className="text-sm text-gray-500">{user.empId}</p>
                        </div>
                        <div className="flex items-center space-x-2">
                          <span className={`px-2 py-1 rounded text-xs font-bold ${
                            user.role === 'admin' 
                              ? 'bg-purple-100 text-purple-700' 
                              : 'bg-blue-100 text-blue-700'
                          }`}>
                            {user.role}
                          </span>
                          {user.isRegistered && (
                            <span className="px-2 py-1 rounded text-xs font-bold bg-green-100 text-green-700">
                              Registered
                            </span>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              <div className="bg-white rounded-xl p-6 shadow-sm">
                <div className="flex items-center space-x-3 mb-3">
                  <Settings className="w-5 h-5 text-gray-600" />
                  <h3 className="font-bold text-gray-900">Status</h3>
                </div>
                <div className="space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span className="text-gray-600">Sheets Initialized</span>
                    <span className="font-bold text-green-600">✓ Yes</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Default Admin Created</span>
                    <span className="font-bold text-green-600">✓ Yes</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Error Result */}
        {error && (
          <div className="bg-red-50 border-2 border-red-200 rounded-2xl p-8 animate-in fade-in slide-in-from-bottom duration-300">
            <div className="flex items-center space-x-3 mb-4">
              <XCircle className="w-8 h-8 text-red-600" />
              <h2 className="text-2xl font-bold text-red-900">
                เชื่อมต่อไม่สำเร็จ
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
                <li>ตรวจสอบว่า Service Account Email ถูกต้อง</li>
                <li>ตรวจสอบว่า Private Key มี \n (backslash-n) ไม่ใช่ขึ้นบรรทัดจริง</li>
                <li>ตรวจสอบว่าแชร์ Google Sheet กับ Service Account แล้ว</li>
                <li>ตรวจสอบว่า Google Sheets API เปิดใช้งานแล้ว</li>
              </ul>
            </div>
          </div>
        )}

        {/* Instructions */}
        <div className="bg-white rounded-2xl shadow-lg p-8 border border-gray-100">
          <h2 className="text-2xl font-bold text-gray-900 mb-6">
            📚 วิธีตั้งค่า Google Sheets
          </h2>
          
          <div className="space-y-6">
            <div>
              <h3 className="font-bold text-gray-900 mb-2 flex items-center">
                <span className="inline-flex items-center justify-center w-6 h-6 bg-blue-600 text-white rounded-full text-sm mr-2">1</span>
                สร้าง Google Cloud Project
              </h3>
              <p className="text-gray-600 text-sm ml-8">
                ไปที่ <a href="https://console.cloud.google.com/" target="_blank" className="text-blue-600 hover:underline">Google Cloud Console</a> และสร้าง Project ใหม่
              </p>
            </div>

            <div>
              <h3 className="font-bold text-gray-900 mb-2 flex items-center">
                <span className="inline-flex items-center justify-center w-6 h-6 bg-blue-600 text-white rounded-full text-sm mr-2">2</span>
                เปิดใช้งาน Google Sheets API
              </h3>
              <p className="text-gray-600 text-sm ml-8">
                ไปที่ APIs &amp; Services → Library → ค้นหา &ldquo;Google Sheets API&rdquo; → Enable
              </p>
            </div>

            <div>
              <h3 className="font-bold text-gray-900 mb-2 flex items-center">
                <span className="inline-flex items-center justify-center w-6 h-6 bg-blue-600 text-white rounded-full text-sm mr-2">3</span>
                สร้าง Service Account
              </h3>
              <p className="text-gray-600 text-sm ml-8">
                APIs & Services → Credentials → Create Credentials → Service Account → สร้าง JSON Key
              </p>
            </div>

            <div>
              <h3 className="font-bold text-gray-900 mb-2 flex items-center">
                <span className="inline-flex items-center justify-center w-6 h-6 bg-blue-600 text-white rounded-full text-sm mr-2">4</span>
                สร้าง Google Sheet และแชร์
              </h3>
              <p className="text-gray-600 text-sm ml-8">
                สร้าง Sheet ใหม่ → Share → วาง Service Account Email → ตั้งสิทธิ์เป็น Editor
              </p>
            </div>

            <div>
              <h3 className="font-bold text-gray-900 mb-2 flex items-center">
                <span className="inline-flex items-center justify-center w-6 h-6 bg-blue-600 text-white rounded-full text-sm mr-2">5</span>
                ตั้งค่า .env.local
              </h3>
              <p className="text-gray-600 text-sm ml-8">
                คัดลอกค่าจากไฟล์ JSON ไปใส่ใน .env.local (ดูตัวอย่างใน .env.example)
              </p>
            </div>
          </div>

          <div className="mt-6 p-4 bg-blue-50 rounded-xl">
            <p className="text-sm text-blue-900">
              📖 อ่านคำแนะนำเพิ่มเติมใน <code className="bg-blue-100 px-2 py-1 rounded">README.md</code>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
