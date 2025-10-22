import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { EmptyState } from "@/components/ui/empty-state";
import { ShoppingCart, Plus, Minus, Trash2 } from "lucide-react";
import { useCart } from "@/contexts/CartContext";
import { Link } from "react-router-dom";

interface CartSummaryProps {
  showActions?: boolean;
  compact?: boolean;
}

export function CartSummary({ showActions = true, compact = false }: CartSummaryProps) {
  const { items, updateQuantity, removeFromCart, getCartTotal, getCartCount } = useCart();

  const total = getCartTotal();
  const itemCount = getCartCount();

  if (items.length === 0) {
    return (
      <EmptyState
        icon={ShoppingCart}
        title="Your cart is empty"
        description="Start browsing suppliers to add items to your cart"
        action={{
          label: "Browse Suppliers",
          onClick: () => window.location.href = "/customer/suppliers"
        }}
      />
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center justify-between">
          <span>Cart Summary</span>
          <Badge variant="secondary">{itemCount} items</Badge>
        </CardTitle>
      </CardHeader>
      
      <CardContent className="space-y-4">
        {items.map((item) => (
          <div key={item.product.id} className="flex items-center space-x-3">
            {item.product.image_url && !compact && (
              <img
                src={item.product.image_url}
                alt={item.product.name_en}
                className="h-12 w-12 rounded object-cover"
              />
            )}
            
            <div className="flex-1 min-w-0">
              <p className="font-medium truncate">{item.product.name_en}</p>
              <p className="text-sm text-muted-foreground">
                {(item.product.discounted_price || item.product.price).toLocaleString()} RWF each
              </p>
              {item.product.supplier?.business_name && (
                <p className="text-xs text-muted-foreground">
                  from {item.product.supplier.business_name}
                </p>
              )}
            </div>

            {showActions && !compact && (
              <div className="flex items-center space-x-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => updateQuantity(item.product.id, item.quantity - 1)}
                  disabled={item.quantity <= 1}
                >
                  <Minus className="h-3 w-3" />
                </Button>
                
                <span className="w-8 text-center text-sm font-medium">
                  {item.quantity}
                </span>
                
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => updateQuantity(item.product.id, item.quantity + 1)}
                  disabled={item.quantity >= (item.product.max_quantity_per_order || 10)}
                >
                  <Plus className="h-3 w-3" />
                </Button>

                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => removeFromCart(item.product.id)}
                  className="text-destructive hover:text-destructive"
                >
                  <Trash2 className="h-3 w-3" />
                </Button>
              </div>
            )}

            {!showActions || compact ? (
              <div className="text-right">
                <p className="font-medium">x{item.quantity}</p>
                <p className="text-sm text-muted-foreground">
                  {((item.product.discounted_price || item.product.price) * item.quantity).toLocaleString()} RWF
                </p>
              </div>
            ) : null}
          </div>
        ))}

        <Separator />

        <div className="space-y-2">
          <div className="flex justify-between text-lg font-semibold">
            <span>Total</span>
            <span>{total.toLocaleString()} RWF</span>
          </div>
        </div>

        {showActions && (
          <div className="space-y-2">
            <Link to="/customer/cart">
              <Button variant="outline" className="w-full touch-target focus-ring">
                View Cart
              </Button>
            </Link>
            <Link to="/customer/checkout">
              <Button className="w-full touch-target focus-ring" size="lg">
                Proceed to Checkout
              </Button>
            </Link>
          </div>
        )}
      </CardContent>
    </Card>
  );
}