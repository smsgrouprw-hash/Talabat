import { useState, useEffect } from "react";
import { useParams, Link } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { ProductGrid } from "@/components/customer/ProductGrid";
import { CartSummary } from "@/components/customer/CartSummary";
import { ArrowLeft, MapPin, Clock, Star, Truck, Phone, Mail } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { Product } from "@/contexts/CartContext";

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
  is_featured?: boolean;
  is_verified?: boolean;
  is_active?: boolean;
  business_hours?: any;
  created_at?: string;
  updated_at?: string;
}

interface SupplierContact {
  business_name: string;
  phone: string;
  email: string;
  address: string;
}

export default function CustomerSupplierDetail() {
  const { id } = useParams<{ id: string }>();
  const supplierId = id;
  const [supplier, setSupplier] = useState<Supplier | null>(null);
  const [supplierContact, setSupplierContact] = useState<SupplierContact | null>(null);
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();

  useEffect(() => {
    if (supplierId) {
      fetchSupplierDetails();
      fetchSupplierContact();
      fetchProducts();
    }
  }, [supplierId]);

  const fetchSupplierDetails = async () => {
    try {
      // Query suppliers table directly but only select safe, non-sensitive columns
      const { data, error } = await supabase
        .from('suppliers')
        .select(`
          id,
          business_name,
          business_type,
          cuisine_type,
          description,
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
        .eq('id', supplierId)
        .eq('is_active', true)
        .single();

      if (error) throw error;

      setSupplier(data);
    } catch (error) {
      console.error("Error fetching supplier:", error);
      toast({
        title: "Error",
        description: "Failed to fetch supplier details",
        variant: "destructive",
      });
    }
  };

  const fetchSupplierContact = async () => {
    try {
      // Get contact information using the secure function (only for authenticated customers)
      const { data, error } = await supabase
        .rpc('get_supplier_contact_for_order', { supplier_id: supplierId });

      if (error) {
        // If error, user might not be authenticated or not a customer
        console.log("Contact information not available:", error);
        return;
      }

      if (data && data.length > 0) {
        setSupplierContact(data[0]);
      }
    } catch (error) {
      console.log("Error fetching supplier contact:", error);
      // This is not a critical error, so we don't show a toast
    }
  };

  const fetchProducts = async () => {
    try {
      const { data, error } = await supabase
        .from("products")
        .select(`
          *,
          supplier:suppliers!products_supplier_id_fkey(
            id,
            business_name,
            delivery_fee
          )
        `)
        .eq("supplier_id", supplierId)
        .eq("is_available", true)
        .order("sort_order", { ascending: true })
        .order("name_en", { ascending: true });

      if (error) throw error;

      setProducts(data || []);
    } catch (error) {
      console.error("Error fetching products:", error);
      toast({
        title: "Error",
        description: "Failed to fetch products",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="container mx-auto py-6">
        <div className="flex justify-center items-center min-h-[400px]">
          <p className="text-muted-foreground">Loading supplier details...</p>
        </div>
      </div>
    );
  }

  if (!supplier) {
    return (
      <div className="container mx-auto py-6">
        <Card>
          <CardContent className="p-12 text-center">
            <h3 className="text-lg font-semibold mb-2">Supplier not found</h3>
            <p className="text-muted-foreground mb-4">
              The supplier you're looking for doesn't exist or is currently unavailable.
            </p>
            <Link to="/customer/suppliers">
              <Button>Browse All Suppliers</Button>
            </Link>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background pb-24">
      {/* Header with cover image */}
      {supplier.cover_image_url && (
        <div className="relative h-64 overflow-hidden">
          <img
            src={supplier.cover_image_url}
            alt={supplier.business_name}
            className="w-full h-full object-cover"
          />
          <div className="absolute inset-0 bg-black/40" />
          
          <div className="absolute top-4 left-4">
            <Link to="/customer/suppliers">
              <Button variant="secondary" size="sm" className="bg-background/80">
                <ArrowLeft className="h-4 w-4 mr-2" />
                Back to Suppliers
              </Button>
            </Link>
          </div>
        </div>
      )}

      <div className="container mx-auto py-6">
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
          {/* Main content */}
          <div className="lg:col-span-3 space-y-6">
            {/* Supplier info */}
            <Card>
              <CardContent className="p-6">
                <div className="flex items-start space-x-4">
                  {supplier.logo_url && (
                    <img
                      src={supplier.logo_url}
                      alt={`${supplier.business_name} logo`}
                      className="h-20 w-20 rounded-full object-cover border-4 border-background shadow-lg"
                    />
                  )}
                  
                  <div className="flex-1">
                    <div className="flex items-start justify-between">
                      <div>
                        <h1 className="text-3xl font-bold">{supplier.business_name}</h1>
                        {supplier.cuisine_type && (
                          <Badge variant="secondary" className="mt-2">
                            {supplier.cuisine_type}
                          </Badge>
                        )}
                      </div>
                      
                      {supplier.rating && supplier.rating > 0 && (
                        <div className="flex items-center space-x-1 text-sm">
                          <Star className="h-4 w-4 fill-yellow-400 text-yellow-400" />
                          <span className="font-medium">{supplier.rating.toFixed(1)}</span>
                          {supplier.total_reviews && supplier.total_reviews > 0 && (
                            <span className="text-muted-foreground">({supplier.total_reviews})</span>
                          )}
                        </div>
                      )}
                    </div>

                    {supplier.description && (
                      <p className="text-muted-foreground mt-3">
                        {supplier.description}
                      </p>
                    )}

                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-4">
                      <div className="flex items-center space-x-2 text-sm">
                        <MapPin className="h-4 w-4 text-muted-foreground" />
                        <span>{supplierContact?.address ? `${supplierContact.address}, ${supplier.city}` : supplier.city}</span>
                      </div>
                      
                      <div className="flex items-center space-x-2 text-sm">
                        <Clock className="h-4 w-4 text-muted-foreground" />
                        <span>{supplier.delivery_time_min}-{supplier.delivery_time_max} min</span>
                      </div>
                      
                      <div className="flex items-center space-x-2 text-sm">
                        <Truck className="h-4 w-4 text-muted-foreground" />
                        <span>
                          {supplier.delivery_fee ? `${supplier.delivery_fee} RWF` : 'Free delivery'}
                        </span>
                      </div>
                    </div>

                    {supplierContact && (
                      <div className="flex items-center space-x-6 mt-4 text-sm text-muted-foreground">
                        <div className="flex items-center space-x-2">
                          <Phone className="h-4 w-4" />
                          <span>{supplierContact.phone}</span>
                        </div>
                        
                        {supplierContact.email && (
                          <div className="flex items-center space-x-2">
                            <Mail className="h-4 w-4" />
                            <span>{supplierContact.email}</span>
                          </div>
                        )}
                      </div>
                    )}

                    {supplier.minimum_order && supplier.minimum_order > 0 && (
                      <div className="mt-4 p-3 bg-muted rounded-lg">
                        <p className="text-sm">
                          <strong>Minimum order:</strong> {supplier.minimum_order.toLocaleString()} RWF
                        </p>
                      </div>
                    )}
                  </div>
                </div>
              </CardContent>
            </Card>

            <Separator />

            {/* Products */}
            <div>
              <h2 className="text-2xl font-bold mb-6">Menu</h2>
              <ProductGrid products={products} />
            </div>
          </div>

          {/* Sidebar with cart */}
          <div className="lg:col-span-1">
            <div className="sticky top-6">
              <CartSummary />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}