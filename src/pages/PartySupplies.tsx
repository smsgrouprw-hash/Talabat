import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { LoadingSpinner } from '@/components/ui/loading-spinner';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Star, Clock, PartyPopper, ArrowRight } from 'lucide-react';
import { useLanguage } from '@/lib/language';

interface PartySupplier {
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

const PartySupplies = () => {
  const [suppliers, setSuppliers] = useState<PartySupplier[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const { language } = useLanguage();

  const arabicSuppliers = [
    { name: 'فوبا للحفلات', type: 'تنظيم حفلات', rating: 4.9 },
    { name: 'بالونات المرح', type: 'ديكور وبالونات', rating: 4.7 },
    { name: 'حفلة أحلام', type: 'خدمات حفلات', rating: 4.8 },
    { name: 'الاحتفال الذهبي', type: 'تجهيز حفلات', rating: 4.6 },
    { name: 'عالم المرح', type: 'ألعاب وترفيه', rating: 4.5 },
    { name: 'ديكور الأناقة', type: 'ديكور حفلات', rating: 4.8 },
    { name: 'كيك وحلويات الحفلات', type: 'كعك وحلويات', rating: 4.9 },
    { name: 'صوت ونور', type: 'صوتيات وإضاءة', rating: 4.4 }
  ];

  useEffect(() => {
    fetchSuppliers();
  }, []);

  const fetchSuppliers = async () => {
    try {
      const { data, error } = await supabase
        .from('suppliers')
        .select('*')
        .eq('is_active', true)
        .in('business_type', ['party_supplies', 'events', 'catering'])
        .order('is_featured', { ascending: false })
        .order('rating', { ascending: false });

      if (error) throw error;

      // Mix real data with Arabic names
      const enhancedData = (data || []).map((supplier, index) => ({
        ...supplier,
        business_name: language === 'ar' && arabicSuppliers[index] 
          ? arabicSuppliers[index].name 
          : supplier.business_name,
        business_type: language === 'ar' && arabicSuppliers[index]
          ? arabicSuppliers[index].type
          : supplier.business_type || 'خدمات حفلات',
        rating: arabicSuppliers[index]?.rating || supplier.rating || 4.6,
        delivery_time_min: supplier.delivery_time_min || 30,
        delivery_time_max: supplier.delivery_time_max || 120,
        minimum_order: supplier.minimum_order || 25000,
        delivery_fee: supplier.delivery_fee || 3000
      }));

      setSuppliers(enhancedData);
    } catch (error) {
      console.error('Error fetching suppliers:', error);
    } finally {
      setLoading(false);
    }
  };

  const filteredSuppliers = suppliers.filter(supplier =>
    supplier.business_name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    supplier.business_type.toLowerCase().includes(searchQuery.toLowerCase())
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
            {language === 'ar' ? 'حفلة فوبا' : 'Party Supplies'}
          </h1>
          <Link to="/">
            <Button variant="ghost" size="sm">
              {language === 'ar' ? 'العودة' : 'Back'}
            </Button>
          </Link>
        </div>
        
        {/* Search */}
        <Input
          placeholder={language === 'ar' ? 'ابحث عن خدمات الحفلات...' : 'Search party services...'}
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="glass-input"
        />
      </div>

      {/* Supplier Grid */}
      <div className="px-4 pb-24 space-y-4">
        {filteredSuppliers.length === 0 ? (
          <Card className="glass-card p-8 text-center">
            <p className="text-muted-foreground">
              {language === 'ar' ? 'لا توجد خدمات حفلات متاحة' : 'No party services available'}
            </p>
          </Card>
        ) : (
          filteredSuppliers.map((supplier) => (
            <Link key={supplier.id} to={`/party/${supplier.id}`}>
              <Card className="glass-card hover:shadow-float transition-all duration-300 hover:scale-[1.02] overflow-hidden">
                <div className="flex gap-4 p-4">
                  {/* Supplier Image */}
                  <div className="w-20 h-20 rounded-2xl bg-gradient-to-br from-purple-400/20 to-pink-500/20 flex items-center justify-center flex-shrink-0">
                    {supplier.logo_url ? (
                      <img
                        src={supplier.logo_url}
                        alt={supplier.business_name}
                        className="w-full h-full object-cover rounded-2xl"
                      />
                    ) : (
                      <PartyPopper className="w-8 h-8 text-purple-600" />
                    )}
                  </div>

                  {/* Supplier Info */}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <h3 className="font-bold text-lg leading-tight mb-1">
                          {supplier.business_name}
                        </h3>
                        <p className="text-sm text-muted-foreground mb-2">
                          {supplier.business_type}
                        </p>
                        
                        {/* Rating and delivery time */}
                        <div className="flex items-center gap-4 mb-2">
                          <div className="flex items-center gap-1">
                            <Star className="w-4 h-4 fill-yellow-400 text-yellow-400" />
                            <span className="text-sm font-medium">{supplier.rating}</span>
                          </div>
                          
                          <div className="flex items-center gap-1">
                            <Clock className="w-4 h-4 text-muted-foreground" />
                            <span className="text-sm text-muted-foreground">
                              {supplier.delivery_time_min}-{supplier.delivery_time_max} {language === 'ar' ? 'د' : 'min'}
                            </span>
                          </div>
                        </div>

                        {/* Order info */}
                        <div className="flex items-center justify-between">
                          <div className="text-sm text-muted-foreground">
                            {language === 'ar' ? 'أقل طلب:' : 'Min order:'} {supplier.minimum_order.toLocaleString()} RWF
                          </div>
                          <div className="text-sm text-muted-foreground">
                            {language === 'ar' ? 'التوصيل:' : 'Delivery:'} {supplier.delivery_fee.toLocaleString()} RWF
                          </div>
                        </div>
                      </div>

                      <div className="flex items-center gap-2">
                        {supplier.is_featured && (
                          <Badge className="bg-gradient-to-r from-purple-400 to-pink-500 text-white">
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

export default PartySupplies;