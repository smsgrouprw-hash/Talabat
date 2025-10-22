import { useState } from 'react';
import { SupplierDashboardLayout } from '@/components/layouts/SupplierDashboardLayout';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useLanguage, translations } from '@/lib/language';
import { 
  FileText,
  Download,
  Calendar,
  TrendingUp,
  DollarSign,
  ShoppingBag,
  Users,
  Star,
  Clock,
  MapPin,
  Filter
} from 'lucide-react';

const SupplierReports = () => {
  const { language } = useLanguage();
  const t = translations[language];
  const [selectedPeriod, setSelectedPeriod] = useState('monthly');
  const [reportType, setReportType] = useState('sales');

  const reportTemplates = [
    {
      id: 'sales-summary',
      title: 'Sales Summary Report',
      description: 'Comprehensive overview of sales performance',
      type: 'sales',
      frequency: 'Daily, Weekly, Monthly',
      icon: DollarSign,
      fields: ['Revenue', 'Orders', 'Average Order Value', 'Top Products']
    },
    {
      id: 'customer-analytics',
      title: 'Customer Analytics Report',
      description: 'Detailed customer behavior and demographics',
      type: 'customers',
      frequency: 'Weekly, Monthly',
      icon: Users,
      fields: ['New Customers', 'Repeat Rate', 'Customer Lifetime Value', 'Geographic Distribution']
    },
    {
      id: 'product-performance',
      title: 'Product Performance Report',
      description: 'Individual product sales and ratings',
      type: 'products',
      frequency: 'Weekly, Monthly',
      icon: ShoppingBag,
      fields: ['Best Sellers', 'Low Performers', 'Ratings', 'Inventory Turnover']
    },
    {
      id: 'operational-efficiency',
      title: 'Operational Efficiency Report',
      description: 'Kitchen and delivery performance metrics',
      type: 'operations',
      frequency: 'Daily, Weekly',
      icon: Clock,
      fields: ['Prep Times', 'Order Accuracy', 'Delivery Performance', 'Staff Productivity']
    },
    {
      id: 'financial-statement',
      title: 'Financial Statement',
      description: 'Detailed financial breakdown and profitability',
      type: 'finance',
      frequency: 'Monthly, Quarterly',
      icon: FileText,
      fields: ['Revenue', 'Costs', 'Profit Margins', 'Tax Information']
    },
    {
      id: 'marketing-performance',
      title: 'Marketing Performance Report',
      description: 'Campaign effectiveness and ROI analysis',
      type: 'marketing',
      frequency: 'Weekly, Monthly',
      icon: TrendingUp,
      fields: ['Campaign ROI', 'Customer Acquisition', 'Promotion Performance', 'Brand Metrics']
    }
  ];

  const recentReports = [
    {
      name: 'Monthly Sales Report - August 2025',
      type: 'Sales',
      generated: '2025-09-01',
      size: '2.4 MB',
      status: 'completed',
      downloadUrl: '#'
    },
    {
      name: 'Weekly Customer Analytics - Week 35',
      type: 'Customer Analytics',
      generated: '2025-08-30',
      size: '1.8 MB',
      status: 'completed',
      downloadUrl: '#'
    },
    {
      name: 'Product Performance - August 2025',
      type: 'Product Performance',
      generated: '2025-09-01',
      size: '3.1 MB',
      status: 'processing',
      downloadUrl: null
    },
    {
      name: 'Daily Operations - August 29, 2025',
      type: 'Operations',
      generated: '2025-08-30',
      size: '892 KB',
      status: 'completed',
      downloadUrl: '#'
    }
  ];

  const quickStats = {
    totalReports: 127,
    thisMonth: 18,
    avgGenerationTime: '2.3 min',
    lastGenerated: '2 hours ago'
  };

  const handleGenerateReport = (templateId: string) => {
    console.log(`Generating report: ${templateId}`);
    // Here you would typically call an API to generate the report
  };

  const handleDownloadReport = (reportId: string) => {
    console.log(`Downloading report: ${reportId}`);
    // Here you would typically trigger a download
  };

  return (
    <SupplierDashboardLayout>
      <div className="p-6 space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold">{t.reportsAnalytics}</h1>
            <p className="text-muted-foreground">{t.reportsDescription}</p>
          </div>
          <div className="flex items-center gap-2">
            <Button variant="outline" size="sm">
              <Filter className="h-4 w-4 mr-2" />
              {t.filter}
            </Button>
            <Button variant="outline" size="sm">
              <Calendar className="h-4 w-4 mr-2" />
              {t.schedule}
            </Button>
          </div>
        </div>

        {/* Quick Stats - Compact 2x2 Grid */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
          <Card>
            <CardContent className="p-3">
              <div className="flex items-center gap-2">
                <FileText className="h-4 w-4 text-muted-foreground flex-shrink-0" />
                <div className="min-w-0">
                  <p className="text-xl font-bold">{quickStats.totalReports}</p>
                  <p className="text-xs text-muted-foreground truncate">{t.totalReports}</p>
                </div>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-3">
              <div className="flex items-center gap-2">
                <Calendar className="h-4 w-4 text-muted-foreground flex-shrink-0" />
                <div className="min-w-0">
                  <p className="text-xl font-bold">{quickStats.thisMonth}</p>
                  <p className="text-xs text-muted-foreground truncate">{t.thisMonth}</p>
                </div>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-3">
              <div className="flex items-center gap-2">
                <Clock className="h-4 w-4 text-muted-foreground flex-shrink-0" />
                <div className="min-w-0">
                  <p className="text-xl font-bold">{quickStats.avgGenerationTime}</p>
                  <p className="text-xs text-muted-foreground truncate">{t.avgGeneration}</p>
                </div>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-3">
              <div className="flex items-center gap-2">
                <Download className="h-4 w-4 text-muted-foreground flex-shrink-0" />
                <div className="min-w-0">
                  <p className="text-xl font-bold">{quickStats.lastGenerated}</p>
                  <p className="text-xs text-muted-foreground truncate">{t.lastGenerated}</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        <Tabs defaultValue="generate" className="space-y-4">
          <TabsList>
            <TabsTrigger value="generate">{t.generateReports}</TabsTrigger>
            <TabsTrigger value="recent">{t.recentReports}</TabsTrigger>
            <TabsTrigger value="scheduled">{t.scheduledReports}</TabsTrigger>
          </TabsList>

          <TabsContent value="generate" className="space-y-4">
            {/* Report Templates */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {reportTemplates.map((template) => (
                <Card key={template.id} className="relative">
                  <CardHeader>
                    <div className="flex items-start justify-between">
                      <div className="flex items-center space-x-3">
                        <div className="h-10 w-10 rounded-lg bg-primary/10 flex items-center justify-center">
                          <template.icon className="h-5 w-5 text-primary" />
                        </div>
                        <div>
                          <CardTitle className="text-lg">{template.title}</CardTitle>
                          <CardDescription>{template.description}</CardDescription>
                        </div>
                      </div>
                      <Badge variant="secondary">{template.type}</Badge>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      <div>
                        <p className="text-sm font-medium mb-2">Available Frequencies:</p>
                        <p className="text-sm text-muted-foreground">{template.frequency}</p>
                      </div>
                      <div>
                        <p className="text-sm font-medium mb-2">Included Metrics:</p>
                        <div className="flex flex-wrap gap-1">
                          {template.fields.map((field) => (
                            <Badge key={field} variant="outline" className="text-xs">
                              {field}
                            </Badge>
                          ))}
                        </div>
                      </div>
                      <div className="flex items-center space-x-2">
                        <select className="flex-1 px-3 py-1 border rounded-md text-sm">
                          <option value="daily">Daily</option>
                          <option value="weekly">Weekly</option>
                          <option value="monthly">Monthly</option>
                          <option value="quarterly">Quarterly</option>
                        </select>
                        <Button 
                          size="sm" 
                          onClick={() => handleGenerateReport(template.id)}
                        >
                          Generate
                        </Button>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </TabsContent>

          <TabsContent value="recent" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>Recent Reports</CardTitle>
                <CardDescription>Your recently generated reports</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {recentReports.map((report, index) => (
                    <div key={index} className="flex items-center justify-between p-4 border rounded-lg">
                      <div className="flex items-center space-x-4">
                        <div className="h-10 w-10 rounded-lg bg-blue-100 flex items-center justify-center">
                          <FileText className="h-5 w-5 text-blue-600" />
                        </div>
                        <div>
                          <h4 className="font-medium">{report.name}</h4>
                          <div className="flex items-center space-x-4 text-sm text-muted-foreground">
                            <span>{report.type}</span>
                            <span>•</span>
                            <span>{report.generated}</span>
                            <span>•</span>
                            <span>{report.size}</span>
                          </div>
                        </div>
                      </div>
                      <div className="flex items-center space-x-2">
                        <Badge 
                          variant={report.status === 'completed' ? 'default' : 'secondary'}
                        >
                          {report.status}
                        </Badge>
                        {report.downloadUrl && (
                          <Button 
                            variant="outline" 
                            size="sm"
                            onClick={() => handleDownloadReport(report.name)}
                          >
                            <Download className="h-4 w-4 mr-2" />
                            Download
                          </Button>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="scheduled" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>Scheduled Reports</CardTitle>
                <CardDescription>Automatically generated reports</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="text-center py-12">
                  <Calendar className="h-16 w-16 mx-auto text-muted-foreground mb-4" />
                  <h3 className="text-lg font-medium mb-2">No Scheduled Reports</h3>
                  <p className="text-muted-foreground mb-4">
                    Set up automatic report generation to receive regular business insights
                  </p>
                  <Button>
                    <Calendar className="h-4 w-4 mr-2" />
                    Schedule Report
                  </Button>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </SupplierDashboardLayout>
  );
};

export default SupplierReports;