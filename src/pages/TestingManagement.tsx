import { AdminDashboardLayout } from "@/components/layouts/AdminDashboardLayout";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Link } from "react-router-dom";
import { 
  Play, 
  Users, 
  Shield, 
  ShoppingCart,
  Database,
  CheckCircle,
  AlertTriangle,
  Settings,
  Bug,
  ExternalLink
} from "lucide-react";

export default function TestingManagement() {
  const testCategories = [
    {
      id: "registration",
      name: "Registration Flows",
      description: "Test user registration and authentication",
      icon: Users,
      color: "bg-blue-100 text-blue-800",
      tests: [
        "Customer Registration → Email Verification → Login",
        "Supplier Registration → Business Setup → Approval Wait",
        "Admin Login → Dashboard Access",
        "Password Reset Flow",
        "Email Verification Resend"
      ]
    },
    {
      id: "security",
      name: "Security & Access Control",
      description: "Test role-based access and data protection",
      icon: Shield,
      color: "bg-red-100 text-red-800",
      tests: [
        "Route Protection (Unauthorized Access Blocked)",
        "RLS Policies (Data Isolation by User)",
        "Cross-Role Access Prevention",
        "Admin-Only Resources Protection",
        "Supplier Approval Status Enforcement"
      ]
    },
    {
      id: "workflows",
      name: "Business Workflows",
      description: "Test core platform functionality",
      icon: ShoppingCart,
      color: "bg-green-100 text-green-800",
      tests: [
        "Supplier Profile Setup → Menu Creation",
        "Customer Order Placement → Cart → Checkout",
        "Supplier Order Management → Status Updates",
        "Admin Supplier Approval Workflow",
        "Real-time Order Notifications"
      ]
    },
    {
      id: "data",
      name: "Data Integrity",
      description: "Test database constraints and calculations",
      icon: Database,
      color: "bg-purple-100 text-purple-800",
      tests: [
        "Order Total Calculations (Items + Delivery + Tax)",
        "Foreign Key Constraints",
        "Circular Reference Prevention (Categories)",
        "Data Validation (Required Fields)",
        "Real-time Data Synchronization"
      ]
    }
  ];

  const manualTestScenarios = [
    {
      title: "Complete Customer Journey",
      steps: [
        "1. Go to /customer/register and create a new customer account",
        "2. Verify email verification process works",
        "3. Login and access customer dashboard",
        "4. Browse suppliers at /customer/suppliers",
        "5. View supplier menu and add items to cart",
        "6. Complete checkout process with delivery address",
        "7. Verify order appears in /customer/orders",
        "8. Test order tracking and status updates"
      ]
    },
    {
      title: "Complete Supplier Journey",
      steps: [
        "1. Go to /supplier/register and create a supplier account",
        "2. Complete business profile setup",
        "3. Wait for admin approval (test pending state)",
        "4. After approval, login and access supplier dashboard",
        "5. Set up business profile at /supplier/profile",
        "6. Add products at /supplier/menu",
        "7. Receive and manage orders at /supplier/orders",
        "8. Test order status workflow (confirm → preparing → ready → delivered)"
      ]
    },
    {
      title: "Admin Management Workflow",
      steps: [
        "1. Login as admin at /admin/login",
        "2. Review pending suppliers at /admin/suppliers",
        "3. Approve or reject supplier applications",
        "4. Manage categories at /admin/categories",
        "5. Test hierarchical category creation",
        "6. Monitor platform activity",
        "7. Verify all admin-only features are protected"
      ]
    }
  ];

  const securityChecklist = [
    {
      category: "Authentication",
      items: [
        "✓ Users cannot access protected routes without login",
        "✓ Email verification required for account activation",
        "✓ Password requirements enforced",
        "✓ Session management working correctly",
        "✓ Logout clears session properly"
      ]
    },
    {
      category: "Authorization",
      items: [
        "✓ Customers cannot access supplier/admin routes",
        "✓ Suppliers cannot access admin routes",
        "✓ Unapproved suppliers have limited access",
        "✓ Users can only see their own data",
        "✓ Role-based permissions enforced"
      ]
    },
    {
      category: "Data Protection",
      items: [
        "✓ RLS policies prevent unauthorized data access",
        "✓ Users cannot modify other users' data",
        "✓ Sensitive fields properly protected",
        "✓ Input validation prevents injection",
        "✓ Error messages don't expose sensitive info"
      ]
    }
  ];

  return (
    <AdminDashboardLayout>
      <div className="container mx-auto py-6 space-y-6">
        <div>
          <h1 className="text-3xl font-bold">Platform Testing Dashboard</h1>
          <p className="text-muted-foreground">
            Comprehensive testing guide for Talabat Rwanda platform
          </p>
        </div>

        {/* Test Categories Overview */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {testCategories.map((category) => {
            const Icon = category.icon;
            return (
              <Card key={category.id}>
                <CardHeader className="pb-3">
                  <div className="flex items-center space-x-2">
                    <Icon className="h-5 w-5" />
                    <CardTitle className="text-sm">{category.name}</CardTitle>
                  </div>
                </CardHeader>
                <CardContent>
                  <p className="text-sm text-muted-foreground mb-3">
                    {category.description}
                  </p>
                  <Badge className={category.color}>
                    {category.tests.length} tests
                  </Badge>
                </CardContent>
              </Card>
            );
          })}
        </div>

        {/* Debug Tools */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <Bug className="h-5 w-5" />
              <span>Debug Tools</span>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <Alert>
                <Bug className="h-4 w-4" />
                <AlertDescription>
                  Use these tools to debug registration and authentication issues
                </AlertDescription>
              </Alert>
              
              <div className="flex flex-wrap gap-3">
                <Button asChild variant="outline">
                  <Link to="/admin/testing/registration-debug">
                    <Bug className="h-4 w-4 mr-2" />
                    Registration Debugger
                    <ExternalLink className="h-3 w-3 ml-1" />
                  </Link>
                </Button>
                
                <Button asChild variant="outline">
                  <Link to="/debug/registration" target="_blank">
                    <Bug className="h-4 w-4 mr-2" />
                    Public Debug Tool
                    <ExternalLink className="h-3 w-3 ml-1" />
                  </Link>
                </Button>
                
                <Button asChild variant="outline">
                  <Link to="/admin/testing/advanced">
                    <Settings className="h-4 w-4 mr-2" />
                    Advanced Testing
                    <ExternalLink className="h-3 w-3 ml-1" />
                  </Link>
                </Button>
              </div>
              
              <div className="bg-muted p-4 rounded-lg text-sm space-y-2">
                <p><strong>Registration Debugger:</strong> Test user creation with detailed logging</p>
                <p><strong>Public Debug Tool:</strong> Same tool accessible without admin login</p>
                <p><strong>Advanced Testing:</strong> Comprehensive security and data testing</p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Manual Testing Scenarios */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <Play className="h-5 w-5" />
              <span>Manual Testing Scenarios</span>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <Tabs defaultValue="customer" className="space-y-4">
              <TabsList className="grid w-full grid-cols-3">
                <TabsTrigger value="customer">Customer Journey</TabsTrigger>
                <TabsTrigger value="supplier">Supplier Journey</TabsTrigger>
                <TabsTrigger value="admin">Admin Workflow</TabsTrigger>
              </TabsList>

              {manualTestScenarios.map((scenario, index) => (
                <TabsContent 
                  key={index}
                  value={["customer", "supplier", "admin"][index]}
                  className="space-y-4"
                >
                  <div>
                    <h3 className="text-lg font-semibold mb-3">{scenario.title}</h3>
                    <div className="space-y-2">
                      {scenario.steps.map((step, stepIndex) => (
                        <div 
                          key={stepIndex}
                          className="flex items-start space-x-3 p-3 bg-muted rounded-lg"
                        >
                          <div className="h-6 w-6 bg-primary rounded-full flex items-center justify-center text-white text-xs font-bold">
                            {stepIndex + 1}
                          </div>
                          <p className="text-sm">{step.substring(2)}</p>
                        </div>
                      ))}
                    </div>
                  </div>
                </TabsContent>
              ))}
            </Tabs>
          </CardContent>
        </Card>

        {/* Security Testing Checklist */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <Shield className="h-5 w-5" />
              <span>Security Testing Checklist</span>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {securityChecklist.map((section, index) => (
                <div key={index} className="space-y-3">
                  <h4 className="font-semibold text-sm">{section.category}</h4>
                  <div className="space-y-2">
                    {section.items.map((item, itemIndex) => (
                      <div key={itemIndex} className="flex items-start space-x-2">
                        <CheckCircle className="h-4 w-4 text-green-500 mt-0.5 flex-shrink-0" />
                        <p className="text-sm text-muted-foreground">{item}</p>
                      </div>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Detailed Test Cases */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <Settings className="h-5 w-5" />
              <span>Detailed Test Cases</span>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-6">
              {testCategories.map((category) => {
                const Icon = category.icon;
                return (
                  <div key={category.id} className="space-y-3">
                    <div className="flex items-center space-x-2">
                      <Icon className="h-5 w-5" />
                      <h4 className="font-semibold">{category.name}</h4>
                      <Badge className={category.color}>
                        {category.tests.length}
                      </Badge>
                    </div>
                    <div className="grid grid-cols-1 gap-2 ml-7">
                      {category.tests.map((test, testIndex) => (
                        <div 
                          key={testIndex}
                          className="flex items-center justify-between p-2 bg-muted rounded text-sm"
                        >
                          <span>{test}</span>
                          <Button size="sm" variant="outline">
                            <Play className="h-3 w-3 mr-1" />
                            Test
                          </Button>
                        </div>
                      ))}
                    </div>
                  </div>
                );
              })}
            </div>
          </CardContent>
        </Card>

        {/* Testing Guidelines */}
        <Card>
          <CardHeader>
            <CardTitle>Testing Guidelines & Bug Reporting</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <Alert>
              <AlertTriangle className="h-4 w-4" />
              <AlertDescription>
                <strong>Important:</strong> Test in incognito/private browsing mode to avoid 
                cached authentication states. Use different browsers for different user roles.
              </AlertDescription>
            </Alert>
            
            <div className="space-y-4">
              <div>
                <h4 className="font-semibold mb-2">Testing Best Practices:</h4>
                <ul className="list-disc list-inside space-y-1 text-sm text-muted-foreground">
                  <li>Create separate test accounts for each user role</li>
                  <li>Test both positive and negative scenarios</li>
                  <li>Verify error messages are user-friendly</li>
                  <li>Check responsive design on different screen sizes</li>
                  <li>Test real-time features in multiple browser tabs</li>
                  <li>Verify email notifications are sent correctly</li>
                </ul>
              </div>
              
              <div>
                <h4 className="font-semibold mb-2">Common Issues to Look For:</h4>
                <ul className="list-disc list-inside space-y-1 text-sm text-muted-foreground">
                  <li>Users can access routes they shouldn't have permission for</li>
                  <li>Data from other users is visible in dashboards</li>
                  <li>Order calculations show incorrect totals</li>
                  <li>Real-time updates don't work across browser sessions</li>
                  <li>Form validation allows invalid data submission</li>
                  <li>Error messages expose sensitive system information</li>
                </ul>
              </div>
              
              <div>
                <h4 className="font-semibold mb-2">Bug Reporting Format:</h4>
                <div className="bg-muted p-4 rounded-lg text-sm">
                  <p><strong>Title:</strong> Brief description of the issue</p>
                  <p><strong>Steps to Reproduce:</strong> Detailed steps to recreate the bug</p>
                  <p><strong>Expected Behavior:</strong> What should happen</p>
                  <p><strong>Actual Behavior:</strong> What actually happens</p>
                  <p><strong>User Role:</strong> Which role was being tested</p>
                  <p><strong>Browser/Device:</strong> Testing environment details</p>
                  <p><strong>Screenshots:</strong> Visual evidence if applicable</p>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </AdminDashboardLayout>
  );
}