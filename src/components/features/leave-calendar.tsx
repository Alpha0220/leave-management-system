'use client';

import { useState } from 'react';
import { Calendar as CalendarIcon, ChevronLeft, ChevronRight } from 'lucide-react';

interface CalendarDay {
  date: Date;
  isCurrentMonth: boolean;
  isToday: boolean;
  leaves: Array<{
    empId: string;
    employeeName: string;
    type: 'annual' | 'sick' | 'personal';
    status: 'pending' | 'approved' | 'rejected';
  }>;
}

const MONTHS_TH = [
  'มกราคม', 'กุมภาพันธ์', 'มีนาคม', 'เมษายน', 'พฤษภาคม', 'มิถุนายน',
  'กรกฎาคม', 'สิงหาคม', 'กันยายน', 'ตุลาคม', 'พฤศจิกายน', 'ธันวาคม'
];

const DAYS_TH = ['อา', 'จ', 'อ', 'พ', 'พฤ', 'ศ', 'ส'];

const LEAVE_TYPE_COLORS = {
  annual: 'bg-blue-100 text-blue-700 border-blue-200',
  sick: 'bg-green-100 text-green-700 border-green-200',
  personal: 'bg-orange-100 text-orange-700 border-orange-200',
};

const STATUS_COLORS = {
  pending: 'opacity-60',
  approved: 'opacity-100',
  rejected: 'opacity-30 line-through',
};

export function LeaveCalendar({ leaves }: { 
  leaves: Array<{
    empId: string;
    employeeName: string;
    type: 'annual' | 'sick' | 'personal';
    startDate: string;
    endDate: string;
    status: 'pending' | 'approved' | 'rejected';
  }> 
}) {
  const [currentDate, setCurrentDate] = useState(new Date());

  const getDaysInMonth = (date: Date): CalendarDay[] => {
    const year = date.getFullYear();
    const month = date.getMonth();
    
    const firstDay = new Date(year, month, 1);
    const lastDay = new Date(year, month + 1, 0);
    const daysInMonth = lastDay.getDate();
    const startingDayOfWeek = firstDay.getDay();
    
    const days: CalendarDay[] = [];
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    // Previous month days
    const prevMonthLastDay = new Date(year, month, 0).getDate();
    for (let i = startingDayOfWeek - 1; i >= 0; i--) {
      const date = new Date(year, month - 1, prevMonthLastDay - i);
      days.push({
        date,
        isCurrentMonth: false,
        isToday: false,
        leaves: getLeavesForDate(date),
      });
    }

    // Current month days
    for (let day = 1; day <= daysInMonth; day++) {
      const date = new Date(year, month, day);
      days.push({
        date,
        isCurrentMonth: true,
        isToday: date.getTime() === today.getTime(),
        leaves: getLeavesForDate(date),
      });
    }

    // Next month days
    const remainingDays = 42 - days.length; // 6 rows * 7 days
    for (let day = 1; day <= remainingDays; day++) {
      const date = new Date(year, month + 1, day);
      days.push({
        date,
        isCurrentMonth: false,
        isToday: false,
        leaves: getLeavesForDate(date),
      });
    }

    return days;
  };

  const getLeavesForDate = (date: Date) => {
    return leaves.filter(leave => {
      const startDate = new Date(leave.startDate);
      const endDate = new Date(leave.endDate);
      startDate.setHours(0, 0, 0, 0);
      endDate.setHours(0, 0, 0, 0);
      date.setHours(0, 0, 0, 0);
      
      return date >= startDate && date <= endDate && leave.status === 'approved';
    });
  };

  const previousMonth = () => {
    setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() - 1));
  };

  const nextMonth = () => {
    setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() + 1));
  };

  const goToToday = () => {
    setCurrentDate(new Date());
  };

  const days = getDaysInMonth(currentDate);

  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
      {/* Header */}
      <div className="bg-linear-to-r from-blue-600 to-indigo-600 text-white p-6">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center space-x-3">
            <CalendarIcon className="w-6 h-6" />
            <h2 className="text-2xl font-bold">
              {MONTHS_TH[currentDate.getMonth()]} {currentDate.getFullYear() + 543}
            </h2>
          </div>
          <div className="flex items-center space-x-2">
            <button
              onClick={previousMonth}
              className="p-2 hover:bg-white/20 rounded-lg transition-colors"
            >
              <ChevronLeft className="w-5 h-5" />
            </button>
            <button
              onClick={goToToday}
              className="px-4 py-2 bg-white/20 hover:bg-white/30 rounded-lg transition-colors text-sm font-medium"
            >
              วันนี้
            </button>
            <button
              onClick={nextMonth}
              className="p-2 hover:bg-white/20 rounded-lg transition-colors"
            >
              <ChevronRight className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Legend */}
        <div className="flex flex-wrap gap-4 text-sm">
          <div className="flex items-center space-x-2">
            <div className="w-3 h-3 rounded-full bg-blue-300"></div>
            <span>ลาพักร้อน</span>
          </div>
          <div className="flex items-center space-x-2">
            <div className="w-3 h-3 rounded-full bg-green-300"></div>
            <span>ลาป่วย</span>
          </div>
          <div className="flex items-center space-x-2">
            <div className="w-3 h-3 rounded-full bg-orange-300"></div>
            <span>ลากิจ</span>
          </div>
        </div>
      </div>

      {/* Calendar Grid */}
      <div className="p-4">
        {/* Day Headers */}
        <div className="grid grid-cols-7 gap-2 mb-2">
          {DAYS_TH.map((day, index) => (
            <div
              key={day}
              className={`text-center text-sm font-bold py-2 ${
                index === 0 ? 'text-red-600' : index === 6 ? 'text-blue-600' : 'text-gray-700'
              }`}
            >
              {day}
            </div>
          ))}
        </div>

        {/* Calendar Days */}
        <div className="grid grid-cols-7 gap-2">
          {days.map((day, index) => (
            <div
              key={index}
              className={`
                min-h-[100px] p-2 rounded-lg border transition-all
                ${day.isCurrentMonth ? 'bg-white border-gray-200' : 'bg-gray-50 border-gray-100'}
                ${day.isToday ? 'ring-2 ring-blue-500 border-blue-500' : ''}
                hover:shadow-md
              `}
            >
              <div className={`
                text-sm font-bold mb-1
                ${!day.isCurrentMonth ? 'text-gray-400' : day.isToday ? 'text-blue-600' : 'text-gray-900'}
              `}>
                {day.date.getDate()}
              </div>

              {/* Leaves */}
              <div className="space-y-1">
                {day.leaves.slice(0, 3).map((leave, idx) => (
                  <div
                    key={idx}
                    className={`
                      text-[10px] px-1.5 py-0.5 rounded border
                      ${LEAVE_TYPE_COLORS[leave.type]}
                      ${STATUS_COLORS[leave.status]}
                      truncate
                    `}
                    title={`${leave.employeeName} - ${leave.type}`}
                  >
                    {leave.employeeName}
                  </div>
                ))}
                {day.leaves.length > 3 && (
                  <div className="text-[10px] text-gray-500 font-medium">
                    +{day.leaves.length - 3} อื่นๆ
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
