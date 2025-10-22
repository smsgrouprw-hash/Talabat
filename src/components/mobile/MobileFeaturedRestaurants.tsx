import { useLanguage } from "@/lib/language";
import { Link } from "react-router-dom";
import { Star, Clock } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";

interface Supplier {
  id: string;
  business_name: string;
  business_name_ar: string | null;
  cuisine_type: string | null;
  logo_url: string | null;
  rating: number;
  delivery_time_min: number;
  delivery_time_max: number;
  delivery_fee: number;
  is_featured: boolean;
  business_type: string;
}

export const MobileFeaturedRestaurants = () => {
  const { language } = useLanguage();
  const [restaurants, setRestaurants] = useState<Supplier[]>([]);
  const [restaurantCategoryId, setRestaurantCategoryId] = useState<string | null>(null);

  useEffect(() => {
    const fetchRestaurants = async () => {
      // Get Restaurant category and suppliers in parallel
      const [categoryResult, suppliersResult] = await Promise.all([
        supabase
          .from('categories')
          .select('id')
          .eq('name_en', 'Restaurant')
          .maybeSingle(),
        supabase
          .from('suppliers')
          .select('id, business_name, business_name_ar, cuisine_type, logo_url, rating, delivery_time_min, delivery_time_max, delivery_fee, is_featured, business_type')
          .eq('is_active', true)
          .eq('is_verified', true)
          .order('is_featured', { ascending: false })
          .order('rating', { ascending: false })
          .limit(20)
      ]);

      if (categoryResult.data) {
        setRestaurantCategoryId(categoryResult.data.id);
        
        // Filter suppliers by restaurant category
        const restaurantSuppliers = suppliersResult.data?.filter(
          s => s.business_type === categoryResult.data.id
        ) || [];
        
        setRestaurants(restaurantSuppliers.slice(0, 10));
      }
    };

    fetchRestaurants();
  }, []);

  if (restaurants.length === 0) {
    return null;
  }

  return (
    <div className="py-6 bg-background" dir={language === 'ar' ? 'rtl' : 'ltr'}>
      <div className={`px-4 mb-4 flex justify-between items-center ${language === 'ar' ? 'flex-row-reverse' : ''}`}>
        <Link to="/restaurants" className="text-sm text-primary font-semibold">
          {language === 'ar' ? 'عرض الكل' : 'View All'}
        </Link>
        <h2 className="text-xl font-bold text-foreground">
          {language === 'ar' ? 'المطاعم المميزة' : 'Featured Restaurants'}
        </h2>
      </div>
      <div className="w-full overflow-x-auto overflow-y-hidden [-webkit-overflow-scrolling:touch] [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
        <div className={`flex gap-4 px-4 pb-2 ${language === 'ar' ? 'flex-row-reverse' : ''}`} style={{ width: 'max-content' }}>
          {restaurants.map((restaurant) => (
            <Link
              key={restaurant.id}
              to={`/restaurant/${restaurant.id}`}
              className="w-[280px] max-w-[320px] flex-shrink-0 bg-card rounded-xl shadow-sm overflow-hidden group hover:shadow-md transition-all"
            >
            <div className="relative h-32">
              <img 
                src={restaurant.logo_url || "https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?w=400&auto=format&fit=crop"} 
                alt={restaurant.business_name}
                className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
              />
              {restaurant.is_featured && (
                <Badge className="absolute top-2 left-2 bg-primary text-primary-foreground font-bold border-0 shadow-md text-xs">
                  {language === 'ar' ? 'مميز' : 'Featured'}
                </Badge>
              )}
              <div className="absolute top-2 right-2 bg-card/95 backdrop-blur-sm rounded-full px-2 py-0.5 flex items-center gap-1">
                <Star className="w-3 h-3 fill-yellow-400 text-yellow-400" />
                <span className="text-xs font-semibold">{restaurant.rating || 0}</span>
              </div>
            </div>
            <div className="p-3">
              <h3 className="font-bold text-sm text-foreground mb-1 line-clamp-1">
                {language === 'ar' && restaurant.business_name_ar ? restaurant.business_name_ar : restaurant.business_name}
              </h3>
              <p className="text-xs text-muted-foreground mb-2 line-clamp-1">
                {restaurant.cuisine_type || (language === 'ar' ? 'مطعم' : 'Restaurant')}
              </p>
              <div className="flex items-center justify-between text-xs">
                <div className="flex items-center gap-1 text-muted-foreground">
                  <Clock className="w-3 h-3" />
                  <span>{restaurant.delivery_time_min}-{restaurant.delivery_time_max}</span>
                </div>
                <span className="font-semibold text-primary">
                  {(restaurant.delivery_fee || 0).toLocaleString()} {language === 'ar' ? 'فرنك' : 'RWF'}
                </span>
              </div>
            </div>
            </Link>
          ))}
        </div>
      </div>
    </div>
  );
};
