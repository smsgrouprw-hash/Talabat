import React, { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import { AdminDashboardLayout } from '@/components/layouts/AdminDashboardLayout';
import { SupplierList } from '@/components/admin/SupplierList';
import { SupplierDetails } from '@/components/admin/SupplierDetails';
import { AddSupplierForm } from '@/components/admin/AddSupplierForm';
import { supabase } from '@/integrations/supabase/client';

const AdminSupplierManagement = () => {
  const [searchParams] = useSearchParams();
  const [selectedSupplier, setSelectedSupplier] = useState<any>(null);
  const [showAddForm, setShowAddForm] = useState(false);
  const [refreshKey, setRefreshKey] = useState(0);
  
  useEffect(() => {
    const supplierId = searchParams.get('supplier');
    if (supplierId) {
      fetchSupplierDetails(supplierId);
    }
  }, [searchParams]);
  
  const fetchSupplierDetails = async (supplierId: string) => {
    const { data, error } = await supabase
      .from('suppliers')
      .select(`
        *,
        users!suppliers_user_id_fkey(first_name, last_name, email)
      `)
      .eq('id', supplierId)
      .single();
    
    if (!error && data) {
      setSelectedSupplier({
        ...data,
        first_name: data.users?.first_name || '',
        last_name: data.users?.last_name || '',
        email: data.users?.email || data.email
      });
    }
  };

  const handleViewDetails = (supplier: any) => {
    setSelectedSupplier(supplier);
    setShowAddForm(false);
  };

  const handleAddNew = () => {
    setShowAddForm(true);
    setSelectedSupplier(null);
  };

  const handleBack = () => {
    setSelectedSupplier(null);
    setShowAddForm(false);
    // Clear URL parameter
    window.history.pushState({}, '', '/admin/suppliers');
  };

  const handleUpdate = () => {
    setRefreshKey(prev => prev + 1);
    setSelectedSupplier(null);
    setShowAddForm(false);
    // Clear URL parameter
    window.history.pushState({}, '', '/admin/suppliers');
  };

  return (
    <AdminDashboardLayout>
      <div className="p-6">
        {selectedSupplier ? (
          <SupplierDetails 
            supplier={selectedSupplier}
            onBack={handleBack}
            onUpdate={handleUpdate}
          />
        ) : showAddForm ? (
          <AddSupplierForm
            onSuccess={handleUpdate}
            onCancel={handleBack}
          />
        ) : (
          <SupplierList 
            key={refreshKey}
            onViewDetails={handleViewDetails}
            onAddNew={handleAddNew}
          />
        )}
      </div>
    </AdminDashboardLayout>
  );
};

export default AdminSupplierManagement;