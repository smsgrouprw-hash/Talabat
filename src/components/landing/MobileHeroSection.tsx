import { Search, MapPin, Star, Mic, Bell } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { useLanguage, translations } from "@/lib/language";
import { RwandaFlag } from "@/components/ui/rwanda-flag";
import { MobileSlideshow } from "./MobileSlideshow";

export const MobileHeroSection = () => {
  const { language } = useLanguage();
  const t = translations[language];

  return (
    <div className="relative overflow-hidden bg-background pt-16" dir={language === 'ar' ? 'rtl' : 'ltr'}>
      {/* Clean minimal background */}
      <div className="absolute inset-0 bg-gradient-to-b from-primary/5 to-transparent"></div>

      <div className="relative z-10 px-4 py-8">
        {/* Clean header with location and notifications */}
        <div className="flex items-center justify-between mb-8">
          <div className="flex items-center gap-3">
            <RwandaFlag className="w-8 h-6 rounded-md shadow-soft" />
            <div>
              <p className="text-xs text-muted-foreground font-medium">
                {language === 'ar' ? 'التوصيل إلى' : 'Deliver to'}
              </p>
              <p className="text-lg font-semibold text-foreground">
                KG 348 St, Kigali
              </p>
            </div>
          </div>
          <div className="bg-card rounded-xl p-2 shadow-soft border border-border">
            <Bell className="h-6 w-6 text-primary" />
          </div>
        </div>

        {/* Clean main search section */}
        <div className="mb-8">
          <h1 className="text-4xl font-bold mb-2 text-foreground leading-tight">
            {language === 'ar' ? 'اطلب طعامك المفضل' : 'Order Your Favorite Food'}
          </h1>
          <p className="text-muted-foreground mb-6 text-lg">
            {language === 'ar' ? 'من أفضل المطاعم في كيغالي' : 'From the best restaurants in Kigali'}
          </p>
          
          {/* Clean search bar */}
          <div className="bg-card rounded-2xl p-1 shadow-medium border border-border">
            <div className="flex items-center">
              <div className="relative flex-1">
                <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 text-muted-foreground h-5 w-5 z-10" />
                <Input 
                  placeholder={language === 'ar' ? 'ابحث عن مطعم أو طبق...' : 'Search restaurant or dish...'}
                  className="pl-12 pr-4 h-14 text-base bg-transparent border-0 focus:ring-0 rounded-2xl placeholder:text-muted-foreground/70"
                />
              </div>
              <Button size="lg" className="mr-2 bg-primary hover:bg-primary/90 rounded-xl h-12 px-4">
                <Mic className="h-5 w-5" />
              </Button>
            </div>
          </div>
        </div>

        {/* Promotional slideshow */}
        <MobileSlideshow />


        {/* Clean action hints */}
        <div className="flex justify-center gap-4 mb-8">
          <div className="bg-card px-4 py-2 rounded-full flex items-center gap-2 shadow-soft border border-border">
            <div className="w-2 h-2 bg-primary rounded-full"></div>
            <span className="text-sm font-medium text-muted-foreground">
              {language === 'ar' ? 'مطاعم جديدة' : 'New Restaurants'}
            </span>
          </div>
          <div className="bg-card px-4 py-2 rounded-full flex items-center gap-2 shadow-soft border border-border">
            <div className="w-2 h-2 bg-secondary rounded-full"></div>
            <span className="text-sm font-medium text-muted-foreground">
              {language === 'ar' ? 'عروض حصرية' : 'Special Offers'}
            </span>
          </div>
        </div>
      </div>
    </div>
  );
};