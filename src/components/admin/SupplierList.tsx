import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { toast } from '@/hooks/use-toast';
import { 
  Search, 
  Filter, 
  Eye, 
  Check, 
  X, 
  MoreHorizontal,
  Building,
  Mail,
  Phone,
  MapPin,
  Clock,
  Plus,
  Trash2,
  Key,
  CreditCard
} from 'lucide-react';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';

interface SupplierListProps {
  onViewDetails: (supplier: any) => void;
  onAddNew: () => void;
}

export const SupplierList: React.FC<SupplierListProps> = ({ onViewDetails, onAddNew }) => {
  const { user } = useAuth();
  const [suppliers, setSuppliers] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [selectedSuppliers, setSelectedSuppliers] = useState<string[]>([]);
  const [showBulkActions, setShowBulkActions] = useState(false);
  const [actionDialogOpen, setActionDialogOpen] = useState(false);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [resetPasswordDialogOpen, setResetPasswordDialogOpen] = useState(false);
  const [newPassword, setNewPassword] = useState('');
  const [actionType, setActionType] = useState<'approve' | 'reject'>('approve');
  const [targetSupplier, setTargetSupplier] = useState<any>(null);

  useEffect(() => {
    fetchSuppliers();
  }, []);

  const fetchSuppliers = async () => {
    try {
      const { data, error } = await supabase
        .from('suppliers')
        .select(`
          *,
          users (
            email,
            first_name,
            last_name
          )
        `)
        .order('created_at', { ascending: false });

      if (error) throw error;
      setSuppliers(data || []);
    } catch (error) {
      console.error('Error fetching suppliers:', error);
      toast({
        title: 'Error',
        description: 'Failed to load suppliers',
        variant: 'destructive'
      });
    } finally {
      setLoading(false);
    }
  };

  const handleApprovalAction = async (supplierId: string, action: 'approve' | 'reject') => {
    try {
      // Update supplier status
      const newStatus = action === 'approve' ? 'active' : 'rejected';
      const { error: updateError } = await supabase
        .from('suppliers')
        .update({ 
          subscription_status: newStatus,
          updated_at: new Date().toISOString()
        })
        .eq('id', supplierId);

      if (updateError) throw updateError;

      // Send notification email
      const { error: emailError } = await supabase.functions.invoke('supplier-notification', {
        body: {
          supplierId,
          action: action === 'approve' ? 'approved' : 'rejected',
          adminEmail: user?.email
        }
      });

      if (emailError) {
        console.warn('Email notification failed:', emailError);
        // Don't throw here as the main action succeeded
      }

      toast({
        title: 'Success',
        description: `Supplier ${action === 'approve' ? 'approved' : 'rejected'} successfully`
      });

      // Refresh suppliers list
      await fetchSuppliers();
    } catch (error: any) {
      console.error('Error updating supplier status:', error);
      toast({
        title: 'Error',
        description: error.message || `Failed to ${action} supplier`,
        variant: 'destructive'
      });
    }
  };

  const handleBulkAction = async (action: 'approve' | 'reject') => {
    if (selectedSuppliers.length === 0) return;

    try {
      const newStatus = action === 'approve' ? 'active' : 'rejected';
      
      // Update all selected suppliers
      const { error: updateError } = await supabase
        .from('suppliers')
        .update({ 
          subscription_status: newStatus,
          updated_at: new Date().toISOString()
        })
        .in('id', selectedSuppliers);

      if (updateError) throw updateError;

      // Send notification emails for each supplier
      for (const supplierId of selectedSuppliers) {
        await supabase.functions.invoke('supplier-notification', {
          body: {
            supplierId,
            action: action === 'approve' ? 'approved' : 'rejected',
            adminEmail: user?.email
          }
        });
      }

      toast({
        title: 'Success',
        description: `${selectedSuppliers.length} suppliers ${action === 'approve' ? 'approved' : 'rejected'} successfully`
      });

      setSelectedSuppliers([]);
      setShowBulkActions(false);
      await fetchSuppliers();
    } catch (error: any) {
      console.error('Error with bulk action:', error);
      toast({
        title: 'Error',
        description: error.message || `Failed to ${action} suppliers`,
        variant: 'destructive'
      });
    }
  };

  const handleDeleteSupplier = async () => {
    if (!targetSupplier) return;

    try {
      // Delete supplier (cascade will handle related data)
      const { error } = await supabase
        .from('suppliers')
        .delete()
        .eq('id', targetSupplier.id);

      if (error) throw error;

      toast({
        title: 'Success',
        description: 'Supplier deleted successfully'
      });

      setDeleteDialogOpen(false);
      setTargetSupplier(null);
      await fetchSuppliers();
    } catch (error: any) {
      console.error('Error deleting supplier:', error);
      toast({
        title: 'Error',
        description: error.message || 'Failed to delete supplier',
        variant: 'destructive'
      });
    }
  };

  const handleResetPassword = async () => {
    if (!targetSupplier || !newPassword) return;

    try {
      const { error } = await supabase.functions.invoke('admin-reset-password', {
        body: {
          userId: targetSupplier.user_id,
          newPassword
        }
      });

      if (error) throw error;

      toast({
        title: 'Success',
        description: 'Password reset successfully'
      });

      setResetPasswordDialogOpen(false);
      setNewPassword('');
      setTargetSupplier(null);
    } catch (error: any) {
      console.error('Error resetting password:', error);
      toast({
        title: 'Error',
        description: error.message || 'Failed to reset password',
        variant: 'destructive'
      });
    }
  };

  const handleToggleStatus = async (supplier: any) => {
    try {
      const newStatus = supplier.is_active ? false : true;
      
      const { error } = await supabase
        .from('suppliers')
        .update({ is_active: newStatus })
        .eq('id', supplier.id);

      if (error) throw error;

      toast({
        title: 'Success',
        description: `Supplier ${newStatus ? 'activated' : 'deactivated'} successfully`
      });

      await fetchSuppliers();
    } catch (error: any) {
      console.error('Error toggling supplier status:', error);
      toast({
        title: 'Error',
        description: error.message || 'Failed to update supplier status',
        variant: 'destructive'
      });
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'active':
        return <Badge className="bg-green-100 text-green-800">Active</Badge>;
      case 'pending':
        return <Badge className="bg-yellow-100 text-yellow-800">Pending</Badge>;
      case 'rejected':
        return <Badge className="bg-red-100 text-red-800">Rejected</Badge>;
      case 'expired':
        return <Badge variant="secondary">Expired</Badge>;
      default:
        return <Badge variant="outline">{status}</Badge>;
    }
  };

  // Filter suppliers based on search and status
  const filteredSuppliers = suppliers.filter(supplier => {
    const matchesSearch = supplier.business_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         supplier.users?.email?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         supplier.users?.first_name?.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesStatus = !statusFilter || supplier.subscription_status === statusFilter;

    return matchesSearch && matchesStatus;
  });

  const pendingCount = suppliers.filter(s => s.subscription_status === 'pending').length;
  const activeCount = suppliers.filter(s => s.subscription_status === 'active').length;
  const rejectedCount = suppliers.filter(s => s.subscription_status === 'rejected').length;

  if (loading) {
    return (
      <div className="p-6">
        <div className="animate-pulse space-y-4">
          <div className="h-8 bg-muted rounded w-1/3"></div>
          <div className="h-32 bg-muted rounded"></div>
          <div className="h-64 bg-muted rounded"></div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">Supplier Management</h1>
          <p className="text-muted-foreground">
            Manage supplier applications and approvals
          </p>
        </div>
        <Button onClick={onAddNew}>
          <Plus className="h-4 w-4 mr-2" />
          Add Supplier
        </Button>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="text-2xl font-bold">{suppliers.length}</div>
            <div className="text-sm text-muted-foreground">Total Suppliers</div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="text-2xl font-bold text-yellow-600">{pendingCount}</div>
            <div className="text-sm text-muted-foreground">Pending Approval</div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="text-2xl font-bold text-green-600">{activeCount}</div>
            <div className="text-sm text-muted-foreground">Active</div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="text-2xl font-bold text-red-600">{rejectedCount}</div>
            <div className="text-sm text-muted-foreground">Rejected</div>
          </CardContent>
        </Card>
      </div>

      {/* Search and Filters */}
      <div className="flex flex-col sm:flex-row gap-4">
        <div className="flex-1 relative">
          <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search suppliers..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-10"
          />
        </div>
        
        <Select value={statusFilter || "all"} onValueChange={(value) => setStatusFilter(value === "all" ? "" : value)}>
          <SelectTrigger className="w-full sm:w-48">
            <SelectValue placeholder="All Statuses" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Statuses</SelectItem>
            <SelectItem value="pending">Pending</SelectItem>
            <SelectItem value="active">Active</SelectItem>
            <SelectItem value="rejected">Rejected</SelectItem>
            <SelectItem value="expired">Expired</SelectItem>
          </SelectContent>
        </Select>

        {selectedSuppliers.length > 0 && (
          <div className="flex gap-2">
            <Button
              onClick={() => handleBulkAction('approve')}
              className="bg-green-600 hover:bg-green-700"
            >
              <Check className="h-4 w-4 mr-2" />
              Approve ({selectedSuppliers.length})
            </Button>
            <Button
              onClick={() => handleBulkAction('reject')}
              variant="destructive"
            >
              <X className="h-4 w-4 mr-2" />
              Reject ({selectedSuppliers.length})
            </Button>
          </div>
        )}
      </div>

      {/* Suppliers Table */}
      <Card>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead className="w-12">
                <input
                  type="checkbox"
                  checked={selectedSuppliers.length === filteredSuppliers.length && filteredSuppliers.length > 0}
                  onChange={(e) => {
                    if (e.target.checked) {
                      setSelectedSuppliers(filteredSuppliers.map(s => s.id));
                    } else {
                      setSelectedSuppliers([]);
                    }
                  }}
                />
              </TableHead>
              <TableHead>Business</TableHead>
              <TableHead>Contact</TableHead>
              <TableHead>Location</TableHead>
              <TableHead>Status</TableHead>
              <TableHead>Created</TableHead>
              <TableHead>Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filteredSuppliers.map((supplier) => (
              <TableRow key={supplier.id}>
                <TableCell>
                  <input
                    type="checkbox"
                    checked={selectedSuppliers.includes(supplier.id)}
                    onChange={(e) => {
                      if (e.target.checked) {
                        setSelectedSuppliers([...selectedSuppliers, supplier.id]);
                      } else {
                        setSelectedSuppliers(selectedSuppliers.filter(id => id !== supplier.id));
                      }
                    }}
                  />
                </TableCell>
                <TableCell>
                  <div className="flex items-center gap-3">
                    {supplier.logo_url ? (
                      <img 
                        src={supplier.logo_url} 
                        alt="Logo" 
                        className="w-10 h-10 rounded-lg object-cover"
                      />
                    ) : (
                      <div className="w-10 h-10 bg-muted rounded-lg flex items-center justify-center">
                        <Building className="h-5 w-5 text-muted-foreground" />
                      </div>
                    )}
                    <div>
                      <div className="font-medium">{supplier.business_name}</div>
                      <div className="text-sm text-muted-foreground">{supplier.business_type}</div>
                    </div>
                  </div>
                </TableCell>
                <TableCell>
                  <div className="space-y-1">
                    <div className="flex items-center gap-2 text-sm">
                      <Mail className="h-3 w-3" />
                      {supplier.users?.email || supplier.email}
                    </div>
                    <div className="flex items-center gap-2 text-sm">
                      <Phone className="h-3 w-3" />
                      {supplier.phone}
                    </div>
                  </div>
                </TableCell>
                <TableCell>
                  <div className="flex items-center gap-2 text-sm">
                    <MapPin className="h-3 w-3" />
                    {supplier.city}
                  </div>
                </TableCell>
                <TableCell>
                  {getStatusBadge(supplier.subscription_status)}
                </TableCell>
                <TableCell>
                  <div className="flex items-center gap-2 text-sm">
                    <Clock className="h-3 w-3" />
                    {new Date(supplier.created_at).toLocaleDateString()}
                  </div>
                </TableCell>
                <TableCell>
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button variant="ghost" size="sm">
                        <MoreHorizontal className="h-4 w-4" />
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                      <DropdownMenuItem onClick={() => onViewDetails(supplier)}>
                        <Eye className="h-4 w-4 mr-2" />
                        View Details
                      </DropdownMenuItem>
                      
                      <DropdownMenuSeparator />
                      
                      {supplier.subscription_status === 'pending' && (
                        <>
                          <DropdownMenuItem 
                            onClick={() => {
                              setTargetSupplier(supplier);
                              setActionType('approve');
                              setActionDialogOpen(true);
                            }}
                            className="text-green-600"
                          >
                            <Check className="h-4 w-4 mr-2" />
                            Approve
                          </DropdownMenuItem>
                          <DropdownMenuItem 
                            onClick={() => {
                              setTargetSupplier(supplier);
                              setActionType('reject');
                              setActionDialogOpen(true);
                            }}
                            className="text-red-600"
                          >
                            <X className="h-4 w-4 mr-2" />
                            Reject
                          </DropdownMenuItem>
                          <DropdownMenuSeparator />
                        </>
                      )}
                      
                      <DropdownMenuItem onClick={() => handleToggleStatus(supplier)}>
                        {supplier.is_active ? (
                          <>
                            <X className="h-4 w-4 mr-2" />
                            Deactivate
                          </>
                        ) : (
                          <>
                            <Check className="h-4 w-4 mr-2" />
                            Activate
                          </>
                        )}
                      </DropdownMenuItem>
                      
                      <DropdownMenuItem 
                        onClick={() => {
                          setTargetSupplier(supplier);
                          setResetPasswordDialogOpen(true);
                        }}
                      >
                        <Key className="h-4 w-4 mr-2" />
                        Reset Password
                      </DropdownMenuItem>
                      
                      <DropdownMenuSeparator />
                      
                      <DropdownMenuItem 
                        onClick={() => {
                          setTargetSupplier(supplier);
                          setDeleteDialogOpen(true);
                        }}
                        className="text-red-600"
                      >
                        <Trash2 className="h-4 w-4 mr-2" />
                        Delete Supplier
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>

        {filteredSuppliers.length === 0 && (
          <div className="text-center py-8">
            <h3 className="text-lg font-semibold mb-2">No Suppliers Found</h3>
            <p className="text-muted-foreground">
              {suppliers.length === 0 
                ? "No suppliers have registered yet" 
                : "Try adjusting your search or filter criteria"
              }
            </p>
          </div>
        )}
      </Card>

      {/* Approval/Rejection Dialog */}
      <AlertDialog open={actionDialogOpen} onOpenChange={setActionDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>
              {actionType === 'approve' ? 'Approve Supplier' : 'Reject Supplier'}
            </AlertDialogTitle>
            <AlertDialogDescription>
              {actionType === 'approve' 
                ? `Are you sure you want to approve "${targetSupplier?.business_name}"? This will activate their account and send a welcome email.`
                : `Are you sure you want to reject "${targetSupplier?.business_name}"? This will prevent them from accessing the platform and send a rejection notification.`
              }
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction 
              onClick={() => {
                if (targetSupplier) {
                  handleApprovalAction(targetSupplier.id, actionType);
                }
                setActionDialogOpen(false);
              }}
              className={actionType === 'approve' ? 'bg-green-600 hover:bg-green-700' : ''}
            >
              Confirm
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* Delete Confirmation Dialog */}
      <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Supplier</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to delete "{targetSupplier?.business_name}"? This action cannot be undone and will permanently delete all associated data including products and orders.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction 
              onClick={handleDeleteSupplier}
              className="bg-red-600 hover:bg-red-700"
            >
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* Reset Password Dialog */}
      <AlertDialog open={resetPasswordDialogOpen} onOpenChange={setResetPasswordDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Reset Password</AlertDialogTitle>
            <AlertDialogDescription>
              Enter a new password for "{targetSupplier?.business_name}". The supplier will be able to log in with this new password.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <div className="py-4">
            <Input
              type="password"
              placeholder="Enter new password (min. 8 characters)"
              value={newPassword}
              onChange={(e) => setNewPassword(e.target.value)}
              minLength={8}
            />
          </div>
          <AlertDialogFooter>
            <AlertDialogCancel onClick={() => {
              setNewPassword('');
              setTargetSupplier(null);
            }}>
              Cancel
            </AlertDialogCancel>
            <AlertDialogAction 
              onClick={handleResetPassword}
              disabled={newPassword.length < 8}
            >
              {actionType === 'approve' ? 'Approve' : 'Reject'}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
};