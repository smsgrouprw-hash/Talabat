import { useLanguage } from "@/lib/language";
import { ShoppingBag, Search, SlidersHorizontal } from "lucide-react";
import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { ListingCard } from "@/components/delala/ListingCard";
import { ListingFilters } from "@/components/delala/ListingFilters";
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from "@/components/ui/sheet";
import { LoadingState } from "@/components/ui/loading-spinner";
import { EmptyState } from "@/components/ui/empty-state";

interface FilterState {
  categories: string[];
  priceRange: [number, number];
  conditions: string[];
  cities: string[];
  postedWithin: string;
  deliveryAvailable: boolean;
  negotiableOnly: boolean;
}

export default function Delala() {
  const { language } = useLanguage();
  const [listings, setListings] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [sortBy, setSortBy] = useState("newest");
  const [maxPrice, setMaxPrice] = useState(1000000);
  const [filters, setFilters] = useState<FilterState>({
    categories: [],
    priceRange: [0, 1000000],
    conditions: [],
    cities: [],
    postedWithin: "all",
    deliveryAvailable: false,
    negotiableOnly: false,
  });

  // Fetch max price once on mount
  useEffect(() => {
    fetchMaxPrice();
  }, []);

  // Fetch listings when filters/search/sort change
  useEffect(() => {
    fetchListings();
  }, [
    filters.categories,
    filters.priceRange,
    filters.conditions,
    filters.cities,
    filters.postedWithin,
    filters.deliveryAvailable,
    filters.negotiableOnly,
    sortBy,
    searchQuery,
  ]);

  const fetchMaxPrice = async () => {
    const { data } = await supabase
      .from("delala_listings" as any)
      .select("price")
      .order("price", { ascending: false })
      .limit(1)
      .single();

    if (!data || typeof data !== "object") return;
    const dataObj = data as Record<string, any>;
    if ("price" in dataObj) {
      const price = dataObj.price as number;
      if (price) {
        setMaxPrice(Math.ceil(price / 10000) * 10000);
        // Don't update filters here - prevents infinite loop
      }
    }
  };

  const fetchListings = async () => {
    setLoading(true);
    try {
      let query = supabase
        .from("delala_listings" as any)
        .select("*")
        .eq("status", "active")
        .eq("is_approved", true)
        .gt("expires_at", new Date().toISOString());

      // Apply search
      if (searchQuery) {
        query = query.or(
          `title_ar.ilike.%${searchQuery}%,title_en.ilike.%${searchQuery}%,description_ar.ilike.%${searchQuery}%,description_en.ilike.%${searchQuery}%`,
        );
      }

      // Apply category filter
      if (filters.categories.length > 0) {
        query = query.in("category", filters.categories);
      }

      // Apply price range filter
      query = query.gte("price", filters.priceRange[0]).lte("price", filters.priceRange[1]);

      // Apply condition filter
      if (filters.conditions.length > 0) {
        query = query.in("condition", filters.conditions);
      }

      // Apply city filter
      if (filters.cities.length > 0) {
        query = query.in("location_city", filters.cities);
      }

      // Apply posted within filter
      if (filters.postedWithin !== "all") {
        const now = new Date();
        let dateFrom = new Date();

        if (filters.postedWithin === "today") {
          dateFrom.setHours(0, 0, 0, 0);
        } else if (filters.postedWithin === "week") {
          dateFrom.setDate(now.getDate() - 7);
        } else if (filters.postedWithin === "month") {
          dateFrom.setMonth(now.getMonth() - 1);
        }

        query = query.gte("created_at", dateFrom.toISOString());
      }

      // Apply delivery filter
      if (filters.deliveryAvailable) {
        query = query.eq("is_delivery_available", true);
      }

      // Apply negotiable filter
      if (filters.negotiableOnly) {
        query = query.eq("is_negotiable", true);
      }

      // Apply sorting
      if (sortBy === "newest") {
        query = query.order("created_at", { ascending: false });
      } else if (sortBy === "oldest") {
        query = query.order("created_at", { ascending: true });
      } else if (sortBy === "price_low") {
        query = query.order("price", { ascending: true });
      } else if (sortBy === "price_high") {
        query = query.order("price", { ascending: false });
      }

      const { data, error } = await query;

      if (error) throw error;
      setListings(data || []);
    } catch (error) {
      console.error("Error fetching listings:", error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-background pb-24">
      <div className="container mx-auto px-3 sm:px-4 py-4 md:py-6" dir={language === "ar" ? "rtl" : "ltr"}>
        {/* Header - Centered */}
        <div className="flex items-center justify-center gap-2 mb-4 md:mb-6">
          <ShoppingBag className="h-6 w-6 md:h-7 md:w-7 text-primary" />
          <h1 className="text-xl md:text-2xl lg:text-3xl font-bold">
            {language === "ar" ? "دلالة - السوق المحلي" : "Delala - Marketplace"}
          </h1>
        </div>

        {/* Search and Sort */}
        <div className="flex gap-2 mb-4 md:mb-6">
          <div className="relative flex-1 min-w-0">
            <div
              className={`absolute top-1/2 -translate-y-1/2 flex items-center pointer-events-none ${language === "ar" ? "right-3" : "left-3"}`}
            >
              <Search className="h-4 w-4 text-muted-foreground" />
            </div>
            <Input
              placeholder={language === "ar" ? "ابحث عن منتجات..." : "Search for products..."}
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className={`h-10 text-sm md:text-base ${language === "ar" ? "pr-10 pl-3 text-right" : "pl-10 pr-3"}`}
              dir={language === "ar" ? "rtl" : "ltr"}
            />
          </div>

          {/* Sort Dropdown - Hidden on mobile */}
          <Select value={sortBy} onValueChange={setSortBy}>
            <SelectTrigger className="w-[180px] h-10 hidden md:flex shrink-0 text-sm">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="newest">{language === "ar" ? "الأحدث أولاً" : "Newest First"}</SelectItem>
              <SelectItem value="oldest">{language === "ar" ? "الأقدم أولاً" : "Oldest First"}</SelectItem>
              <SelectItem value="price_low">{language === "ar" ? "السعر: من الأدنى" : "Price: Low to High"}</SelectItem>
              <SelectItem value="price_high">
                {language === "ar" ? "السعر: من الأعلى" : "Price: High to Low"}
              </SelectItem>
            </SelectContent>
          </Select>

          {/* Sort Dropdown - Mobile version */}
          <Select value={sortBy} onValueChange={setSortBy}>
            <SelectTrigger className="w-[110px] h-10 md:hidden shrink-0 text-xs">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="newest">{language === "ar" ? "الأحدث أولاً" : "Newest First"}</SelectItem>
              <SelectItem value="oldest">{language === "ar" ? "الأقدم أولاً" : "Oldest First"}</SelectItem>
              <SelectItem value="price_low">{language === "ar" ? "السعر: من الأدنى" : "Price: Low to High"}</SelectItem>
              <SelectItem value="price_high">
                {language === "ar" ? "السعر: من الأعلى" : "Price: High to Low"}
              </SelectItem>
            </SelectContent>
          </Select>

          {/* Filter Button - Mobile only */}
          <Sheet>
            <SheetTrigger asChild>
              <Button variant="outline" size="icon" className="md:hidden shrink-0 h-10 w-10">
                <SlidersHorizontal className="h-4 w-4" />
              </Button>
            </SheetTrigger>
            <SheetContent side={language === "ar" ? "right" : "left"} className="overflow-y-auto">
              <SheetHeader>
                <SheetTitle>{language === "ar" ? "تصفية النتائج" : "Filters"}</SheetTitle>
              </SheetHeader>
              <div className="mt-4">
                <ListingFilters filters={filters} onFilterChange={setFilters} maxPrice={maxPrice} />
              </div>
            </SheetContent>
          </Sheet>
        </div>

        {/* Main Content */}
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-4 md:gap-6">
          {/* Desktop Filters Sidebar */}
          <div className="hidden lg:block">
            <ListingFilters filters={filters} onFilterChange={setFilters} maxPrice={maxPrice} />
          </div>

          {/* Listings Grid - More products per row */}
          <div className="lg:col-span-3">
            {loading ? (
              <LoadingState message={language === "ar" ? "جاري التحميل..." : "Loading..."} />
            ) : listings.length === 0 ? (
              <EmptyState
                icon={ShoppingBag}
                title={language === "ar" ? "لا توجد نتائج" : "No Results Found"}
                description={
                  language === "ar"
                    ? "لم نتمكن من العثور على أي إعلانات تطابق معايير البحث"
                    : "We couldn't find any listings matching your search criteria"
                }
              />
            ) : (
              <div className="grid grid-cols-2 md:grid-cols-3 xl:grid-cols-4 gap-2.5 sm:gap-3 md:gap-4">
                {listings.map((listing) => (
                  <ListingCard
                    key={listing.id}
                    id={listing.id}
                    images={listing.images}
                    titleAr={listing.title_ar}
                    titleEn={listing.title_en}
                    price={listing.price}
                    currency={listing.currency}
                    isNegotiable={listing.is_negotiable}
                    condition={listing.condition}
                    locationCity={listing.location_city}
                    createdAt={listing.created_at}
                    userId={listing.user_id}
                  />
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
