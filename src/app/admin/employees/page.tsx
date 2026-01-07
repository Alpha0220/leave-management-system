'use client';

import { useState, useEffect } from 'react';
import { ProtectedRoute } from '@/components/auth/protected-route';
import { useAuth } from '@/contexts/auth.context';
import { useRouter } from 'next/navigation';
import { LogOut, Users, Plus, Edit, Trash2, CheckCircle, XCircle } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { EmployeeFormDialog } from '@/components/features/employee-form-dialog';

interface Employee {
  empId: string;
  name: string;
  role: 'admin' | 'employee';
  isRegistered: boolean;
  leaveQuota: number;
  sickLeaveQuota: number;
  personalLeaveQuota: number;
}

export default function AdminEmployeesPage() {
  return (
    <ProtectedRoute requireAdmin>
      <AdminEmployeesContent />
    </ProtectedRoute>
  );
}

function AdminEmployeesContent() {
  const { logout } = useAuth();
  const router = useRouter();
  const [employees, setEmployees] = useState<Employee[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [selectedEmployee, setSelectedEmployee] = useState<Employee | null>(null);

  useEffect(() => {
    fetchEmployees();
  }, []);

  const fetchEmployees = async () => {
    try {
      setLoading(true);
      const response = await fetch('/api/users');
      const data = await response.json();

      if (data.success) {
        setEmployees(data.users || []);
      }
    } catch (error) {
      console.error('Error fetching employees:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleEdit = (employee: Employee) => {
    setSelectedEmployee(employee);
    setShowForm(true);
  };

  const handleDelete = async (empId: string) => {
    if (!confirm('คุณแน่ใจหรือไม่ที่จะลบพนักงานคนนี้?')) {
      return;
    }

    try {
      const response = await fetch(`/api/users/${empId}`, {
        method: 'DELETE',
      });

      if (response.ok) {
        await fetchEmployees();
      }
    } catch (error) {
      console.error('Error deleting employee:', error);
    }
  };

  const handleCloseForm = () => {
    setShowForm(false);
    setSelectedEmployee(null);
  };

  const handleSuccess = () => {
    fetchEmployees();
    handleCloseForm();
  };

  const employeeCount = employees.filter(e => e.role === 'employee').length;
  const adminCount = employees.filter(e => e.role === 'admin').length;
  const registeredCount = employees.filter(e => e.isRegistered).length;

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-linear-to-r from-purple-600 to-pink-600 text-white shadow-lg">
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
                <h1 className="text-3xl font-bold">จัดการพนักงาน</h1>
                <p className="text-purple-100 mt-1">เพิ่ม แก้ไข และลบข้อมูลพนักงาน</p>
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
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Stats */}
        <div className="grid md:grid-cols-4 gap-6 mb-8">
          <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-500 mb-1">พนักงานทั้งหมด</p>
                <p className="text-3xl font-black text-blue-600">{employees.length}</p>
              </div>
              <Users className="w-8 h-8 text-blue-600" />
            </div>
          </div>

          <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-500 mb-1">พนักงานทั่วไป</p>
                <p className="text-3xl font-black text-green-600">{employeeCount}</p>
              </div>
              <Users className="w-8 h-8 text-green-600" />
            </div>
          </div>

          <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-500 mb-1">ผู้ดูแลระบบ</p>
                <p className="text-3xl font-black text-purple-600">{adminCount}</p>
              </div>
              <Users className="w-8 h-8 text-purple-600" />
            </div>
          </div>

          <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-500 mb-1">ลงทะเบียนแล้ว</p>
                <p className="text-3xl font-black text-orange-600">{registeredCount}</p>
              </div>
              <CheckCircle className="w-8 h-8 text-orange-600" />
            </div>
          </div>
        </div>

        {/* Action Bar */}
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-xl font-bold text-gray-900">รายชื่อพนักงาน</h2>
          <Button onClick={() => setShowForm(true)}>
            <Plus className="w-4 h-4 mr-2" />
            เพิ่มพนักงาน
          </Button>
        </div>

        {/* Employees Table */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
          {loading ? (
            <div className="p-12 text-center">
              <p className="text-gray-500">กำลังโหลด...</p>
            </div>
          ) : employees.length === 0 ? (
            <div className="p-12 text-center">
              <p className="text-gray-500">ไม่มีข้อมูลพนักงาน</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left">
                <thead className="bg-gray-50 border-b border-gray-100">
                  <tr>
                    <th className="px-6 py-4 text-xs font-bold text-gray-500 uppercase">Employee ID</th>
                    <th className="px-6 py-4 text-xs font-bold text-gray-500 uppercase">ชื่อ-นามสกุล</th>
                    <th className="px-6 py-4 text-xs font-bold text-gray-500 uppercase">บทบาท</th>
                    <th className="px-6 py-4 text-xs font-bold text-gray-500 uppercase">โควตา (พักร้อน/ป่วย/กิจ)</th>
                    <th className="px-6 py-4 text-xs font-bold text-gray-500 uppercase">สถานะ</th>
                    <th className="px-6 py-4 text-xs font-bold text-gray-500 uppercase">การจัดการ</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                  {employees.map((employee) => (
                    <tr key={employee.empId} className="hover:bg-gray-50 transition-colors">
                      <td className="px-6 py-4 font-mono text-sm text-gray-900">
                        {employee.empId}
                      </td>
                      <td className="px-6 py-4 font-bold text-gray-900">
                        {employee.name}
                      </td>
                      <td className="px-6 py-4">
                        <Badge variant={employee.role === 'admin' ? 'info' : 'default'}>
                          {employee.role === 'admin' ? 'Admin' : 'Employee'}
                        </Badge>
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex space-x-4">
                          <span className="text-blue-600 font-bold">
                            {employee.leaveQuota} <span className="text-[10px] text-gray-400">วัน</span>
                          </span>
                          <span className="text-green-600 font-bold">
                            {employee.sickLeaveQuota} <span className="text-[10px] text-gray-400">วัน</span>
                          </span>
                          <span className="text-orange-600 font-bold">
                            {employee.personalLeaveQuota} <span className="text-[10px] text-gray-400">วัน</span>
                          </span>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        {employee.isRegistered ? (
                          <Badge variant="success">
                            <CheckCircle className="w-3 h-3 mr-1" />
                            ลงทะเบียนแล้ว
                          </Badge>
                        ) : (
                          <Badge variant="warning">
                            <XCircle className="w-3 h-3 mr-1" />
                            ยังไม่ลงทะเบียน
                          </Badge>
                        )}
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex space-x-2">
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => handleEdit(employee)}
                          >
                            <Edit className="w-3 h-3 mr-1" />
                            แก้ไข
                          </Button>
                          {employee.empId !== 'ADMIN001' && (
                            <Button
                              size="sm"
                              variant="destructive"
                              onClick={() => handleDelete(employee.empId)}
                            >
                              <Trash2 className="w-3 h-3 mr-1" />
                              ลบ
                            </Button>
                          )}
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </main>

      {/* Employee Form Dialog */}
      <EmployeeFormDialog
        open={showForm}
        onClose={handleCloseForm}
        onSuccess={handleSuccess}
        employee={selectedEmployee}
      />
    </div>
  );
}
