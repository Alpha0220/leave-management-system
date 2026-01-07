'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/contexts/auth.context';
import { Loader2 } from 'lucide-react';

export default function HomePage() {
  const { loading, isAuthenticated, isAdmin } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!loading) {
      if (!isAuthenticated) {
        // Not logged in - redirect to login
        router.push('/login');
      } else if (isAdmin) {
        // Admin user - redirect to admin dashboard
        router.push('/admin/dashboard');
      } else {
        // Regular employee - redirect to employee dashboard
        router.push('/dashboard');
      }
    }
  }, [loading, isAuthenticated, isAdmin, router]);

  // Show loading state while checking auth
  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50">
      <div className="text-center">
        <Loader2 className="w-12 h-12 animate-spin text-blue-600 mx-auto mb-4" />
        <p className="text-gray-600">กำลังโหลด...</p>
      </div>
    </div>
  );
}
