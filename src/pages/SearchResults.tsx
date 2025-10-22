import { useState, useEffect } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import { Search, Filter, ArrowLeft, MapPin, Star, Clock } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { supabase } from '@/integrations/supabase/client';
import { useLanguage } from '@/lib/language';
import { useToast } from '@/hooks/use-toast';

interface SearchResult {
  id: string;
  type: 'restaurant' | 'product';
  name: string;
  description?: string;
  image_url?: string;
  rating?: number;
  delivery_time?: string;
  price?: number;
  supplier?: {
    business_name: string;
    delivery_fee: number;
  };
}

const SearchResults = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const { language } = useLanguage();
  const { toast } = useToast();
  
  const [searchQuery, setSearchQuery] = useState(searchParams.get('q') || '');
  const [results, setResults] = useState<SearchResult[]>([]);
  const [loading, setLoading] = useState(false);
  const [selectedFilter, setSelectedFilter] = useState('all');

  const filters = [
    { id: 'all', label: language === 'ar' ? 'الكل' : 'All' },
    { id: 'restaurants', label: language === 'ar' ? 'المطاعم' : 'Restaurants' },
    { id: 'food', label: language === 'ar' ? 'الطعام' : 'Food' },
  ];

  const performSearch = async (query: string) => {
    if (!query.trim()) return;
    
    setLoading(true);
    try {
      const searchResults: SearchResult[] = [];

      // Search restaurants
      if (selectedFilter === 'all' || selectedFilter === 'restaurants') {
        const { data: suppliers, error: suppliersError } = await supabase
          .from('suppliers')
          .select('id, business_name, description, logo_url, rating, delivery_fee, delivery_time_min, delivery_time_max')
          .ilike('business_name', `%${query}%`)
          .eq('is_active', true)
          .limit(10);

        if (suppliersError) {
          console.error('Error searching suppliers:', suppliersError);
        } else {
          suppliers?.forEach(supplier => {
            searchResults.push({
              id: supplier.id,
              type: 'restaurant',
              name: supplier.business_name,
              description: supplier.description || '',
              image_url: supplier.logo_url || undefined,
              rating: supplier.rating || 0,
              delivery_time: `${supplier.delivery_time_min}-${supplier.delivery_time_max} min`,
              supplier: {
                business_name: supplier.business_name,
                delivery_fee: supplier.delivery_fee || 0
              }
            });
          });
        }
      }

      // Search products/dishes
      if (selectedFilter === 'all' || selectedFilter === 'food') {
        const { data: products, error: productsError } = await supabase
          .from('products')
          .select(`
            id, name, name_en, description, description_en, price, discounted_price, image_url,
            suppliers!inner(id, business_name, delivery_fee, rating)
          `)
          .or(`name.ilike.%${query}%,name_en.ilike.%${query}%,description.ilike.%${query}%,description_en.ilike.%${query}%`)
          .eq('is_available', true)
          .limit(20);

        if (productsError) {
          console.error('Error searching products:', productsError);
        } else {
          products?.forEach(product => {
            const supplier = product.suppliers as any;
            searchResults.push({
              id: product.id,
              type: 'product',
              name: language === 'ar' ? product.name : product.name_en,
              description: language === 'ar' ? product.description : product.description_en || '',
              image_url: product.image_url || undefined,
              price: product.discounted_price || product.price,
              supplier: {
                business_name: supplier.business_name,
                delivery_fee: supplier.delivery_fee || 0
              }
            });
          });
        }
      }

      setResults(searchResults);
    } catch (error) {
      console.error('Search error:', error);
      toast({
        title: language === 'ar' ? 'خطأ في البحث' : 'Search Error',
        description: language === 'ar' ? 'حدث خطأ أثناء البحث' : 'An error occurred while searching',
        variant: 'destructive'
      });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    const query = searchParams.get('q');
    if (query) {
      setSearchQuery(query);
      performSearch(query);
    }
  }, [searchParams, selectedFilter]);

  const handleSearch = () => {
    if (searchQuery.trim()) {
      navigate(`/search?q=${encodeURIComponent(searchQuery.trim())}`);
    }
  };

  const handleResultClick = (result: SearchResult) => {
    if (result.type === 'restaurant') {
      navigate(`/restaurant/${result.id}`);
    } else {
      navigate(`/restaurant/${result.supplier?.business_name}?product=${result.id}`);
    }
  };

  return (
    <div className="min-h-screen bg-background pt-20 pb-24" dir={language === 'ar' ? 'rtl' : 'ltr'}>
      {/* Header */}
      <div className="sticky top-16 z-40 bg-background/95 backdrop-blur-sm border-b">
        <div className="px-4 py-4">
          <div className="flex items-center gap-4 mb-4">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => navigate(-1)}
              className="p-2"
            >
              <ArrowLeft className="h-5 w-5" />
            </Button>
            <h1 className="text-xl font-bold flex-1">
              {language === 'ar' ? 'نتائج البحث' : 'Search Results'}
            </h1>
          </div>

          {/* Search bar */}
          <div className="flex gap-2">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
              <Input
                placeholder={language === 'ar' ? 'ابحث عن مطعم أو طبق...' : 'Search restaurant or dish...'}
                className="pl-10"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                onKeyPress={(e) => e.key === 'Enter' && handleSearch()}
              />
            </div>
            <Button onClick={handleSearch} disabled={loading}>
              <Search className="h-4 w-4" />
            </Button>
          </div>

          {/* Filters */}
          <div className="flex gap-2 mt-4">
            {filters.map((filter) => (
              <Button
                key={filter.id}
                variant={selectedFilter === filter.id ? 'default' : 'outline'}
                size="sm"
                onClick={() => setSelectedFilter(filter.id)}
              >
                {filter.label}
              </Button>
            ))}
          </div>
        </div>
      </div>

      {/* Results */}
      <div className="px-4 py-6">
        {loading ? (
          <div className="text-center py-8">
            <div className="h-8 w-8 animate-spin rounded-full border-b-2 border-primary mx-auto mb-4"></div>
            <p className="text-muted-foreground">
              {language === 'ar' ? 'جاري البحث...' : 'Searching...'}
            </p>
          </div>
        ) : results.length > 0 ? (
          <div className="space-y-4">
            <p className="text-sm text-muted-foreground">
              {language === 'ar' ? `${results.length} نتيجة لـ "${searchQuery}"` : `${results.length} results for "${searchQuery}"`}
            </p>
            
            {results.map((result) => (
              <Card 
                key={`${result.type}-${result.id}`}
                className="cursor-pointer hover:shadow-md transition-shadow"
                onClick={() => handleResultClick(result)}
              >
                <CardContent className="p-4">
                  <div className="flex gap-4">
                    {result.image_url && (
                      <img
                        src={result.image_url}
                        alt={result.name}
                        className="w-16 h-16 rounded-lg object-cover"
                      />
                    )}
                    <div className="flex-1">
                      <div className="flex items-start justify-between">
                        <div>
                          <h3 className="font-semibold">{result.name}</h3>
                          <p className="text-sm text-muted-foreground line-clamp-2">
                            {result.description}
                          </p>
                          {result.supplier && (
                            <p className="text-xs text-muted-foreground mt-1">
                              {result.supplier.business_name}
                            </p>
                          )}
                        </div>
                        <Badge variant={result.type === 'restaurant' ? 'default' : 'secondary'}>
                          {result.type === 'restaurant' ? 
                            (language === 'ar' ? 'مطعم' : 'Restaurant') : 
                            (language === 'ar' ? 'طبق' : 'Dish')
                          }
                        </Badge>
                      </div>
                      
                      <div className="flex items-center gap-4 mt-2 text-xs text-muted-foreground">
                        {result.rating && (
                          <div className="flex items-center gap-1">
                            <Star className="h-3 w-3 fill-yellow-400 text-yellow-400" />
                            <span>{result.rating}</span>
                          </div>
                        )}
                        {result.delivery_time && (
                          <div className="flex items-center gap-1">
                            <Clock className="h-3 w-3" />
                            <span>{result.delivery_time}</span>
                          </div>
                        )}
                        {result.price && (
                          <div className="font-semibold text-primary">
                            {result.price} RWF
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        ) : searchQuery ? (
          <div className="text-center py-12">
            <Search className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
            <h3 className="text-lg font-semibold mb-2">
              {language === 'ar' ? 'لا توجد نتائج' : 'No results found'}
            </h3>
            <p className="text-muted-foreground">
              {language === 'ar' ? 'جرب البحث بكلمات مختلفة' : 'Try searching with different keywords'}
            </p>
          </div>
        ) : null}
      </div>
    </div>
  );
};

export default SearchResults;