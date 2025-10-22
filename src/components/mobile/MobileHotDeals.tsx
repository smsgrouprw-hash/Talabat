import { useState, useEffect } from "react";
import { useLanguage } from "@/lib/language";
import { Link } from "react-router-dom";
import { Badge } from "@/components/ui/badge";
import { Star, Clock } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";

interface Product {
  id: string;
  name: string;
  name_ar: string;
  price: number;
  discounted_price: number | null;
  image_url: string;
  supplier_id: string;
  suppliers: {
    id: string;
    business_name: string;
    business_name_ar: string;
    rating: number;
    delivery_time_min: number;
    delivery_time_max: number;
  };
}

export const MobileHotDeals = () => {
  const { language } = useLanguage();
  const [hotDeals, setHotDeals] = useState<Product[]>([]);

  useEffect(() => {
    fetchHotDeals();
  }, []);

  const fetchHotDeals = async () => {
    try {
      const { data, error } = await supabase
        .from('products')
        .select(`
          id,
          name,
          name_ar,
          price,
          discounted_price,
          image_url,
          supplier_id,
          suppliers (
            id,
            business_name,
            business_name_ar,
            rating,
            delivery_time_min,
            delivery_time_max
          )
        `)
        .eq('is_available', true)
        .eq('is_hot_deal', true)
        .not('discounted_price', 'is', null)
        .order('discounted_price', { ascending: true })
        .limit(10);

      if (error) throw error;
      setHotDeals(data || []);
    } catch (error) {
      console.error('Error fetching hot deals:', error);
    }
  };

  if (hotDeals.length === 0) {
    return null;
  }

  return (
    <div className="py-6 bg-muted/30" dir={language === 'ar' ? 'rtl' : 'ltr'}>
      <div className={`px-4 mb-4 flex justify-between items-center ${language === 'ar' ? 'flex-row-reverse' : ''}`}>
        <Link to="/restaurants" className="text-sm text-primary font-semibold">
          {language === 'ar' ? 'عرض الكل' : 'View All'}
        </Link>
        <h2 className="text-xl font-bold text-foreground">
          {language === 'ar' ? '🔥 عروض ساخنة' : '🔥 Hot Deals'}
        </h2>
      </div>
      <div className="w-full overflow-x-auto overflow-y-hidden [-webkit-overflow-scrolling:touch] [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
        <div className={`flex gap-4 px-4 pb-2 ${language === 'ar' ? 'flex-row-reverse' : ''}`} style={{ width: 'max-content' }}>
          {hotDeals.map((deal) => {
            const supplier = deal.suppliers;
            const discount = deal.discounted_price 
              ? Math.round(((deal.price - deal.discounted_price) / deal.price) * 100)
              : 0;

            return (
              <Link
                key={deal.id}
                to={`/customer-supplier-detail/${deal.supplier_id}`}
                className="w-[280px] max-w-[320px] flex-shrink-0 bg-card rounded-2xl shadow-md overflow-hidden group hover:shadow-lg transition-all"
              >
                <div className="relative h-36">
                  <img 
                    src={deal.image_url || "https://images.unsplash.com/photo-1546069901-ba9599a7e63c?w=400&auto=format&fit=crop"} 
                    alt={language === 'ar' && deal.name_ar ? deal.name_ar : deal.name}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                  />
                  {discount > 0 && (
                    <Badge className="absolute top-3 left-3 bg-red-500 text-white font-bold border-0 shadow-lg">
                      {discount}% {language === 'ar' ? 'خصم' : 'OFF'}
                    </Badge>
                  )}
                </div>
                <div className="p-4">
                  <h3 className="font-bold text-foreground mb-1 line-clamp-1">
                    {language === 'ar' && deal.name_ar ? deal.name_ar : deal.name}
                  </h3>
                  <p className="text-sm text-muted-foreground mb-2 line-clamp-1">
                    {language === 'ar' && supplier.business_name_ar ? supplier.business_name_ar : supplier.business_name}
                  </p>
                  <div className="flex items-center justify-between mb-2">
                    <div className="flex items-center gap-1">
                      <Star className="w-4 h-4 fill-yellow-400 text-yellow-400" />
                      <span className="text-sm font-semibold">{supplier.rating || 4.5}</span>
                    </div>
                    <div className="flex items-center gap-1 text-muted-foreground">
                      <Clock className="w-4 h-4" />
                      <span className="text-sm">
                        {supplier.delivery_time_min}-{supplier.delivery_time_max} {language === 'ar' ? 'دقيقة' : 'min'}
                      </span>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="text-lg font-bold text-primary">
                      {(deal.discounted_price || deal.price).toLocaleString()} {language === 'ar' ? 'فرنك' : 'RWF'}
                    </span>
                    {deal.discounted_price && (
                      <span className="text-sm text-muted-foreground line-through">
                        {deal.price.toLocaleString()}
                      </span>
                    )}
                  </div>
                </div>
              </Link>
            );
          })}
        </div>
      </div>
    </div>
  );
};
