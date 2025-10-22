import { useState, useEffect } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { Home, Search, User, BookOpen, Store } from "lucide-react";
import { useLanguage } from "@/lib/language";
import { useAuth } from "@/hooks/useAuth";

export const BottomNavigation = () => {
  const { language } = useLanguage();
  const location = useLocation();
  const { isAuthenticated, role, loading } = useAuth();
  
  const [isVisible, setIsVisible] = useState(true);
  const [lastScrollY, setLastScrollY] = useState(0);

  useEffect(() => {
    const handleScroll = () => {
      const currentScrollY = window.scrollY;
      
      if (currentScrollY > lastScrollY && currentScrollY > 100) {
        // Scrolling down - hide nav
        setIsVisible(false);
      } else {
        // Scrolling up - show nav
        setIsVisible(true);
      }
      
      setLastScrollY(currentScrollY);
    };

    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, [lastScrollY]);

  // Dynamic profile route that recalculates on every render
  const profileRoute = !isAuthenticated || !role ? "/auth" : 
    role === 'customer' ? "/customer-dashboard" :
    role === 'supplier' ? "/supplier-dashboard" :
    role === 'admin' ? "/admin-dashboard" :
    "/auth";

  console.log('BottomNavigation render:', { isAuthenticated, role, loading, profileRoute });

  const navItems = [
    {
      icon: Home,
      label: language === 'ar' ? "الرئيسية" : "Home",
      route: "/",
      active: location.pathname === "/"
    },
    {
      icon: BookOpen,
      label: language === 'ar' ? "معرفة" : "Knowledge",
      route: "/knowledge",
      active: location.pathname.includes("/knowledge")
    },
    {
      icon: Store,
      label: language === 'ar' ? "دلالة" : "Delala",
      route: "/delala",
      active: location.pathname.includes("/delala")
    },
    {
      icon: Search,
      label: language === 'ar' ? "البحث" : "Search",
      route: "/restaurants",
      active: location.pathname.includes("/restaurant") || location.pathname.includes("/grocery") || location.pathname.includes("/party") || location.pathname === "/restaurants"
    },
    {
      icon: User,
      label: language === 'ar' ? "الحساب" : "Account",
      route: profileRoute,
      active: location.pathname === "/auth" || location.pathname === "/role-selection" || location.pathname.includes("/profile") || location.pathname.includes("/customer-dashboard") || location.pathname.includes("/supplier-dashboard") || location.pathname.includes("/admin-dashboard")
    }
  ];

  return (
    <nav 
      className={`fixed bottom-0 left-0 right-0 w-full z-50 md:hidden bg-background/95 backdrop-blur-md border-t rounded-t-3xl transition-transform duration-300 ${
        isVisible ? 'translate-y-0' : 'translate-y-full'
      }`} 
      dir={language === 'ar' ? 'rtl' : 'ltr'}
    >
      <div className="grid grid-cols-5 px-6 pt-2 pb-1 safe-bottom">
        {navItems.map((item, index) => {
          const IconComponent = item.icon;
          return (
            <Link
              key={index}
              to={item.route}
              className="flex flex-col items-center justify-center gap-0.5 touch-target cursor-pointer transition-all duration-300 active:scale-95"
            >
              <div className={`relative p-2 rounded-2xl transition-all duration-300 ${
                item.active 
                  ? 'bg-gradient-to-r from-primary to-accent shadow-glow scale-110' 
                  : 'hover:bg-primary/10 hover:scale-105'
              }`}>
                <IconComponent className={`h-5 w-5 transition-colors ${
                  item.active ? 'text-white' : 'text-muted-foreground'
                }`} />
              </div>
              <span className={`text-[10px] font-medium transition-colors font-arabic ${
                item.active ? 'text-primary' : 'text-muted-foreground'
              }`}>
                {item.label}
              </span>
            </Link>
          );
        })}
      </div>
    </nav>
  );
};