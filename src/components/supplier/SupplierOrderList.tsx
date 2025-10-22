import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Search, Eye, Clock, CheckCircle, Package, Truck, XCircle, Filter } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { formatDistanceToNow } from "date-fns";
import { OrderDetailsView } from "./OrderDetailsView";
import { useLanguage, translations } from "@/lib/language";

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

interface SupplierOrderListProps {
  supplierId: string;
}

export function SupplierOrderList({ supplierId }: SupplierOrderListProps) {
  const { language } = useLanguage();
  const t = translations[language];
  const [orders, setOrders] = useState<Order[]>([]);
  const [filteredOrders, setFilteredOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);
  const { toast } = useToast();

  useEffect(() => {
    fetchOrders();
    
    // Subscribe to real-time updates
    const channel = supabase
      .channel('supplier-orders')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'orders',
          filter: `supplier_id=eq.${supplierId}`
        },
        () => {
          fetchOrders();
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [supplierId]);

  useEffect(() => {
    filterOrders();
  }, [orders, searchTerm, statusFilter]);

  const fetchOrders = async () => {
    try {
      const { data, error } = await supabase
        .from("orders")
        .select(`
          *,
          customer:users!orders_user_id_fkey(
            first_name,
            last_name,
            phone,
            email
          ),
          order_items(
            *,
            product:products(
              name_en,
              image_url
            )
          )
        `)
        .eq("supplier_id", supplierId)
        .order("created_at", { ascending: false });

      if (error) throw error;

      setOrders(data || []);
    } catch (error) {
      console.error("Error fetching orders:", error);
      toast({
        title: "Error",
        description: "Failed to fetch orders",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const filterOrders = () => {
    let filtered = orders;

    if (statusFilter !== "all") {
      filtered = filtered.filter(order => order.status === statusFilter);
    }

    if (searchTerm) {
      filtered = filtered.filter(order =>
        order.order_number.toLowerCase().includes(searchTerm.toLowerCase()) ||
        order.customer?.first_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        order.customer?.last_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        order.customer?.phone?.includes(searchTerm)
      );
    }

    setFilteredOrders(filtered);
  };

  const updateOrderStatus = async (orderId: string, newStatus: string) => {
    try {
      const updates: any = { 
        status: newStatus,
        updated_at: new Date().toISOString()
      };

      // Add timestamps for specific status changes
      if (newStatus === 'ready') {
        updates.estimated_delivery_time = new Date(Date.now() + 30 * 60 * 1000).toISOString(); // 30 min from now
      } else if (newStatus === 'delivered') {
        updates.actual_delivery_time = new Date().toISOString();
      }

      const { error } = await supabase
        .from("orders")
        .update(updates)
        .eq("id", orderId);

      if (error) throw error;

      toast({
        title: "Status Updated",
        description: `Order status changed to ${statusConfig[newStatus as keyof typeof statusConfig].label}`,
      });

      fetchOrders();
    } catch (error) {
      console.error("Error updating order status:", error);
      toast({
        title: "Error",
        description: "Failed to update order status",
        variant: "destructive",
      });
    }
  };

  const getStatusCounts = () => {
    return Object.keys(statusConfig).reduce((acc, status) => {
      acc[status] = orders.filter(order => order.status === status).length;
      return acc;
    }, {} as Record<string, number>);
  };

  const statusCounts = getStatusCounts();

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-[400px]">
        <p className="text-muted-foreground">Loading orders...</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold">{t.orderManagement}</h2>
        <Badge variant="outline">{orders.length} {t.totalOrders}</Badge>
      </div>

      {/* Filters and Search - Clean Layout */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Filter className="h-5 w-5" />
            <span>{t.filters}</span>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col sm:flex-row gap-4">
            <div className="flex-1 space-y-2">
              <label className="text-sm font-medium">{t.searchOrders}</label>
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
                <Input
                  placeholder={t.searchPlaceholderOrders}
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10"
                />
              </div>
            </div>

            <div className="sm:w-64 space-y-2">
              <label className="text-sm font-medium">{t.filterByStatus}</label>
              <Select value={statusFilter} onValueChange={setStatusFilter}>
                <SelectTrigger>
                  <SelectValue placeholder={t.allStatuses} />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">{t.allStatuses} ({orders.length})</SelectItem>
                  {Object.entries(statusConfig).map(([status, config]) => (
                    <SelectItem key={status} value={status}>
                      {config.label} ({statusCounts[status] || 0})
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Status Tabs */}
      <Tabs value={statusFilter} onValueChange={setStatusFilter}>
        <TabsList className="grid w-full grid-cols-7 gap-1">
          <TabsTrigger value="all">{t.all} ({orders.length})</TabsTrigger>
          {Object.entries(statusConfig).map(([status, config]) => (
            <TabsTrigger key={status} value={status}>
              {config.label} ({statusCounts[status] || 0})
            </TabsTrigger>
          ))}
        </TabsList>

        <TabsContent value={statusFilter} className="mt-6">
          {filteredOrders.length === 0 ? (
            <Card>
              <CardContent className="p-12 text-center">
                <Package className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
                <h3 className="text-lg font-semibold mb-2">{t.noOrdersFound}</h3>
                <p className="text-muted-foreground">
                  {searchTerm || statusFilter !== "all" 
                    ? t.noOrdersMatch
                    : t.noOrdersYet
                  }
                </p>
              </CardContent>
            </Card>
          ) : (
            <div className="space-y-4">
              {filteredOrders.map((order) => {
                const statusInfo = statusConfig[order.status as keyof typeof statusConfig];
                const StatusIcon = statusInfo.icon;

                return (
                  <Card key={order.id} className="hover:shadow-md transition-shadow">
                    <CardContent className="p-6">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center space-x-4">
                          <div className={`p-2 rounded-full ${statusInfo.color}`}>
                            <StatusIcon className="h-5 w-5" />
                          </div>
                          
                          <div>
                            <div className="flex items-center space-x-2">
                              <h3 className="font-semibold">{order.order_number}</h3>
                              <Badge variant={statusInfo.variant}>
                                {statusInfo.label}
                              </Badge>
                            </div>
                            <p className="text-sm text-muted-foreground">
                              {order.customer?.first_name} {order.customer?.last_name} • 
                              {formatDistanceToNow(new Date(order.created_at), { addSuffix: true })}
                            </p>
                            <p className="text-sm text-muted-foreground">
                              {order.order_items?.length || 0} {t.items} • {order.total_amount.toLocaleString()} {order.currency}
                            </p>
                          </div>
                        </div>

                        <div className="flex items-center space-x-2">
                          {/* Status Action Buttons */}
                          {statusInfo.nextStatuses.map((nextStatus) => {
                            const nextStatusConfig = statusConfig[nextStatus as keyof typeof statusConfig];
                            return (
                              <Button
                                key={nextStatus}
                                variant={nextStatus === 'cancelled' ? 'destructive' : 'default'}
                                size="sm"
                                onClick={() => updateOrderStatus(order.id, nextStatus)}
                              >
                                {nextStatus === 'confirmed' && 'Confirm'}
                                {nextStatus === 'preparing' && 'Start Preparing'}
                                {nextStatus === 'ready' && 'Mark Ready'}
                                {nextStatus === 'delivered' && 'Mark Delivered'}
                                {nextStatus === 'cancelled' && 'Cancel'}
                              </Button>
                            );
                          })}

                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => setSelectedOrder(order)}
                          >
                            <Eye className="h-4 w-4 mr-2" />
                            View Details
                          </Button>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                );
              })}
            </div>
          )}
        </TabsContent>
      </Tabs>

      {/* Order Details Dialog */}
      {selectedOrder && (
        <Dialog open={!!selectedOrder} onOpenChange={() => setSelectedOrder(null)}>
          <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>Order Details - {selectedOrder.order_number}</DialogTitle>
            </DialogHeader>
            <OrderDetailsView 
              order={selectedOrder} 
              onStatusUpdate={(orderId, status) => {
                updateOrderStatus(orderId, status);
                setSelectedOrder(null);
              }}
              onClose={() => setSelectedOrder(null)}
            />
          </DialogContent>
        </Dialog>
      )}
    </div>
  );
}