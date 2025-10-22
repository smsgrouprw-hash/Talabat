import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { SupplierDashboardLayout } from '@/components/layouts/SupplierDashboardLayout';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { useAuth } from '@/hooks/useAuth';
import { authHelpers } from '@/lib/auth';
import { LanguageToggle } from '@/components/ui/LanguageToggle';
import { useLanguage, translations } from '@/lib/language';
import { Store, Clock, User, LogOut, Construction, CheckCircle, AlertTriangle, TrendingUp, Package, DollarSign, ShoppingBag } from 'lucide-react';

interface SupplierData {
  is_active: boolean;
  is_verified: boolean;
  business_name: string;
  subscription_status: string;
}

const SupplierDashboard = () => {
  const { user, role } = useAuth();
  const { language } = useLanguage();
  const t = translations[language];
  const isRTL = language === 'ar';
  const [supplierData, setSupplierData] = useState<SupplierData | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchSupplierData();
  }, [user]);

  const fetchSupplierData = async () => {
    if (!user?.id) return;

    try {
      const { data, error } = await supabase
        .from('suppliers')
        .select('is_active, is_verified, business_name, subscription_status')
        .eq('user_id', user.id)
        .maybeSingle();

      if (error) {
        console.error('Error fetching supplier data:', error);
        return;
      }

      setSupplierData(data);
    } catch (error) {
      console.error('Error in fetchSupplierData:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSignOut = async () => {
    await authHelpers.signOut();
  };

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <div className="text-center">
          <div className="h-8 w-8 animate-spin rounded-full border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-muted-foreground">{t.loading}</p>
        </div>
      </div>
    );
  }

  // Check if supplier is approved and verified
  const isApproved = supplierData?.is_active && supplierData?.is_verified;
  
  // If approved, use the full dashboard layout
  if (isApproved) {
    return (
      <SupplierDashboardLayout>
        <div className="p-6 space-y-6">
          {/* Welcome Header */}
          <div className={`flex items-center justify-between ${isRTL ? 'flex-row-reverse' : ''}`}>
            <div className={isRTL ? 'text-right' : ''}>
              <h1 className="text-3xl font-bold font-arabic">{t.welcomeBack}</h1>
              <p className={`text-muted-foreground font-arabic ${isRTL ? 'text-right' : ''}`}>
                {supplierData?.business_name || (isRTL ? 'عملك' : 'Your Business')}
              </p>
            </div>
            <div className={isRTL ? 'text-left' : 'text-right'}>
              <p className={`text-sm text-muted-foreground font-arabic ${isRTL ? 'text-left' : 'text-right'}`}>{t.status}</p>
              <div className={`flex items-center gap-2 ${isRTL ? 'flex-row-reverse justify-start' : 'justify-end'}`}>
                <CheckCircle className="h-4 w-4 text-green-600" />
                <span className="text-green-600 font-medium font-arabic">{t.active}</span>
              </div>
            </div>
          </div>

          {/* Quick Stats */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                {isRTL ? (
                  <>
                    <CardTitle className="text-sm font-medium font-arabic text-right">{t.totalOrders}</CardTitle>
                    <ShoppingBag className="h-4 w-4 text-muted-foreground" />
                  </>
                ) : (
                  <>
                    <CardTitle className="text-sm font-medium font-arabic">{t.totalOrders}</CardTitle>
                    <ShoppingBag className="h-4 w-4 text-muted-foreground" />
                  </>
                )}
              </CardHeader>
              <CardContent className={isRTL ? 'text-left' : ''}>
                <div className={`text-2xl font-bold ${isRTL ? 'text-left' : ''}`}>0</div>
                <p className={`text-xs text-muted-foreground font-arabic ${isRTL ? 'text-left' : ''}`}>{t.thisMonth}</p>
              </CardContent>
            </Card>
            
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                {isRTL ? (
                  <>
                    <CardTitle className="text-sm font-medium font-arabic text-right">{t.revenue}</CardTitle>
                    <DollarSign className="h-4 w-4 text-muted-foreground" />
                  </>
                ) : (
                  <>
                    <CardTitle className="text-sm font-medium font-arabic">{t.revenue}</CardTitle>
                    <DollarSign className="h-4 w-4 text-muted-foreground" />
                  </>
                )}
              </CardHeader>
              <CardContent className={isRTL ? 'text-left' : ''}>
                <div className={`text-2xl font-bold ${isRTL ? 'text-left' : ''}`}>RWF 0</div>
                <p className={`text-xs text-muted-foreground font-arabic ${isRTL ? 'text-left' : ''}`}>{t.thisMonth}</p>
              </CardContent>
            </Card>
            
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                {isRTL ? (
                  <>
                    <CardTitle className="text-sm font-medium font-arabic text-right">{t.menuItems}</CardTitle>
                    <Package className="h-4 w-4 text-muted-foreground" />
                  </>
                ) : (
                  <>
                    <CardTitle className="text-sm font-medium font-arabic">{t.menuItems}</CardTitle>
                    <Package className="h-4 w-4 text-muted-foreground" />
                  </>
                )}
              </CardHeader>
              <CardContent className={isRTL ? 'text-left' : ''}>
                <div className={`text-2xl font-bold ${isRTL ? 'text-left' : ''}`}>0</div>
                <p className={`text-xs text-muted-foreground font-arabic ${isRTL ? 'text-left' : ''}`}>{t.activeProducts}</p>
              </CardContent>
            </Card>
            
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                {isRTL ? (
                  <>
                    <CardTitle className="text-sm font-medium font-arabic text-right">{t.rating}</CardTitle>
                    <TrendingUp className="h-4 w-4 text-muted-foreground" />
                  </>
                ) : (
                  <>
                    <CardTitle className="text-sm font-medium font-arabic">{t.rating}</CardTitle>
                    <TrendingUp className="h-4 w-4 text-muted-foreground" />
                  </>
                )}
              </CardHeader>
              <CardContent className={isRTL ? 'text-left' : ''}>
                <div className={`text-2xl font-bold ${isRTL ? 'text-left' : ''}`}>-</div>
                <p className={`text-xs text-muted-foreground font-arabic ${isRTL ? 'text-left' : ''}`}>{t.averageRating}</p>
              </CardContent>
            </Card>
          </div>

          {/* Quick Actions */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <Card className="text-center">
              <CardHeader>
                <div className="mx-auto mb-2 h-12 w-12 rounded-full bg-blue-100 flex items-center justify-center">
                  <Store className="h-6 w-6 text-blue-600" />
                </div>
                <CardTitle className="text-lg">{t.businessProfile}</CardTitle>
                <CardDescription>
                  {t.manageBusinessInfo}
                </CardDescription>
              </CardHeader>
              <CardContent>
                <Link to="/supplier/profile">
                  <Button className="w-full">{t.manageProfile}</Button>
                </Link>
              </CardContent>
            </Card>

            <Card className="text-center">
              <CardHeader>
                <div className="mx-auto mb-2 h-12 w-12 rounded-full bg-green-100 flex items-center justify-center">
                  <Construction className="h-6 w-6 text-green-600" />
                </div>
                <CardTitle className="text-lg">{t.menuManagement}</CardTitle>
                <CardDescription>
                  {t.addManageFoodItems}
                </CardDescription>
              </CardHeader>
              <CardContent>
                <Link to="/supplier/menu">
                  <Button className="w-full">{t.manageMenu}</Button>
                </Link>
              </CardContent>
            </Card>

            <Card className="text-center">
              <CardHeader>
                <div className="mx-auto mb-2 h-12 w-12 rounded-full bg-purple-100 flex items-center justify-center">
                  <CheckCircle className="h-6 w-6 text-purple-600" />
                </div>
                <CardTitle className="text-lg">{t.orderManagement}</CardTitle>
                <CardDescription>
                  {t.receiveManageOrders}
                </CardDescription>
              </CardHeader>
              <CardContent>
                <Link to="/supplier/orders">
                  <Button className="w-full">{t.viewOrders}</Button>
                </Link>
              </CardContent>
            </Card>
          </div>
        </div>
      </SupplierDashboardLayout>
    );
  }

  // Pending approval screen
  return (
    <div className="min-h-screen bg-background pb-24">
      <header className="border-b border-border bg-card">
        <div className="container mx-auto px-4 py-4 flex items-center justify-between">
          <div className="flex items-center space-x-4">
            <h1 className="text-2xl font-bold text-primary">Talabat Rwanda</h1>
            <span className="text-sm text-muted-foreground">
              {isRTL ? 'لوحة تحكم المورد' : 'Supplier Dashboard'}
            </span>
          </div>
          
          <div className="flex items-center space-x-4">
            <LanguageToggle />
            <div className="flex items-center space-x-2">
              <User className="h-4 w-4" />
              <span className="text-sm">{user?.email}</span>
            </div>
            <Button variant="outline" size="sm" onClick={handleSignOut}>
              <LogOut className="h-4 w-4 mr-2" />
              {t.logout}
            </Button>
          </div>
        </div>
      </header>

      {/* Pending approval content */}
      <main className="container mx-auto px-4 py-8">
        <div className="max-w-4xl mx-auto space-y-6">
          <Card>
            <CardHeader>
              <div className="flex items-center space-x-3">
                <div className="h-12 w-12 rounded-full bg-yellow-100 flex items-center justify-center">
                  <AlertTriangle className="h-6 w-6 text-yellow-600" />
                </div>
                <div>
                  <CardTitle className="text-yellow-600">{t.applicationSubmitted}</CardTitle>
                  <CardDescription>
                    {t.pendingReview}
                  </CardDescription>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                <div className="flex items-center space-x-2">
                  <Clock className="h-4 w-4 text-muted-foreground" />
                  <span className="text-sm">{t.approvalProcess}</span>
                </div>
                <div className="text-sm text-muted-foreground">
                  {t.contactInfo}
                </div>
                <div className="mt-4">
                  <Link to="/supplier/profile">
                    <Button variant="outline" size="sm">
                      {t.manageProfile}
                    </Button>
                  </Link>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </main>
    </div>
  );
};

export default SupplierDashboard;
