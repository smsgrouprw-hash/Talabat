import { useState, useEffect } from 'react';
import { SupplierDashboardLayout } from '@/components/layouts/SupplierDashboardLayout';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';
import { useLanguage, translations } from '@/lib/language';
import { 
  TrendingUp, 
  TrendingDown, 
  DollarSign, 
  ShoppingBag, 
  Star, 
  Users,
  Calendar,
  Clock,
  Target,
  Award
} from 'lucide-react';

const SupplierAnalytics = () => {
  const { language } = useLanguage();
  const t = translations[language];
  const isRTL = language === 'ar';
  const [timeRange, setTimeRange] = useState('7d');

  // Mock analytics data
  const stats = {
    revenue: {
      current: 125000,
      previous: 98000,
      change: 27.5
    },
    orders: {
      current: 156,
      previous: 142,
      change: 9.9
    },
    rating: {
      current: 4.6,
      previous: 4.4,
      change: 4.5
    },
    customers: {
      current: 89,
      previous: 76,
      change: 17.1
    }
  };

  const topProducts = [
    { name: 'Chicken Burger', orders: 45, revenue: 22500, rating: 4.8 },
    { name: 'Margherita Pizza', orders: 38, revenue: 19000, rating: 4.7 },
    { name: 'Caesar Salad', orders: 32, revenue: 12800, rating: 4.5 },
    { name: 'Pasta Carbonara', orders: 28, revenue: 14000, rating: 4.6 },
    { name: 'Fish & Chips', orders: 25, revenue: 15000, rating: 4.4 }
  ];

  const ordersByHour = [
    { hour: '08:00', orders: 12 },
    { hour: '09:00', orders: 18 },
    { hour: '10:00', orders: 8 },
    { hour: '11:00', orders: 15 },
    { hour: '12:00', orders: 35 },
    { hour: '13:00', orders: 42 },
    { hour: '14:00', orders: 28 },
    { hour: '15:00', orders: 16 },
    { hour: '16:00', orders: 12 },
    { hour: '17:00', orders: 18 },
    { hour: '18:00', orders: 38 },
    { hour: '19:00', orders: 45 },
    { hour: '20:00', orders: 52 },
    { hour: '21:00', orders: 38 },
    { hour: '22:00', orders: 22 }
  ];

  const StatCard = ({ title, value, change, icon: Icon, prefix = '', suffix = '' }) => (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        {isRTL ? (
          <>
            <CardTitle className="text-sm font-medium font-arabic text-right">{title}</CardTitle>
            <Icon className="h-4 w-4 text-muted-foreground" />
          </>
        ) : (
          <>
            <CardTitle className="text-sm font-medium font-arabic">{title}</CardTitle>
            <Icon className="h-4 w-4 text-muted-foreground" />
          </>
        )}
      </CardHeader>
      <CardContent className={isRTL ? 'text-left' : ''}>
        <div className={`text-2xl font-bold ${isRTL ? 'text-left' : ''}`}>{prefix}{value.toLocaleString()}{suffix}</div>
        <div className={`flex items-center text-xs text-muted-foreground gap-1 ${isRTL ? 'flex-row-reverse justify-end' : ''}`}>
          {change > 0 ? (
            <TrendingUp className="h-3 w-3 text-green-600" />
          ) : (
            <TrendingDown className="h-3 w-3 text-red-600" />
          )}
          <span className={change > 0 ? 'text-green-600' : 'text-red-600'}>
            {Math.abs(change)}%
          </span>
          <span className="font-arabic">{isRTL ? 'مقارنة بالفترة السابقة' : 'vs last period'}</span>
        </div>
      </CardContent>
    </Card>
  );

  return (
    <SupplierDashboardLayout>
      <div className="p-6 space-y-6">
        {/* Header */}
        <div className={`flex items-center justify-between ${isRTL ? 'flex-row-reverse' : ''}`}>
          <div className={isRTL ? 'text-right' : ''}>
            <h1 className={`text-3xl font-bold font-arabic ${isRTL ? 'text-right' : ''}`}>{isRTL ? 'تحليلات' : 'Analytics'}</h1>
            <p className={`text-muted-foreground font-arabic ${isRTL ? 'text-right' : ''}`}>{isRTL ? 'تتبع أداء عملك' : 'Track your business performance'}</p>
          </div>
          <div className="flex items-center space-x-2">
            <select 
              value={timeRange} 
              onChange={(e) => setTimeRange(e.target.value)}
              className={`px-3 py-1 border border-border rounded-md text-sm bg-background font-arabic ${isRTL ? 'text-right' : ''}`}
              dir={isRTL ? 'rtl' : 'ltr'}
            >
              <option value="7d">{isRTL ? 'آخر 7 أيام' : 'Last 7 days'}</option>
              <option value="30d">{isRTL ? 'آخر 30 يوماً' : 'Last 30 days'}</option>
              <option value="90d">{isRTL ? 'آخر 3 أشهر' : 'Last 3 months'}</option>
              <option value="1y">{isRTL ? 'آخر سنة' : 'Last year'}</option>
            </select>
          </div>
        </div>

        {/* Key Metrics */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <StatCard
            title={isRTL ? 'إجمالي الإيرادات' : 'Total Revenue'}
            value={stats.revenue.current}
            change={stats.revenue.change}
            icon={DollarSign}
            prefix="RWF "
          />
          <StatCard
            title={isRTL ? 'إجمالي الطلبات' : 'Total Orders'}
            value={stats.orders.current}
            change={stats.orders.change}
            icon={ShoppingBag}
          />
          <StatCard
            title={isRTL ? 'متوسط التقييم' : 'Average Rating'}
            value={stats.rating.current}
            change={stats.rating.change}
            icon={Star}
            suffix="/5"
          />
          <StatCard
            title={isRTL ? 'العملاء الفريدون' : 'Unique Customers'}
            value={stats.customers.current}
            change={stats.customers.change}
            icon={Users}
          />
        </div>

        <Tabs defaultValue="overview" className="space-y-4">
          <TabsList>
            <TabsTrigger value="overview">Overview</TabsTrigger>
            <TabsTrigger value="products">Products</TabsTrigger>
            <TabsTrigger value="customers">Customers</TabsTrigger>
            <TabsTrigger value="performance">Performance</TabsTrigger>
          </TabsList>

          <TabsContent value="overview" className="space-y-4">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Orders by Hour */}
              <Card>
                <CardHeader>
                  <CardTitle>Orders by Time</CardTitle>
                  <CardDescription>Peak hours analysis</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    {ordersByHour
                      .sort((a, b) => b.orders - a.orders)
                      .slice(0, 6)
                      .map((item, index) => (
                        <div key={item.hour} className="flex items-center space-x-3">
                          <div className="w-12 text-sm font-medium">{item.hour}</div>
                          <Progress value={(item.orders / 52) * 100} className="flex-1" />
                          <div className="w-8 text-sm text-muted-foreground text-right">
                            {item.orders}
                          </div>
                        </div>
                      ))
                    }
                  </div>
                </CardContent>
              </Card>

              {/* Recent Performance */}
              <Card>
                <CardHeader>
                  <CardTitle>Performance Indicators</CardTitle>
                  <CardDescription>Key business metrics</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="flex items-center justify-between">
                    <span className="text-sm">Order Fulfillment Rate</span>
                    <div className="flex items-center space-x-2">
                      <Progress value={94} className="w-20" />
                      <span className="text-sm font-medium">94%</span>
                    </div>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm">Average Prep Time</span>
                    <Badge variant="secondary">18 min</Badge>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm">Customer Satisfaction</span>
                    <div className="flex items-center space-x-1">
                      <Star className="h-4 w-4 fill-yellow-400 text-yellow-400" />
                      <span className="text-sm font-medium">4.6/5</span>
                    </div>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm">Repeat Customer Rate</span>
                    <span className="text-sm font-medium text-green-600">68%</span>
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          <TabsContent value="products" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>Top Performing Products</CardTitle>
                <CardDescription>Your best-selling items this period</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {topProducts.map((product, index) => (
                    <div key={product.name} className="flex items-center space-x-4 p-3 border rounded-lg">
                      <div className="flex items-center justify-center w-8 h-8 bg-primary text-primary-foreground rounded-full text-sm font-bold">
                        {index + 1}
                      </div>
                      <div className="flex-1">
                        <h4 className="font-medium">{product.name}</h4>
                        <div className="flex items-center space-x-4 text-sm text-muted-foreground">
                          <span>{product.orders} orders</span>
                          <span>RWF {product.revenue.toLocaleString()}</span>
                          <div className="flex items-center space-x-1">
                            <Star className="h-3 w-3 fill-yellow-400 text-yellow-400" />
                            <span>{product.rating}</span>
                          </div>
                        </div>
                      </div>
                      {index === 0 && (
                        <Badge variant="default">
                          <Award className="h-3 w-3 mr-1" />
                          Best Seller
                        </Badge>
                      )}
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="customers" className="space-y-4">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <Card>
                <CardHeader>
                  <CardTitle>Customer Insights</CardTitle>
                  <CardDescription>Understanding your customer base</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="space-y-3">
                    <div className="flex justify-between items-center">
                      <span className="text-sm">New Customers</span>
                      <span className="font-medium">23</span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-sm">Returning Customers</span>
                      <span className="font-medium">66</span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-sm">Average Order Value</span>
                      <span className="font-medium">RWF 15,800</span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-sm">Customer Lifetime Value</span>
                      <span className="font-medium">RWF 47,500</span>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Customer Feedback</CardTitle>
                  <CardDescription>Recent reviews and ratings</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    <div className="border-l-4 border-green-500 pl-3">
                      <div className="flex items-center space-x-2">
                        <Star className="h-4 w-4 fill-yellow-400 text-yellow-400" />
                        <span className="font-medium">5.0</span>
                      </div>
                      <p className="text-sm text-muted-foreground">"Amazing food quality and fast delivery!"</p>
                    </div>
                    <div className="border-l-4 border-green-500 pl-3">
                      <div className="flex items-center space-x-2">
                        <Star className="h-4 w-4 fill-yellow-400 text-yellow-400" />
                        <span className="font-medium">4.8</span>
                      </div>
                      <p className="text-sm text-muted-foreground">"Great service, will order again."</p>
                    </div>
                    <div className="border-l-4 border-yellow-500 pl-3">
                      <div className="flex items-center space-x-2">
                        <Star className="h-4 w-4 fill-yellow-400 text-yellow-400" />
                        <span className="font-medium">4.0</span>
                      </div>
                      <p className="text-sm text-muted-foreground">"Food was good but delivery took a bit long."</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          <TabsContent value="performance" className="space-y-4">
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              <Card>
                <CardHeader>
                  <CardTitle>Goals & Targets</CardTitle>
                  <CardDescription>Track your business objectives</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="space-y-3">
                    <div>
                      <div className="flex justify-between items-center mb-1">
                        <span className="text-sm">Monthly Revenue Goal</span>
                        <span className="text-sm">83%</span>
                      </div>
                      <Progress value={83} />
                    </div>
                    <div>
                      <div className="flex justify-between items-center mb-1">
                        <span className="text-sm">Order Volume Target</span>
                        <span className="text-sm">92%</span>
                      </div>
                      <Progress value={92} />
                    </div>
                    <div>
                      <div className="flex justify-between items-center mb-1">
                        <span className="text-sm">Customer Rating Goal</span>
                        <span className="text-sm">95%</span>
                      </div>
                      <Progress value={95} />
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Operational Metrics</CardTitle>
                  <CardDescription>Restaurant efficiency</CardDescription>
                </CardHeader>
                <CardContent className="space-y-3">
                  <div className="flex justify-between items-center">
                    <span className="text-sm">Average Prep Time</span>
                    <Badge variant="secondary">18 min</Badge>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-sm">Order Accuracy</span>
                    <Badge variant="default">96%</Badge>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-sm">On-Time Delivery</span>
                    <Badge variant="default">89%</Badge>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-sm">Cancelled Orders</span>
                    <Badge variant="destructive">3%</Badge>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Growth Metrics</CardTitle>
                  <CardDescription>Business growth trends</CardDescription>
                </CardHeader>
                <CardContent className="space-y-3">
                  <div className="flex justify-between items-center">
                    <span className="text-sm">Revenue Growth</span>
                    <span className="text-sm font-medium text-green-600">+27.5%</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-sm">Customer Growth</span>
                    <span className="text-sm font-medium text-green-600">+17.1%</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-sm">Order Growth</span>
                    <span className="text-sm font-medium text-green-600">+9.9%</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-sm">Market Share</span>
                    <span className="text-sm font-medium">12.3%</span>
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>
        </Tabs>
      </div>
    </SupplierDashboardLayout>
  );
};

export default SupplierAnalytics;