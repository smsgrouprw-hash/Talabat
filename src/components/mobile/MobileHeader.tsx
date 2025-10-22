import { Bell } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ThemeToggle } from "@/components/ui/theme-toggle";
import { useLanguage } from "@/lib/language";
import { useState } from "react";

export const MobileHeader = () => {
  const { language } = useLanguage();
  const [notificationCount] = useState(3); // Example notification count

  const handleNotificationClick = () => {
    console.log("Notifications clicked");
    // Navigate to notifications page
  };

  return (
    <div className="fixed top-0 left-0 right-0 z-50 md:hidden" dir={language === 'ar' ? 'rtl' : 'ltr'}>
      <div className="glass-card mx-4 mt-2 rounded-xl shadow-md">
        <div className="flex h-12 items-center justify-between px-3">
          {/* Logo */}
          <div className={`flex items-center gap-2 ${language === 'ar' ? 'flex-row-reverse' : ''}`}>
            <img 
              src="/favicon.png" 
              alt="Talabat Rwanda" 
              className="h-7 w-7"
            />
            <span className="text-base font-bold text-primary font-arabic">
              {language === 'ar' ? 'طلبات' : 'Talabat'}
            </span>
          </div>
          
          {/* Right side - Theme toggle and notifications */}
          <div className={`flex items-center gap-2 ${language === 'ar' ? 'flex-row-reverse' : ''}`}>
            <ThemeToggle />
            
            {/* Notification Bell */}
            <Button
              variant="ghost" 
              size="sm"
              className="relative p-1.5 rounded-lg hover:bg-muted/50"
              onClick={handleNotificationClick}
            >
              <Bell className="h-5 w-5 text-foreground" />
              {notificationCount > 0 && (
                <Badge 
                  className={`absolute -top-0.5 ${language === 'ar' ? '-left-0.5' : '-right-0.5'} bg-red-500 text-white text-[10px] rounded-full h-4 w-4 flex items-center justify-center font-bold animate-pulse`}
                >
                  {notificationCount > 9 ? '9+' : notificationCount}
                </Badge>
              )}
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
};