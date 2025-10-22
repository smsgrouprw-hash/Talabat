import React from 'react';
import { Link, NavLink, useLocation } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { 
  Users, 
  Store, 
  ShoppingBag, 
  DollarSign, 
  Tags, 
  FileText, 
  Settings,
  Menu,
  LogOut,
  Shield,
  Home,
  Image
} from 'lucide-react';
import { useAuth } from '@/hooks/useAuth';
import { authHelpers } from '@/lib/auth';
import { ROUTES } from '@/lib/routes';
import { useLanguage, translations } from '@/lib/language';

interface AdminDashboardLayoutProps {
  children: React.ReactNode;
}

export const AdminDashboardLayout: React.FC<AdminDashboardLayoutProps> = ({ 
  children 
}) => {
  const { user } = useAuth();
  const location = useLocation();
  const { language } = useLanguage();
  const t = translations[language];
  const [isMobileMenuOpen, setIsMobileMenuOpen] = React.useState(false);
  const isRTL = language === 'ar';

  const handleSignOut = async () => {
    await authHelpers.signOut();
  };

  const navigationItems = [
    {
      label: language === 'ar' ? 'الرئيسية' : 'Home',
      href: ROUTES.HOME,
      icon: Home
    },
    {
      label: t.users,
      href: ROUTES.ADMIN.USERS,
      icon: Users
    },
    {
      label: t.suppliers,
      href: ROUTES.ADMIN.SUPPLIERS,
      icon: Store
    },
    {
      label: t.orders,
      href: ROUTES.ADMIN.ORDERS,
      icon: ShoppingBag
    },
    {
      label: t.revenue,
      href: '/admin/revenue',
      icon: DollarSign
    },
    {
      label: t.categories,
      href: '/admin/categories',
      icon: Tags
    },
    {
      label: t.slideshow,
      href: '/admin-slideshow-management',
      icon: Image
    },
    {
      label: t.featuredRestaurants,
      href: '/admin-featured-restaurants',
      icon: Store
    },
    {
      label: t.reports,
      href: '/admin/reports',
      icon: FileText
    }
  ];

  return (
    <div className="min-h-screen bg-background" dir={isRTL ? 'rtl' : 'ltr'}>
      {/* Top Navigation */}
      <header className="border-b bg-card sticky top-0 z-50">
        <div className="flex h-16 items-center justify-between px-4 lg:px-6">
          {/* Mobile Menu Button & Branding - Swapped for RTL */}
          <div className={`flex items-center gap-3 ${isRTL ? 'flex-row-reverse' : ''}`}>
            {/* Mobile Menu Button - On RIGHT for RTL */}
            <Button
              variant="ghost"
              size="icon"
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
              className="lg:hidden shrink-0"
            >
              <Menu className="h-5 w-5" />
            </Button>
            
            <Link to={ROUTES.HOME} className="flex items-center gap-2">
              <Shield className="h-6 w-6 text-primary shrink-0" />
              <span className="text-xl font-bold text-primary hidden sm:inline">Talabat Rwanda</span>
            </Link>
            <Badge variant="destructive" className="hidden md:inline-flex">
              {t.adminPanel}
            </Badge>
          </div>

          {/* Admin Controls - On LEFT for RTL */}
          <div className={`flex items-center gap-3 ${isRTL ? 'flex-row-reverse' : ''}`}>
            <Button variant="outline" size="sm" className="hidden md:inline-flex">
              <Settings className={`h-4 w-4 ${isRTL ? 'ml-2' : 'mr-2'}`} />
              {t.settings}
            </Button>
            
            {/* User Profile Dropdown */}
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" className="relative h-8 w-8 rounded-full">
                  <Avatar className="h-8 w-8">
                    <AvatarFallback className="bg-destructive text-destructive-foreground">
                      {user?.email?.charAt(0).toUpperCase()}
                    </AvatarFallback>
                  </Avatar>
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent className="w-56 bg-card z-50" align="end" forceMount>
                <div className="flex flex-col space-y-1 p-2">
                  <p className="text-sm font-medium leading-none">{user?.email}</p>
                  <p className="text-xs leading-none text-muted-foreground">
                    {t.systemAdministrator}
                  </p>
                </div>
                <DropdownMenuSeparator />
                <DropdownMenuItem>
                  <Settings className={`h-4 w-4 ${isRTL ? 'ml-2' : 'mr-2'}`} />
                  {t.adminSettings}
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem onClick={handleSignOut}>
                  <LogOut className={`h-4 w-4 ${isRTL ? 'ml-2' : 'mr-2'}`} />
                  {t.logout}
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </div>
      </header>

      <div className="flex">
        {/* Side Navigation - Desktop - On RIGHT for RTL */}
        <aside className={`hidden lg:block w-64 border-r bg-card ${isRTL ? 'order-last border-l border-r-0' : 'order-first'}`}>
          <nav className="p-4 space-y-2">
            {navigationItems.map((item) => (
              <NavLink
                key={item.href}
                to={item.href}
                className={({ isActive }) =>
                  `flex items-center gap-3 px-3 py-2 rounded-md text-sm font-medium transition-colors ${
                    isActive
                      ? 'bg-destructive text-destructive-foreground'
                      : 'text-muted-foreground hover:bg-muted hover:text-foreground'
                  } ${isRTL ? 'flex-row-reverse' : ''}`
                }
                onClick={() => console.log('Navigating to:', item.href, item.label)}
              >
                <item.icon className="h-4 w-4" />
                <span>{item.label}</span>
              </NavLink>
            ))}
            
            <div className="pt-4 mt-4 border-t space-y-2">
              <NavLink
                to={ROUTES.ADMIN.SETTINGS}
                className={({ isActive }) =>
                  `flex items-center gap-3 px-3 py-2 rounded-md text-sm font-medium transition-colors ${
                    isActive
                      ? 'bg-destructive text-destructive-foreground'
                      : 'text-muted-foreground hover:bg-muted hover:text-foreground'
                  }`
                }
              >
                <Settings className="h-4 w-4" />
                {t.systemSettings}
              </NavLink>
              
              <button
                onClick={handleSignOut}
                className="w-full flex items-center gap-3 px-3 py-2 rounded-md text-sm font-medium transition-colors text-muted-foreground hover:bg-destructive/10 hover:text-destructive"
              >
                <LogOut className="h-4 w-4" />
                {t.logout}
              </button>
            </div>
          </nav>
        </aside>

        {/* Main Content */}
        <main className="flex-1 min-h-[calc(100vh-4rem)] bg-muted/30 overflow-y-auto pb-20 md:pb-6 px-4 sm:px-6 lg:px-8">
          <div className="max-w-7xl mx-auto w-full">
            {children}
          </div>
        </main>

        {/* Mobile Navigation Overlay - On RIGHT for RTL */}
        {isMobileMenuOpen && (
          <div className="fixed inset-0 z-50 lg:hidden">
            <div className="fixed inset-0 bg-background/80 backdrop-blur-sm" onClick={() => setIsMobileMenuOpen(false)} />
            <aside className={`fixed ${isRTL ? 'right-0 border-l' : 'left-0 border-r'} top-0 h-full w-64 bg-card p-4 overflow-y-auto`}>
              <nav className="space-y-2 mt-16">
                {navigationItems.map((item) => (
                  <NavLink
                    key={item.href}
                    to={item.href}
                    className={({ isActive }) =>
                      `flex items-center gap-3 px-3 py-2 rounded-md text-sm font-medium transition-colors ${
                        isActive
                          ? 'bg-destructive text-destructive-foreground'
                          : 'text-muted-foreground hover:bg-muted hover:text-foreground'
                      } ${isRTL ? 'flex-row-reverse' : ''}`
                    }
                    onClick={() => {
                      console.log('Mobile nav to:', item.href, item.label);
                      setIsMobileMenuOpen(false);
                    }}
                  >
                    <item.icon className="h-4 w-4" />
                    <span>{item.label}</span>
                  </NavLink>
                ))}
                
                <div className="pt-4 mt-4 border-t space-y-2">
                  <NavLink
                    to={ROUTES.ADMIN.SETTINGS}
                    className={({ isActive }) =>
                      `flex items-center gap-3 px-3 py-2 rounded-md text-sm font-medium transition-colors ${
                        isActive
                          ? 'bg-destructive text-destructive-foreground'
                          : 'text-muted-foreground hover:bg-muted hover:text-foreground'
                      }`
                    }
                    onClick={() => setIsMobileMenuOpen(false)}
                  >
                    <Settings className="h-4 w-4" />
                    {t.systemSettings}
                  </NavLink>
                  
                  <button
                    onClick={() => {
                      setIsMobileMenuOpen(false);
                      handleSignOut();
                    }}
                    className="w-full flex items-center gap-3 px-3 py-2 rounded-md text-sm font-medium transition-colors text-muted-foreground hover:bg-destructive/10 hover:text-destructive"
                  >
                    <LogOut className="h-4 w-4" />
                    {t.logout}
                  </button>
                </div>
              </nav>
            </aside>
          </div>
        )}
      </div>
    </div>
  );
};