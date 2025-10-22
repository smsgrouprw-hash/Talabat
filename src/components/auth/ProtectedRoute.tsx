import { ReactNode } from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '@/hooks/useAuth';
import { supabase } from '@/integrations/supabase/client';
import { useState, useEffect } from 'react';
import { ROUTES } from '@/lib/routes';
import type { UserRole } from '@/lib/auth';

interface ProtectedRouteProps {
  children: ReactNode;
  requiredRole?: UserRole;
  requireAuth?: boolean;
  redirectTo?: string;
  checkSupplierApproval?: boolean;
}

interface SupplierStatus {
  isActive: boolean;
  isVerified: boolean;
  loading: boolean;
}

export const ProtectedRoute = ({ 
  children, 
  requiredRole,
  requireAuth = true,
  redirectTo = ROUTES.LOGIN,
  checkSupplierApproval = false
}: ProtectedRouteProps) => {
  const { isAuthenticated, role, user, loading: authLoading } = useAuth();
  const location = useLocation();
  const [supplierStatus, setSupplierStatus] = useState<SupplierStatus>({
    isActive: false,
    isVerified: false,
    loading: false
  });

  // Debug logging
  console.log('ProtectedRoute check:', { 
    path: location.pathname,
    isAuthenticated, 
    role, 
    requiredRole,
    authLoading
  });

  // Check supplier approval status if needed
  useEffect(() => {
    const checkSupplierStatus = async () => {
      if (!checkSupplierApproval || role !== 'supplier' || !user?.id) {
        return;
      }

      setSupplierStatus(prev => ({ ...prev, loading: true }));

      try {
        const { data, error } = await supabase
          .from('suppliers')
          .select('is_active, is_verified')
          .eq('user_id', user.id)
          .maybeSingle();

        if (error) {
          console.error('Error checking supplier status:', error);
          setSupplierStatus({ isActive: false, isVerified: false, loading: false });
          return;
        }

        setSupplierStatus({
          isActive: data?.is_active || false,
          isVerified: data?.is_verified || false,
          loading: false
        });
      } catch (error) {
        console.error('Error in supplier status check:', error);
        setSupplierStatus({ isActive: false, isVerified: false, loading: false });
      }
    };

    checkSupplierStatus();
  }, [checkSupplierApproval, role, user?.id]);

  // Show loading while checking auth, role, or supplier status
  if (authLoading || (checkSupplierApproval && supplierStatus.loading)) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <div className="text-center">
          <div className="h-8 w-8 animate-spin rounded-full border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-muted-foreground">Loading...</p>
        </div>
      </div>
    );
  }

  // If authenticated but role is still loading, wait
  if (isAuthenticated && !role && requiredRole) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <div className="text-center">
          <div className="h-8 w-8 animate-spin rounded-full border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-muted-foreground">Verifying permissions...</p>
        </div>
      </div>
    );
  }

  // Check authentication requirement
  if (requireAuth && !isAuthenticated) {
    return <Navigate to={redirectTo} state={{ from: location }} replace />;
  }

  // Check supplier approval if required
  if (checkSupplierApproval && role === 'supplier') {
    if (!supplierStatus.isActive || !supplierStatus.isVerified) {
      return <Navigate to={ROUTES.SUPPLIER.DASHBOARD} replace />;
    }
  }

  // Check role requirement
  if (requiredRole && role !== requiredRole) {
    // Handle role-based redirects
    if (role === 'admin') {
      return <Navigate to={ROUTES.ADMIN.DASHBOARD} replace />;
    } else if (role === 'supplier') {
      return <Navigate to={ROUTES.SUPPLIER.DASHBOARD} replace />;
    } else if (role === 'customer') {
      return <Navigate to={ROUTES.CUSTOMER.DASHBOARD} replace />;
    } else {
      return <Navigate to={ROUTES.UNAUTHORIZED} replace />;
    }
  }

  return <>{children}</>;
};

// Convenience components for specific roles
export const AdminRoute = ({ children, redirectTo, checkSupplierApproval }: { 
  children: ReactNode; 
  redirectTo?: string;
  checkSupplierApproval?: boolean;
}) => (
  <ProtectedRoute 
    requiredRole="admin" 
    redirectTo={redirectTo}
    checkSupplierApproval={checkSupplierApproval}
  >
    {children}
  </ProtectedRoute>
);

export const SupplierRoute = ({ children, redirectTo, checkSupplierApproval = true }: { 
  children: ReactNode; 
  redirectTo?: string;
  checkSupplierApproval?: boolean;
}) => (
  <ProtectedRoute 
    requiredRole="supplier" 
    redirectTo={redirectTo}
    checkSupplierApproval={checkSupplierApproval}
  >
    {children}
  </ProtectedRoute>
);

export const CustomerRoute = ({ children, redirectTo }: { 
  children: ReactNode; 
  redirectTo?: string;
}) => (
  <ProtectedRoute requiredRole="customer" redirectTo={redirectTo}>
    {children}
  </ProtectedRoute>
);