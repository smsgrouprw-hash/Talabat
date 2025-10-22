import { Button } from '@/components/ui/button';
import { Badge } from "@/components/ui/badge";
import { Zap, Star, Smartphone, Download, Plus } from "lucide-react";
import { useLanguage } from "@/lib/language";

const triggerPWAInstall = () => {
  const event = new CustomEvent('pwa-install-requested');
  window.dispatchEvent(event);
};

export const MobileDownloadApp = () => {
  const { language } = useLanguage();

  const appFeatures = [
    {
      icon: Zap,
      title: language === 'ar' ? 'طلب أسرع' : 'Faster ordering',
      description: language === 'ar' ? 'اطلب في ثواني مع التطبيق' : 'Order in seconds with the app'
    },
    {
      icon: Star,
      title: language === 'ar' ? 'عروض حصرية' : 'Exclusive deals',
      description: language === 'ar' ? 'خصومات خاصة لمستخدمي التطبيق' : 'Special discounts for app users'
    },
    {
      icon: Smartphone,
      title: language === 'ar' ? 'تتبع مباشر' : 'Live tracking',
      description: language === 'ar' ? 'تتبع طلبك في الوقت الفعلي' : 'Track your order in real-time'
    }
  ];

  return (
    <div className="px-4 py-8 bg-gradient-to-br from-primary/10 via-accent/5 to-secondary/10" dir={language === 'ar' ? 'rtl' : 'ltr'}>
      <div className="bg-gradient-to-r from-primary to-accent rounded-3xl p-6 text-white relative overflow-hidden">
        {/* Background decorative elements */}
        <div className="absolute top-2 right-4 w-16 h-16 bg-white/10 rounded-full blur-2xl"></div>
        <div className="absolute bottom-4 left-2 w-12 h-12 bg-white/10 rounded-full blur-xl"></div>
        
        <div className="relative z-10">
          {/* Header */}
          <div className="text-center mb-6">
            <div className="mx-auto w-16 h-16 bg-white/20 rounded-2xl flex items-center justify-center mb-4">
              <Smartphone className="h-8 w-8 text-white" />
            </div>
            <h2 className="text-2xl font-bold mb-2">
              {language === 'ar' ? 'حمل التطبيق الآن' : 'Download the App Now'}
            </h2>
            <p className="text-white/90 text-sm">
              {language === 'ar' ? 'احصل على أفضل تجربة مع تطبيق طلبات رواندا' : 'Get the best experience with Talabat Rwanda app'}
            </p>
          </div>

          {/* Features */}
          <div className="space-y-4 mb-6">
            {appFeatures.map((feature, index) => (
              <div key={index} className="flex items-center gap-3">
                <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-white/20 backdrop-blur">
                  <feature.icon className="h-4 w-4 text-white" />
                </div>
                <div className="flex-1">
                  <h3 className="text-sm font-semibold text-white">
                    {feature.title}
                  </h3>
                  <p className="text-xs text-white/80">
                    {feature.description}
                  </p>
                </div>
              </div>
            ))}
          </div>

          {/* Rating */}
          <div className="flex items-center justify-center gap-1 mb-4">
            {[...Array(5)].map((_, i) => (
              <Star key={i} className="h-4 w-4 fill-yellow-400 text-yellow-400" />
            ))}
            <span className="ml-2 text-white/90 font-medium text-sm">4.8 (10K+)</span>
          </div>

          {/* Install App Button */}
          <div className="space-y-3">
            <Button 
              size="lg" 
              onClick={triggerPWAInstall}
              className="w-full bg-gradient-to-r from-primary to-accent text-white font-semibold rounded-xl transition-all duration-300 hover:scale-[1.02] hover:opacity-90"
            >
              <Plus className="h-5 w-5 mr-2" />
              {language === 'ar' ? 'تثبيت التطبيق' : 'Install App'}
            </Button>
            <p className="text-center text-white/80 text-xs">
              {language === 'ar' ? 'أضف التطبيق إلى شاشتك الرئيسية' : 'Add app to your home screen'}
            </p>
          </div>

          {/* Free badge - iOS specific for Arabic */}
          <div className="flex justify-center mt-4">
            <Badge className="bg-green-500/20 text-green-300 border-green-400/30 px-3 py-1">
              {language === 'ar' ? 'تحميل لأجهزة ابل' : 'Free Download'}
            </Badge>
          </div>
        </div>
      </div>
    </div>
  );
};