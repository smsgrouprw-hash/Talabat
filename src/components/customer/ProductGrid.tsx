import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { EmptyState } from "@/components/ui/empty-state";
import { Plus, Minus, Clock, Leaf, Heart, Package } from "lucide-react";
import { useCart, Product } from "@/contexts/CartContext";
import { useToast } from "@/hooks/use-toast";
import { cn } from "@/lib/utils";

interface ProductGridProps {
  products: Product[];
}

export function ProductGrid({ products }: ProductGridProps) {
  const [quantities, setQuantities] = useState<Record<string, number>>({});
  const { addToCart } = useCart();
  const { toast } = useToast();

  const handleQuantityChange = (productId: string, quantity: number) => {
    setQuantities(prev => ({
      ...prev,
      [productId]: Math.max(1, quantity)
    }));
  };

  const handleAddToCart = (product: Product) => {
    const quantity = quantities[product.id] || 1;
    addToCart(product, quantity);
    
    toast({
      title: "Added to cart",
      description: `${product.name_en} x${quantity} added to your cart`,
    });

    // Reset quantity after adding to cart
    setQuantities(prev => ({
      ...prev,
      [product.id]: 1
    }));
  };

  if (products.length === 0) {
    return (
      <EmptyState
        icon={Package}
        title="No products available"
        description="This supplier hasn't added any products yet. Please check back later."
      />
    );
  }

  return (
    <div className="grid-responsive">
      {products.map((product) => {
        const quantity = quantities[product.id] || 1;
        const price = product.discounted_price || product.price;
        const originalPrice = product.discounted_price ? product.price : null;

        return (
          <Card key={product.id} className="card-hover overflow-hidden group">
            {product.image_url && (
              <div className="h-48 overflow-hidden relative">
                <img
                  src={product.image_url}
                  alt={product.name_en}
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-normal"
                />
                {product.discounted_price && (
                  <div className="absolute top-2 right-2">
                    <Badge variant="destructive" className="bg-destructive text-white font-medium">
                      Sale
                    </Badge>
                  </div>
                )}
              </div>
            )}

            <CardHeader className="pb-3">
              <div className="flex items-start justify-between">
                <CardTitle className="text-lg line-clamp-2">{product.name_en}</CardTitle>
                {product.discounted_price && (
                  <Badge variant="destructive" className="ml-2">Sale</Badge>
                )}
              </div>
              
              <div className="flex items-center space-x-2">
                <span className="text-xl font-bold text-primary">
                  {price.toLocaleString()} RWF
                </span>
                {originalPrice && (
                  <span className="text-sm text-muted-foreground line-through">
                    {originalPrice.toLocaleString()} RWF
                  </span>
                )}
              </div>
            </CardHeader>

            <CardContent className="space-y-4">
              {product.description && (
                <p className="text-sm text-muted-foreground line-clamp-2">
                  {product.description}
                </p>
              )}

              <div className="flex flex-wrap gap-2">
                {product.preparation_time && (
                  <div className="flex items-center space-x-1 text-xs text-muted-foreground">
                    <Clock className="h-3 w-3" />
                    <span>{product.preparation_time} min</span>
                  </div>
                )}
                
                {/* Add dietary badges if they exist in the schema */}
                <div className="flex items-center space-x-1">
                  <Leaf className="h-3 w-3 text-green-600" />
                  <Heart className="h-3 w-3 text-red-500" />
                </div>
              </div>

              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => handleQuantityChange(product.id, quantity - 1)}
                    disabled={quantity <= 1}
                  >
                    <Minus className="h-4 w-4" />
                  </Button>
                  
                  <Input
                    type="number"
                    value={quantity}
                    onChange={(e) => handleQuantityChange(product.id, parseInt(e.target.value) || 1)}
                    className="w-16 text-center"
                    min="1"
                    max={product.max_quantity_per_order || 10}
                  />
                  
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => handleQuantityChange(product.id, quantity + 1)}
                    disabled={quantity >= (product.max_quantity_per_order || 10)}
                  >
                    <Plus className="h-4 w-4" />
                  </Button>
                </div>

                <Button
                  onClick={() => handleAddToCart(product)}
                  className="flex-1 ml-4 touch-target focus-ring"
                  size="lg"
                >
                  Add to Cart
                </Button>
              </div>

              {product.max_quantity_per_order && (
                <p className="text-xs text-muted-foreground">
                  Max {product.max_quantity_per_order} per order
                </p>
              )}
            </CardContent>
          </Card>
        );
      })}
    </div>
  );
}