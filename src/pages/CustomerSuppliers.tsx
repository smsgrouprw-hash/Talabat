import { useState, useEffect } from "react";
import { useSearchParams } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { SupplierCard } from "@/components/customer/SupplierCard";
import { LoadingState } from "@/components/ui/loading-spinner";
import { EmptyState } from "@/components/ui/empty-state";
import { Search, MapPin } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { useLanguage } from "@/lib/language";

interface Supplier {
  id: string;
  business_name: string;
  business_type?: string;
  cuisine_type?: string;
  description?: string;
  city: string;
  rating?: number;
  total_reviews?: number;
  delivery_time_min?: number;
  delivery_time_max?: number;
  delivery_fee?: number;
  delivery_radius_km?: number;
  minimum_order?: number;
  logo_url?: string;
  cover_image_url?: string;
  is_featured: boolean;
  is_verified: boolean;
  is_active: boolean;
  business_hours?: any;
  created_at: string;
  updated_at: string;
}

export default function CustomerSuppliers() {
  const [searchParams] = useSearchParams();
  const categoryId = searchParams.get('category');
  const [suppliers, setSuppliers] = useState<Supplier[]>([]);
  const [filteredSuppliers, setFilteredSuppliers] = useState<Supplier[]>([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [loading, setLoading] = useState(true);
  const [categoryName, setCategoryName] = useState({ en: "", ar: "" });
  const { toast } = useToast();
  const { language } = useLanguage();

  useEffect(() => {
    fetchSuppliers();
    if (categoryId) {
      fetchCategoryName();
    }
  }, [categoryId]);

  useEffect(() => {
    filterSuppliers();
  }, [suppliers, searchTerm]);

  const fetchCategoryName = async () => {
    if (!categoryId) return;
    
    const { data } = await supabase
      .from('categories')
      .select('name_en, name_ar')
      .eq('id', categoryId)
      .maybeSingle();
    
    if (data) {
      setCategoryName({ en: data.name_en, ar: data.name_ar || data.name_en });
    }
  };

  const fetchSuppliers = async () => {
    try {
      let query = supabase
        .from('suppliers')
        .select(`
          id,
          business_name,
          business_name_ar,
          business_type,
          cuisine_type,
          description,
          description_ar,
          city,
          rating,
          total_reviews,
          delivery_time_min,
          delivery_time_max,
          minimum_order,
          delivery_fee,
          delivery_radius_km,
          logo_url,
          cover_image_url,
          is_featured,
          is_verified,
          is_active,
          business_hours,
          created_at,
          updated_at
        `)
        .eq('is_active', true)
        .eq('is_verified', true);

      // Filter by category if provided
      if (categoryId) {
        query = query.eq('business_type', categoryId);
      }

      const { data, error } = await query
        .order('is_featured', { ascending: false })
        .order('rating', { ascending: false });

      if (error) throw error;

      setSuppliers(data || []);
    } catch (error) {
      console.error("Error fetching suppliers:", error);
      toast({
        title: language === 'ar' ? 'خطأ' : "Error",
        description: language === 'ar' ? 'فشل في جلب الموردين' : "Failed to fetch suppliers",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const filterSuppliers = () => {
    if (!searchTerm) {
      setFilteredSuppliers(suppliers);
      return;
    }

    const filtered = suppliers.filter(supplier =>
      supplier.business_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      supplier.cuisine_type?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      supplier.city.toLowerCase().includes(searchTerm.toLowerCase()) ||
      supplier.description?.toLowerCase().includes(searchTerm.toLowerCase())
    );

    setFilteredSuppliers(filtered);
  };

  if (loading) {
    return (
      <div className="container-responsive py-6">
        <LoadingState message="Loading suppliers..." size="lg" />
      </div>
    );
  }

  const currentCategoryName = language === 'ar' ? categoryName.ar : categoryName.en;

  return (
    <div className="container-responsive py-6 pb-24 space-y-6 fade-in" dir={language === 'ar' ? 'rtl' : 'ltr'}>
      <div className="text-center space-y-2">
        <h1 className="heading-primary text-balance">
          {currentCategoryName 
            ? language === 'ar' ? `موردو ${currentCategoryName}` : `${currentCategoryName} Suppliers`
            : language === 'ar' ? 'ابحث عن المطاعم والموردين' : 'Find Restaurants & Suppliers'
          }
        </h1>
        <p className="text-muted-foreground text-lg">
          {currentCategoryName 
            ? language === 'ar' 
              ? `تصفح مشاريع ${currentCategoryName} بالقرب منك`
              : `Browse ${currentCategoryName.toLowerCase()} businesses near you`
            : language === 'ar' 
              ? 'اكتشف المطاعم وموردي الطعام المحليين بالقرب منك'
              : 'Discover local restaurants and food suppliers near you'
          }
        </p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className={`flex items-center ${language === 'ar' ? 'gap-2 flex-row-reverse' : 'space-x-2'}`}>
            <Search className="h-5 w-5" />
            <span>{language === 'ar' ? 'البحث عن الموردين' : 'Search Suppliers'}</span>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="relative">
            <Search className={`absolute ${language === 'ar' ? 'right-3' : 'left-3'} top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4`} />
            <Input
              placeholder={language === 'ar' ? '...البحث بالاسم أو المطبخ أو الموقع' : 'Search by name, cuisine, or location...'}
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className={`${language === 'ar' ? 'pr-10' : 'pl-10'} touch-target focus-ring`}
            />
          </div>
        </CardContent>
      </Card>

      {filteredSuppliers.length === 0 ? (
        <EmptyState
          icon={MapPin}
          title={language === 'ar' ? 'لم يتم العثور على موردين' : 'No suppliers found'}
          description={searchTerm 
            ? language === 'ar' 
              ? 'حاول تعديل مصطلحات البحث أو تصفح جميع الموردين'
              : 'Try adjusting your search terms or browse all suppliers'
            : language === 'ar'
              ? 'لا يوجد موردون نشطون متاحون حاليًا في منطقتك'
              : 'No active suppliers are currently available in your area'
          }
          action={searchTerm ? {
            label: language === 'ar' ? 'مسح البحث' : 'Clear search',
            onClick: () => setSearchTerm("")
          } : undefined}
        />
      ) : (
        <>
          <div className={`flex items-center justify-between ${language === 'ar' ? 'flex-row-reverse' : ''}`}>
            <h2 className="text-xl font-semibold">
              {searchTerm 
                ? language === 'ar' 
                  ? `نتائج البحث (${filteredSuppliers.length})`
                  : `Search Results (${filteredSuppliers.length})`
                : language === 'ar'
                  ? `جميع الموردين (${filteredSuppliers.length})`
                  : `All Suppliers (${filteredSuppliers.length})`
              }
            </h2>
          </div>

          <div className="grid-responsive">
            {filteredSuppliers.map((supplier) => (
              <SupplierCard key={supplier.id} supplier={supplier} />
            ))}
          </div>
        </>
      )}
    </div>
  );
}