import React from "react";
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { ErrorBoundary } from "@/components/ui/error-boundary";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";

import { ThemeProvider } from "next-themes";
import { CartProvider } from "@/contexts/CartContext";
import { Heart } from "lucide-react";
import { BottomNavigation } from "@/components/ui/bottom-navigation";

// Pages
import Index from "./pages/Index";
import Auth from "./pages/Auth";
import CustomerRegister from "./pages/CustomerRegister";
import CustomerDashboard from "./pages/CustomerDashboard";
import CustomerSuppliers from "./pages/CustomerSuppliers";
import CustomerSupplierDetail from "./pages/CustomerSupplierDetail";
import CustomerCart from "./pages/CustomerCart";
import CustomerCheckout from "./pages/CustomerCheckout";
import CustomerOrders from "./pages/CustomerOrders";
import RestaurantListings from "./pages/RestaurantListings";
import GroceryListings from "./pages/GroceryListings";
import PartySupplies from "./pages/PartySupplies";
import RestaurantDetail from "./pages/RestaurantDetail";
import Knowledge from "./pages/Knowledge";
import ArticleDetail from "./pages/ArticleDetail";
import Delala from "./pages/Delala";
import DelalaDetail from "./pages/DelalaDetail";
import DelalaPost from "./pages/DelalaPost";
import MyDelalaListings from "./pages/MyDelalaListings";
import SupplierDashboard from "./pages/SupplierDashboard";
import SupplierProfile from "./pages/SupplierProfile";
import SupplierMenuManagement from "./pages/SupplierMenuManagement";
import SupplierOrderManagement from "./pages/SupplierOrderManagement";
import SupplierAnalytics from "./pages/SupplierAnalytics";
import SupplierReports from "./pages/SupplierReports";
import AdminDashboard from "./pages/AdminDashboard";
import AdminSupplierManagement from "./pages/AdminSupplierManagement";
import AdminCategoryManagement from "./pages/AdminCategoryManagement";
import AdminSlideshowManagement from "./pages/AdminSlideshowManagement";
import AdminFeaturedRestaurants from "./pages/AdminFeaturedRestaurants";
import AdminDelalaManagement from "./pages/AdminDelalaManagement";
import PlatformTesting from "./pages/PlatformTesting";
import TestingManagement from "./pages/TestingManagement";
import UnauthorizedAccess from "./pages/UnauthorizedAccess";
import NotFound from "./pages/NotFound";
import About from "./pages/About";
import Contact from "./pages/Contact";
import Pricing from "./pages/Pricing";
import Privacy from "./pages/Privacy";
import Careers from "./pages/Careers";
import SearchResults from "./pages/SearchResults";
import RoleSelection from "./pages/RoleSelection";

// Email and Registration
import { EmailVerificationPage } from "./pages/EmailVerificationPage";
import { RegistrationPendingPage } from "./pages/RegistrationPendingPage";

// Auth Components
import { CustomerRegisterForm } from "./components/auth/CustomerRegisterForm";
import { SupplierRegisterForm } from "./components/auth/SupplierRegisterForm";
import { AdminLogin } from "./components/auth/AdminLogin";
import { AuthCallback } from "./pages/AuthCallback";
import RegistrationDebugger from "./pages/RegistrationDebugger";

// Route Protection
import { ProtectedRoute, AdminRoute, SupplierRoute, CustomerRoute } from "./components/auth/ProtectedRoute";
import { RoleBasedRedirect } from "./components/auth/RoleBasedRedirect";
import { PWAInstallPrompt } from "./components/pwa/PWAInstallPrompt";

// Route Constants
import { ROUTES } from "./lib/routes";

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      retry: 1,
      refetchOnWindowFocus: false,
    },
  },
});

function App() {
  return (
    <ErrorBoundary>
      <QueryClientProvider client={queryClient}>
        <ThemeProvider
          attribute="class"
          defaultTheme="system"
          enableSystem
          disableTransitionOnChange
        >
          <TooltipProvider>
            <CartProvider>
                <BrowserRouter>
                  <Toaster />
                  <Sonner />
                <Routes>
                  {/* Public Routes */}
                  <Route path={ROUTES.HOME} element={<Index />} />
                  <Route path="/role-selection" element={<RoleSelection />} />
                  <Route path={ROUTES.LOGIN} element={<Auth />} />
                  <Route path={ROUTES.REGISTER} element={<CustomerRegister />} />
                  <Route path={ROUTES.CUSTOMER_REGISTER} element={<CustomerRegisterForm />} />
                  <Route path={ROUTES.SUPPLIER_REGISTER} element={<SupplierRegisterForm />} />
                  <Route path={ROUTES.AUTH_CALLBACK} element={<AuthCallback />} />
                  <Route path={ROUTES.ADMIN_LOGIN} element={<AdminLogin />} />
                  <Route path={ROUTES.EMAIL_VERIFICATION} element={<EmailVerificationPage />} />
                  <Route path={ROUTES.REGISTRATION_PENDING} element={<RegistrationPendingPage />} />

                  {/* Public category pages */}
                  <Route path="/restaurants" element={<RestaurantListings />} />
                  <Route path="/grocery" element={<GroceryListings />} />
                  <Route path="/party" element={<PartySupplies />} />
                  <Route path="/restaurant/:id" element={<RestaurantDetail />} />
                  <Route path="/store/:id" element={<RestaurantDetail />} />
                  <Route path="/party/:id" element={<RestaurantDetail />} />
                  <Route path="/search" element={<SearchResults />} />
                  
                  {/* Knowledge Hub */}
                  <Route path="/knowledge" element={<Knowledge />} />
                  <Route path="/knowledge/:id" element={<ArticleDetail />} />
                  
          {/* Delala Marketplace */}
          <Route path="/delala" element={<Delala />} />
          <Route path="/delala/post" element={<DelalaPost />} />
          <Route path="/delala/my-listings" element={<MyDelalaListings />} />
          <Route path="/delala/:id" element={<DelalaDetail />} />
                  
                  {/* Public cart and favorites */}
                  <Route path="/cart" element={<CustomerCart />} />
                  <Route path="/favorites" element={
                    <div className="container mx-auto py-6 space-y-6">
                      <h1 className="text-3xl font-bold text-center">المفضلة</h1>
                      <div className="text-center py-12">
                        <Heart className="h-16 w-16 mx-auto text-muted-foreground mb-4" />
                        <p className="text-lg text-muted-foreground">لا توجد عناصر مفضلة بعد</p>
                        <p className="text-sm text-muted-foreground">ابدأ في إضافة مطاعمك المفضلة هنا</p>
                      </div>
                    </div>
                  } />

                  {/* Dynamic Dashboard Route - Redirects based on role */}
                  <Route 
                    path={ROUTES.DASHBOARD} 
                    element={
                      <ProtectedRoute>
                        <RoleBasedRedirect />
                      </ProtectedRoute>
                    } 
                  />

                  {/* Customer Protected Routes */}
                  <Route 
                    path={ROUTES.CUSTOMER.DASHBOARD} 
                    element={
                      <CustomerRoute>
                        <CustomerDashboard />
                      </CustomerRoute>
                    } 
                  />
                  
                  {/* Customer browsing routes - Public */}
                  <Route path="/customer/suppliers" element={<CustomerSuppliers />} />
                  <Route path="/customer-suppliers" element={<CustomerSuppliers />} />
                  <Route path="/customer/supplier/:id" element={<CustomerSupplierDetail />} />
                  <Route path="/customer-supplier-detail/:id" element={<CustomerSupplierDetail />} />
                  
                  {/* Customer account routes - Protected */}
                  <Route
                    path="/customer/cart" 
                    element={
                      <CustomerRoute>
                        <CustomerCart />
                      </CustomerRoute>
                    } 
                  />
                  
                  <Route 
                    path="/customer/checkout" 
                    element={
                      <CustomerRoute>
                        <CustomerCheckout />
                      </CustomerRoute>
                    } 
                  />
                  
                  <Route 
                    path="/customer/orders" 
                    element={
                      <CustomerRoute>
                        <CustomerOrders />
                      </CustomerRoute>
                    } 
                  />
                  
                  <Route 
                    path="/customer/profile" 
                    element={
                      <CustomerRoute>
                        <div className="p-8 text-center">
                          <h1 className="text-2xl font-bold">Customer Profile</h1>
                          <p className="text-muted-foreground">Coming Soon</p>
                        </div>
                      </CustomerRoute>
                    } 
                  />

                  {/* Supplier Protected Routes */}
                  <Route 
                    path={ROUTES.SUPPLIER.DASHBOARD} 
                    element={
                      <SupplierRoute checkSupplierApproval={false}>
                        <SupplierDashboard />
                      </SupplierRoute>
                    } 
                  />
                  
                  {/* Supplier Profile Management */}
                  <Route 
                    path={ROUTES.SUPPLIER.PROFILE}
                    element={
                      <SupplierRoute checkSupplierApproval={false}>
                        <SupplierProfile />
                      </SupplierRoute>
                    } 
                  />

                  {/* Supplier Menu Management */}
                  <Route 
                    path={ROUTES.SUPPLIER.MENU}
                    element={
                      <SupplierRoute checkSupplierApproval={false}>
                        <SupplierMenuManagement />
                      </SupplierRoute>
                    } 
                  />

                  {/* Supplier Order Management */}
                  <Route 
                    path="/supplier/orders" 
                    element={
                      <SupplierRoute checkSupplierApproval={true}>
                        <SupplierOrderManagement />
                      </SupplierRoute>
                    } 
                  />

                   {/* Future Supplier Routes (require approval) */}
                   <Route 
                     path="/supplier/analytics" 
                     element={
                       <SupplierRoute checkSupplierApproval={false}>
                         <SupplierAnalytics />
                       </SupplierRoute>
                     } 
                   />

                   <Route 
                     path="/supplier/reports" 
                     element={
                       <SupplierRoute checkSupplierApproval={false}>
                         <SupplierReports />
                       </SupplierRoute>
                     } 
                   />

                   {/* Admin Protected Routes */}
                  <Route 
                    path={ROUTES.ADMIN.DASHBOARD} 
                    element={
                      <AdminRoute>
                        <AdminDashboard />
                      </AdminRoute>
                    } 
                  />
                  
                  {/* Admin Supplier Management */}
                  <Route 
                    path={ROUTES.ADMIN.SUPPLIERS} 
                    element={
                      <AdminRoute>
                        <AdminSupplierManagement />
                      </AdminRoute>
                    } 
                  />
                  
                  {/* Admin Category Management */}
                  <Route 
                    path="/admin/categories" 
                    element={
                      <AdminRoute>
                        <AdminCategoryManagement />
                      </AdminRoute>
                    } 
                  />
                  
                  {/* Admin Slideshow Management */}
                  <Route 
                    path="/admin-slideshow-management" 
                    element={
                      <AdminRoute>
                        <AdminSlideshowManagement />
                      </AdminRoute>
                    } 
                  />
                  
                  {/* Admin Featured Restaurants */}
                  <Route 
                    path="/admin-featured-restaurants" 
                    element={
                      <AdminRoute>
                        <AdminFeaturedRestaurants />
                      </AdminRoute>
                    } 
                  />
                  
                  {/* Admin Delala Management */}
                  <Route 
                    path="/admin/delala" 
                    element={
                      <AdminRoute>
                        <AdminDelalaManagement />
                      </AdminRoute>
                    } 
                  />
                  
                  {/* Platform Testing (Admin only) */}
                  <Route 
                    path="/admin/testing" 
                    element={
                      <AdminRoute>
                        <TestingManagement />
                      </AdminRoute>
                    } 
                  />
                  
                  {/* Advanced Testing Tools */}
                  <Route 
                    path="/admin/testing/advanced" 
                    element={
                      <AdminRoute>
                        <PlatformTesting />
                      </AdminRoute>
                    } 
                  />
                  
                  {/* Registration Debugger */}
                  <Route 
                    path="/admin/testing/registration-debug" 
                    element={
                      <AdminRoute>
                        <RegistrationDebugger />
                      </AdminRoute>
                    } 
                  />
                  
                  {/* Public Debug Route (for testing) */}
                  <Route path="/debug/registration" element={<RegistrationDebugger />} />
                  
                  {/* Future Admin Routes (placeholders) */}
                  <Route 
                    path="/admin/users" 
                    element={
                      <AdminRoute>
                        <div className="p-8 text-center">
                          <h1 className="text-2xl font-bold">User Management</h1>
                          <p className="text-muted-foreground">Coming Soon</p>
                        </div>
                      </AdminRoute>
                    } 
                  />

                  {/* Static Pages */}
                  <Route path="/about" element={<About />} />
                  <Route path="/contact" element={<Contact />} />
                  <Route path="/pricing" element={<Pricing />} />
                  <Route path="/privacy" element={<Privacy />} />
                  <Route path="/careers" element={<Careers />} />

                  {/* Error Routes */}
                  <Route path={ROUTES.UNAUTHORIZED} element={<UnauthorizedAccess />} />
                  <Route path={ROUTES.NOT_FOUND} element={<NotFound />} />
                  
                  {/* Catch-all route - must be last */}
                  <Route path="*" element={<NotFound />} />
                </Routes>
                
                {/* Global Bottom Navigation - appears on all pages */}
                <BottomNavigation />
                
                {/* PWA Install Prompt */}
                <PWAInstallPrompt />
            </BrowserRouter>
          </CartProvider>
        </TooltipProvider>
      </ThemeProvider>
    </QueryClientProvider>
    </ErrorBoundary>
  );
}

export default App;