import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible";
import { ChevronDown, ChevronUp, Package, Clock, CheckCircle, XCircle } from "lucide-react";
import { useAuth } from "@/hooks/useAuth";
import { useToast } from "@/hooks/use-toast";
import { formatDistanceToNow } from "date-fns";

interface OrderItem {
  id: string;
  product_id: string;
  quantity: number;
  unit_price: number;
  total_price: number;
  special_instructions?: string;
  product?: {
    name_en: string;
    image_url?: string;
  };
}

interface Order {
  id: string;
  order_number: string;
  total_amount: number;
  subtotal: number;
  delivery_fee: number;
  tax_amount: number;
  discount_amount: number;
  delivery_address: string;
  delivery_instructions?: string;
  notes?: string;
  status: string;
  payment_status: string;
  currency: string;
  created_at: string;
  estimated_delivery_time?: string;
  actual_delivery_time?: string;
  supplier?: {
    business_name: string;
    phone: string;
    logo_url?: string;
  };
  order_items?: OrderItem[];
}

const statusConfig = {
  pending: { label: 'Pending', variant: 'secondary' as const, icon: Clock },
  confirmed: { label: 'Confirmed', variant: 'default' as const, icon: CheckCircle },
  preparing: { label: 'Preparing', variant: 'default' as const, icon: Package },
  ready: { label: 'Ready', variant: 'default' as const, icon: CheckCircle },
  delivered: { label: 'Delivered', variant: 'default' as const, icon: CheckCircle },
  cancelled: { label: 'Cancelled', variant: 'destructive' as const, icon: XCircle },
};

export default function CustomerOrders() {
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [expandedOrders, setExpandedOrders] = useState<Set<string>>(new Set());
  const { user } = useAuth();
  const { toast } = useToast();

  useEffect(() => {
    if (user) {
      fetchOrders();
    }
  }, [user]);

  const fetchOrders = async () => {
    try {
      const { data, error } = await supabase
        .from("orders")
        .select(`
          *,
          supplier:suppliers!orders_supplier_id_fkey(
            business_name,
            phone,
            logo_url
          ),
          order_items(
            *,
            product:products(
              name_en,
              image_url
            )
          )
        `)
        .eq("user_id", user?.id)
        .order("created_at", { ascending: false });

      if (error) throw error;

      setOrders(data || []);
    } catch (error) {
      console.error("Error fetching orders:", error);
      toast({
        title: "Error",
        description: "Failed to fetch your orders",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const toggleOrderExpansion = (orderId: string) => {
    const newExpanded = new Set(expandedOrders);
    if (newExpanded.has(orderId)) {
      newExpanded.delete(orderId);
    } else {
      newExpanded.add(orderId);
    }
    setExpandedOrders(newExpanded);
  };

  if (loading) {
    return (
      <div className="container mx-auto py-6">
        <div className="flex justify-center items-center min-h-[400px]">
          <p className="text-muted-foreground">Loading your orders...</p>
        </div>
      </div>
    );
  }

  if (orders.length === 0) {
    return (
      <div className="container mx-auto py-6">
        <Card>
          <CardContent className="p-12 text-center">
            <Package className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
            <h3 className="text-lg font-semibold mb-2">No orders yet</h3>
            <p className="text-muted-foreground mb-4">
              You haven't placed any orders yet. Start browsing suppliers to place your first order.
            </p>
            <Button onClick={() => window.location.href = '/customer/suppliers'}>
              Browse Suppliers
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="container mx-auto py-6 pb-24 space-y-6">
      <h1 className="text-3xl font-bold">Your Orders</h1>

      <div className="space-y-4">
        {orders.map((order) => {
          const isExpanded = expandedOrders.has(order.id);
          const statusInfo = statusConfig[order.status as keyof typeof statusConfig] || statusConfig.pending;
          const StatusIcon = statusInfo.icon;

          return (
            <Card key={order.id}>
              <Collapsible>
                <CollapsibleTrigger asChild>
                  <CardHeader className="cursor-pointer hover:bg-muted/50 transition-colors">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-4">
                        {order.supplier?.logo_url && (
                          <img
                            src={order.supplier.logo_url}
                            alt={order.supplier.business_name}
                            className="h-12 w-12 rounded-full object-cover"
                          />
                        )}
                        <div>
                          <CardTitle className="text-lg">{order.order_number}</CardTitle>
                          <p className="text-sm text-muted-foreground">
                            {order.supplier?.business_name} • {formatDistanceToNow(new Date(order.created_at), { addSuffix: true })}
                          </p>
                        </div>
                      </div>

                      <div className="flex items-center space-x-4">
                        <div className="text-right">
                          <div className="flex items-center space-x-2">
                            <StatusIcon className="h-4 w-4" />
                            <Badge variant={statusInfo.variant}>
                              {statusInfo.label}
                            </Badge>
                          </div>
                          <p className="text-lg font-semibold mt-1">
                            {order.total_amount.toLocaleString()} {order.currency}
                          </p>
                        </div>

                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => toggleOrderExpansion(order.id)}
                        >
                          {isExpanded ? (
                            <ChevronUp className="h-4 w-4" />
                          ) : (
                            <ChevronDown className="h-4 w-4" />
                          )}
                        </Button>
                      </div>
                    </div>
                  </CardHeader>
                </CollapsibleTrigger>

                <CollapsibleContent>
                  <CardContent className="pt-0">
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                      {/* Order Items */}
                      <div>
                        <h4 className="font-semibold mb-3">Order Items</h4>
                        <div className="space-y-3">
                          {order.order_items?.map((item) => (
                            <div key={item.id} className="flex items-center space-x-3 p-3 bg-muted rounded-lg">
                              {item.product?.image_url && (
                                <img
                                  src={item.product.image_url}
                                  alt={item.product.name_en}
                                  className="h-12 w-12 rounded object-cover"
                                />
                              )}
                              <div className="flex-1">
                                <p className="font-medium">{item.product?.name_en}</p>
                                <p className="text-sm text-muted-foreground">
                                  {item.unit_price.toLocaleString()} {order.currency} × {item.quantity}
                                </p>
                              </div>
                              <div className="text-right">
                                <p className="font-medium">
                                  {item.total_price.toLocaleString()} {order.currency}
                                </p>
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>

                      {/* Order Details */}
                      <div className="space-y-4">
                        <div>
                          <h4 className="font-semibold mb-3">Delivery Information</h4>
                          <div className="space-y-2 text-sm">
                            <div>
                              <span className="text-muted-foreground">Address:</span>
                              <p className="mt-1">{order.delivery_address}</p>
                            </div>
                            
                            {order.delivery_instructions && (
                              <div>
                                <span className="text-muted-foreground">Instructions:</span>
                                <p className="mt-1">{order.delivery_instructions}</p>
                              </div>
                            )}

                            {order.notes && (
                              <div>
                                <span className="text-muted-foreground">Notes:</span>
                                <p className="mt-1">{order.notes}</p>
                              </div>
                            )}
                          </div>
                        </div>

                        <div>
                          <h4 className="font-semibold mb-3">Order Summary</h4>
                          <div className="space-y-2 text-sm">
                            <div className="flex justify-between">
                              <span>Subtotal</span>
                              <span>{order.subtotal.toLocaleString()} {order.currency}</span>
                            </div>
                            
                            {order.delivery_fee > 0 && (
                              <div className="flex justify-between">
                                <span>Delivery Fee</span>
                                <span>{order.delivery_fee.toLocaleString()} {order.currency}</span>
                              </div>
                            )}
                            
                            {order.tax_amount > 0 && (
                              <div className="flex justify-between">
                                <span>Tax</span>
                                <span>{order.tax_amount.toLocaleString()} {order.currency}</span>
                              </div>
                            )}
                            
                            {order.discount_amount > 0 && (
                              <div className="flex justify-between text-green-600">
                                <span>Discount</span>
                                <span>-{order.discount_amount.toLocaleString()} {order.currency}</span>
                              </div>
                            )}
                            
                            <div className="flex justify-between font-semibold text-lg pt-2 border-t">
                              <span>Total</span>
                              <span>{order.total_amount.toLocaleString()} {order.currency}</span>
                            </div>
                          </div>
                        </div>

                        {order.supplier && (
                          <div>
                            <h4 className="font-semibold mb-3">Supplier Contact</h4>
                            <div className="text-sm">
                              <p>{order.supplier.business_name}</p>
                              <p className="text-muted-foreground">{order.supplier.phone}</p>
                            </div>
                          </div>
                        )}
                      </div>
                    </div>
                  </CardContent>
                </CollapsibleContent>
              </Collapsible>
            </Card>
          );
        })}
      </div>
    </div>
  );
}