import { Button } from '@/components/ui/button';
import { Badge } from "@/components/ui/badge";
import { Zap, Star, Smartphone, Plus } from "lucide-react";

const triggerPWAInstall = () => {
  // This will trigger the PWA install prompt component to show
  const event = new CustomEvent('pwa-install-requested');
  window.dispatchEvent(event);
};

export const DownloadAppSection = () => {
  const appFeatures = [
    {
      icon: Zap,
      title: "Faster ordering",
      description: "Order in seconds with the app"
    },
    {
      icon: Star,
      title: "Exclusive deals",
      description: "Special discounts for app users"
    },
    {
      icon: Smartphone,
      title: "Live tracking",
      description: "Track your order in real-time"
    }
  ];

  return (
    <section className="py-20 bg-gradient-to-r from-amber-900 via-amber-800 to-orange-900 relative overflow-hidden">
      {/* Background decorative elements */}
      <div className="absolute top-10 right-10 w-32 h-32 bg-orange-400/20 rounded-full blur-3xl"></div>
      <div className="absolute bottom-20 left-10 w-24 h-24 bg-yellow-400/20 rounded-full blur-2xl"></div>
      <div className="absolute top-1/2 right-1/4 w-16 h-16 bg-red-400/20 rounded-full blur-xl"></div>
      
      <div className="container relative">
        <div className="grid lg:grid-cols-2 gap-12 items-center">
          {/* Left content */}
          <div className="text-white space-y-8">
            <div>
              <h2 className="text-4xl md:text-5xl font-bold mb-6">
                Download the App Now
              </h2>
              <p className="text-xl text-white/90 leading-relaxed">
                Get the best experience with Talabat Rwanda app. Faster ordering, 
                exclusive deals, and live order tracking
              </p>
            </div>

            {/* Features */}
            <div className="grid gap-6">
              {appFeatures.map((feature, index) => (
                <div key={index} className="flex items-start gap-4">
                  <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-white/10 backdrop-blur">
                    <feature.icon className="h-6 w-6 text-yellow-400" />
                  </div>
                  <div>
                    <h3 className="text-lg font-semibold text-white mb-1">
                      {feature.title}
                    </h3>
                    <p className="text-white/80">
                      {feature.description}
                    </p>
                  </div>
                </div>
              ))}
            </div>

            {/* Install App Button */}
            <div className="flex justify-center">
              <Button 
                size="lg" 
                onClick={triggerPWAInstall}
                className="bg-gradient-to-r from-primary to-accent text-white font-semibold px-8 py-4 rounded-full transition-all duration-300 hover:scale-105 hover:opacity-90"
              >
                <Plus className="h-5 w-5 mr-2" />
                Install App
              </Button>
            </div>
            <p className="text-center text-white/80 text-sm mt-2">
              Add to your device for the best experience
            </p>
          </div>

          {/* Right content - App preview */}
          <div className="relative">
            <div className="bg-white/10 backdrop-blur-sm rounded-3xl p-8 border border-white/20">
              <div className="text-center text-white space-y-6">
                <div className="mx-auto w-20 h-20 bg-white/20 rounded-2xl flex items-center justify-center">
                  <Smartphone className="h-10 w-10 text-white" />
                </div>
                
                <div>
                  <h3 className="text-2xl font-bold mb-2">Talabat Rwanda App</h3>
                  <div className="flex items-center justify-center gap-1 mb-2">
                    {[...Array(5)].map((_, i) => (
                      <Star key={i} className="h-5 w-5 fill-yellow-400 text-yellow-400" />
                    ))}
                    <span className="ml-2 text-white/90 font-medium">4.8 (10K+ reviews)</span>
                  </div>
                  <p className="text-white/80">
                    Join 50,000+ users enjoying the app
                  </p>
                </div>

                <div className="flex justify-center">
                  <Badge className="bg-green-500/20 text-green-300 border-green-400/30 px-4 py-2">
                    Free Download
                  </Badge>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};