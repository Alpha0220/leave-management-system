'use client';

import { useState, useEffect, useCallback } from 'react';
import { ProtectedRoute } from '@/components/auth/protected-route';
import { Plus, Trash2, CheckCircle, XCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { EmployeeFormDialog } from '@/components/features/employee-form-dialog';
import { useToast } from '@/contexts/toast.context';

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

type ViewMode = 'employees' | 'leave-management';

function AdminEmployeesContent() {
  const toast = useToast();
  const [employees, setEmployees] = useState<Employee[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [selectedEmployee, setSelectedEmployee] = useState<Employee | null>(null);
  const [viewMode, setViewMode] = useState<ViewMode>('employees');

  const fetchEmployees = useCallback(async () => {
    try {
      setLoading(true);
      const response = await fetch('/api/users');
      const data = await response.json();

      if (data.success) {
        setEmployees(data.users || []);
      }
    } catch (error) {
      console.error('Error fetching employees:', error);
      toast.error('ไม่สามารถโหลดข้อมูลพนักงานได้');
    } finally {
      setLoading(false);
    }
  }, [toast]);

  useEffect(() => {
    fetchEmployees();
  }, [fetchEmployees]);

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
        toast.success('ลบพนักงานสำเร็จ');
        await fetchEmployees();
      } else {
        toast.error('ลบพนักงานไม่สำเร็จ');
      }
    } catch (error) {
      console.error('Error deleting employee:', error);
      toast.error('เกิดข้อผิดพลาดในการลบพนักงาน');
    }
  };

  const handleResetRegistration = async (empId: string) => {
    if (!confirm('คุณแน่ใจหรือไม่ที่จะรีเซ็ตการลงทะเบียน? พนักงานจะต้องลงทะเบียนและตั้งรหัสผ่านใหม่')) {
      return;
    }

    try {
      const response = await fetch(`/api/users/${empId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          password: '', 
          isRegistered: false 
        }),
      });

      if (response.ok) {
        toast.success('รีเซ็ตการลงทะเบียนสำเร็จ');
        await fetchEmployees();
      } else {
        toast.error('รีเซ็ตการลงทะเบียนไม่สำเร็จ');
      }
    } catch (error) {
      console.error('Error resetting registration:', error);
      toast.error('เกิดข้อผิดพลาดในการรีเซ็ต');
    }
  };

  const handleCloseForm = () => {
    setShowForm(false);
    setSelectedEmployee(null);
  };

  const handleSuccess = () => {
    toast.success(selectedEmployee ? 'แก้ไขข้อมูลสำเร็จ' : 'เพิ่มพนักงานสำเร็จ');
    fetchEmployees();
    handleCloseForm();
  };

  const employeeCount = employees.filter(e => e.role === 'employee').length;
  const adminCount = employees.filter(e => e.role === 'admin').length;
  const registeredCount = employees.filter(e => e.isRegistered).length;

  return (
    <div className="space-y-6">
      {/* Page Title & Actions */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-black text-gray-900 tracking-tight">จัดการพนักงาน</h1>
          <p className="text-gray-500 mt-1 uppercase text-xs font-bold tracking-widest">ข้อมูลและสิทธิ์การเข้าใช้งานของพนักงานทั้งหมด</p>
        </div>
        <Button 
          onClick={() => setShowForm(true)}
          className="bg-purple-600 hover:bg-purple-700 text-white font-bold rounded-xl shadow-lg shadow-purple-200 transition-all active:scale-95"
        >
          <Plus className="w-5 h-5 mr-2" />
          เพิ่มพนักงานใหม่
        </Button>
      </div>

      {/* Stats Summary */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm transition-all hover:shadow-md">
          <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest leading-none">พนักงานทั้งหมด</p>
          <p className="text-3xl font-black text-gray-900 mt-2">{employees.length}</p>
        </div>
        <div className="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm transition-all hover:shadow-md">
          <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest leading-none">ทั่วไป / แอดมิน</p>
          <p className="text-3xl font-black text-gray-900 mt-2">{employeeCount} / {adminCount}</p>
        </div>
        <div className="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm transition-all hover:shadow-md">
          <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest leading-none">ลงทะเบียนแล้ว</p>
          <p className="text-3xl font-black text-green-600 mt-2">{registeredCount}</p>
        </div>
        <div className="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm transition-all hover:shadow-md">
          <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest leading-none">ยังไม่ลงทะเบียน</p>
          <p className="text-3xl font-black text-orange-600 mt-2">{employees.length - registeredCount}</p>
        </div>
      </div>

      {/* View Mode Filter Tabs */}
      <div className="flex items-center gap-3 bg-white p-2 rounded-2xl border border-gray-100 shadow-sm w-fit">
        <button
          onClick={() => setViewMode('employees')}
          className={`px-6 py-3 rounded-xl font-bold text-sm transition-all ${
            viewMode === 'employees'
              ? 'bg-linear-to-r from-blue-600 to-indigo-600 text-white shadow-lg shadow-blue-200'
              : 'text-gray-600 hover:bg-gray-50'
          }`}
        >
          รายชื่อพนักงาน
        </button>
        <button
          onClick={() => setViewMode('leave-management')}
          className={`px-6 py-3 rounded-xl font-bold text-sm transition-all ${
            viewMode === 'leave-management'
              ? 'bg-linear-to-r from-purple-600 to-pink-600 text-white shadow-lg shadow-purple-200'
              : 'text-gray-600 hover:bg-gray-50'
          }`}
        >
          ตั้งค่าวันลา
        </button>
      </div>

      {/* Employees Table Card */}
      <div className="bg-white rounded-3xl shadow-sm border border-gray-100 overflow-hidden">
        
        {loading ? (
          <div className="p-20 text-center">
            <div className="inline-block w-8 h-8 border-4 border-blue-600 border-t-transparent rounded-full animate-spin mb-4"></div>
            <p className="text-gray-500 font-medium">กำลังโหลดข้อมูลพนักงาน...</p>
          </div>
        ) : employees.length === 0 ? (
          <div className="p-20 text-center">
            <UsersIcon className="w-16 h-16 text-gray-200 mx-auto mb-4" />
            <p className="text-gray-500 font-bold text-lg">ไม่พบข้อมูลพนักงานในระบบ</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left">
              <thead>
                <tr className="bg-gray-50/50">
                  {viewMode === 'employees' && (
                    <th className="px-8 py-4 text-sm font-black text-gray-900 uppercase tracking-widest">Employee ID</th>
                  )}
                  <th className="px-8 py-4 text-sm font-black text-gray-900 uppercase tracking-widest">ชื่อ-นามสกุล</th>
                  
                  {viewMode === 'employees' ? (
                    <>
                      <th className="px-8 py-4 text-sm font-black text-gray-900 uppercase tracking-widest">บทบาท</th>
                      <th className="px-8 py-4 text-sm font-black text-gray-900 uppercase tracking-widest">สถานะ</th>
                      <th className="px-8 py-4 text-sm font-black text-gray-900 uppercase tracking-widest text-right">การจัดการ</th>
                    </>
                  ) : (
                    <>
                      <th className="px-4 py-4 text-sm font-black text-gray-900 uppercase tracking-widest text-center">ลาพักร้อน</th>
                      <th className="px-4 py-4 text-sm font-black text-gray-900 uppercase tracking-widest text-center">ลาป่วย</th>
                      <th className="px-4 py-4 text-sm font-black text-gray-900 uppercase tracking-widest text-center">ลากิจ</th>
                      <th className="px-8 py-4 text-sm font-black text-gray-900 uppercase tracking-widest text-right">การจัดการ</th>
                    </>
                  )}
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-50">
                {employees.map((employee) => (
                  <tr key={employee.empId} className="group hover:bg-gray-50/50 transition-colors">
                    {viewMode === 'employees' && (
                      <td className="px-8 py-5 font-mono text-xs font-bold text-gray-400 group-hover:text-blue-600 transition-colors">
                        {employee.empId}
                      </td>
                    )}
                    <td className="px-8 py-5">
                      <p className="font-black text-gray-900 text-base">{employee.name}</p>
                    </td>
                    
                    {viewMode === 'employees' ? (
                      <>
                        {/* Role */}
                        <td className="px-8 py-5">
                          <span className={`px-2 py-1 rounded text-[10px] font-black uppercase tracking-wider ${
                            employee.role === 'admin' 
                              ? 'bg-purple-100 text-purple-700' 
                              : 'bg-blue-100 text-blue-700'
                          }`}>
                            {employee.role}
                          </span>
                        </td>
                        
                        {/* Status */}
                        <td className="px-8 py-5">
                          {employee.isRegistered ? (
                            <div className="flex items-center text-green-600 space-x-1.5">
                              <CheckCircle className="w-4 h-4" />
                              <span className="text-xs font-bold uppercase tracking-wide">ลงทะเบียนแล้ว</span>
                            </div>
                          ) : (
                            <div className="flex items-center text-orange-500 space-x-1.5">
                              <XCircle className="w-4 h-4" />
                              <span className="text-xs font-bold uppercase tracking-wide">รอลงทะเบียน</span>
                            </div>
                          )}
                        </td>
                        
                        {/* Actions - Reordered: Reset → Edit → Delete */}
                        <td className="px-8 py-5">
                          <div className="flex items-center justify-end space-x-3">
                            {/* Reset Password Button */}
                            {employee.isRegistered ? (
                              <button
                                onClick={() => handleResetRegistration(employee.empId)}
                                className="px-3 py-1.5 text-orange-600 hover:bg-orange-50 border border-orange-100 rounded-lg transition-all text-xs font-black"
                              >
                                รีเซ็ตรหัส
                              </button>
                            ) : (
                              // Spacer to maintain layout when reset button is not shown
                              <div className="w-[84px]"></div>
                            )}
                            
                            {/* Edit Button */}
                            <button
                              onClick={() => handleEdit(employee)}
                              className="px-3 py-1.5 text-blue-600 hover:bg-blue-50 border border-blue-100 rounded-lg transition-all text-xs font-black"
                            >
                              แก้ไข
                            </button>
                            
                            {/* Delete Button - Always shown, disabled for ADMIN001 */}
                            <button
                              onClick={() => employee.empId !== 'ADMIN001' && handleDelete(employee.empId)}
                              disabled={employee.empId === 'ADMIN001'}
                              className={`p-2 rounded-lg transition-all ${
                                employee.empId === 'ADMIN001'
                                  ? 'text-gray-300 cursor-not-allowed'
                                  : 'text-gray-400 hover:text-red-600 hover:bg-red-50'
                              }`}
                              title={employee.empId === 'ADMIN001' ? 'ไม่สามารถลบแอดมินหลักได้' : 'ลบพนักงาน'}
                            >
                              <Trash2 className="w-4 h-4" />
                            </button>
                          </div>
                        </td>
                      </>
                    ) : (
                      <>
                        {/* Leave Quotas */}
                        <td className="px-4 py-5 text-center">
                          <span className="font-black text-blue-600 text-lg">{employee.leaveQuota}</span>
                        </td>
                        <td className="px-4 py-5 text-center">
                          <span className="font-black text-green-600 text-lg">{employee.sickLeaveQuota}</span>
                        </td>
                        <td className="px-4 py-5 text-center">
                          <span className="font-black text-orange-600 text-lg">{employee.personalLeaveQuota}</span>
                        </td>
                        
                        {/* Actions */}
                        <td className="px-8 py-5">
                          <div className="flex items-center justify-end">
                            <button
                              onClick={() => handleEdit(employee)}
                              className="px-3 py-1.5 text-blue-600 hover:bg-blue-50 border border-blue-100 rounded-lg transition-all text-xs font-black"
                            >
                              แก้ไข
                            </button>
                          </div>
                        </td>
                      </>
                    )}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      <EmployeeFormDialog
        open={showForm}
        onClose={handleCloseForm}
        onSuccess={handleSuccess}
        employee={selectedEmployee}
      />
    </div>
  );
}

function UsersIcon({ className }: { className?: string }) {
  return (
    <svg 
      className={className} 
      fill="none" 
      viewBox="0 0 24 24" 
      stroke="currentColor" 
      strokeWidth={1.5}
    >
      <path strokeLinecap="round" strokeLinejoin="round" d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" />
    </svg>
  );
}
