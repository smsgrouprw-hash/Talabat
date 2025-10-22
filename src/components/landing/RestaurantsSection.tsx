import { Button } from '@/components/ui/button';
import { Badge } from "@/components/ui/badge";
import { Star, Clock, MapPin } from "lucide-react";
import { useLanguage, translations } from "@/lib/language";
import { Link } from 'react-router-dom';
import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";

interface Supplier {
  id: string;
  business_name: string;
  business_type: string | null;
  address: string | null;
  logo_url: string | null;
  rating: number;
  delivery_time_min: number;
  delivery_time_max: number;
}

export const RestaurantsSection = () => {
  const { language } = useLanguage();
  const t = translations[language];
  const [loading, setLoading] = useState(true);
  const [restaurants, setRestaurants] = useState<Supplier[]>([]);
  const [restaurantCategoryId, setRestaurantCategoryId] = useState<string | null>(null);

  useEffect(() => {
    const fetchRestaurantCategory = async () => {
      // Get the Restaurant category ID
      const { data: categoryData } = await supabase
        .from('categories')
        .select('id')
        .eq('name_en', 'Restaurant')
        .single();
      
      if (categoryData) {
        setRestaurantCategoryId(categoryData.id);
      }
    };
    
    fetchRestaurantCategory();
  }, []);

  useEffect(() => {
    if (!restaurantCategoryId) return;
    
    const fetchSuppliers = async () => {
      const { data, error } = await supabase
        .from('suppliers')
        .select('id, business_name, business_type, address, logo_url, rating, delivery_time_min, delivery_time_max')
        .eq('is_active', true)
        .eq('is_verified', true)
        .eq('business_type', restaurantCategoryId)
        .order('rating', { ascending: false })
        .limit(8);

      if (data && !error) {
        setRestaurants(data);
      }
      setLoading(false);
    };

    fetchSuppliers();
  }, [restaurantCategoryId]);

  if (restaurants.length === 0) {
    return null;
  }

  return (
    <section className="py-8 px-4" dir={language === 'ar' ? 'rtl' : 'ltr'}>
      <div className="container-responsive">
        {/* Section title - mobile optimized */}
        <div className="mb-6">
          <h2 className="text-xl md:text-2xl font-bold mb-2 text-foreground">
            {language === 'ar' ? "الغداء أثناء التنقل" : "Lunch on the go"}
          </h2>
        </div>

        {/* Horizontal scrolling cards for mobile */}
        <div className="flex gap-4 overflow-x-auto pb-4 snap-x snap-mandatory scrollbar-hide scroll-smooth">
          {restaurants.map((restaurant) => (
            <Link
              key={restaurant.id}
              to={`/customer-supplier-detail/${restaurant.id}`}
              className="flex-shrink-0 w-72 sm:w-80 bg-card rounded-xl shadow-md hover:shadow-lg transition-all duration-300 snap-start cursor-pointer group"
            >
              <div className="relative">
                <img 
                  src={restaurant.logo_url || "https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?w=400&auto=format&fit=crop"}
                  alt={restaurant.business_name}
                  className="w-full h-48 object-cover rounded-t-xl transition-transform duration-300 group-hover:scale-105"
                />
                
                {/* Rating badge */}
                <div className="absolute top-3 left-3 right-3 flex justify-between items-start">
                  <Badge className="bg-card/95 backdrop-blur-sm text-foreground font-semibold text-xs px-2 py-1">
                    {restaurant.business_type || (language === 'ar' ? 'مطعم' : 'Restaurant')}
                  </Badge>
                  {restaurant.rating >= 4.5 && (
                    <Badge className="bg-yellow-500 text-white font-bold text-xs px-2 py-1">
                      ⭐ {restaurant.rating}
                    </Badge>
                  )}
                </div>
              </div>
              
              {/* Card content */}
              <div className="p-4">
                <h3 className="font-bold text-lg mb-1 text-foreground line-clamp-1">{restaurant.business_name}</h3>
                <p className="text-muted-foreground text-sm mb-3 line-clamp-1">{restaurant.address || (language === 'ar' ? 'كيغالي' : 'Kigali')}</p>
                
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Star className="h-4 w-4 fill-yellow-400 text-yellow-400" />
                    <span className="font-semibold text-sm">{restaurant.rating || 0}</span>
                  </div>
                  <div className="flex items-center gap-1 text-muted-foreground text-sm">
                    <Clock className="h-4 w-4" />
                    <span>{restaurant.delivery_time_min}-{restaurant.delivery_time_max} {language === 'ar' ? 'دقيقة' : 'min'}</span>
                  </div>
                </div>
              </div>
            </Link>
          ))}
        </div>

        {/* View all button */}
        <div className="text-center mt-6">
          <Link to="/customer-suppliers">
            <Button 
              variant="outline"
              className="border-primary text-primary hover:bg-primary/10"
            >
              {language === 'ar' ? "عرض الكل ←" : "View All →"}
            </Button>
          </Link>
        </div>
      </div>
    </section>
  );
};