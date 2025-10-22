import { useEffect } from 'react';
import { Navigate } from 'react-router-dom';
import { useAuth } from '@/hooks/useAuth';
import { ROUTES } from '@/lib/routes';

interface RoleBasedRedirectProps {
  fallbackRoute?: string;
}

export const RoleBasedRedirect = ({ fallbackRoute = ROUTES.HOME }: RoleBasedRedirectProps) => {
  const { isAuthenticated, role, loading } = useAuth();

  useEffect(() => {
    console.log('RoleBasedRedirect - Auth status:', { isAuthenticated, role, loading });
  }, [isAuthenticated, role, loading]);

  // Show loading while determining auth state
  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <div className="text-center">
          <div className="h-8 w-8 animate-spin rounded-full border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-muted-foreground">Redirecting...</p>
        </div>
      </div>
    );
  }

  // Redirect unauthenticated users to login
  if (!isAuthenticated) {
    return <Navigate to={ROUTES.LOGIN} replace />;
  }

  // Redirect based on user role
  switch (role) {
    case 'admin':
      return <Navigate to={ROUTES.ADMIN.DASHBOARD} replace />;
    case 'supplier':
      return <Navigate to={ROUTES.SUPPLIER.DASHBOARD} replace />;
    case 'customer':
      return <Navigate to={ROUTES.CUSTOMER.DASHBOARD} replace />;
    default:
      // User has no role or unknown role
      return <Navigate to={fallbackRoute} replace />;
  }
};