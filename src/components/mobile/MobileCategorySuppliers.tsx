import { useLanguage } from "@/lib/language";
import { Link } from "react-router-dom";
import { Star, Clock } from "lucide-react";
import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";

interface Supplier {
  id: string;
  business_name: string;
  business_type: string | null;
  logo_url: string | null;
  rating: number;
  delivery_time_min: number;
  delivery_time_max: number;
  delivery_fee: number;
}

interface CategoryGroup {
  category: string;
  suppliers: Supplier[];
}

export const MobileCategorySuppliers = () => {
  const { language } = useLanguage();
  const [categoryGroups, setCategoryGroups] = useState<CategoryGroup[]>([]);
  const [restaurantCategoryId, setRestaurantCategoryId] = useState<string | null>(null);

  useEffect(() => {
    const fetchRestaurantCategory = async () => {
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
        .select('id, business_name, business_type, logo_url, rating, delivery_time_min, delivery_time_max, delivery_fee')
        .eq('is_active', true)
        .eq('is_verified', true)
        .neq('business_type', restaurantCategoryId)
        .order('rating', { ascending: false })
        .limit(10);

      if (data && !error) {
        // Group suppliers by business_type
        const grouped = data.reduce((acc: { [key: string]: Supplier[] }, supplier) => {
          const category = supplier.business_type || 'other';
          if (!acc[category]) {
            acc[category] = [];
          }
          acc[category].push(supplier);
          return acc;
        }, {});

        // Convert to array and filter out categories with less than 2 suppliers
        const groupedArray = Object.entries(grouped)
          .filter(([_, suppliers]) => suppliers.length >= 2)
          .map(([category, suppliers]) => ({
            category,
            suppliers: suppliers.slice(0, 10) // Limit to 10 per category
          }));

        setCategoryGroups(groupedArray);
      }
    };

    fetchSuppliers();
  }, [restaurantCategoryId]);

  const getCategoryDisplayName = (category: string) => {
    const categoryNames: { [key: string]: { ar: string; en: string } } = {
      restaurant: { ar: 'مطاعم', en: 'Restaurants' },
      grocery: { ar: 'بقالة', en: 'Grocery' },
      pharmacy: { ar: 'صيدليات', en: 'Pharmacies' },
      bakery: { ar: 'مخابز', en: 'Bakeries' },
      cafe: { ar: 'مقاهي', en: 'Cafes' },
      other: { ar: 'أخرى', en: 'Other' }
    };

    return categoryNames[category]?.[language] || category;
  };

  if (categoryGroups.length === 0) {
    return null;
  }

  return (
    <>
      {categoryGroups.map(({ category, suppliers }) => (
        <div key={category} className="py-6 bg-muted/10" dir={language === 'ar' ? 'rtl' : 'ltr'}>
          <div className={`px-4 mb-4 flex justify-between items-center ${language === 'ar' ? 'flex-row-reverse' : ''}`}>
            <h2 className="text-xl font-bold text-foreground">
              {getCategoryDisplayName(category)}
            </h2>
            <Link to={`/restaurants?category=${category}`} className="text-sm text-primary font-semibold">
              {language === 'ar' ? 'عرض الكل' : 'View All'}
            </Link>
          </div>
          <div className="w-full overflow-x-auto overflow-y-hidden [-webkit-overflow-scrolling:touch] [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
            <div className={`flex gap-4 px-4 pb-2 ${language === 'ar' ? 'flex-row-reverse' : ''}`} style={{ width: 'max-content' }}>
              {suppliers.map((supplier) => (
                <Link
                  key={supplier.id}
                  to={`/customer-supplier-detail/${supplier.id}`}
                  className="w-[280px] max-w-[320px] flex-shrink-0 bg-card rounded-xl shadow-sm overflow-hidden group hover:shadow-md transition-all"
                >
                  <div className="relative h-32">
                    <img 
                      src={supplier.logo_url || "https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?w=400&auto=format&fit=crop"} 
                      alt={supplier.business_name}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                    />
                    <div className="absolute top-2 right-2 bg-card/95 backdrop-blur-sm rounded-full px-2 py-0.5 flex items-center gap-1">
                      <Star className="w-3 h-3 fill-yellow-400 text-yellow-400" />
                      <span className="text-xs font-semibold">{supplier.rating || 0}</span>
                    </div>
                  </div>
                  <div className="p-3">
                    <h3 className="font-bold text-sm text-foreground mb-1 line-clamp-1">
                      {supplier.business_name}
                    </h3>
                    <p className="text-xs text-muted-foreground mb-2 line-clamp-1">
                      {supplier.business_type || (language === 'ar' ? 'محل' : 'Business')}
                    </p>
                    <div className="flex items-center justify-between text-xs">
                      <div className="flex items-center gap-1 text-muted-foreground">
                        <Clock className="w-3 h-3" />
                        <span>{supplier.delivery_time_min}-{supplier.delivery_time_max}</span>
                      </div>
                      <span className="font-semibold text-primary">
                        {(supplier.delivery_fee || 0).toLocaleString()} {language === 'ar' ? 'فرنك' : 'RWF'}
                      </span>
                    </div>
                  </div>
                </Link>
              ))}
            </div>
          </div>
        </div>
      ))}
    </>
  );
};
