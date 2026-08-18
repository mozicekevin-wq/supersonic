import React from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';

/** Protects all /admin/* routes. Redirects to /admin/login if not authenticated or not admin/editor. */
export default function AdminGuard({ children }: { children: React.ReactNode }) {
  const { user, profile, loading } = useAuth();
  const location = useLocation();

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen"
        style={{ background: 'hsl(var(--sidebar-background))' }}>
        <div className="w-10 h-10 border-4 border-accent border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  if (!user) {
    return <Navigate to="/admin/login" state={{ from: location }} replace />;
  }

  // profile may be null briefly while fetching — only block if explicitly non-admin
  if (profile && profile.role !== 'admin' && profile.role !== 'editor') {
    return <Navigate to="/" replace />;
  }

  return <>{children}</>;
}
