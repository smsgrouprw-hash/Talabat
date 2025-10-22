import { SupplierDashboardLayout } from '@/components/layouts/SupplierDashboardLayout';
import { ProductList } from '@/components/supplier/ProductList';
import { ErrorBoundary } from '@/components/ui/error-boundary';

const SupplierMenuManagement = () => {
  return (
    <SupplierDashboardLayout>
      <ErrorBoundary>
        <ProductList />
      </ErrorBoundary>
    </SupplierDashboardLayout>
  );
};

export default SupplierMenuManagement;