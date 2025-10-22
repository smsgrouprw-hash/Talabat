import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { CartSummary } from "@/components/customer/CartSummary";
import { useCart } from "@/contexts/CartContext";
import { useAuth } from "@/hooks/useAuth";
import { useToast } from "@/hooks/use-toast";

export default function CustomerCheckout() {
  const navigate = useNavigate();
  const { items, clearCart, getCartTotal, getItemsBySupplier } = useCart();
  const { user } = useAuth();
  const { toast } = useToast();
  
  const [formData, setFormData] = useState({
    delivery_address: "",
    delivery_instructions: "",
    notes: "",
  });
  const [loading, setLoading] = useState(false);

  const generateOrderNumber = () => {
    const timestamp = Date.now().toString(36);
    const random = Math.random().toString(36).substr(2, 5);
    return `ORD-${timestamp}-${random}`.toUpperCase();
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!user) {
      toast({
        title: "Authentication required",
        description: "Please log in to place an order",
        variant: "destructive",
      });
      return;
    }

    if (items.length === 0) {
      toast({
        title: "Cart is empty",
        description: "Add items to your cart before checking out",
        variant: "destructive",
      });
      return;
    }

    if (!formData.delivery_address.trim()) {
      toast({
        title: "Delivery address required",
        description: "Please provide a delivery address",
        variant: "destructive",
      });
      return;
    }

    setLoading(true);

    try {
      // Group items by supplier to create separate orders
      const supplierGroups = getItemsBySupplier();
      const orderIds: string[] = [];

      for (const [supplierId, supplierItems] of supplierGroups) {
        // Calculate totals for this supplier
        const subtotal = supplierItems.reduce((sum, item) => {
          const price = item.product.discounted_price || item.product.price;
          return sum + (price * item.quantity);
        }, 0);

        const deliveryFee = supplierItems[0].product.supplier?.delivery_fee || 0;
        const taxAmount = 0; // No tax calculation for now
        const discountAmount = 0; // No discount calculation for now
        const totalAmount = subtotal + deliveryFee + taxAmount - discountAmount;

        // Create order
        const orderData = {
          order_number: generateOrderNumber(),
          user_id: user.id,
          supplier_id: supplierId,
          subtotal,
          delivery_fee: deliveryFee,
          tax_amount: taxAmount,
          discount_amount: discountAmount,
          total_amount: totalAmount,
          delivery_address: formData.delivery_address,
          delivery_instructions: formData.delivery_instructions || null,
          notes: formData.notes || null,
          status: 'pending',
          payment_status: 'pending',
          currency: 'RWF',
        };

        const { data: order, error: orderError } = await supabase
          .from("orders")
          .insert([orderData])
          .select()
          .single();

        if (orderError) throw orderError;

        orderIds.push(order.id);

        // Create order items
        const orderItemsData = supplierItems.map(item => ({
          order_id: order.id,
          product_id: item.product.id,
          quantity: item.quantity,
          unit_price: item.product.discounted_price || item.product.price,
          total_price: (item.product.discounted_price || item.product.price) * item.quantity,
        }));

        const { error: itemsError } = await supabase
          .from("order_items")
          .insert(orderItemsData);

        if (itemsError) throw itemsError;
      }

      // Clear cart and redirect to confirmation
      clearCart();
      
      toast({
        title: "Order placed successfully!",
        description: `Your order${orderIds.length > 1 ? 's have' : ' has'} been placed and ${orderIds.length > 1 ? 'are' : 'is'} being processed.`,
      });

      // Redirect to order confirmation or orders list
      navigate('/customer/orders');

    } catch (error) {
      console.error("Error placing order:", error);
      toast({
        title: "Error",
        description: "Failed to place order. Please try again.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  if (items.length === 0) {
    return (
      <div className="container mx-auto py-6">
        <Card>
          <CardContent className="p-12 text-center">
            <h3 className="text-lg font-semibold mb-2">Your cart is empty</h3>
            <p className="text-muted-foreground mb-4">
              Add some items to your cart before checking out.
            </p>
            <Button onClick={() => navigate('/customer/suppliers')}>
              Browse Suppliers
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="container mx-auto py-6 pb-24 space-y-6">
      <h1 className="text-3xl font-bold">Checkout</h1>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Order Form */}
        <div>
          <Card>
            <CardHeader>
              <CardTitle>Delivery Information</CardTitle>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleSubmit} className="space-y-6">
                <div className="space-y-2">
                  <Label htmlFor="delivery_address">Delivery Address *</Label>
                  <Textarea
                    id="delivery_address"
                    value={formData.delivery_address}
                    onChange={(e) => setFormData({ ...formData, delivery_address: e.target.value })}
                    placeholder="Enter your full delivery address..."
                    rows={3}
                    required
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="delivery_instructions">Delivery Instructions</Label>
                  <Textarea
                    id="delivery_instructions"
                    value={formData.delivery_instructions}
                    onChange={(e) => setFormData({ ...formData, delivery_instructions: e.target.value })}
                    placeholder="Any special delivery instructions..."
                    rows={2}
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="notes">Order Notes</Label>
                  <Textarea
                    id="notes"
                    value={formData.notes}
                    onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                    placeholder="Any special requests or notes..."
                    rows={2}
                  />
                </div>

                <Button 
                  type="submit" 
                  className="w-full" 
                  size="lg"
                  disabled={loading}
                >
                  {loading ? "Placing Order..." : "Place Order"}
                </Button>
              </form>
            </CardContent>
          </Card>
        </div>

        {/* Order Summary */}
        <div>
          <Card>
            <CardHeader>
              <CardTitle>Order Summary</CardTitle>
            </CardHeader>
            <CardContent>
              <CartSummary compact={true} showActions={false} />
              
              <Separator className="my-4" />
              
              <div className="space-y-2">
                <div className="flex justify-between text-sm">
                  <span>Subtotal</span>
                  <span>{getCartTotal().toLocaleString()} RWF</span>
                </div>
                
                {/* Show delivery fees by supplier */}
                {Array.from(getItemsBySupplier()).map(([supplierId, supplierItems]) => {
                  const deliveryFee = supplierItems[0].product.supplier?.delivery_fee || 0;
                  const supplierName = supplierItems[0].product.supplier?.business_name || 'Unknown Supplier';
                  
                  return deliveryFee > 0 ? (
                    <div key={supplierId} className="flex justify-between text-sm">
                      <span>Delivery ({supplierName})</span>
                      <span>{deliveryFee.toLocaleString()} RWF</span>
                    </div>
                  ) : null;
                })}
                
                <Separator />
                
                <div className="flex justify-between font-semibold text-lg">
                  <span>Total</span>
                  <span>
                    {(getCartTotal() + Array.from(getItemsBySupplier()).reduce((total, [, items]) => {
                      return total + (items[0].product.supplier?.delivery_fee || 0);
                    }, 0)).toLocaleString()} RWF
                  </span>
                </div>
              </div>

              <div className="mt-6 p-4 bg-muted rounded-lg">
                <p className="text-sm text-muted-foreground">
                  By placing this order, you agree to our terms and conditions. 
                  You will receive order confirmations via your registered email.
                </p>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}