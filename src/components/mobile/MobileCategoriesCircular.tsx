import { useLanguage } from "@/lib/language";
import { Link } from "react-router-dom";
import { UtensilsCrossed, Coffee, ShoppingBasket, Car, Wrench, GraduationCap, Home, Laptop, Library, Store } from "lucide-react";
import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";

const iconMap: Record<string, any> = {
  UtensilsCrossed,
  Coffee,
  ShoppingBasket,
  Car,
  Wrench,
  GraduationCap,
  Home,
  Laptop,
  Library,
  Store
};

const colorMap = [
  "from-orange-400 to-red-400",
  "from-amber-400 to-orange-400",
  "from-green-400 to-emerald-400",
  "from-blue-400 to-cyan-400",
  "from-purple-400 to-pink-400",
  "from-yellow-400 to-amber-400",
  "from-red-500 to-orange-500",
  "from-indigo-400 to-blue-400",
  "from-teal-400 to-green-400"
];

export const MobileCategoriesCircular = () => {
  const { language } = useLanguage();
  const [categories, setCategories] = useState<any[]>([]);

  useEffect(() => {
    const fetchCategories = async () => {
      // Optimized: Get categories with supplier count in one query using aggregation
      const { data: categoriesData, error: categoriesError } = await supabase
        .from('categories')
        .select('id, name_en, name_ar')
        .is('parent_category_id', null)
        .eq('is_active', true)
        .order('sort_order');
      
      if (categoriesError || !categoriesData) return;

      // Batch check all categories at once
      const categoryIds = categoriesData.map(c => c.id);
      const { data: suppliersData } = await supabase
        .from('suppliers')
        .select('business_type')
        .in('business_type', categoryIds)
        .eq('is_active', true)
        .eq('is_verified', true);

      // Count suppliers per category
      const supplierCounts = new Map();
      suppliersData?.forEach(s => {
        if (s.business_type) {
          supplierCounts.set(s.business_type, (supplierCounts.get(s.business_type) || 0) + 1);
        }
      });

      // Filter categories with suppliers
      const categoriesWithSuppliers = categoriesData.filter(c => 
        supplierCounts.get(c.id) > 0
      );
      
      setCategories(categoriesWithSuppliers.slice(0, 9));
    };
    
    fetchCategories();
  }, []);

  const getIcon = (index: number) => {
    const icons = [UtensilsCrossed, Coffee, ShoppingBasket, Car, Wrench, GraduationCap, Home, Laptop, Library];
    return icons[index % icons.length] || Store;
  };

  return (
    <div className="py-6 bg-background w-full" dir={language === 'ar' ? 'rtl' : 'ltr'}>
      <div className="px-4 mb-4">
        <h2 className="text-xl font-bold text-foreground">
          {language === 'ar' ? 'الفئات' : 'Categories'}
        </h2>
      </div>
      <div className="w-full overflow-x-auto overflow-y-hidden [-webkit-overflow-scrolling:touch] [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
        <div className={`flex gap-5 px-4 pb-5 pt-1 ${language === 'ar' ? 'flex-row-reverse' : ''}`} style={{ width: 'max-content' }}>
          {categories.map((category, index) => {
            const Icon = getIcon(index);
            return (
              <Link
                key={category.id}
                to={`/customer-suppliers?category=${category.id}`}
                className="flex flex-col items-center gap-2 w-[90px] flex-shrink-0 group"
              >
                <div className={`w-16 h-16 rounded-full bg-gradient-to-br ${colorMap[index % colorMap.length]} flex items-center justify-center shadow-md group-hover:shadow-lg transition-all group-hover:scale-105`}>
                  <Icon className="w-8 h-8 text-white" strokeWidth={2} />
                </div>
                <span className="text-xs font-medium text-foreground text-center leading-tight">
                  {language === 'ar' ? category.name_ar : category.name_en}
                </span>
              </Link>
            );
          })}
        </div>
      </div>
    </div>
  );
};
