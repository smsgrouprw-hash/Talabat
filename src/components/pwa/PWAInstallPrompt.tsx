import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Download, X, Smartphone, Share, Plus } from 'lucide-react';
import { useLanguage } from '@/lib/language';

interface BeforeInstallPromptEvent extends Event {
  readonly platforms: string[];
  readonly userChoice: Promise<{
    outcome: 'accepted' | 'dismissed';
    platform: string;
  }>;
  prompt(): Promise<void>;
}

const isIOS = () => {
  const userAgent = window.navigator.userAgent.toLowerCase();
  return /iphone|ipad|ipod/.test(userAgent) || 
         (navigator.platform === 'MacIntel' && navigator.maxTouchPoints > 1);
};

const isIOSSafari = () => {
  const ua = window.navigator.userAgent;
  const iOS = /iPad|iPhone|iPod/.test(ua);
  const webkit = /WebKit/.test(ua);
  const iOSSafari = iOS && webkit && !/CriOS|FxiOS|OPiOS|mercury/.test(ua);
  return iOSSafari;
};

const isStandalone = () => {
  return (window.navigator as any).standalone || window.matchMedia('(display-mode: standalone)').matches;
};

export const PWAInstallPrompt = () => {
  const { language } = useLanguage();
  const [deferredPrompt, setDeferredPrompt] = useState<BeforeInstallPromptEvent | null>(null);
  const [showInstallPrompt, setShowInstallPrompt] = useState(false);
  const [showIOSInstructions, setShowIOSInstructions] = useState(false);
  const [isInstalled, setIsInstalled] = useState(false);

  useEffect(() => {
    // Register service worker
    if ('serviceWorker' in navigator) {
      navigator.serviceWorker.register('/sw.js')
        .then(registration => {
          console.log('Service Worker registered:', registration);
        })
        .catch(error => {
          console.log('Service Worker registration failed:', error);
        });
    }

    // Check if app is already installed
    if (isStandalone()) {
      setIsInstalled(true);
      return;
    }

    // For iOS Safari, don't auto-show, only show when triggered
    // Instructions will be shown when user clicks install button

    // Listen for beforeinstallprompt event (Android)
    const handleBeforeInstallPrompt = (e: Event) => {
      console.log('PWA: beforeinstallprompt event fired');
      e.preventDefault();
      setDeferredPrompt(e as BeforeInstallPromptEvent);
      
      // Show install prompt after a delay if not dismissed
      setTimeout(() => {
        if (!isInstalled && !localStorage.getItem('pwa-install-dismissed')) {
          setShowInstallPrompt(true);
        }
      }, 10000);
    };

    // Listen for appinstalled event
    const handleAppInstalled = () => {
      console.log('PWA: App was installed');
      setIsInstalled(true);
      setShowInstallPrompt(false);
      setShowIOSInstructions(false);
      setDeferredPrompt(null);
    };

    // Listen for custom event from download buttons
    const handleInstallRequest = () => {
      console.log('PWA: Install request event received');
      if (isIOSSafari()) {
        setShowIOSInstructions(true);
      } else if (deferredPrompt) {
        handleInstallClick();
      } else {
        setShowInstallPrompt(true);
      }
    };

    window.addEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
    window.addEventListener('appinstalled', handleAppInstalled);
    window.addEventListener('pwa-install-requested', handleInstallRequest);

    return () => {
      window.removeEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
      window.removeEventListener('appinstalled', handleAppInstalled);
      window.removeEventListener('pwa-install-requested', handleInstallRequest);
    };
  }, [isInstalled, deferredPrompt]);

  const handleInstallClick = async () => {
    if (!deferredPrompt) return;

    try {
      await deferredPrompt.prompt();
      const { outcome } = await deferredPrompt.userChoice;
      
      if (outcome === 'accepted') {
        console.log('PWA: User accepted the install prompt');
      } else {
        console.log('PWA: User dismissed the install prompt');
      }
      
      setDeferredPrompt(null);
      setShowInstallPrompt(false);
    } catch (error) {
      console.error('PWA: Error during installation:', error);
    }
  };

  const handleDismiss = () => {
    setShowInstallPrompt(false);
    setShowIOSInstructions(false);
    localStorage.setItem('pwa-install-dismissed', 'true');
  };

  // Don't show if already installed
  if (isInstalled) {
    return null;
  }

  // iOS Manual Instructions Modal
  if (showIOSInstructions && isIOS()) {
    return (
      <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
        <div className="bg-gradient-to-br from-primary via-accent to-secondary rounded-3xl p-6 text-white shadow-2xl max-w-md w-full animate-slide-up">
          <div className="flex items-start justify-between mb-4">
            <div className="flex items-center gap-3">
              <div className="bg-white/20 rounded-2xl p-3">
                <Smartphone className="h-8 w-8" />
              </div>
              <div>
                <h3 className="font-bold text-lg">
                  {language === 'ar' ? 'تثبيت التطبيق' : 'Install App'}
                </h3>
                <p className="text-sm text-white/90">
                  {language === 'ar' ? 'لأجهزة آبل' : 'For Apple Devices'}
                </p>
              </div>
            </div>
            <Button
              variant="ghost"
              size="sm"
              onClick={handleDismiss}
              className="text-white hover:bg-white/20 p-2 h-auto rounded-full"
            >
              <X className="h-5 w-5" />
            </Button>
          </div>
          
          <div className="space-y-4 mb-6">
            <p className="text-white/95 text-base">
              {language === 'ar' 
                ? 'لتثبيت التطبيق على جهاز آبل الخاص بك، اتبع الخطوات التالية:' 
                : 'To install the app on your Apple device, follow these steps:'}
            </p>
            
            <div className="space-y-4">
              <div className="flex items-start gap-3 bg-white/10 rounded-xl p-3">
                <div className="bg-white/20 rounded-lg p-2 mt-0.5">
                  <Share className="h-5 w-5" />
                </div>
                <div className="flex-1">
                  <p className="font-semibold text-base mb-1">
                    {language === 'ar' ? '١. اضغط على زر المشاركة' : '1. Tap the Share button'}
                  </p>
                  <p className="text-sm text-white/80">
                    {language === 'ar' 
                      ? 'في شريط الأدوات السفلي لمتصفح Safari' 
                      : 'In the bottom toolbar of Safari'}
                  </p>
                </div>
              </div>
              
              <div className="flex items-start gap-3 bg-white/10 rounded-xl p-3">
                <div className="bg-white/20 rounded-lg p-2 mt-0.5">
                  <Plus className="h-5 w-5" />
                </div>
                <div className="flex-1">
                  <p className="font-semibold text-base mb-1">
                    {language === 'ar' ? '٢. اختر "إضافة إلى الشاشة الرئيسية"' : '2. Select "Add to Home Screen"'}
                  </p>
                  <p className="text-sm text-white/80">
                    {language === 'ar' 
                      ? 'من قائمة الخيارات' 
                      : 'From the options menu'}
                  </p>
                </div>
              </div>
              
              <div className="flex items-start gap-3 bg-white/10 rounded-xl p-3">
                <div className="bg-white/20 rounded-lg p-2 mt-0.5">
                  <Download className="h-5 w-5" />
                </div>
                <div className="flex-1">
                  <p className="font-semibold text-base mb-1">
                    {language === 'ar' ? '٣. اضغط "إضافة"' : '3. Tap "Add"'}
                  </p>
                  <p className="text-sm text-white/80">
                    {language === 'ar' 
                      ? 'في الزاوية العلوية اليمنى' 
                      : 'In the top right corner'}
                  </p>
                </div>
              </div>
            </div>
          </div>

          <Button
            onClick={handleDismiss}
            className="w-full bg-white text-primary hover:bg-white/90 font-semibold py-6 text-base"
          >
            {language === 'ar' ? 'فهمت' : 'Got it'}
          </Button>
        </div>
      </div>
    );
  }

  // Android Install Prompt
  if (!showInstallPrompt || !deferredPrompt) {
    return null;
  }

  return (
    <div className="fixed bottom-24 left-4 right-4 z-50 md:hidden">
      <div className="bg-gradient-to-r from-primary to-accent rounded-2xl p-4 text-white shadow-lg animate-slide-up">
        <div className="flex items-start justify-between mb-3">
          <div className="flex items-center gap-3">
            <div className="bg-white/20 rounded-xl p-2">
              <Smartphone className="h-6 w-6" />
            </div>
            <div>
              <h3 className="font-bold text-sm">
                {language === 'ar' ? 'تثبيت التطبيق' : 'Install App'}
              </h3>
              <p className="text-xs text-white/90">
                {language === 'ar' ? 'احصل على تجربة أفضل' : 'Get a better experience'}
              </p>
            </div>
          </div>
          <Button
            variant="ghost"
            size="sm"
            onClick={handleDismiss}
            className="text-white hover:bg-white/20 p-1 h-auto"
          >
            <X className="h-4 w-4" />
          </Button>
        </div>
        
        <div className="flex gap-2">
          <Button
            onClick={handleInstallClick}
            className="flex-1 bg-white text-primary hover:bg-white/90 font-semibold"
          >
            <Download className="h-4 w-4 mr-2" />
            {language === 'ar' ? 'تثبيت' : 'Install'}
          </Button>
          <Button
            variant="outline"
            onClick={handleDismiss}
            className="border-white text-white hover:bg-white/20"
          >
            {language === 'ar' ? 'لاحقاً' : 'Later'}
          </Button>
        </div>
      </div>
    </div>
  );
};