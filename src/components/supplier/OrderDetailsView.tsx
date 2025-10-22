import { useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { 
  Clock, 
  User, 
  MapPin, 
  Phone, 
  Mail, 
  Package, 
  CheckCircle, 
  Truck, 
  XCircle,
  MessageSquare,
  Calendar
} from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { formatDistanceToNow, format } from "date-fns";

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
  updated_at: string;
  estimated_delivery_time?: string;
  actual_delivery_time?: string;
  user_id: string;
  supplier_id: string;
  customer?: {
    first_name: string;
    last_name: string;
    phone: string;
    email: string;
  };
  order_items?: OrderItem[];
}

const statusConfig = {
  pending: { 
    label: 'Pending', 
    variant: 'secondary' as const, 
    icon: Clock,
    color: 'bg-yellow-100 text-yellow-800',
    nextStatuses: ['confirmed', 'cancelled']
  },
  confirmed: { 
    label: 'Confirmed', 
    variant: 'default' as const, 
    icon: CheckCircle,
    color: 'bg-blue-100 text-blue-800',
    nextStatuses: ['preparing', 'cancelled']
  },
  preparing: { 
    label: 'Preparing', 
    variant: 'default' as const, 
    icon: Package,
    color: 'bg-orange-100 text-orange-800',
    nextStatuses: ['ready', 'cancelled']
  },
  ready: { 
    label: 'Ready', 
    variant: 'default' as const, 
    icon: CheckCircle,
    color: 'bg-green-100 text-green-800',
    nextStatuses: ['delivered']
  },
  delivered: { 
    label: 'Delivered', 
    variant: 'default' as const, 
    icon: Truck,
    color: 'bg-green-100 text-green-800',
    nextStatuses: []
  },
  cancelled: { 
    label: 'Cancelled', 
    variant: 'destructive' as const, 
    icon: XCircle,
    color: 'bg-red-100 text-red-800',
    nextStatuses: []
  },
};

interface OrderDetailsViewProps {
  order: Order;
  onStatusUpdate: (orderId: string, status: string) => void;
  onClose: () => void;
}

export function OrderDetailsView({ order, onStatusUpdate, onClose }: OrderDetailsViewProps) {
  const [supplierNotes, setSupplierNotes] = useState("");
  const [estimatedTime, setEstimatedTime] = useState("");
  const [loading, setLoading] = useState(false);
  const { toast } = useToast();

  const statusInfo = statusConfig[order.status as keyof typeof statusConfig];
  const StatusIcon = statusInfo.icon;

  const updateSupplierNotes = async () => {
    if (!supplierNotes.trim()) return;

    setLoading(true);
    try {
      const { error } = await supabase
        .from("orders")
        .update({ 
          notes: supplierNotes,
          updated_at: new Date().toISOString()
        })
        .eq("id", order.id);

      if (error) throw error;

      toast({
        title: "Notes Updated",
        description: "Supplier notes have been saved",
      });

      setSupplierNotes("");
    } catch (error) {
      console.error("Error updating notes:", error);
      toast({
        title: "Error",
        description: "Failed to update notes",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const updateEstimatedTime = async () => {
    if (!estimatedTime) return;

    setLoading(true);
    try {
      const estimatedDateTime = new Date(estimatedTime).toISOString();
      
      const { error } = await supabase
        .from("orders")
        .update({ 
          estimated_delivery_time: estimatedDateTime,
          updated_at: new Date().toISOString()
        })
        .eq("id", order.id);

      if (error) throw error;

      toast({
        title: "Estimated Time Updated",
        description: "Estimated delivery time has been updated",
      });

      setEstimatedTime("");
    } catch (error) {
      console.error("Error updating estimated time:", error);
      toast({
        title: "Error",
        description: "Failed to update estimated time",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Order Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-3">
          <div className={`p-2 rounded-full ${statusInfo.color}`}>
            <StatusIcon className="h-6 w-6" />
          </div>
          <div>
            <h3 className="text-xl font-semibold">{order.order_number}</h3>
            <div className="flex items-center space-x-2 mt-1">
              <Badge variant={statusInfo.variant}>{statusInfo.label}</Badge>
              <span className="text-sm text-muted-foreground">
                Placed {formatDistanceToNow(new Date(order.created_at), { addSuffix: true })}
              </span>
            </div>
          </div>
        </div>

        <div className="text-right">
          <p className="text-2xl font-bold">{order.total_amount.toLocaleString()} {order.currency}</p>
          <p className="text-sm text-muted-foreground">
            Payment: {order.payment_status}
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Customer Information */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <User className="h-5 w-5" />
              <span>Customer Information</span>
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <h4 className="font-medium">
                {order.customer?.first_name} {order.customer?.last_name}
              </h4>
              <div className="space-y-2 mt-2 text-sm">
                <div className="flex items-center space-x-2">
                  <Phone className="h-4 w-4 text-muted-foreground" />
                  <span>{order.customer?.phone}</span>
                </div>
                <div className="flex items-center space-x-2">
                  <Mail className="h-4 w-4 text-muted-foreground" />
                  <span>{order.customer?.email}</span>
                </div>
              </div>
            </div>

            <Separator />

            <div>
              <div className="flex items-center space-x-2 mb-2">
                <MapPin className="h-4 w-4 text-muted-foreground" />
                <h4 className="font-medium">Delivery Address</h4>
              </div>
              <p className="text-sm">{order.delivery_address}</p>
              
              {order.delivery_instructions && (
                <div className="mt-2">
                  <p className="text-sm font-medium">Delivery Instructions:</p>
                  <p className="text-sm text-muted-foreground">{order.delivery_instructions}</p>
                </div>
              )}
            </div>

            {order.notes && (
              <>
                <Separator />
                <div>
                  <div className="flex items-center space-x-2 mb-2">
                    <MessageSquare className="h-4 w-4 text-muted-foreground" />
                    <h4 className="font-medium">Customer Notes</h4>
                  </div>
                  <p className="text-sm text-muted-foreground">{order.notes}</p>
                </div>
              </>
            )}
          </CardContent>
        </Card>

        {/* Order Timeline */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <Clock className="h-5 w-5" />
              <span>Order Timeline</span>
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-3">
              <div className="flex items-center space-x-2 text-sm">
                <span className="font-medium">Placed:</span>
                <span>{format(new Date(order.created_at), 'MMM dd, yyyy HH:mm')}</span>
              </div>
              
              {order.updated_at !== order.created_at && (
                <div className="flex items-center space-x-2 text-sm">
                  <span className="font-medium">Last Updated:</span>
                  <span>{format(new Date(order.updated_at), 'MMM dd, yyyy HH:mm')}</span>
                </div>
              )}

              {order.estimated_delivery_time && (
                <div className="flex items-center space-x-2 text-sm">
                  <span className="font-medium">Estimated Ready:</span>
                  <span>{format(new Date(order.estimated_delivery_time), 'MMM dd, yyyy HH:mm')}</span>
                </div>
              )}

              {order.actual_delivery_time && (
                <div className="flex items-center space-x-2 text-sm">
                  <span className="font-medium">Delivered:</span>
                  <span>{format(new Date(order.actual_delivery_time), 'MMM dd, yyyy HH:mm')}</span>
                </div>
              )}
            </div>

            <Separator />

            {/* Update Estimated Time */}
            <div className="space-y-2">
              <Label htmlFor="estimated-time">Update Estimated Ready Time</Label>
              <div className="flex space-x-2">
                <Input
                  id="estimated-time"
                  type="datetime-local"
                  value={estimatedTime}
                  onChange={(e) => setEstimatedTime(e.target.value)}
                  min={new Date().toISOString().slice(0, 16)}
                />
                <Button 
                  onClick={updateEstimatedTime}
                  disabled={!estimatedTime || loading}
                  size="sm"
                >
                  <Calendar className="h-4 w-4 mr-2" />
                  Update
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Order Items */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <Package className="h-5 w-5" />
            <span>Order Items ({order.order_items?.length || 0})</span>
          </CardTitle>
        </CardHeader>
        <CardContent>
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
                  {item.special_instructions && (
                    <p className="text-sm text-orange-600 mt-1">
                      Note: {item.special_instructions}
                    </p>
                  )}
                </div>
                <div className="text-right">
                  <p className="font-medium">
                    {item.total_price.toLocaleString()} {order.currency}
                  </p>
                </div>
              </div>
            ))}
          </div>

          <Separator className="my-4" />

          {/* Order Summary */}
          <div className="space-y-2">
            <div className="flex justify-between text-sm">
              <span>Subtotal</span>
              <span>{order.subtotal.toLocaleString()} {order.currency}</span>
            </div>
            
            {order.delivery_fee > 0 && (
              <div className="flex justify-between text-sm">
                <span>Delivery Fee</span>
                <span>{order.delivery_fee.toLocaleString()} {order.currency}</span>
              </div>
            )}
            
            {order.tax_amount > 0 && (
              <div className="flex justify-between text-sm">
                <span>Tax</span>
                <span>{order.tax_amount.toLocaleString()} {order.currency}</span>
              </div>
            )}
            
            {order.discount_amount > 0 && (
              <div className="flex justify-between text-sm text-green-600">
                <span>Discount</span>
                <span>-{order.discount_amount.toLocaleString()} {order.currency}</span>
              </div>
            )}
            
            <Separator />
            
            <div className="flex justify-between font-semibold text-lg">
              <span>Total</span>
              <span>{order.total_amount.toLocaleString()} {order.currency}</span>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Supplier Notes */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <MessageSquare className="h-5 w-5" />
            <span>Supplier Notes</span>
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="supplier-notes">Add notes for this order</Label>
            <Textarea
              id="supplier-notes"
              value={supplierNotes}
              onChange={(e) => setSupplierNotes(e.target.value)}
              placeholder="Add any notes about this order..."
              rows={3}
            />
            <Button 
              onClick={updateSupplierNotes}
              disabled={!supplierNotes.trim() || loading}
              size="sm"
            >
              Save Notes
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Action Buttons */}
      <div className="flex items-center justify-between pt-4">
        <div className="flex space-x-2">
          {statusInfo.nextStatuses.map((nextStatus) => (
            <Button
              key={nextStatus}
              variant={nextStatus === 'cancelled' ? 'destructive' : 'default'}
              onClick={() => onStatusUpdate(order.id, nextStatus)}
            >
              {nextStatus === 'confirmed' && 'Confirm Order'}
              {nextStatus === 'preparing' && 'Start Preparing'}
              {nextStatus === 'ready' && 'Mark Ready for Delivery'}
              {nextStatus === 'delivered' && 'Mark as Delivered'}
              {nextStatus === 'cancelled' && 'Cancel Order'}
            </Button>
          ))}
        </div>

        <Button variant="outline" onClick={onClose}>
          Close
        </Button>
      </div>
    </div>
  );
}