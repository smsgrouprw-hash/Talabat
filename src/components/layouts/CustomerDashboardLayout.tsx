import React from "react";
import { Link, NavLink, useLocation } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { LanguageToggle } from "@/components/ui/LanguageToggle";
import { ShoppingBag, User, LogOut, Menu, Home, Package, ShoppingCart, X } from "lucide-react";
import { useAuth } from "@/hooks/useAuth";
import { authHelpers } from "@/lib/auth";
import { useLanguage } from "@/lib/language";
import { ROUTES } from "@/lib/routes";

interface CustomerDashboardLayoutProps {
  children: React.ReactNode;
}

export const CustomerDashboardLayout: React.FC<CustomerDashboardLayoutProps> = ({ children }) => {
  const { user } = useAuth();
  const { language } = useLanguage();
  const location = useLocation();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = React.useState(false);

  const isArabic = language === "ar";

  const handleSignOut = async () => {
    await authHelpers.signOut();
  };

  const navigationItems = [
    {
      label: isArabic ? "لوحة التحكم" : "Dashboard",
      href: ROUTES.CUSTOMER.DASHBOARD,
      icon: Home,
    },
    {
      label: isArabic ? "الرئيسية" : "Home",
      href: ROUTES.HOME,
      icon: Home,
    },
    {
      label: isArabic ? "تصفح الموردين" : "Browse Suppliers",
      href: "/customer/suppliers",
      icon: ShoppingBag,
    },
    {
      label: isArabic ? "طلباتك" : "Your Orders",
      href: "/customer/orders",
      icon: Package,
    },
    {
      label: isArabic ? "السلة" : "Cart",
      href: "/customer/cart",
      icon: ShoppingCart,
    },
    {
      label: isArabic ? "الملف الشخصي" : "Profile",
      href: "/customer/profile",
      icon: User,
    },
    {
      label: isArabic ? "تسجيل الخروج" : "Sign Out",
      href: "#",
      icon: LogOut,
      onClick: handleSignOut,
    },
  ];

  return (
    <div className="min-h-screen bg-background" dir={isArabic ? "rtl" : "ltr"}>
      {/* Top Navigation */}
      <header className="border-b bg-card sticky top-0 z-50 shadow-sm">
        <div
          className={`flex h-14 sm:h-16 items-center justify-between px-3 sm:px-4 lg:px-6 ${isArabic ? "flex-row-reverse" : ""}`}
        >
          {/* Hamburger Menu Button */}
          <Button
            variant="ghost"
            size="sm"
            className="lg:hidden h-9 w-9 p-0"
            onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
          >
            <Menu className="h-5 w-5" />
          </Button>

          {/* Logo - Center */}
          <Link to={ROUTES.HOME} className="flex items-center">
            <span className="text-base sm:text-xl font-bold text-primary">Talabat Rwanda</span>
          </Link>

          {/* Language Toggle */}
          <LanguageToggle />
        </div>
      </header>

      <div className={`flex ${isArabic ? "flex-row-reverse" : ""}`}>
        {/* Side Navigation - Desktop */}
        <aside className={`hidden lg:block w-56 xl:w-64 bg-card ${isArabic ? "border-l" : "border-r"}`}>
          <nav className="p-3 xl:p-4 space-y-1">
            {/* User Info Section */}
            <div className={`px-3 py-3 mb-3 rounded-lg bg-muted/50 flex items-center gap-3`}>
              <div className="h-8 w-8 rounded-full bg-primary flex items-center justify-center text-primary-foreground text-sm font-semibold flex-shrink-0">
                {user?.email?.charAt(0).toUpperCase()}
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-xs sm:text-sm font-medium truncate">{user?.email}</p>
                <p className="text-xs text-muted-foreground">{isArabic ? "عميل" : "Customer"}</p>
              </div>
            </div>

            {/* Navigation Links */}
            {navigationItems.map((item) =>
              item.onClick ? (
                <button
                  key={item.label}
                  onClick={item.onClick}
                  className="w-full flex items-center gap-3 px-3 py-2.5 rounded-md text-sm font-medium transition-all hover:bg-destructive/10 text-destructive"
                >
                  <item.icon className="h-4 w-4 flex-shrink-0" />
                  <span className="flex-1">{item.label}</span>
                </button>
              ) : (
                <NavLink
                  key={item.href}
                  to={item.href}
                  className={({ isActive }) =>
                    `flex items-center gap-3 px-3 py-2.5 rounded-md text-sm font-medium transition-all ${
                      isActive
                        ? "bg-primary text-primary-foreground shadow-sm"
                        : "text-muted-foreground hover:bg-muted hover:text-foreground"
                    }`
                  }
                >
                  <item.icon className="h-4 w-4 flex-shrink-0" />
                  <span className="flex-1">{item.label}</span>
                </NavLink>
              ),
            )}
          </nav>
        </aside>

        {/* Mobile Navigation Overlay */}
        {isMobileMenuOpen && (
          <div className="fixed inset-0 z-50 lg:hidden">
            <div
              className="fixed inset-0 bg-background/80 backdrop-blur-sm"
              onClick={() => setIsMobileMenuOpen(false)}
            />
            <aside
              className={`fixed top-0 h-full w-72 bg-card shadow-xl ${
                isArabic ? "right-0 border-l" : "left-0 border-r"
              }`}
            >
              {/* Menu Header */}
              <div className={`flex items-center justify-between p-4 border-b ${isArabic ? "flex-row-reverse" : ""}`}>
                <h2 className="text-lg font-semibold">{isArabic ? "القائمة" : "Menu"}</h2>
                <Button variant="ghost" size="sm" className="h-8 w-8 p-0" onClick={() => setIsMobileMenuOpen(false)}>
                  <X className="h-5 w-5" />
                </Button>
              </div>

              <nav className="p-4 space-y-1">
                {/* User Info Section */}
                <div className="px-3 py-3 mb-3 rounded-lg bg-muted/50 flex items-center gap-3">
                  <div className="h-10 w-10 rounded-full bg-primary flex items-center justify-center text-primary-foreground text-base font-semibold flex-shrink-0">
                    {user?.email?.charAt(0).toUpperCase()}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium truncate">{user?.email}</p>
                    <p className="text-xs text-muted-foreground">{isArabic ? "عميل" : "Customer"}</p>
                  </div>
                </div>

                {/* Navigation Links */}
                {navigationItems.map((item) =>
                  item.onClick ? (
                    <button
                      key={item.label}
                      onClick={() => {
                        item.onClick();
                        setIsMobileMenuOpen(false);
                      }}
                      className="w-full flex items-center gap-3 px-3 py-3 rounded-md text-sm font-medium transition-all hover:bg-destructive/10 text-destructive"
                    >
                      <item.icon className="h-5 w-5 flex-shrink-0" />
                      <span className="flex-1">{item.label}</span>
                    </button>
                  ) : (
                    <NavLink
                      key={item.href}
                      to={item.href}
                      className={({ isActive }) =>
                        `flex items-center gap-3 px-3 py-3 rounded-md text-sm font-medium transition-all ${
                          isActive
                            ? "bg-primary text-primary-foreground shadow-sm"
                            : "text-muted-foreground hover:bg-muted hover:text-foreground"
                        }`
                      }
                      onClick={() => setIsMobileMenuOpen(false)}
                    >
                      <item.icon className="h-5 w-5 flex-shrink-0" />
                      <span className="flex-1">{item.label}</span>
                    </NavLink>
                  ),
                )}
              </nav>
            </aside>
          </div>
        )}

        {/* Main Content */}
        <main className="flex-1 min-h-[calc(100vh-3.5rem)] sm:min-h-[calc(100vh-4rem)] pb-20 sm:pb-24">{children}</main>
      </div>
    </div>
  );
};
