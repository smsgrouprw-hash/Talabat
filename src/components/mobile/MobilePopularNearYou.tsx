import { useLanguage } from "@/lib/language";
import { Link } from "react-router-dom";
import { Star, Clock, MapPin } from "lucide-react";
import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";

interface Supplier {
  id: string;
  business_name: string;
  cuisine_type: string | null;
  logo_url: string | null;
  rating: number;
  delivery_time_min: number;
  delivery_time_max: number;
  address: string | null;
  latitude: number;
  longitude: number;
  distance?: number;
}

// Haversine formula to calculate distance between two coordinates
function calculateDistance(lat1: number, lon1: number, lat2: number, lon2: number): number {
  const R = 6371; // Earth's radius in km
  const dLat = (lat2 - lat1) * Math.PI / 180;
  const dLon = (lon2 - lon1) * Math.PI / 180;
  const a = 
    Math.sin(dLat/2) * Math.sin(dLat/2) +
    Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) *
    Math.sin(dLon/2) * Math.sin(dLon/2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
  return R * c; // Distance in km
}

export const MobilePopularNearYou = () => {
  const { language } = useLanguage();
  const { toast } = useToast();
  const [restaurants, setRestaurants] = useState<Supplier[]>([]);
  const [userLocation, setUserLocation] = useState<{ lat: number; lon: number } | null>(null);
  const [isLoadingLocation, setIsLoadingLocation] = useState(true);

  useEffect(() => {
    // Get user's current location
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          setUserLocation({
            lat: position.coords.latitude,
            lon: position.coords.longitude
          });
          setIsLoadingLocation(false);
        },
        (error) => {
          console.error('Error getting location:', error);
          // Fallback to Kigali center if location is denied
          setUserLocation({
            lat: -1.9441,
            lon: 30.0619
          });
          setIsLoadingLocation(false);
        }
      );
    } else {
      // Fallback to Kigali center if geolocation not supported
      setUserLocation({
        lat: -1.9441,
        lon: 30.0619
      });
      setIsLoadingLocation(false);
    }
  }, []);

  useEffect(() => {
    if (!userLocation) return;

    const fetchNearbySuppliers = async () => {
      const { data, error } = await supabase
        .from('suppliers')
        .select('id, business_name, cuisine_type, logo_url, rating, delivery_time_min, delivery_time_max, address, latitude, longitude')
        .eq('is_active', true)
        .eq('is_verified', true);

      if (data && !error) {
        // Calculate distance for each supplier
        const suppliersWithDistance = data.map(supplier => ({
          ...supplier,
          distance: calculateDistance(
            userLocation.lat,
            userLocation.lon,
            supplier.latitude,
            supplier.longitude
          )
        }));

        // Filter suppliers within 10km radius
        const nearbySuppliers = suppliersWithDistance
          .filter(supplier => supplier.distance <= 10)
          .sort((a, b) => a.distance - b.distance) // Sort by distance (closest first)
          .slice(0, 5); // Limit to 5 suppliers

        setRestaurants(nearbySuppliers);
      }
    };

    fetchNearbySuppliers();
  }, [userLocation]);

  if (isLoadingLocation) {
    return (
      <div className="py-6 pb-8 bg-muted/20" dir={language === 'ar' ? 'rtl' : 'ltr'}>
        <div className={`px-4 mb-4 flex justify-between items-center ${language === 'ar' ? 'flex-row-reverse' : ''}`}>
          <h2 className="text-xl font-bold text-foreground">
            {language === 'ar' ? 'شائع بالقرب منك' : 'Popular Near You'}
          </h2>
        </div>
        <div className="px-4 text-center text-muted-foreground">
          {language === 'ar' ? 'جاري تحديد موقعك...' : 'Finding your location...'}
        </div>
      </div>
    );
  }

  if (restaurants.length === 0) {
    return (
      <div className="py-6 pb-8 bg-muted/20" dir={language === 'ar' ? 'rtl' : 'ltr'}>
        <div className={`px-4 mb-4 flex justify-between items-center ${language === 'ar' ? 'flex-row-reverse' : ''}`}>
          <h2 className="text-xl font-bold text-foreground">
            {language === 'ar' ? 'شائع بالقرب منك' : 'Popular Near You'}
          </h2>
        </div>
        <div className="px-4 text-center text-muted-foreground">
          {language === 'ar' ? 'لا توجد مطاعم قريبة منك' : 'No restaurants near you'}
        </div>
      </div>
    );
  }

  return (
    <div className="py-6 pb-8 bg-muted/20" dir={language === 'ar' ? 'rtl' : 'ltr'}>
      <div className={`px-4 mb-4 flex justify-between items-center ${language === 'ar' ? 'flex-row-reverse' : ''}`}>
        <h2 className="text-xl font-bold text-foreground">
          {language === 'ar' ? 'شائع بالقرب منك' : 'Popular Near You'}
        </h2>
        <Link to="/restaurants" className="text-sm text-primary font-semibold">
          {language === 'ar' ? 'عرض الكل' : 'View All'}
        </Link>
      </div>
      <div className="px-4 space-y-3">
        {restaurants.map((restaurant) => (
          <Link
            key={restaurant.id}
            to={`/customer-supplier-detail/${restaurant.id}`}
            className="flex gap-3 bg-card rounded-xl shadow-sm overflow-hidden group hover:shadow-md transition-all p-3"
          >
            <div className="relative w-24 h-24 flex-shrink-0 rounded-lg overflow-hidden">
              <img 
                src={restaurant.logo_url || "https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?w=400&auto=format&fit=crop"} 
                alt={restaurant.business_name}
                className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
              />
            </div>
            <div className="flex-1 min-w-0">
              <h3 className="font-bold text-foreground mb-1 line-clamp-1">
                {restaurant.business_name}
              </h3>
              <p className="text-sm text-muted-foreground mb-2 line-clamp-1">
                {restaurant.cuisine_type || (language === 'ar' ? 'مطعم' : 'Restaurant')}
              </p>
              <div className="flex items-center gap-3 text-xs">
                <div className="flex items-center gap-1">
                  <Star className="w-3.5 h-3.5 fill-yellow-400 text-yellow-400" />
                  <span className="font-semibold">{restaurant.rating || 0}</span>
                </div>
                <div className="flex items-center gap-1 text-muted-foreground">
                  <Clock className="w-3.5 h-3.5" />
                  <span>{restaurant.delivery_time_min}-{restaurant.delivery_time_max} {language === 'ar' ? 'دقيقة' : 'min'}</span>
                </div>
                {restaurant.distance !== undefined && (
                  <div className="flex items-center gap-1 text-primary font-semibold">
                    <MapPin className="w-3.5 h-3.5" />
                    <span>{restaurant.distance.toFixed(1)} {language === 'ar' ? 'كم' : 'km'}</span>
                  </div>
                )}
              </div>
            </div>
          </Link>
        ))}
      </div>
    </div>
  );
};
