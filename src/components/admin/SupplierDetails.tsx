import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { toast } from '@/hooks/use-toast';
import { 
  ArrowLeft,
  Check, 
  X, 
  Building,
  Mail,
  Phone,
  MapPin,
  Clock,
  Star,
  Users,
  DollarSign,
  ShoppingBag,
  Globe,
  Calendar,
  Trash2,
  Ban,
  CreditCard
} from 'lucide-react';
import { 
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
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

interface SupplierDetailsProps {
  supplier: any;
  onBack: () => void;
  onUpdate: () => void;
}

export const SupplierDetails: React.FC<SupplierDetailsProps> = ({ 
  supplier, 
  onBack, 
  onUpdate 
}) => {
  const { user } = useAuth();
  const [orderStats, setOrderStats] = useState<any>(null);
  const [subscription, setSubscription] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [actionDialogOpen, setActionDialogOpen] = useState(false);
  const [actionType, setActionType] = useState<'approve' | 'reject' | 'suspend' | 'delete'>('approve');
  const [selectedSubscription, setSelectedSubscription] = useState<string>('basic');

  useEffect(() => {
    fetchSupplierStats();
  }, [supplier.id]);

  const fetchSupplierStats = async () => {
    try {
      // Fetch order statistics
      const { data: orders, error: ordersError } = await supabase
        .from('orders')
        .select('id, total_amount, status, created_at')
        .eq('supplier_id', supplier.id);

      if (ordersError) throw ordersError;

      // Calculate order stats
      const totalOrders = orders?.length || 0;
      const completedOrders = orders?.filter(o => o.status === 'completed').length || 0;
      const totalRevenue = orders?.reduce((sum, order) => sum + Number(order.total_amount), 0) || 0;

      setOrderStats({
        total: totalOrders,
        completed: completedOrders,
        revenue: totalRevenue,
        avgOrderValue: totalOrders > 0 ? totalRevenue / totalOrders : 0
      });

      // Fetch subscription details
      const { data: subData, error: subError } = await supabase
        .from('subscriptions')
        .select('*')
        .eq('supplier_id', supplier.id)
        .maybeSingle();

      if (subError && subError.code !== 'PGRST116') {
        console.error('Error fetching subscription:', subError);
      }

      setSubscription(subData);
    } catch (error) {
      console.error('Error fetching supplier stats:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleApprovalAction = async (action: 'approve' | 'reject' | 'suspend' | 'delete') => {
    try {
      if (action === 'delete') {
        // Delete supplier
        const { error: deleteError } = await supabase
          .from('suppliers')
          .delete()
          .eq('id', supplier.id);

        if (deleteError) throw deleteError;

        toast({
          title: 'Success',
          description: 'Supplier deleted successfully'
        });
        
        onUpdate();
        return;
      }

      // Update supplier status
      let newStatus = 'active';
      if (action === 'reject') newStatus = 'rejected';
      else if (action === 'suspend') newStatus = 'suspended';
      
      const { error: updateError } = await supabase
        .from('suppliers')
        .update({ 
          subscription_status: newStatus,
          is_active: action !== 'suspend',
          updated_at: new Date().toISOString()
        })
        .eq('id', supplier.id);

      if (updateError) throw updateError;

      // Send notification email
      const { error: emailError } = await supabase.functions.invoke('supplier-notification', {
        body: {
          supplierId: supplier.id,
          action: action === 'approve' ? 'approved' : action,
          adminEmail: user?.email
        }
      });

      if (emailError) {
        console.warn('Email notification failed:', emailError);
      }

      toast({
        title: 'Success',
        description: `Supplier ${action}d successfully`
      });

      onUpdate();
    } catch (error: any) {
      console.error('Error updating supplier status:', error);
      toast({
        title: 'Error',
        description: error.message || `Failed to ${action} supplier`,
        variant: 'destructive'
      });
    }
  };

  const handleSubscriptionChange = async () => {
    try {
      const { error } = await supabase
        .from('subscriptions')
        .update({
          plan_type: selectedSubscription,
          updated_at: new Date().toISOString()
        })
        .eq('supplier_id', supplier.id);

      if (error) throw error;

      toast({
        title: 'Success',
        description: 'Subscription plan updated successfully'
      });

      fetchSupplierStats();
    } catch (error: any) {
      console.error('Error updating subscription:', error);
      toast({
        title: 'Error',
        description: error.message || 'Failed to update subscription',
        variant: 'destructive'
      });
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'active':
        return <Badge className="bg-green-100 text-green-800">Active</Badge>;
      case 'pending':
        return <Badge className="bg-yellow-100 text-yellow-800">Pending Approval</Badge>;
      case 'rejected':
        return <Badge className="bg-red-100 text-red-800">Rejected</Badge>;
      case 'expired':
        return <Badge variant="secondary">Expired</Badge>;
      default:
        return <Badge variant="outline">{status}</Badge>;
    }
  };

  const formatBusinessHours = (businessHours: any) => {
    if (!businessHours) return 'Not set';
    
    const days = Object.entries(businessHours);
    const openDays = days.filter(([, hours]: [string, any]) => hours.isOpen);
    
    if (openDays.length === 0) return 'Closed';
    if (openDays.length === 7) return '7 days a week';
    
    return `${openDays.length} days a week`;
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4">
        <Button variant="outline" onClick={onBack} size="sm">
          <ArrowLeft className="h-4 w-4 mr-2" />
          Back to List
        </Button>
        <div className="flex-1">
          <h1 className="text-xl sm:text-2xl font-bold">Supplier Details</h1>
          <p className="text-sm text-muted-foreground">
            Complete information for {supplier.business_name}
          </p>
        </div>
        <div className="flex flex-wrap gap-2 w-full sm:w-auto">
          {supplier.subscription_status === 'pending' && (
            <>
              <Button
                onClick={() => {
                  setActionType('approve');
                  setActionDialogOpen(true);
                }}
                className="bg-green-600 hover:bg-green-700"
                size="sm"
              >
                <Check className="h-4 w-4 mr-2" />
                Approve
              </Button>
              <Button
                onClick={() => {
                  setActionType('reject');
                  setActionDialogOpen(true);
                }}
                variant="destructive"
                size="sm"
              >
                <X className="h-4 w-4 mr-2" />
                Reject
              </Button>
            </>
          )}
          {supplier.subscription_status === 'active' && (
            <Button
              onClick={() => {
                setActionType('suspend');
                setActionDialogOpen(true);
              }}
              variant="outline"
              size="sm"
            >
              <Ban className="h-4 w-4 mr-2" />
              Suspend
            </Button>
          )}
          <Button
            onClick={() => {
              setActionType('delete');
              setActionDialogOpen(true);
            }}
            variant="destructive"
            size="sm"
          >
            <Trash2 className="h-4 w-4 mr-2" />
            Delete
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Business Information */}
        <div className="lg:col-span-2 space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Building className="h-5 w-5" />
                Business Information
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-start gap-4">
                {supplier.logo_url && (
                  <img 
                    src={supplier.logo_url} 
                    alt="Business logo"
                    className="w-20 h-20 object-cover rounded-lg border"
                  />
                )}
                <div className="flex-1">
                  <h3 className="text-xl font-semibold">{supplier.business_name}</h3>
                  <p className="text-muted-foreground">{supplier.business_type}</p>
                  {supplier.cuisine_type && (
                    <p className="text-sm text-muted-foreground">Cuisine: {supplier.cuisine_type}</p>
                  )}
                  <div className="mt-2">{getStatusBadge(supplier.subscription_status)}</div>
                </div>
              </div>

              {supplier.description && (
                <div>
                  <h4 className="font-medium mb-2">Description</h4>
                  <p className="text-muted-foreground">{supplier.description}</p>
                </div>
              )}

              <Separator />

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-3">
                  <div className="flex items-center gap-3">
                    <Mail className="h-4 w-4 text-muted-foreground" />
                    <div>
                      <p className="text-sm font-medium">Email</p>
                      <p className="text-sm text-muted-foreground">
                        {supplier.users?.email || supplier.email}
                      </p>
                    </div>
                  </div>
                  
                  <div className="flex items-center gap-3">
                    <Phone className="h-4 w-4 text-muted-foreground" />
                    <div>
                      <p className="text-sm font-medium">Phone</p>
                      <p className="text-sm text-muted-foreground">{supplier.phone}</p>
                    </div>
                  </div>

                  {supplier.website_url && (
                    <div className="flex items-center gap-3">
                      <Globe className="h-4 w-4 text-muted-foreground" />
                      <div>
                        <p className="text-sm font-medium">Website</p>
                        <a 
                          href={supplier.website_url} 
                          target="_blank" 
                          rel="noopener noreferrer"
                          className="text-sm text-primary hover:underline"
                        >
                          Visit Website
                        </a>
                      </div>
                    </div>
                  )}
                </div>

                <div className="space-y-3">
                  <div className="flex items-start gap-3">
                    <MapPin className="h-4 w-4 text-muted-foreground mt-1" />
                    <div>
                      <p className="text-sm font-medium">Address</p>
                      <p className="text-sm text-muted-foreground">
                        {supplier.address}
                        <br />
                        {supplier.city}
                        {supplier.postal_code && `, ${supplier.postal_code}`}
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center gap-3">
                    <Calendar className="h-4 w-4 text-muted-foreground" />
                    <div>
                      <p className="text-sm font-medium">Member Since</p>
                      <p className="text-sm text-muted-foreground">
                        {new Date(supplier.created_at).toLocaleDateString()}
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Business Operations */}
          <Card>
            <CardHeader>
              <CardTitle>Business Operations</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-4">
                  <div>
                    <h4 className="font-medium mb-2">Delivery Information</h4>
                    <div className="space-y-2 text-sm">
                      <div className="flex justify-between">
                        <span>Delivery Radius:</span>
                        <span>{supplier.delivery_radius_km}km</span>
                      </div>
                      <div className="flex justify-between">
                        <span>Delivery Fee:</span>
                        <span>RWF {supplier.delivery_fee?.toLocaleString()}</span>
                      </div>
                      <div className="flex justify-between">
                        <span>Minimum Order:</span>
                        <span>RWF {supplier.minimum_order?.toLocaleString()}</span>
                      </div>
                      <div className="flex justify-between">
                        <span>Delivery Time:</span>
                        <span>{supplier.delivery_time_min}-{supplier.delivery_time_max} min</span>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="space-y-4">
                  <div>
                    <h4 className="font-medium mb-2">Business Hours</h4>
                    <p className="text-sm text-muted-foreground">
                      {formatBusinessHours(supplier.business_hours)}
                    </p>
                  </div>

                  <div>
                    <h4 className="font-medium mb-2">Rating</h4>
                    <div className="flex items-center gap-2">
                      <Star className="h-4 w-4 fill-yellow-400 text-yellow-400" />
                      <span className="text-sm">
                        {supplier.rating?.toFixed(1) || 'No rating'} 
                        {supplier.total_reviews > 0 && ` (${supplier.total_reviews} reviews)`}
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Stats and Subscription */}
        <div className="space-y-6">
          {/* Order Statistics */}
          <Card>
            <CardHeader>
              <CardTitle>Order Statistics</CardTitle>
            </CardHeader>
            <CardContent>
              {loading ? (
                <div className="space-y-3">
                  <div className="h-4 bg-muted rounded animate-pulse"></div>
                  <div className="h-4 bg-muted rounded animate-pulse"></div>
                  <div className="h-4 bg-muted rounded animate-pulse"></div>
                </div>
              ) : orderStats ? (
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <ShoppingBag className="h-4 w-4" />
                      <span className="text-sm">Total Orders</span>
                    </div>
                    <span className="font-semibold">{orderStats.total}</span>
                  </div>
                  
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <Check className="h-4 w-4" />
                      <span className="text-sm">Completed</span>
                    </div>
                    <span className="font-semibold">{orderStats.completed}</span>
                  </div>
                  
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <DollarSign className="h-4 w-4" />
                      <span className="text-sm">Total Revenue</span>
                    </div>
                    <span className="font-semibold">RWF {orderStats.revenue.toLocaleString()}</span>
                  </div>
                  
                  <div className="flex items-center justify-between">
                    <span className="text-sm">Avg Order Value</span>
                    <span className="font-semibold">RWF {orderStats.avgOrderValue.toLocaleString()}</span>
                  </div>
                </div>
              ) : (
                <p className="text-sm text-muted-foreground">No order data available</p>
              )}
            </CardContent>
          </Card>

          {/* Subscription Details */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <CreditCard className="h-5 w-5" />
                Subscription
              </CardTitle>
            </CardHeader>
            <CardContent>
              {subscription ? (
                <div className="space-y-4">
                  <div className="flex justify-between items-center">
                    <span className="text-sm">Plan:</span>
                    <span className="font-medium capitalize">{subscription.plan_type}</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-sm">Status:</span>
                    <Badge variant={subscription.status === 'active' ? 'default' : 'secondary'}>
                      {subscription.status}
                    </Badge>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-sm">Monthly Fee:</span>
                    <span className="font-medium">RWF {subscription.monthly_fee?.toLocaleString()}</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-sm">Commission:</span>
                    <span className="font-medium">{subscription.commission_rate}%</span>
                  </div>
                  {subscription.next_payment_date && (
                    <div className="flex justify-between items-center">
                      <span className="text-sm">Next Payment:</span>
                      <span className="font-medium text-xs">
                        {new Date(subscription.next_payment_date).toLocaleDateString()}
                      </span>
                    </div>
                  )}
                  
                  <Separator />
                  
                  <div className="space-y-2">
                    <label className="text-sm font-medium">Change Plan</label>
                    <Select
                      value={selectedSubscription}
                      onValueChange={setSelectedSubscription}
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="basic">Basic</SelectItem>
                        <SelectItem value="standard">Standard</SelectItem>
                        <SelectItem value="premium">Premium</SelectItem>
                      </SelectContent>
                    </Select>
                    <Button
                      onClick={handleSubscriptionChange}
                      className="w-full"
                      size="sm"
                      disabled={selectedSubscription === subscription.plan_type}
                    >
                      Update Plan
                    </Button>
                  </div>
                </div>
              ) : (
                <p className="text-sm text-muted-foreground">No subscription data</p>
              )}
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Cover Image */}
      {supplier.cover_image_url && (
        <Card>
          <CardHeader>
            <CardTitle>Business Images</CardTitle>
          </CardHeader>
          <CardContent>
            <img 
              src={supplier.cover_image_url} 
              alt="Business cover"
              className="w-full h-64 object-cover rounded-lg"
            />
          </CardContent>
        </Card>
      )}

      {/* Action Dialog */}
      <AlertDialog open={actionDialogOpen} onOpenChange={setActionDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>
              {actionType === 'approve' && 'Approve Supplier'}
              {actionType === 'reject' && 'Reject Supplier'}
              {actionType === 'suspend' && 'Suspend Supplier'}
              {actionType === 'delete' && 'Delete Supplier'}
            </AlertDialogTitle>
            <AlertDialogDescription>
              {actionType === 'approve' && 
                `Are you sure you want to approve ${supplier.business_name}? They will be able to accept orders and manage their business.`
              }
              {actionType === 'reject' && 
                `Are you sure you want to reject ${supplier.business_name}? They will be notified of this decision.`
              }
              {actionType === 'suspend' && 
                `Are you sure you want to suspend ${supplier.business_name}? They will not be able to accept new orders.`
              }
              {actionType === 'delete' && 
                `Are you sure you want to permanently delete ${supplier.business_name}? This action cannot be undone.`
              }
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={() => {
                handleApprovalAction(actionType);
                setActionDialogOpen(false);
              }}
              className={
                actionType === 'approve' 
                  ? 'bg-green-600 hover:bg-green-700' 
                  : actionType === 'delete'
                  ? 'bg-destructive hover:bg-destructive/90'
                  : ''
              }
            >
              {actionType === 'approve' && 'Approve'}
              {actionType === 'reject' && 'Reject'}
              {actionType === 'suspend' && 'Suspend'}
              {actionType === 'delete' && 'Delete'}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
};