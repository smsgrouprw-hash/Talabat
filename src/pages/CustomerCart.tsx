import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { CartSummary } from "@/components/customer/CartSummary";
import { ArrowLeft } from "lucide-react";
import { useCart } from "@/contexts/CartContext";

export default function CustomerCart() {
  const { items } = useCart();

  return (
    <div className="container mx-auto py-6 pb-24 space-y-6">
      <div className="flex items-center space-x-4">
        <Link to="/customer/suppliers">
          <Button variant="outline" size="sm">
            <ArrowLeft className="h-4 w-4 mr-2" />
            Continue Shopping
          </Button>
        </Link>
        <h1 className="text-3xl font-bold">Your Cart</h1>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2">
          <CartSummary showActions={true} />
        </div>
        
        <div className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Order Summary</CardTitle>
            </CardHeader>
            <CardContent>
              <CartSummary compact={true} showActions={false} />
            </CardContent>
          </Card>

          {items.length > 0 && (
            <Link to="/customer/checkout">
              <Button className="w-full" size="lg">
                Proceed to Checkout
              </Button>
            </Link>
          )}
        </div>
      </div>
    </div>
  );
}