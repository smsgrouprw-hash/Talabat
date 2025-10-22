import React from 'react';
import { Link, NavLink, useLocation } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { useLanguage, translations } from '@/lib/language';
import { Badge } from '@/components/ui/badge';
import { LanguageToggle } from '@/components/ui/LanguageToggle';
import { OrderNotifications } from '@/components/supplier/OrderNotifications';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { 
  BarChart3, 
  ShoppingBag, 
  Menu as MenuIcon, 
  User, 
  LogOut,
  Bell,
  CreditCard,
  Home,
  ChefHat
} from 'lucide-react';
import { useAuth } from '@/hooks/useAuth';
import { authHelpers } from '@/lib/auth';
import { ROUTES } from '@/lib/routes';

interface SupplierDashboardLayoutProps {
  children: React.ReactNode;
}

export const SupplierDashboardLayout: React.FC<SupplierDashboardLayoutProps> = ({ 
  children 
}) => {
  const { user } = useAuth();
  const location = useLocation();
  const { language } = useLanguage();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = React.useState(false);
  const isRTL = language === 'ar';
  const t = translations[language];

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
      label: t.orders,
      href: '/supplier/orders',
      icon: ShoppingBag,
      badge: '3'
    },
    {
      label: t.menu,
      href: ROUTES.SUPPLIER.MENU,
      icon: ChefHat
    },
    {
      label: t.analytics,
      href: ROUTES.SUPPLIER.ANALYTICS,
      icon: BarChart3
    },
    {
      label: t.profile,
      href: ROUTES.SUPPLIER.PROFILE,
      icon: User
    },
    {
      label: t.reports,
      href: '/supplier/reports',
      icon: CreditCard
    }
  ];

  return (
    <div className="min-h-screen bg-background" dir={isRTL ? 'rtl' : 'ltr'}>
      {/* Top Navigation */}
      <header className="border-b bg-card sticky top-0 z-50">
        <div className={`flex h-16 items-center justify-between px-4 lg:px-6 ${isRTL ? 'flex-row-reverse' : ''}`}>
          {/* LEFT SIDE for English / RIGHT SIDE for Arabic: Menu Button */}
          <Button
            variant="ghost"
            size="sm"
            className="lg:hidden"
            onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
          >
            <MenuIcon className="h-5 w-5" />
          </Button>

          {/* Business Info - Center */}
          <div className="flex items-center gap-3">
            <Link to={ROUTES.HOME} className="flex items-center gap-2">
              <span className="text-xl font-bold text-primary">Talabat Rwanda</span>
            </Link>
            <Badge variant="secondary" className="hidden sm:inline-flex">
              {isRTL ? 'بوابة الموردين' : 'Supplier Portal'}
            </Badge>
          </div>

          {/* RIGHT SIDE for English / LEFT SIDE for Arabic: User Actions */}
          <div className={`flex items-center gap-2 ${isRTL ? 'flex-row-reverse' : ''}`}>
            <LanguageToggle />
            <OrderNotifications />
            
            {/* User Menu */}
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" className="relative h-9 w-9 rounded-full">
                  <Avatar className="h-9 w-9">
                    <AvatarFallback>
                      {user?.email?.charAt(0).toUpperCase() || 'U'}
                    </AvatarFallback>
                  </Avatar>
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent className="w-56" align={isRTL ? 'start' : 'end'}>
                <div className="flex items-center justify-start gap-2 p-2">
                  <div className="flex flex-col space-y-1">
                    <p className="text-sm font-medium leading-none">{user?.email}</p>
                  </div>
                </div>
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
        {/* Sidebar */}
        <aside className={`hidden lg:block w-64 border-${isRTL ? 'l' : 'r'} bg-card min-h-[calc(100vh-4rem)] sticky top-16`}>
          <nav className="flex flex-col gap-1 p-4">
            {navigationItems.map((item) => {
              const Icon = item.icon;
              const isActive = location.pathname === item.href;
              return (
                <NavLink
                  key={item.href}
                  to={item.href}
                  className={`flex items-center gap-3 rounded-lg px-3 py-2 text-sm transition-all hover:bg-accent ${
                    isActive ? 'bg-accent text-accent-foreground' : 'text-muted-foreground'
                  } ${isRTL ? 'flex-row-reverse' : ''}`}
                >
                  <Icon className="h-4 w-4" />
                  <span className="flex-1">{item.label}</span>
                  {item.badge && (
                    <Badge variant="secondary" className="ml-auto">
                      {item.badge}
                    </Badge>
                  )}
                </NavLink>
              );
            })}
          </nav>
        </aside>

        {/* Mobile Menu */}
        {isMobileMenuOpen && (
          <div className="fixed inset-0 z-40 lg:hidden">
            <div 
              className="absolute inset-0 bg-background/80 backdrop-blur-sm"
              onClick={() => setIsMobileMenuOpen(false)}
            />
            <aside className={`absolute ${isRTL ? 'right-0' : 'left-0'} top-0 h-full w-64 border-${isRTL ? 'l' : 'r'} bg-card`}>
              <div className="flex h-16 items-center border-b px-4">
                <h2 className="text-lg font-semibold">{t.menu}</h2>
              </div>
              <nav className="flex flex-col gap-1 p-4">
                {navigationItems.map((item) => {
                  const Icon = item.icon;
                  const isActive = location.pathname === item.href;
                  return (
                    <NavLink
                      key={item.href}
                      to={item.href}
                      onClick={() => setIsMobileMenuOpen(false)}
                      className={`flex items-center gap-3 rounded-lg px-3 py-2 text-sm transition-all hover:bg-accent ${
                        isActive ? 'bg-accent text-accent-foreground' : 'text-muted-foreground'
                      } ${isRTL ? 'flex-row-reverse' : ''}`}
                    >
                      <Icon className="h-4 w-4" />
                      <span className="flex-1">{item.label}</span>
                      {item.badge && (
                        <Badge variant="secondary" className="ml-auto">
                          {item.badge}
                        </Badge>
                      )}
                    </NavLink>
                  );
                })}
                <DropdownMenuSeparator />
                <Button
                  variant="ghost"
                  className={`w-full justify-start ${isRTL ? 'flex-row-reverse' : ''}`}
                  onClick={handleSignOut}
                >
                  <LogOut className={`h-4 w-4 ${isRTL ? 'ml-2' : 'mr-2'}`} />
                  {t.logout}
                </Button>
              </nav>
            </aside>
          </div>
        )}

        {/* Main Content */}
        <main className="flex-1 p-6 pb-20 md:pb-6">
          {children}
        </main>
      </div>
    </div>
  );
};
