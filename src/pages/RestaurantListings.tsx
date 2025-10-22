import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { LoadingSpinner } from '@/components/ui/loading-spinner';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Star, Clock, MapPin, ArrowRight } from 'lucide-react';
import { useLanguage } from '@/lib/language';

interface Restaurant {
  id: string;
  business_name: string;
  business_name_ar: string | null;
  cuisine_type: string;
  rating: number;
  delivery_time_min: number;
  delivery_time_max: number;
  minimum_order: number;
  delivery_fee: number;
  logo_url: string;
  address: string;
  is_featured: boolean;
}

const RestaurantListings = () => {
  const [restaurants, setRestaurants] = useState<Restaurant[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const { language } = useLanguage();

  useEffect(() => {
    fetchRestaurants();
  }, []);

  const fetchRestaurants = async () => {
    try {
      const { data, error } = await supabase
        .from('suppliers')
        .select('*')
        .eq('is_active', true)
        .eq('is_verified', true)
        .order('is_featured', { ascending: false })
        .order('rating', { ascending: false });

      if (error) throw error;

      setRestaurants(data || []);
    } catch (error) {
      console.error('Error fetching restaurants:', error);
    } finally {
      setLoading(false);
    }
  };

  const filteredRestaurants = restaurants.filter(restaurant => {
    const name = language === 'ar' && restaurant.business_name_ar 
      ? restaurant.business_name_ar 
      : restaurant.business_name;
    const cuisine = restaurant.cuisine_type || '';
    
    return name.toLowerCase().includes(searchQuery.toLowerCase()) ||
           cuisine.toLowerCase().includes(searchQuery.toLowerCase());
  });

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-dynamic flex items-center justify-center">
        <LoadingSpinner />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-dynamic">
      {/* Header */}
      <div className="glass-card mx-4 mt-4 mb-6 rounded-3xl p-6">
        <div className="flex items-center justify-between mb-4">
          <h1 className="text-2xl font-bold bg-gradient-to-r from-primary to-secondary bg-clip-text text-transparent">
            {language === 'ar' ? 'المطاعم' : 'Restaurants'}
          </h1>
          <Link to="/">
            <Button variant="ghost" size="sm">
              {language === 'ar' ? 'العودة' : 'Back'}
            </Button>
          </Link>
        </div>
        
        {/* Search */}
        <Input
          placeholder={language === 'ar' ? 'ابحث عن المطاعم...' : 'Search restaurants...'}
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="glass-input"
        />
      </div>

      {/* Restaurant Grid */}
      <div className="px-4 pb-24 space-y-4">
        {filteredRestaurants.length === 0 ? (
          <Card className="glass-card p-8 text-center">
            <p className="text-muted-foreground">
              {language === 'ar' ? 'لا توجد مطاعم متاحة' : 'No restaurants available'}
            </p>
          </Card>
        ) : (
          filteredRestaurants.map((restaurant) => (
            <Link key={restaurant.id} to={`/restaurant/${restaurant.id}`}>
              <Card className="glass-card hover:shadow-float transition-all duration-300 hover:scale-[1.02] overflow-hidden">
                <div className="flex gap-4 p-4">
                  {/* Restaurant Image */}
                  <div className="w-20 h-20 rounded-2xl bg-gradient-to-br from-primary/20 to-secondary/20 flex items-center justify-center flex-shrink-0">
                    {restaurant.logo_url ? (
                      <img
                        src={restaurant.logo_url}
                        alt={restaurant.business_name}
                        className="w-full h-full object-cover rounded-2xl"
                      />
                    ) : (
                      <div className="w-8 h-8 rounded-lg bg-gradient-to-r from-primary to-secondary" />
                    )}
                  </div>

                  {/* Restaurant Info */}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <h3 className="font-bold text-lg leading-tight mb-1">
                          {language === 'ar' && restaurant.business_name_ar 
                            ? restaurant.business_name_ar 
                            : restaurant.business_name}
                        </h3>
                        <p className="text-sm text-muted-foreground mb-2">
                          {restaurant.cuisine_type || (language === 'ar' ? 'متنوع' : 'Various')}
                        </p>
                        
                        {/* Rating and delivery time */}
                        <div className="flex items-center gap-4 mb-2">
                          <div className="flex items-center gap-1">
                            <Star className="w-4 h-4 fill-yellow-400 text-yellow-400" />
                            <span className="text-sm font-medium">{restaurant.rating}</span>
                          </div>
                          
                          <div className="flex items-center gap-1">
                            <Clock className="w-4 h-4 text-muted-foreground" />
                            <span className="text-sm text-muted-foreground">
                              {restaurant.delivery_time_min}-{restaurant.delivery_time_max} {language === 'ar' ? 'د' : 'min'}
                            </span>
                          </div>
                        </div>

                        {/* Order info */}
                        <div className="flex items-center justify-between">
                          <div className="text-sm text-muted-foreground">
                            {language === 'ar' ? 'أقل طلب:' : 'Min order:'} {restaurant.minimum_order.toLocaleString()} RWF
                          </div>
                          <div className="text-sm text-muted-foreground">
                            {language === 'ar' ? 'التوصيل:' : 'Delivery:'} {restaurant.delivery_fee.toLocaleString()} RWF
                          </div>
                        </div>
                      </div>

                      <div className="flex items-center gap-2">
                        {restaurant.is_featured && (
                          <Badge className="bg-gradient-to-r from-yellow-400 to-orange-500 text-white">
                            {language === 'ar' ? 'مميز' : 'Featured'}
                          </Badge>
                        )}
                        <ArrowRight className="w-5 h-5 text-muted-foreground" />
                      </div>
                    </div>
                  </div>
                </div>
              </Card>
            </Link>
          ))
        )}
      </div>
    </div>
  );
};

export default RestaurantListings;