'use client';

import { useAuth } from '@/contexts/auth.context';
import { useToast } from '@/contexts/toast.context';
import { useRouter } from 'next/navigation';
import { LogOut, User, Bell, Menu } from 'lucide-react';

interface NavbarProps {
  onMenuClick?: () => void;
  pageTitle?: string;
}

export function Navbar({ onMenuClick, pageTitle }: NavbarProps) {
  const { user, logout } = useAuth();
  const toast = useToast();
  const router = useRouter();

  const handleLogout = () => {
    logout();
    toast.success('ออกจากระบบสำเร็จ');
    router.push('/login');
  };

  return (
    <nav className="sticky top-0 z-40 w-full bg-white/80 backdrop-blur-md border-b border-gray-200">
      <div className="px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          <div className="flex items-center">
            <button
              onClick={onMenuClick}
              className="p-2 mr-2 text-gray-600 lg:hidden hover:bg-gray-100 rounded-lg transition-colors"
            >
              <Menu className="w-6 h-6" />
            </button>
            {pageTitle && (
              <h1 className="text-xl font-black text-gray-900">{pageTitle}</h1>
            )}
          </div>

          <div className="flex items-center space-x-4">
            <button className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-full transition-all relative">
              <Bell className="w-5 h-5" />
              <span className="absolute top-2 right-2 w-2 h-2 bg-red-500 rounded-full border-2 border-white"></span>
            </button>

            <div className="flex items-center space-x-3 border-l border-gray-200 pl-4">
              <div className="text-right hidden md:block">
                <p className="text-sm font-bold text-gray-900 leading-none">{user?.name}</p>
                <p className="text-xs text-gray-500 mt-1 uppercase tracking-wider">{user?.role}</p>
              </div>
              <div className="w-9 h-9 bg-gray-100 rounded-full flex items-center justify-center border border-gray-200">
                <User className="w-5 h-5 text-gray-600" />
              </div>
              <button
                onClick={handleLogout}
                className="p-2 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-all"
                title="ออกจากระบบ"
              >
                <LogOut className="w-5 h-5" />
              </button>
            </div>
          </div>
        </div>
      </div>
    </nav>
  );
}
