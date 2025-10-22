import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { useToast } from '@/hooks/use-toast';
import { useAuth } from '@/hooks/useAuth';
import { useLanguage, translations } from '@/lib/language';
import { AdminDashboardLayout } from '@/components/layouts/AdminDashboardLayout';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { 
  Building, 
  Users, 
  ShoppingBag, 
  DollarSign, 
  CheckCircle, 
  XCircle, 
  Clock, 
  Eye,
  MoreHorizontal,
  TrendingUp,
  AlertTriangle,
  Shield,
  User,
  LogOut
} from 'lucide-react';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';

interface Supplier {
  id: string;
  business_name: string;
  business_type: string;
  email: string;
  phone: string;
  address: string;
  city: string;
  is_active: boolean;
  is_verified: boolean;
  subscription_status: string;
  created_at: string;
  user_id: string;
  first_name: string;
  last_name: string;
}

interface DashboardStats {
  totalSuppliers: number;
  pendingApprovals: number;
  activeSuppliers: number;
  totalRevenue: number;
  totalOrders: number;
  totalCustomers: number;
}

const AdminDashboard = () => {
  const [suppliers, setSuppliers] = useState<Supplier[]>([]);
  const [stats, setStats] = useState<DashboardStats>({
    totalSuppliers: 0,
    pendingApprovals: 0,
    activeSuppliers: 0,
    totalRevenue: 0,
    totalOrders: 0,
    totalCustomers: 0
  });
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState<string | null>(null);
  const { user, role } = useAuth();
  const { toast } = useToast();
  const navigate = useNavigate();
  const { language } = useLanguage();
  const t = translations[language];

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const handleSignOut = async () => {
    await supabase.auth.signOut();
    navigate('/');
  };

  const fetchDashboardData = async () => {
    try {
      await Promise.all([
        fetchSuppliers(),
        fetchStats()
      ]);
    } catch (error) {
      console.error('Error fetching dashboard data:', error);
      toast({
        title: "Error",
        description: "Failed to load dashboard data",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const fetchSuppliers = async () => {
    const { data, error } = await supabase
      .from('suppliers')
      .select(`
        *,
        users!suppliers_user_id_fkey(first_name, last_name, email)
      `)
      .order('created_at', { ascending: false });

    if (error) {
      console.error('Error fetching suppliers:', error);
      return;
    }

    const formattedSuppliers = data.map(supplier => ({
      ...supplier,
      first_name: supplier.users?.first_name || '',
      last_name: supplier.users?.last_name || '',
      email: supplier.users?.email || supplier.email
    }));

    setSuppliers(formattedSuppliers);
  };

  const fetchStats = async () => {
    // Get supplier stats
    const { data: supplierData } = await supabase
      .from('suppliers')
      .select('is_active, is_verified');

    // Get customer count
    const { count: customerCount } = await supabase
      .from('user_roles')
      .select('*', { count: 'exact', head: true })
      .eq('role', 'customer');

    // Get order stats
    const { data: orderData } = await supabase
      .from('orders')
      .select('total_amount');

    const totalSuppliers = supplierData?.length || 0;
    const activeSuppliers = supplierData?.filter(s => s.is_active && s.is_verified).length || 0;
    const pendingApprovals = supplierData?.filter(s => !s.is_active || !s.is_verified).length || 0;
    const totalRevenue = orderData?.reduce((sum, order) => sum + (parseFloat(order.total_amount?.toString() || '0') || 0), 0) || 0;
    const totalOrders = orderData?.length || 0;

    setStats({
      totalSuppliers,
      pendingApprovals,
      activeSuppliers,
      totalRevenue,
      totalOrders,
      totalCustomers: customerCount || 0
    });
  };

  const handleApproveSupplier = async (supplierId: string) => {
    setActionLoading(supplierId);
    try {
      const { error } = await supabase.rpc('approve_supplier', { 
        supplier_id: supplierId 
      });

      if (error) throw error;

      toast({
        title: "Success",
        description: "Supplier approved successfully",
      });

      fetchDashboardData();
    } catch (error: any) {
      console.error('Error approving supplier:', error);
      toast({
        title: "Error",
        description: error.message || "Failed to approve supplier",
        variant: "destructive",
      });
    } finally {
      setActionLoading(null);
    }
  };

  const handleRejectSupplier = async (supplierId: string) => {
    setActionLoading(supplierId);
    try {
      const { error } = await supabase.rpc('reject_supplier', { 
        supplier_id: supplierId,
        reason: 'Application rejected by admin'
      });

      if (error) throw error;

      toast({
        title: "Success",
        description: "Supplier rejected successfully",
      });

      fetchDashboardData();
    } catch (error: any) {
      console.error('Error rejecting supplier:', error);
      toast({
        title: "Error",
        description: error.message || "Failed to reject supplier",
        variant: "destructive",
      });
    } finally {
      setActionLoading(null);
    }
  };

  const getStatusBadge = (supplier: Supplier) => {
    if (supplier.is_active && supplier.is_verified) {
      return <Badge className="bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-100">{t.active}</Badge>;
    } else if (!supplier.is_active && !supplier.is_verified) {
      return <Badge className="bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-100">{t.pendingReviewStatus}</Badge>;
    } else {
      return <Badge className="bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-100">{t.inactive}</Badge>;
    }
  };

  const StatCard = ({ title, value, icon: Icon, change = null, prefix = '', suffix = '' }: { 
    title: string; 
    value: number; 
    icon: any; 
    change?: string | null; 
    prefix?: string; 
    suffix?: string; 
  }) => (
    <Card className="min-w-[240px] sm:min-w-0 flex-shrink-0 snap-start">
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2 p-3 sm:p-4">
        <CardTitle className="text-xs sm:text-sm font-medium truncate pr-2">{title}</CardTitle>
        <Icon className="h-3 w-3 sm:h-4 sm:w-4 text-muted-foreground flex-shrink-0" />
      </CardHeader>
      <CardContent className="p-3 sm:p-4 pt-0">
        <div className="text-lg sm:text-xl md:text-2xl font-bold truncate">{prefix}{value.toLocaleString()}{suffix}</div>
        {change && (
          <p className="text-[10px] sm:text-xs text-muted-foreground mt-1">
            <TrendingUp className="h-2 w-2 sm:h-3 sm:w-3 inline mr-1" />
            {change} {t.fromLastMonth}
          </p>
        )}
      </CardContent>
    </Card>
  );

  if (loading) {
    return (
      <AdminDashboardLayout>
        <div className="p-4 sm:p-6">
          <div className="animate-pulse space-y-6">
            <div className="h-8 bg-muted rounded w-1/3"></div>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
              {[1, 2, 3, 4].map((i) => (
                <div key={i} className="h-24 bg-muted rounded"></div>
              ))}
            </div>
            <div className="h-96 bg-muted rounded"></div>
          </div>
        </div>
      </AdminDashboardLayout>
    );
  }

  return (
    <AdminDashboardLayout>
      <div className="p-3 sm:p-4 md:p-6 pb-24 sm:pb-6">
        <div className="mb-4 sm:mb-6 md:mb-8">
          <h1 className="text-xl sm:text-2xl md:text-3xl font-bold mb-1 sm:mb-2">{t.adminDashboard}</h1>
          <p className="text-xs sm:text-sm md:text-base text-muted-foreground">
            {t.managePerformance}
          </p>
        </div>

        {/* Stats Cards - Horizontally scrollable on mobile */}
        <div className="overflow-x-auto scrollbar-hide scroll-smooth snap-x snap-mandatory pb-2 -mx-3 px-3 sm:-mx-4 sm:px-4 md:mx-0 md:px-0 mb-4 sm:mb-6">
          <div className="flex sm:grid gap-3 sm:gap-4 md:gap-6 sm:grid-cols-2 lg:grid-cols-4 min-w-max sm:min-w-0">
          <StatCard
            title={t.totalSuppliers}
            value={stats.totalSuppliers}
            icon={Building}
            change="+12%"
          />
          <StatCard
            title={t.pendingApprovals}
            value={stats.pendingApprovals}
            icon={Clock}
          />
          <StatCard
            title={t.activeSuppliers}
            value={stats.activeSuppliers}
            icon={CheckCircle}
            change="+8%"
          />
          <StatCard
            title={t.totalCustomers}
            value={stats.totalCustomers}
            icon={Users}
            change="+23%"
          />
          </div>
        </div>

        {/* Additional Stats - Horizontally scrollable on mobile */}
        <div className="overflow-x-auto scrollbar-hide scroll-smooth snap-x snap-mandatory pb-2 -mx-3 px-3 sm:-mx-4 sm:px-4 md:mx-0 md:px-0 mb-4 sm:mb-6">
          <div className="flex sm:grid gap-3 sm:gap-4 md:gap-6 sm:grid-cols-2 min-w-max sm:min-w-0">
          <StatCard
            title={t.totalRevenue}
            value={stats.totalRevenue}
            icon={DollarSign}
            prefix="RWF "
            change="+15%"
          />
          <StatCard
            title={t.totalOrders}
            value={stats.totalOrders}
            icon={ShoppingBag}
            change="+18%"
          />
          </div>
        </div>

        {/* Supplier Management */}
        <Tabs defaultValue="pending" className="space-y-3 sm:space-y-4">
          <TabsList className="grid w-full grid-cols-3 sm:w-auto sm:inline-grid h-auto">
            <TabsTrigger value="pending" className="text-[10px] sm:text-xs md:text-sm py-2 px-2 sm:px-3">
              <span className="hidden sm:inline">{t.pendingApproval}</span>
              <span className="sm:hidden">{t.pending}</span>
              <span className="ml-1">({stats.pendingApprovals})</span>
            </TabsTrigger>
            <TabsTrigger value="active" className="text-[10px] sm:text-xs md:text-sm py-2 px-2 sm:px-3">
              <span className="hidden sm:inline">{t.activeSuppliers}</span>
              <span className="sm:hidden">{t.active}</span>
              <span className="ml-1">({stats.activeSuppliers})</span>
            </TabsTrigger>
            <TabsTrigger value="all" className="text-[10px] sm:text-xs md:text-sm py-2 px-2 sm:px-3">
              <span className="hidden sm:inline">{t.allSuppliers}</span>
              <span className="sm:hidden">{t.all}</span>
              <span className="ml-1">({stats.totalSuppliers})</span>
            </TabsTrigger>
          </TabsList>

          <TabsContent value="pending" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>{t.suppliersAwaitingApproval}</CardTitle>
                <CardDescription>{t.reviewApproveSuppliers}</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {suppliers
                    .filter(supplier => !supplier.is_active || !supplier.is_verified)
                    .map((supplier) => (
                      <div key={supplier.id} className="flex flex-col sm:flex-row sm:items-center justify-between p-3 sm:p-4 border rounded-lg gap-3">
                        <div className="flex-1 min-w-0">
                          <div className="flex items-start sm:items-center space-x-3">
                            <div className="flex-1 min-w-0">
                              <h4 className="font-medium text-sm sm:text-base truncate">{supplier.business_name}</h4>
                              <p className="text-xs sm:text-sm text-muted-foreground truncate">
                                {supplier.first_name} {supplier.last_name} • {supplier.email}
                              </p>
                              <div className="flex flex-wrap items-center gap-1 sm:gap-2 text-xs text-muted-foreground mt-1">
                                <span>{supplier.business_type}</span>
                                <span className="hidden sm:inline">•</span>
                                <span>{supplier.city}</span>
                                <span className="hidden sm:inline">•</span>
                                <span className="text-[10px] sm:text-xs">Applied {new Date(supplier.created_at).toLocaleDateString()}</span>
                              </div>
                            </div>
                          </div>
                        </div>
                        <div className="flex items-center justify-end space-x-2 flex-shrink-0">
                          {getStatusBadge(supplier)}
                          <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                              <Button variant="outline" size="sm">
                                <MoreHorizontal className="h-4 w-4" />
                              </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="end">
                              <DropdownMenuItem 
                                onClick={() => handleApproveSupplier(supplier.id)}
                                disabled={actionLoading === supplier.id}
                              >
                                <CheckCircle className="h-4 w-4 mr-2" />
                                {t.approve}
                              </DropdownMenuItem>
                              <DropdownMenuItem 
                                onClick={() => handleRejectSupplier(supplier.id)}
                                disabled={actionLoading === supplier.id}
                              >
                                <XCircle className="h-4 w-4 mr-2" />
                                {t.reject}
                              </DropdownMenuItem>
                              <DropdownMenuItem onClick={() => navigate(`/admin/suppliers?supplier=${supplier.id}`)}>
                                <Eye className="h-4 w-4 mr-2" />
                                {t.viewDetails}
                              </DropdownMenuItem>
                            </DropdownMenuContent>
                          </DropdownMenu>
                        </div>
                      </div>
                    ))}
                  {suppliers.filter(supplier => !supplier.is_active || !supplier.is_verified).length === 0 && (
                    <div className="text-center py-8">
                      <CheckCircle className="h-12 w-12 mx-auto text-green-600 mb-4" />
                      <h3 className="text-lg font-medium mb-2">{t.allCaughtUp}</h3>
                      <p className="text-muted-foreground">{t.noPendingSuppliers}</p>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="active" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>{t.activeSuppliersList}</CardTitle>
                <CardDescription>{t.currentlyApprovedSuppliers}</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {suppliers
                    .filter(supplier => supplier.is_active && supplier.is_verified)
                    .map((supplier) => (
                      <div key={supplier.id} className="flex items-center justify-between p-4 border rounded-lg">
                        <div className="flex-1">
                          <div className="flex items-center space-x-3">
                            <div>
                              <h4 className="font-medium">{supplier.business_name}</h4>
                              <p className="text-sm text-muted-foreground">
                                {supplier.first_name} {supplier.last_name} • {supplier.email}
                              </p>
                              <div className="flex items-center space-x-4 text-xs text-muted-foreground mt-1">
                                <span>{supplier.business_type}</span>
                                <span>•</span>
                                <span>{supplier.city}</span>
                                <span>•</span>
                                <span>Active since {new Date(supplier.created_at).toLocaleDateString()}</span>
                              </div>
                            </div>
                          </div>
                        </div>
                        <div className="flex items-center space-x-2">
                          {getStatusBadge(supplier)}
                          <Button 
                            variant="outline" 
                            size="sm"
                            onClick={() => navigate(`/admin/suppliers?supplier=${supplier.id}`)}
                          >
                            <Eye className="h-4 w-4 mr-2" />
                            {t.viewDetails}
                          </Button>
                        </div>
                      </div>
                    ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="all" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>{t.allSuppliersList}</CardTitle>
                <CardDescription>{t.completeSupplierList}</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {suppliers.map((supplier) => (
                    <div key={supplier.id} className="flex items-center justify-between p-4 border rounded-lg">
                      <div className="flex-1">
                        <div className="flex items-center space-x-3">
                          <div>
                            <h4 className="font-medium">{supplier.business_name}</h4>
                            <p className="text-sm text-muted-foreground">
                              {supplier.first_name} {supplier.last_name} • {supplier.email}
                            </p>
                            <div className="flex items-center space-x-4 text-xs text-muted-foreground mt-1">
                              <span>{supplier.business_type}</span>
                              <span>•</span>
                              <span>{supplier.city}</span>
                              <span>•</span>
                              <span>{new Date(supplier.created_at).toLocaleDateString()}</span>
                            </div>
                          </div>
                        </div>
                      </div>
                      <div className="flex items-center space-x-2">
                        {getStatusBadge(supplier)}
                        <Button 
                          variant="outline" 
                          size="sm"
                          onClick={() => navigate(`/admin/suppliers?supplier=${supplier.id}`)}
                        >
                          <Eye className="h-4 w-4 mr-2" />
                          {t.manage}
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>

      </div>
    </AdminDashboardLayout>
  );
};

export default AdminDashboard;