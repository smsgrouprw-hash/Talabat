import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { toast } from '@/hooks/use-toast';
import { Plus, Search, Filter } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';
import { useLanguage } from '@/lib/language';
import { ProductCard } from './ProductCard';
import { ProductForm } from './ProductForm';

export const ProductList: React.FC = () => {
  const { user } = useAuth();
  const { language } = useLanguage();
  const isRTL = language === 'ar';
  const [products, setProducts] = useState<any[]>([]);
  const [categories, setCategories] = useState<any[]>([]);
  const [supplier, setSupplier] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editingProduct, setEditingProduct] = useState<any>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('all');
  const [availabilityFilter, setAvailabilityFilter] = useState('all');

  useEffect(() => {
    if (user) {
      fetchData();
    }
  }, [user]);

  const fetchData = async () => {
    await Promise.all([
      fetchSupplier(),
      fetchCategories()
    ]);
  };

  const fetchSupplier = async () => {
    if (!user) return;

    try {
      const { data, error } = await supabase
        .from('suppliers')
        .select('*')
        .eq('user_id', user.id)
        .maybeSingle();

      if (error) throw error;
      
      if (data) {
        setSupplier(data);
        await fetchProducts(data.id);
      }
    } catch (error) {
      console.error('Error fetching supplier:', error);
      toast({
        title: 'Error',
        description: 'Failed to load supplier information',
        variant: 'destructive'
      });
    } finally {
      setLoading(false);
    }
  };

  const fetchProducts = async (supplierId: string) => {
    try {
      const { data, error } = await supabase
        .from('products')
        .select('*')
        .eq('supplier_id', supplierId)
        .order('created_at', { ascending: false });

      if (error) throw error;
      setProducts(data || []);
    } catch (error) {
      console.error('Error fetching products:', error);
      toast({
        title: 'Error',
        description: 'Failed to load products',
        variant: 'destructive'
      });
    }
  };

  const fetchCategories = async () => {
    try {
      // Fetch from 'product_categories' table which is for product categorization
      const { data, error } = await supabase
        .from('product_categories')
        .select('*')
        .eq('is_active', true)
        .order('sort_order')
        .order('name_en');

      if (error) throw error;
      setCategories(data || []);
    } catch (error) {
      console.error('Error fetching categories:', error);
    }
  };

  const handleAddProduct = () => {
    setEditingProduct(null);
    setShowForm(true);
  };

  const handleEditProduct = (product: any) => {
    setEditingProduct(product);
    setShowForm(true);
  };

  const handleDeleteProduct = async (productId: string) => {
    try {
      const { error } = await supabase
        .from('products')
        .delete()
        .eq('id', productId);

      if (error) throw error;

      toast({
        title: 'Success',
        description: 'Product deleted successfully'
      });

      if (supplier) {
        await fetchProducts(supplier.id);
      }
    } catch (error: any) {
      console.error('Error deleting product:', error);
      toast({
        title: 'Error',
        description: error.message || 'Failed to delete product',
        variant: 'destructive'
      });
    }
  };

  const handleFormSuccess = () => {
    setShowForm(false);
    setEditingProduct(null);
    if (supplier) {
      fetchProducts(supplier.id);
    }
  };

  const handleFormCancel = () => {
    setShowForm(false);
    setEditingProduct(null);
  };

  // Filter products based on search and filters
  const filteredProducts = products.filter(product => {
    const matchesSearch = product.name_en?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         product.name_ar?.includes(searchTerm) ||
                         product.description_en?.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesCategory = categoryFilter === 'all' || product.category_id === categoryFilter;
    
    const matchesAvailability = availabilityFilter === 'all' || 
                               (availabilityFilter === 'available' && product.is_available) ||
                               (availabilityFilter === 'unavailable' && !product.is_available);

    return matchesSearch && matchesCategory && matchesAvailability;
  });

  if (loading) {
    return (
      <div className="p-6">
        <div className="animate-pulse space-y-4">
          <div className="h-8 bg-muted rounded w-1/3"></div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[1, 2, 3].map((i) => (
              <div key={i} className="h-64 bg-muted rounded"></div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  if (!supplier) {
    return (
      <div className="p-6 text-center">
        <h2 className="text-xl font-semibold mb-2">Supplier Profile Required</h2>
        <p className="text-muted-foreground">
          Please complete your supplier profile before managing products.
        </p>
      </div>
    );
  }

  if (showForm) {
    return (
      <div className="p-6">
        <ProductForm
          product={editingProduct}
          categories={categories}
          supplierId={supplier.id}
          onSuccess={handleFormSuccess}
          onCancel={handleFormCancel}
        />
      </div>
    );
  }

  return (
    <div className="p-6">
      <div className="space-y-6">
        {/* Header */}
        <div className={`flex items-center justify-between ${isRTL ? 'flex-row-reverse' : ''}`}>
          <div className={isRTL ? 'text-right' : ''}>
            <h1 className="text-2xl font-bold">
              {isRTL ? 'إدارة المنتجات' : 'Product Management'}
            </h1>
            <p className="text-muted-foreground">
              {isRTL ? 'إدارة عناصر القائمة والمنتجات الخاصة بك' : 'Manage your menu items and products'}
            </p>
          </div>
          <Button onClick={handleAddProduct}>
            <Plus className="h-4 w-4 mr-2" />
            {isRTL ? 'إضافة منتج' : 'Add Product'}
          </Button>
        </div>

        {/* Search and Filters */}
        <div className="flex flex-col sm:flex-row gap-4">
          <div className="flex-1 relative">
            <Search className={`absolute top-3 h-4 w-4 text-muted-foreground ${isRTL ? 'right-3' : 'left-3'}`} />
            <Input
              placeholder={isRTL ? 'ابحث عن المنتجات...' : 'Search products...'}
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className={isRTL ? 'pr-10' : 'pl-10'}
              dir={isRTL ? 'rtl' : 'ltr'}
            />
          </div>
          
          <Select value={categoryFilter} onValueChange={setCategoryFilter}>
            <SelectTrigger className="w-full sm:w-48">
              <SelectValue placeholder={isRTL ? 'جميع الفئات' : 'All Categories'} />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">{isRTL ? 'جميع الفئات' : 'All Categories'}</SelectItem>
              {categories.map((category) => (
                <SelectItem key={category.id} value={category.id}>
                  {isRTL && category.name_ar ? category.name_ar : category.name_en}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>

          <Select value={availabilityFilter} onValueChange={setAvailabilityFilter}>
            <SelectTrigger className="w-full sm:w-48">
              <SelectValue placeholder={isRTL ? 'جميع المنتجات' : 'All Products'} />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">{isRTL ? 'جميع المنتجات' : 'All Products'}</SelectItem>
              <SelectItem value="available">{isRTL ? 'متوفر فقط' : 'Available Only'}</SelectItem>
              <SelectItem value="unavailable">{isRTL ? 'غير متوفر فقط' : 'Unavailable Only'}</SelectItem>
            </SelectContent>
          </Select>
        </div>

        {/* Products Stats */}
        <div className={`flex gap-4 ${isRTL ? 'flex-row-reverse' : ''}`}>
          <Badge variant="outline">
            {isRTL ? `الإجمالي: ${products.length}` : `Total: ${products.length}`}
          </Badge>
          <Badge className="bg-green-100 text-green-800">
            {isRTL ? `متوفر: ${products.filter(p => p.is_available).length}` : `Available: ${products.filter(p => p.is_available).length}`}
          </Badge>
          <Badge variant="secondary" className="bg-red-100 text-red-800">
            {isRTL ? `غير متوفر: ${products.filter(p => !p.is_available).length}` : `Unavailable: ${products.filter(p => !p.is_available).length}`}
          </Badge>
        </div>

        {/* Products Grid */}
        {filteredProducts.length === 0 ? (
          <div className={`text-center py-12 ${isRTL ? 'text-right' : ''}`}>
            {products.length === 0 ? (
              <div>
                <h3 className="text-lg font-semibold mb-2">
                  {isRTL ? 'لا توجد منتجات بعد' : 'No Products Yet'}
                </h3>
                <p className="text-muted-foreground mb-4">
                  {isRTL ? 'ابدأ في بناء قائمتك عن طريق إضافة منتجك الأول' : 'Start building your menu by adding your first product'}
                </p>
                <Button onClick={handleAddProduct}>
                  <Plus className="h-4 w-4 mr-2" />
                  {isRTL ? 'أضف منتجك الأول' : 'Add Your First Product'}
                </Button>
              </div>
            ) : (
              <div>
                <h3 className="text-lg font-semibold mb-2">
                  {isRTL ? 'لم يتم العثور على منتجات' : 'No Products Found'}
                </h3>
                <p className="text-muted-foreground">
                  {isRTL ? 'حاول تعديل معايير البحث أو الفلتر' : 'Try adjusting your search or filter criteria'}
                </p>
              </div>
            )}
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredProducts.map((product) => (
              <ProductCard
                key={product.id}
                product={product}
                categories={categories}
                onEdit={handleEditProduct}
                onDelete={handleDeleteProduct}
              />
            ))}
          </div>
        )}
      </div>
    </div>
  );
};