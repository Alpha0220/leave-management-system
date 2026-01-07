'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useAuth } from '@/contexts/auth.context';
import {
  LayoutDashboard,
  Calendar,
  History,
  Users,
  Settings,
  ChevronLeft,
  ChevronRight,
  ShieldCheck,
  FileText,
  LucideIcon
} from 'lucide-react';

interface NavLink {
  name: string;
  href: string;
  icon: LucideIcon;
}

interface NavDivider {
  type: 'divider';
}

type NavItem = NavLink | NavDivider;

interface SidebarProps {
  collapsed: boolean;
  onToggle: () => void;
  mobile?: boolean;
}

export function Sidebar({ collapsed, onToggle, mobile }: SidebarProps) {
  const { user } = useAuth();
  const pathname = usePathname();

  const isAdmin = user?.role === 'admin';

  const employeeLinks: NavLink[] = [
    { name: 'แดชบอร์ด', href: '/dashboard', icon: LayoutDashboard },
    { name: 'ปฏิทินการลา', href: '/calendar', icon: Calendar },
    { name: 'ประวัติการลา', href: '/leave/history', icon: History },
  ];

  const adminLinks: NavLink[] = [
    { name: 'Admin Dashboard', href: '/admin/dashboard', icon: ShieldCheck },
    { name: 'อนุมัติคำขอลา', href: '/admin/leaves', icon: FileText },
    { name: 'จัดการพนักงาน', href: '/admin/employees', icon: Users },
    { name: 'ตั้งค่าระบบ', href: '/admin/settings', icon: Settings },
  ];

  const links: NavItem[] = isAdmin ? [...employeeLinks, { type: 'divider' }, ...adminLinks] : employeeLinks;

  return (
    <aside
      className={`
        bg-white transition-all duration-300 ease-in-out flex flex-col overflow-x-hidden h-full
        ${mobile ? 'w-64' : (collapsed ? 'w-20' : 'w-64')}
      `}
    >
      {!mobile && (
        <div className="flex justify-end p-4 border-b border-gray-100">
          <button
            onClick={onToggle}
            className="p-1.5 bg-gray-50 hover:bg-gray-100 rounded-lg text-gray-500 transition-colors border border-gray-200"
          >
            {collapsed ? <ChevronRight size={18} /> : <ChevronLeft size={18} />}
          </button>
        </div>
      )}

      <div className="flex-1 overflow-y-auto overflow-x-hidden py-6 px-3 space-y-2">
        {links.map((link, index) => {
          if ('type' in link && link.type === 'divider') {
            return (
              <div key={index} className="py-4 px-3">
                <div className="h-px bg-gray-100 w-full relative">
                  {!collapsed && (
                    <span className="absolute left-1/2 -top-2 -translate-x-1/2 bg-white px-2 text-[10px] font-black text-gray-300 uppercase tracking-[0.2em]">
                      Administration
                    </span>
                  )}
                </div>
              </div>
            );
          }

          const navLink = link as NavLink;
          const Icon = navLink.icon;
          const isActive = pathname === navLink.href;

          return (
            <Link
              key={navLink.href}
              href={navLink.href}
              className={`
                flex items-center px-4 py-3 rounded-xl transition-all group relative
                ${isActive
                  ? 'bg-blue-50 text-blue-600'
                  : 'text-gray-500 hover:bg-gray-50 hover:text-gray-900'}
              `}
            >
              <Icon
                size={22}
                className={`shrink-0 ${isActive ? 'text-blue-600' : 'text-gray-400 group-hover:text-gray-600'} transition-colors`}
              />

              <span className={`
                ml-3 font-medium whitespace-nowrap overflow-hidden transition-all duration-300
                ${collapsed && !mobile ? 'w-0 opacity-0' : 'w-full opacity-100'}
              `}>
                {navLink.name}
              </span>

              {collapsed && !mobile && (
                <div className="absolute left-full ml-4 px-3 py-2 bg-gray-900 text-white text-xs font-bold rounded-lg opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all whitespace-nowrap z-50 shadow-xl">
                  {navLink.name}
                </div>
              )}

              {isActive && (
                <div className="absolute left-0 w-1 h-6 bg-blue-600 rounded-r-full" />
              )}
            </Link>
          );
        })}
      </div>
    </aside>
  );
}
