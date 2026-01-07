'use client';

import { useState, useEffect } from 'react';
import { ProtectedRoute } from '@/components/auth/protected-route';
import { useAuth } from '@/contexts/auth.context';
import { useRouter } from 'next/navigation';
import { LogOut, Calendar as CalendarIcon } from 'lucide-react';
import { LeaveCalendar } from '@/components/features/leave-calendar';

interface Leave {
  id: string;
  empId: string;
  type: 'annual' | 'sick' | 'personal';
  startDate: string;
  endDate: string;
  totalDays: number;
  reason: string;
  status: 'pending' | 'approved' | 'rejected';
}

interface User {
  empId: string;
  name: string;
}

export default function CalendarPage() {
  return (
    <ProtectedRoute>
      <CalendarContent />
    </ProtectedRoute>
  );
}

function CalendarContent() {
  const { logout } = useAuth();
  const router = useRouter();
  const [leaves, setLeaves] = useState<Leave[]>([]);
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      setLoading(true);
      
      // Fetch all leaves
      const leavesRes = await fetch('/api/leaves');
      const leavesData = await leavesRes.json();
      
      // Fetch all users
      const usersRes = await fetch('/api/users');
      const usersData = await usersRes.json();

      if (leavesData.success) {
        setLeaves(leavesData.leaves || []);
      }
      
      if (usersData.success) {
        setUsers(usersData.users || []);
      }
    } catch (error) {
      console.error('Error fetching data:', error);
    } finally {
      setLoading(false);
    }
  };

  const getUserName = (empId: string) => {
    const user = users.find(u => u.empId === empId);
    return user?.name || empId;
  };

  // Add employee names to leaves
  const leavesWithNames = leaves.map(leave => ({
    ...leave,
    employeeName: getUserName(leave.empId),
  }));

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
              <div className="flex items-center space-x-3">
                <CalendarIcon className="w-6 h-6 text-blue-600" />
                <div>
                  <h1 className="text-2xl font-bold text-gray-900">ปฏิทินการลา</h1>
                  <p className="text-sm text-gray-600">ดูวันลาของทีม</p>
                </div>
              </div>
            </div>
            <button
              onClick={() => { logout(); router.push('/login'); }}
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
        {loading ? (
          <div className="flex items-center justify-center py-12">
            <div className="text-center">
              <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
              <p className="mt-4 text-gray-600">กำลังโหลด...</p>
            </div>
          </div>
        ) : (
          <LeaveCalendar leaves={leavesWithNames} />
        )}
      </main>
    </div>
  );
}
