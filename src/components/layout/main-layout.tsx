'use client';

import { useState, ReactNode } from 'react';
import { Navbar } from './navbar';
import { Sidebar } from './sidebar';
import { Footer } from './footer';
import { X } from 'lucide-react';

interface MainLayoutProps {
  children: ReactNode;
}

export function MainLayout({ children }: MainLayoutProps) {
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  // Removed isAuthenticated check to show layout on every page as requested

  return (
    <div className="h-screen bg-gray-50 flex flex-col overflow-hidden">
      {/* Navbar always at top */}
      <Navbar onMenuClick={() => setMobileMenuOpen(true)} />

      <div className="flex flex-1 overflow-hidden relative">
        {/* Mobile Sidebar Backdrop */}
        {mobileMenuOpen && (
          <div 
            className="fixed inset-0 bg-gray-900/50 backdrop-blur-sm z-50 lg:hidden"
            onClick={() => setMobileMenuOpen(false)}
          />
        )}

        {/* Mobile Sidebar */}
        <div 
          className={`
            fixed top-0 left-0 bottom-0 z-50 lg:hidden transition-transform duration-300 ease-in-out
            ${mobileMenuOpen ? 'translate-x-0' : '-translate-x-full'}
          `}
        >
          <div className="relative h-full">
            <button 
              onClick={() => setMobileMenuOpen(false)}
              className="absolute top-4 -right-12 p-2 bg-white rounded-lg shadow-lg text-gray-600 hover:text-red-600 transition-colors"
            >
              <X className="w-6 h-6" />
            </button>
            <Sidebar 
              collapsed={false} 
              onToggle={() => {}} 
              mobile 
            />
          </div>
        </div>

        {/* Desktop Sidebar - Fixed height with its own scroll */}
        <div className="hidden lg:block shrink-0 border-r border-gray-200">
          <Sidebar 
            collapsed={sidebarCollapsed} 
            onToggle={() => setSidebarCollapsed(!sidebarCollapsed)} 
          />
        </div>

        {/* Main Content Area - Scrollable area */}
        <main className="flex-1 overflow-y-auto overflow-x-hidden transition-all duration-300 flex flex-col">
          <div className="flex-1 p-4 sm:p-6 lg:p-8">
            <div className="max-w-7xl mx-auto w-full">
              {children}
            </div>
          </div>
          <Footer />
        </main>
      </div>
    </div>
  );
}
