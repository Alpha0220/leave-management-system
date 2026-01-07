'use client';

import { useState } from 'react';
import { ProtectedRoute } from '@/components/auth/protected-route';
import { useAuth } from '@/contexts/auth.context';
import { FileText, Plus } from 'lucide-react';
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
  const { user } = useAuth();
  const [showLeaveForm, setShowLeaveForm] = useState(false);
  const [refreshKey, setRefreshKey] = useState(0);

  const handleSuccess = () => {
    setRefreshKey(prev => prev + 1); // Trigger refresh
  };

  return (
    <div className="space-y-8">
      {/* Page Title & Actions */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-black text-gray-900 tracking-tight">ประวัติการลา</h1>
          <p className="text-gray-500 mt-1 uppercase text-xs font-bold tracking-widest">{user?.name} | Employee Portal</p>
        </div>
        <Button 
          onClick={() => setShowLeaveForm(true)}
          className="bg-blue-600 hover:bg-blue-700 text-white font-black rounded-2xl shadow-lg shadow-blue-100 px-8 py-6"
        >
          <Plus className="w-6 h-6 mr-2" />
          ยื่นคำขอลาใหม่
        </Button>
      </div>

      {/* Main Table Card */}
      <div className="bg-white rounded-3xl shadow-sm border border-gray-100 overflow-hidden">
        <div className="px-8 py-6 border-b border-gray-50 flex items-center space-x-3">
          <FileText className="w-6 h-6 text-blue-600" />
          <h2 className="text-xl font-black text-gray-900">รายการคำขอลาทั้งหมด</h2>
        </div>
        
        <div className="p-2 sm:p-4">
          <LeaveHistoryTable key={refreshKey} />
        </div>
      </div>

      {/* Leave Request Form Modal */}
      <LeaveRequestForm
        open={showLeaveForm}
        onClose={() => setShowLeaveForm(false)}
        onSuccess={handleSuccess}
      />
    </div>
  );
}
