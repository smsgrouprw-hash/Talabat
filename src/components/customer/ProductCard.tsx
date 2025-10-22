import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Plus, Minus, Star } from "lucide-react";
import { useState } from "react";

interface Product {
  id: string;
  name: string;
  description?: string;
  price: number;
  image_url?: string;
  category?: string;
  is_available: boolean;
  rating?: number;
  prep_time_minutes?: number;
}

interface ProductCardProps {
  product: Product;
  onAddToCart: (product: Product, quantity: number) => void;
  cartQuantity?: number;
}

export function ProductCard({ product, onAddToCart, cartQuantity = 0 }: ProductCardProps) {
  const [quantity, setQuantity] = useState(cartQuantity);

  const handleQuantityChange = (newQuantity: number) => {
    if (newQuantity < 0) return;
    setQuantity(newQuantity);
    onAddToCart(product, newQuantity - cartQuantity);
  };

  return (
    <Card className="card-hover overflow-hidden group">
      {product.image_url && (
        <div className="h-48 overflow-hidden relative">
          <img
            src={product.image_url}
            alt={product.name}
            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-normal"
          />
          {!product.is_available && (
            <div className="absolute inset-0 bg-black/50 flex items-center justify-center">
              <Badge variant="destructive" className="text-white">
                Out of Stock
              </Badge>
            </div>
          )}
          {product.rating && product.rating > 0 && (
            <div className="absolute top-2 left-2">
              <Badge className="bg-white/90 text-foreground border-0">
                <Star className="h-3 w-3 fill-yellow-400 text-yellow-400 mr-1" />
                {product.rating.toFixed(1)}
              </Badge>
            </div>
          )}
        </div>
      )}

      <CardHeader className="pb-3">
        <div className="flex items-start justify-between">
          <div className="flex-1 min-w-0">
            <CardTitle className="text-lg truncate">{product.name}</CardTitle>
            {product.category && (
              <Badge variant="secondary" className="mt-1 text-xs">
                {product.category}
              </Badge>
            )}
          </div>
          <div className="text-right">
            <p className="text-lg font-bold text-primary">
              {product.price.toLocaleString()} RWF
            </p>
            {product.prep_time_minutes && (
              <p className="text-xs text-muted-foreground">
                ~{product.prep_time_minutes} min
              </p>
            )}
          </div>
        </div>
      </CardHeader>

      <CardContent className="space-y-4">
        {product.description && (
          <p className="text-sm text-muted-foreground line-clamp-2">
            {product.description}
          </p>
        )}

        {product.is_available ? (
          <div className="flex items-center justify-between">
            {quantity === 0 ? (
              <Button 
                className="w-full touch-target focus-ring" 
                onClick={() => handleQuantityChange(1)}
                size="lg"
              >
                <Plus className="h-4 w-4 mr-2" />
                Add to Cart
              </Button>
            ) : (
              <div className="flex items-center justify-between w-full">
                <Button
                  variant="outline"
                  size="sm"
                  className="touch-target focus-ring"
                  onClick={() => handleQuantityChange(quantity - 1)}
                >
                  <Minus className="h-4 w-4" />
                </Button>
                <span className="mx-4 font-medium text-lg min-w-[2rem] text-center">
                  {quantity}
                </span>
                <Button
                  variant="outline" 
                  size="sm"
                  className="touch-target focus-ring"
                  onClick={() => handleQuantityChange(quantity + 1)}
                >
                  <Plus className="h-4 w-4" />
                </Button>
              </div>
            )}
          </div>
        ) : (
          <Button disabled className="w-full" size="lg">
            Out of Stock
          </Button>
        )}
      </CardContent>
    </Card>
  );
}