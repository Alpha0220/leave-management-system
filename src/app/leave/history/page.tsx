'use client';

import { useState } from 'react';
import { ProtectedRoute } from '@/components/auth/protected-route';
import { useAuth } from '@/contexts/auth.context';
import { useRouter } from 'next/navigation';
import { LogOut, FileText, Plus } from 'lucide-react';
import { LeaveHistoryTable } from '@/components/features/leave-history-table';
import { LeaveRequestForm } from '@/components/features/leave-request-form';
import { Button } from '@/components/ui/button';

export default function LeaveHistoryPage() {
  return (
    <ProtectedRoute>
      <LeaveHistoryContent />
    </ProtectedRoute>
  );
}

function LeaveHistoryContent() {
  const { user, logout } = useAuth();
  const router = useRouter();
  const [showLeaveForm, setShowLeaveForm] = useState(false);
  const [refreshKey, setRefreshKey] = useState(0);

  const handleLogout = () => {
    logout();
    router.push('/login');
  };

  const handleSuccess = () => {
    setRefreshKey(prev => prev + 1); // Trigger refresh
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow-sm border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <button
                onClick={() => router.push('/dashboard')}
                className="text-gray-600 hover:text-gray-900 transition-colors"
              >
                ← กลับ
              </button>
              <div>
                <h1 className="text-2xl font-bold text-gray-900">ประวัติการลา</h1>
                <p className="text-sm text-gray-600">{user?.name}</p>
              </div>
            </div>
            <button
              onClick={handleLogout}
              className="flex items-center space-x-2 px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded-lg transition-colors"
            >
              <LogOut className="w-4 h-4" />
              <span>ออกจากระบบ</span>
            </button>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Action Bar */}
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center space-x-3">
            <FileText className="w-6 h-6 text-blue-600" />
            <h2 className="text-xl font-bold text-gray-900">
              ประวัติการลาทั้งหมด
            </h2>
          </div>
          <Button onClick={() => setShowLeaveForm(true)}>
            <Plus className="w-4 h-4 mr-2" />
            ยื่นคำขอลา
          </Button>
        </div>

        {/* Leave History Table */}
        <LeaveHistoryTable key={refreshKey} />
      </main>

      {/* Leave Request Form Modal */}
      <LeaveRequestForm
        open={showLeaveForm}
        onClose={() => setShowLeaveForm(false)}
        onSuccess={handleSuccess}
      />
    </div>
  );
}
