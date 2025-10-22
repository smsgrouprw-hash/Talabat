import { Link } from 'react-router-dom';
import { Star, Clock, MapPin, Heart, Plus } from "lucide-react";
import { useLanguage } from "@/lib/language";
import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";

interface Supplier {
  id: string;
  business_name: string;
  cuisine_type: string | null;
  logo_url: string | null;
  rating: number;
  delivery_time_min: number;
  delivery_time_max: number;
  delivery_fee: number;
  is_featured: boolean;
}

export const ModernRestaurantsSection = () => {
  const { language } = useLanguage();
  const [restaurants, setRestaurants] = useState<Supplier[]>([]);

  useEffect(() => {
    const fetchSuppliers = async () => {
      const { data, error } = await supabase
        .from('suppliers')
        .select('id, business_name, cuisine_type, logo_url, rating, delivery_time_min, delivery_time_max, delivery_fee, is_featured')
        .eq('is_active', true)
        .eq('is_verified', true)
        .order('is_featured', { ascending: false })
        .order('rating', { ascending: false })
        .limit(10);

      if (data && !error) {
        setRestaurants(data);
      }
    };

    fetchSuppliers();
  }, []);

  if (restaurants.length === 0) {
    return null;
  }

  return (
    <div className="px-4 py-8 bg-gradient-to-b from-background to-muted/20" dir={language === 'ar' ? 'rtl' : 'ltr'}>
      <div className="mb-8">
        <h2 className="text-3xl font-bold mb-2 bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent">
          {language === 'ar' ? 'المطاعم المميزة' : 'Featured Restaurants'}
        </h2>
        <p className="text-muted-foreground text-lg">
          {language === 'ar' ? 'اكتشف أفضل المطاعم في كيغالي' : 'Discover the best restaurants in Kigali'}
        </p>
      </div>

      <div className="overflow-x-auto scrollbar-hide scroll-smooth snap-x snap-mandatory pb-4">
        <div className="flex gap-6 min-w-max">
        {restaurants.map((restaurant, index) => (
          <Link 
            key={restaurant.id} 
            to={`/customer-supplier-detail/${restaurant.id}`}
            className="glass-card rounded-3xl overflow-hidden shadow-large hover:shadow-float transition-all duration-500 hover:scale-[1.02] animate-slide-up card-3d block w-80 sm:w-96 flex-shrink-0 snap-start"
            style={{animationDelay: `${index * 0.1}s`}}
          >
            <div className="relative">
              <img 
                src={restaurant.logo_url || "https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?w=400&auto=format&fit=crop"} 
                alt={restaurant.business_name}
                className="w-full h-48 object-cover"
              />
              
              {/* Overlay badges */}
              <div className="absolute top-3 left-3 flex gap-2">
                {restaurant.is_featured && (
                  <div className="bg-gradient-to-r from-secondary to-secondary/80 text-white px-3 py-1 rounded-full text-xs font-bold animate-pulse-glow">
                    {language === 'ar' ? '🔥 مميز' : '🔥 Featured'}
                  </div>
                )}
                {restaurant.rating >= 4.5 && (
                  <div className="bg-gradient-to-r from-accent to-accent/80 text-white px-3 py-1 rounded-full text-xs font-bold">
                    {language === 'ar' ? '⭐ الأفضل' : '⭐ Top Rated'}
                  </div>
                )}
              </div>
              
              {/* Heart button */}
              <div className="absolute top-3 right-3">
                <div className="glass-card p-2 rounded-xl hover:scale-110 transition-transform cursor-pointer">
                  <Heart className="h-5 w-5 text-red-500" />
                </div>
              </div>
            </div>
            
            <div className="p-6">
              <div className="flex justify-between items-start mb-3">
                <div className="flex-1">
                  <h3 className="font-bold text-xl mb-1 bg-gradient-to-r from-foreground to-foreground/70 bg-clip-text text-transparent">
                    {restaurant.business_name}
                  </h3>
                  <p className="text-muted-foreground text-sm">
                    {restaurant.cuisine_type || (language === 'ar' ? 'مطعم' : 'Restaurant')}
                  </p>
                </div>
                
                <div className="flex items-center gap-1 glass-card px-3 py-1 rounded-full">
                  <Star className="h-4 w-4 fill-yellow-400 text-yellow-400" />
                  <span className="font-bold text-sm">{restaurant.rating || 0}</span>
                </div>
              </div>
              
              <div className="flex items-center gap-4 mb-4 text-sm text-muted-foreground">
                <div className="flex items-center gap-1">
                  <Clock className="h-4 w-4" />
                  <span>{restaurant.delivery_time_min}-{restaurant.delivery_time_max} {language === 'ar' ? 'دقيقة' : 'min'}</span>
                </div>
                <div className="flex items-center gap-1">
                  <MapPin className="h-4 w-4" />
                  <span>{(restaurant.delivery_fee || 0).toLocaleString()} {language === 'ar' ? 'فرنك' : 'RWF'}</span>
                </div>
              </div>
              
              {/* Action button */}
              <div className="glass-card rounded-2xl p-1">
                <button className="w-full bg-gradient-to-r from-primary to-accent text-white py-3 rounded-xl font-bold flex items-center justify-center gap-2 hover:shadow-glow transition-all duration-300 hover:scale-[1.02]">
                  <Plus className="h-5 w-5" />
                  {language === 'ar' ? 'اطلب الآن' : 'Order Now'}
                </button>
              </div>
            </div>
          </Link>
        ))}
        </div>
      </div>
      
      {/* Load more button */}
      <div className="flex justify-center mt-8">
        <div className="glass-card px-8 py-4 rounded-2xl cursor-pointer hover:scale-105 transition-transform duration-300 shadow-float">
          <span className="text-lg font-bold bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent">
            {language === 'ar' ? 'عرض المزيد من المطاعم' : 'View More Restaurants'}
          </span>
        </div>
      </div>
    </div>
  );
};