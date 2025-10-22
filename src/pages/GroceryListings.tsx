import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { LoadingSpinner } from '@/components/ui/loading-spinner';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Star, Clock, ShoppingBag, ArrowRight } from 'lucide-react';
import { useLanguage } from '@/lib/language';

interface GroceryStore {
  id: string;
  business_name: string;
  business_type: string;
  rating: number;
  delivery_time_min: number;
  delivery_time_max: number;
  minimum_order: number;
  delivery_fee: number;
  logo_url: string;
  address: string;
  is_featured: boolean;
}

const GroceryListings = () => {
  const [stores, setStores] = useState<GroceryStore[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const { language } = useLanguage();

  const arabicStores = [
    { name: 'سوق الخضار الطازجة', type: 'خضروات وفواكه', rating: 4.7 },
    { name: 'مخبز الأصالة', type: 'مخبز', rating: 4.8 },
    { name: 'سوبر ماركت النور', type: 'بقالة', rating: 4.5 },
    { name: 'مخبز الشام', type: 'مخبز', rating: 4.9 },
    { name: 'سوق التوفير', type: 'بقالة عامة', rating: 4.4 },
    { name: 'مخبز الحرمين', type: 'مخبز وحلويات', rating: 4.6 },
    { name: 'سوق الطازج', type: 'لحوم وأسماك', rating: 4.7 },
    { name: 'بقالة المدينة', type: 'بقالة', rating: 4.3 }
  ];

  useEffect(() => {
    fetchStores();
  }, []);

  const fetchStores = async () => {
    try {
      const { data, error } = await supabase
        .from('suppliers')
        .select('*')
        .eq('is_active', true)
        .in('business_type', ['grocery', 'bakery', 'supermarket'])
        .order('is_featured', { ascending: false })
        .order('rating', { ascending: false });

      if (error) throw error;

      // Mix real data with Arabic names
      const enhancedData = (data || []).map((store, index) => ({
        ...store,
        business_name: language === 'ar' && arabicStores[index] 
          ? arabicStores[index].name 
          : store.business_name,
        business_type: language === 'ar' && arabicStores[index]
          ? arabicStores[index].type
          : store.business_type || 'بقالة',
        rating: arabicStores[index]?.rating || store.rating || 4.5,
        delivery_time_min: store.delivery_time_min || 15,
        delivery_time_max: store.delivery_time_max || 30,
        minimum_order: store.minimum_order || 10000,
        delivery_fee: store.delivery_fee || 2000
      }));

      setStores(enhancedData);
    } catch (error) {
      console.error('Error fetching stores:', error);
    } finally {
      setLoading(false);
    }
  };

  const filteredStores = stores.filter(store =>
    store.business_name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    store.business_type.toLowerCase().includes(searchQuery.toLowerCase())
  );

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
            {language === 'ar' ? 'الأسواق والمخابز' : 'Grocery & Bakery'}
          </h1>
          <Link to="/">
            <Button variant="ghost" size="sm">
              {language === 'ar' ? 'العودة' : 'Back'}
            </Button>
          </Link>
        </div>
        
        {/* Search */}
        <Input
          placeholder={language === 'ar' ? 'ابحث عن الأسواق والمخابز...' : 'Search stores...'}
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="glass-input"
        />
      </div>

      {/* Store Grid */}
      <div className="px-4 pb-24 space-y-4">
        {filteredStores.length === 0 ? (
          <Card className="glass-card p-8 text-center">
            <p className="text-muted-foreground">
              {language === 'ar' ? 'لا توجد متاجر متاحة' : 'No stores available'}
            </p>
          </Card>
        ) : (
          filteredStores.map((store) => (
            <Link key={store.id} to={`/store/${store.id}`}>
              <Card className="glass-card hover:shadow-float transition-all duration-300 hover:scale-[1.02] overflow-hidden">
                <div className="flex gap-4 p-4">
                  {/* Store Image */}
                  <div className="w-20 h-20 rounded-2xl bg-gradient-to-br from-green-400/20 to-blue-500/20 flex items-center justify-center flex-shrink-0">
                    {store.logo_url ? (
                      <img
                        src={store.logo_url}
                        alt={store.business_name}
                        className="w-full h-full object-cover rounded-2xl"
                      />
                    ) : (
                      <ShoppingBag className="w-8 h-8 text-green-600" />
                    )}
                  </div>

                  {/* Store Info */}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <h3 className="font-bold text-lg leading-tight mb-1">
                          {store.business_name}
                        </h3>
                        <p className="text-sm text-muted-foreground mb-2">
                          {store.business_type}
                        </p>
                        
                        {/* Rating and delivery time */}
                        <div className="flex items-center gap-4 mb-2">
                          <div className="flex items-center gap-1">
                            <Star className="w-4 h-4 fill-yellow-400 text-yellow-400" />
                            <span className="text-sm font-medium">{store.rating}</span>
                          </div>
                          
                          <div className="flex items-center gap-1">
                            <Clock className="w-4 h-4 text-muted-foreground" />
                            <span className="text-sm text-muted-foreground">
                              {store.delivery_time_min}-{store.delivery_time_max} {language === 'ar' ? 'د' : 'min'}
                            </span>
                          </div>
                        </div>

                        {/* Order info */}
                        <div className="flex items-center justify-between">
                          <div className="text-sm text-muted-foreground">
                            {language === 'ar' ? 'أقل طلب:' : 'Min order:'} {store.minimum_order.toLocaleString()} RWF
                          </div>
                          <div className="text-sm text-muted-foreground">
                            {language === 'ar' ? 'التوصيل:' : 'Delivery:'} {store.delivery_fee.toLocaleString()} RWF
                          </div>
                        </div>
                      </div>

                      <div className="flex items-center gap-2">
                        {store.is_featured && (
                          <Badge className="bg-gradient-to-r from-green-400 to-blue-500 text-white">
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

export default GroceryListings;