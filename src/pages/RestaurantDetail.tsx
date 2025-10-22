import { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { LoadingSpinner } from '@/components/ui/loading-spinner';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Star, Clock, MapPin, Phone, ArrowLeft, Plus } from 'lucide-react';
import { useLanguage } from '@/lib/language';

interface Restaurant {
  id: string;
  business_name: string;
  cuisine_type: string;
  rating: number;
  delivery_time_min: number;
  delivery_time_max: number;
  minimum_order: number;
  delivery_fee: number;
  logo_url: string;
  cover_image_url: string;
  address: string;
  phone: string;
  description: string;
  is_featured: boolean;
}

interface Product {
  id: string;
  name: string;
  description: string;
  price: number;
  image_url: string;
  category_id: string;
}

export default function RestaurantDetail() {
  const { id } = useParams();
  const [restaurant, setRestaurant] = useState<Restaurant | null>(null);
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const { language } = useLanguage();

  useEffect(() => {
    if (id) {
      fetchRestaurantDetails();
      fetchProducts();
    }
  }, [id]);

  const fetchRestaurantDetails = async () => {
    try {
      const { data, error } = await supabase
        .from('suppliers')
        .select('*')
        .eq('id', id)
        .single();

      if (error) throw error;

      setRestaurant(data);
    } catch (error) {
      console.error('Error fetching restaurant:', error);
    }
  };

  const fetchProducts = async () => {
    try {
      const { data, error } = await supabase
        .from('products')
        .select('*')
        .eq('supplier_id', id)
        .eq('is_available', true)
        .order('sort_order')
        .limit(20);

      if (error) throw error;

      setProducts(data || []);
    } catch (error) {
      console.error('Error fetching products:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-dynamic flex items-center justify-center">
        <LoadingSpinner />
      </div>
    );
  }

  if (!restaurant) {
    return (
      <div className="min-h-screen bg-gradient-dynamic flex items-center justify-center">
        <Card className="glass-card p-8 text-center">
          <p className="text-muted-foreground">
            {language === 'ar' ? 'المطعم غير موجود' : 'Restaurant not found'}
          </p>
          <Link to="/">
            <Button className="mt-4">
              {language === 'ar' ? 'رجوع للرئيسية' : 'Back to home'}
            </Button>
          </Link>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-dynamic">
      {/* Header */}
      <div className="glass-card mx-4 mt-4 mb-6 rounded-3xl overflow-hidden">
        {/* Cover Image */}
        <div className="h-48 bg-gradient-to-br from-primary/20 to-secondary/20 relative">
          {restaurant.cover_image_url ? (
            <img
              src={restaurant.cover_image_url}
              alt={restaurant.business_name}
              className="w-full h-full object-cover"
            />
          ) : (
            <div className="w-full h-full bg-gradient-to-br from-primary/30 to-secondary/30" />
          )}
          
          {/* Back Button */}
          <Link to="/">
            <Button
              variant="ghost"
              size="sm"
              className="absolute top-4 left-4 glass-card"
            >
              <ArrowLeft className="w-4 h-4 mr-2" />
              {language === 'ar' ? 'رجوع' : 'Back'}
            </Button>
          </Link>
        </div>

        {/* Restaurant Info */}
        <div className="p-6">
          <div className="flex items-start gap-4">
            {/* Logo */}
            <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-primary/20 to-secondary/20 flex items-center justify-center flex-shrink-0">
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

            {/* Info */}
            <div className="flex-1">
              <div className="flex items-start justify-between mb-2">
                <h1 className="text-2xl font-bold">{restaurant.business_name}</h1>
                {restaurant.is_featured && (
                  <Badge className="bg-gradient-to-r from-yellow-400 to-orange-500 text-white">
                    {language === 'ar' ? 'مميز' : 'Featured'}
                  </Badge>
                )}
              </div>
              
              <p className="text-muted-foreground mb-3">{restaurant.cuisine_type}</p>
              
              {/* Stats */}
              <div className="flex items-center gap-6 mb-4">
                <div className="flex items-center gap-1">
                  <Star className="w-4 h-4 fill-yellow-400 text-yellow-400" />
                  <span className="font-medium">{restaurant.rating}</span>
                </div>
                
                <div className="flex items-center gap-1">
                  <Clock className="w-4 h-4 text-muted-foreground" />
                  <span className="text-sm text-muted-foreground">
                    {restaurant.delivery_time_min}-{restaurant.delivery_time_max} {language === 'ar' ? 'د' : 'min'}
                  </span>
                </div>
                
                <div className="flex items-center gap-1">
                  <MapPin className="w-4 h-4 text-muted-foreground" />
                  <span className="text-sm text-muted-foreground">
                    {language === 'ar' ? 'التوصيل:' : 'Delivery:'} {restaurant.delivery_fee.toLocaleString()} RWF
                  </span>
                </div>
              </div>

              {/* Description */}
              {restaurant.description && (
                <p className="text-sm text-muted-foreground mb-4">
                  {restaurant.description}
                </p>
              )}

              {/* Contact */}
              <div className="flex items-center gap-4">
                <div className="text-sm">
                  {language === 'ar' ? 'أقل طلب:' : 'Min order:'} <span className="font-medium">{restaurant.minimum_order.toLocaleString()} RWF</span>
                </div>
                {restaurant.phone && (
                  <div className="flex items-center gap-1 text-sm text-muted-foreground">
                    <Phone className="w-4 h-4" />
                    {restaurant.phone}
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Menu */}
      <div className="px-4 pb-24">
        <h2 className="text-xl font-bold mb-4 px-2">
          {language === 'ar' ? 'القائمة' : 'Menu'}
        </h2>

        {products.length === 0 ? (
          <Card className="glass-card p-8 text-center">
            <p className="text-muted-foreground">
              {language === 'ar' ? 'لا توجد منتجات متاحة' : 'No products available'}
            </p>
          </Card>
        ) : (
          <div className="space-y-3">
            {products.map((product) => (
              <Card key={product.id} className="glass-card hover:shadow-float transition-all duration-300">
                <div className="flex gap-4 p-4">
                  {/* Product Image */}
                  <div className="w-20 h-20 rounded-2xl bg-gradient-to-br from-primary/20 to-secondary/20 flex items-center justify-center flex-shrink-0">
                    {product.image_url ? (
                      <img
                        src={product.image_url}
                        alt={product.name}
                        className="w-full h-full object-cover rounded-2xl"
                      />
                    ) : (
                      <div className="w-8 h-8 rounded-lg bg-gradient-to-r from-primary to-secondary" />
                    )}
                  </div>

                  {/* Product Info */}
                  <div className="flex-1 min-w-0">
                    <h3 className="font-medium text-lg leading-tight mb-1">
                      {product.name}
                    </h3>
                    {product.description && (
                      <p className="text-sm text-muted-foreground mb-2 line-clamp-2">
                        {product.description}
                      </p>
                    )}
                    <div className="flex items-center justify-between">
                      <span className="font-bold text-lg">
                        {product.price.toLocaleString()} RWF
                      </span>
                      <Button size="sm" className="bg-gradient-to-r from-primary to-secondary text-white">
                        <Plus className="w-4 h-4 mr-1" />
                        {language === 'ar' ? 'إضافة' : 'Add'}
                      </Button>
                    </div>
                  </div>
                </div>
              </Card>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}