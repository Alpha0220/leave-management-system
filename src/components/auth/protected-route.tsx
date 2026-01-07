'use client';

/**
 * Protected Route Component
 * Redirects to login if not authenticated
 * Optionally checks for admin role
 */

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/contexts/auth.context';
import { Loader2 } from 'lucide-react';

interface ProtectedRouteProps {
  children: React.ReactNode;
  requireAdmin?: boolean;
}

export function ProtectedRoute({ children, requireAdmin = false }: ProtectedRouteProps) {
  const { loading, isAuthenticated, isAdmin } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!loading) {
      // Not authenticated - redirect to login
      if (!isAuthenticated) {
        router.push('/login');
        return;
      }

      // Requires admin but user is not admin - redirect to dashboard
      if (requireAdmin && !isAdmin) {
        router.push('/dashboard');
        return;
      }
    }
  }, [loading, isAuthenticated, isAdmin, requireAdmin, router]);

  // Show loading state
  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <Loader2 className="w-12 h-12 animate-spin text-blue-600 mx-auto mb-4" />
          <p className="text-gray-600">กำลังโหลด...</p>
        </div>
      </div>
    );
  }

  // Not authenticated
  if (!isAuthenticated) {
    return null;
  }

  // Requires admin but user is not admin
  if (requireAdmin && !isAdmin) {
    return null;
  }

  // Authenticated and authorized
  return <>{children}</>;
}
