import { useLanguage } from "@/lib/language";
import { Carousel, CarouselContent, CarouselItem, CarouselNext, CarouselPrevious } from "@/components/ui/carousel";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";

const promos = [
  {
    id: 1,
    title: { ar: "عروض الإفطار الرائعة", en: "Breakfast Good Deals" },
    discount: { ar: "خصم 30%", en: "30% OFF" },
    description: { ar: "احصل على خصم على وجبات الإفطار", en: "Get discount on breakfast meals" },
    bgImage: "https://images.unsplash.com/photo-1533089860892-a7c6f0a88666?w=800&auto=format&fit=crop",
    bgColor: "from-orange-500 to-red-500"
  },
  {
    id: 2,
    title: { ar: "خصم 50% على الطلبات الأولى", en: "Flat 50% OFF" },
    discount: { ar: "خصم 50%", en: "50% OFF" },
    description: { ar: "للطلبات الجديدة فقط", en: "For new orders only" },
    bgImage: "https://images.unsplash.com/photo-1568901346375-23c9450c58cd?w=800&auto=format&fit=crop",
    bgColor: "from-primary to-orange-600"
  },
  {
    id: 3,
    title: { ar: "توصيل مجاني", en: "Free Delivery" },
    discount: { ar: "توصيل مجاني", en: "FREE" },
    description: { ar: "على الطلبات فوق 10,000 فرنك", en: "On orders above 10,000 RWF" },
    bgImage: "https://images.unsplash.com/photo-1513104890138-7c749659a591?w=800&auto=format&fit=crop",
    bgColor: "from-red-500 to-pink-500"
  }
];

export const MobilePromoCarousel = () => {
  const { language } = useLanguage();

  return (
    <div className="px-4 py-6" dir={language === 'ar' ? 'rtl' : 'ltr'}>
      <Carousel className="w-full" opts={{ loop: true, align: "start", direction: language === 'ar' ? 'rtl' : 'ltr' }}>
        <CarouselContent className="-ml-2">
          {promos.map((promo) => (
            <CarouselItem key={promo.id} className="pl-2 basis-full">
              <div className="relative h-40 rounded-2xl overflow-hidden shadow-lg">
                <div className={`absolute inset-0 bg-gradient-to-r ${promo.bgColor} opacity-90`} />
                <img 
                  src={promo.bgImage} 
                  alt={promo.title[language]}
                  className="absolute inset-0 w-full h-full object-cover mix-blend-overlay"
                />
                <div className={`relative h-full p-6 flex flex-col justify-between ${language === 'ar' ? 'items-end text-right' : 'items-start text-left'}`}>
                  <div className="w-full">
                    <Badge className="bg-white/20 text-white border-white/30 backdrop-blur-sm mb-2 font-bold">
                      {promo.discount[language]}
                    </Badge>
                    <h3 className="text-white font-bold text-xl mb-2 leading-tight">
                      {promo.title[language]}
                    </h3>
                    <p className="text-white/90 text-sm">
                      {promo.description[language]}
                    </p>
                  </div>
                  <Button 
                    size="sm" 
                    className={`bg-white text-primary hover:bg-white/90 font-bold rounded-full px-6 ${language === 'ar' ? 'self-start' : 'self-start'}`}
                  >
                    {language === 'ar' ? 'اطلب الآن' : 'Order Now'}
                  </Button>
                </div>
              </div>
            </CarouselItem>
          ))}
        </CarouselContent>
      </Carousel>
    </div>
  );
};
