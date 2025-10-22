import { Link, Navigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { useAuth } from '@/hooks/useAuth';
import { authHelpers } from '@/lib/auth';
import { ROUTES } from '@/lib/routes';
import { RoleBasedRedirect } from '@/components/auth/RoleBasedRedirect';

import { useTheme as useNextTheme } from "next-themes";
import { HeroSection } from "@/components/landing/HeroSection";
import { FeaturesSection } from "@/components/landing/FeaturesSection";
import { PricingSection } from "@/components/landing/PricingSection";
import { CategoriesSection } from "@/components/landing/CategoriesSection";
import { RestaurantsSection } from "@/components/landing/RestaurantsSection";
import { DownloadAppSection } from "@/components/landing/DownloadAppSection";
import { ThemeToggle } from "@/components/ui/theme-toggle";
import { LanguageToggle } from "@/components/ui/LanguageToggle";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { User, Briefcase } from "lucide-react";
import { useLanguage, translations } from "@/lib/language";
import { MobileSearchBar } from "@/components/mobile/MobileSearchBar";
import { MobileHeader } from "@/components/mobile/MobileHeader";
import { MobileSlideshow } from "@/components/landing/MobileSlideshow";
import { MobileCategoriesCircular } from "@/components/mobile/MobileCategoriesCircular";
import { MobileHotDeals } from "@/components/mobile/MobileHotDeals";
import { MobileFeaturedRestaurants } from "@/components/mobile/MobileFeaturedRestaurants";
import { MobilePopularNearYou } from "@/components/mobile/MobilePopularNearYou";
import { MobileDownloadApp } from "@/components/mobile/MobileDownloadApp";
import { MobileCategorySuppliers } from "@/components/mobile/MobileCategorySuppliers";
import { PWAInstallPrompt } from "@/components/pwa/PWAInstallPrompt";
import { Footer } from "@/components/ui/footer";

const Index = () => {
  const { isAuthenticated, user, role, loading } = useAuth();
  const { language } = useLanguage();
  const t = translations[language];

  const handleSignOut = async () => {
    await authHelpers.signOut();
  };

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-background">
        <div className="text-center">
          <div className="h-8 w-8 animate-spin rounded-full border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-muted-foreground">Loading...</p>
        </div>
      </div>
    );
  }

  // If authenticated, use RoleBasedRedirect to navigate to correct dashboard
  if (isAuthenticated) {
    return <RoleBasedRedirect />;
  }

  return (
    <div className="h-screen overflow-y-auto overflow-x-hidden bg-background transition-colors duration-300 [-webkit-overflow-scrolling:touch]">
      {/* Modern Navigation - Desktop only */}
      <nav className="fixed top-0 left-0 right-0 z-50 border-b border-border backdrop-blur supports-[backdrop-filter]:bg-background/95 hidden md:block">
        <div className="container flex h-16 items-center justify-between">
          <Link to="/" className="flex items-center space-x-3">
            <img 
              src="/favicon.png" 
              alt="Talabat Rwanda" 
              className="h-8 w-8"
            />
            <span className="text-xl font-bold text-primary">
              Talabat Rwanda
            </span>
          </Link>
          <div className="flex items-center space-x-2 md:space-x-4">
            <LanguageToggle />
            <ThemeToggle />
            {!isAuthenticated && (
              <>
                <TooltipProvider>
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <Link to="/business/login" className="hidden sm:block">
                        <Button variant="ghost" size="sm" className="p-2">
                          <Briefcase className="h-4 w-4" />
                        </Button>
                      </Link>
                    </TooltipTrigger>
                    <TooltipContent>
                      <p>{language === 'ar' ? 'تسجيل دخول الشركات' : 'Business Login'}</p>
                    </TooltipContent>
                  </Tooltip>
                </TooltipProvider>
                
                <TooltipProvider>
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <Link to="/auth">
                        <Button size="sm" className="bg-primary text-primary-foreground hover:bg-primary/90 p-2">
                          <User className="h-4 w-4" />
                        </Button>
                      </Link>
                    </TooltipTrigger>
                    <TooltipContent>
                      <p>{language === 'ar' ? 'تسجيل الدخول' : 'Login'}</p>
                    </TooltipContent>
                  </Tooltip>
                </TooltipProvider>
              </>
            )}
            {isAuthenticated && (
              <div className="flex items-center gap-2">
                <span className="text-sm text-muted-foreground">
                  {user?.email}
                </span>
                <Button onClick={handleSignOut} variant="outline" size="sm">
                  {language === 'ar' ? 'تسجيل الخروج' : 'Sign Out'}
                </Button>
              </div>
            )}
          </div>
        </div>
      </nav>

      {/* Mobile Header - New organized layout */}
      <MobileHeader />

      {/* Mobile-first design */}
      <div className="md:pt-16">
        {/* Mobile-only redesigned layout */}
        <div className="md:hidden pb-[100px]">
          {/* 1. Compact Header - Already handled by MobileHeader */}
          
          {/* 2. Search Bar */}
          <div className="pt-16">
            <MobileSearchBar />
          </div>
          
          {/* 3. Promotional Slideshow */}
          <div className="px-4 py-4">
            <MobileSlideshow />
          </div>
          
          {/* 4. Categories Section - Circular icons */}
          <MobileCategoriesCircular />
          
          {/* 5. Hot Deals */}
          <MobileHotDeals />
          
          {/* 6. Featured Restaurants */}
          <MobileFeaturedRestaurants />
          
          {/* 7. Suppliers by Category - Dynamic */}
          <MobileCategorySuppliers />
          
          {/* 8. Popular Near You */}
          <MobilePopularNearYou />
          
          {/* 9. Download App Section */}
          <MobileDownloadApp />
        </div>

        {/* Desktop Hero - visible on desktop */}
        <div className="hidden md:block">
          <HeroSection />
        </div>

        {/* Shared sections - optimized for mobile */}
        <div className="hidden md:block">
          <FeaturesSection />
          <PricingSection />
        </div>

        {/* Categories Section - responsive */}
        <div className="hidden md:block">
          <CategoriesSection />
        </div>

        {/* Desktop Restaurants Section */}
        <div className="hidden md:block">
          <RestaurantsSection />
        </div>

        {/* Download App Section */}
        <div className="hidden md:block">
          <DownloadAppSection />
        </div>

        {/* Desktop Footer only */}
        <footer className="hidden md:block bg-gray-900 py-12 text-white">
          <div className="container">
            <div className="grid gap-8 md:grid-cols-4">
              <div>
                <div className="mb-4 flex items-center space-x-2">
                  <div 
                    className="h-8 w-8 rounded-lg bg-gradient-to-r from-primary to-accent"
                  />
                  <span className="text-xl font-bold">Talabat Rwanda</span>
                </div>
                <p className="text-gray-400">
                  Your trusted local marketplace connecting you with the best businesses in Rwanda.
                </p>
              </div>
              <div>
                <h3 className="mb-4 font-semibold">For Customers</h3>
                <ul className="space-y-2 text-gray-400">
                  <li><Link to="/restaurants" className="hover:text-white">Browse Restaurants</Link></li>
                  <li><Link to="/grocery" className="hover:text-white">Find Services</Link></li>
                  <li><Link to="/customer/orders" className="hover:text-white">Track Orders</Link></li>
                  <li><Link to="/customer-register" className="hover:text-white">Help Center</Link></li>
                </ul>
              </div>
              <div>
                <h3 className="mb-4 font-semibold">For Businesses</h3>
                <ul className="space-y-2 text-gray-400">
                  <li><Link to="/supplier-register" className="hover:text-white">Join as Partner</Link></li>
                  <li><Link to="/supplier-dashboard" className="hover:text-white">Business Dashboard</Link></li>
                  <li><Link to="/pricing" className="hover:text-white">Pricing</Link></li>
                  <li><Link to="/supplier-register" className="hover:text-white">Support</Link></li>
                </ul>
              </div>
              <div>
                <h3 className="mb-4 font-semibold">Company</h3>
                <ul className="space-y-2 text-gray-400">
                  <li><Link to="/about" className="hover:text-white">About Us</Link></li>
                  <li><Link to="/careers" className="hover:text-white">Careers</Link></li>
                  <li><Link to="/contact" className="hover:text-white">Contact</Link></li>
                  <li><Link to="/privacy" className="hover:text-white">Privacy Policy</Link></li>
                </ul>
              </div>
            </div>
            <div className="mt-8 border-t border-gray-800 pt-8 text-center text-gray-400">
              <p>&copy; 2024 Talabat Rwanda. All rights reserved.</p>
             </div>
           </div>
          </footer>
         </div>
         
         {/* PWA Install Prompt */}
         <PWAInstallPrompt />
         
         {/* Footer Component - Desktop only */}
         <div className="hidden md:block">
           <Footer />
         </div>
      </div>
  );
};

export default Index;