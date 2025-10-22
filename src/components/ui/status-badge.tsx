import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import { Clock, CheckCircle, Package, Truck, X, AlertCircle } from "lucide-react";

interface StatusBadgeProps {
  status: 'pending' | 'confirmed' | 'preparing' | 'ready' | 'delivered' | 'cancelled';
  className?: string;
  showIcon?: boolean;
}

const statusConfig = {
  pending: {
    label: 'Pending',
    icon: Clock,
    className: 'status-pending'
  },
  confirmed: {
    label: 'Confirmed', 
    icon: CheckCircle,
    className: 'status-confirmed'
  },
  preparing: {
    label: 'Preparing',
    icon: Package,
    className: 'status-preparing'
  },
  ready: {
    label: 'Ready',
    icon: AlertCircle,
    className: 'status-ready'
  },
  delivered: {
    label: 'Delivered',
    icon: Truck,
    className: 'status-delivered'
  },
  cancelled: {
    label: 'Cancelled',
    icon: X,
    className: 'status-cancelled'
  }
};

export function StatusBadge({ status, className, showIcon = true }: StatusBadgeProps) {
  const config = statusConfig[status];
  const Icon = config.icon;

  return (
    <Badge 
      variant="outline" 
      className={cn(
        config.className,
        "flex items-center gap-1 font-medium",
        className
      )}
    >
      {showIcon && <Icon className="h-3 w-3" />}
      {config.label}
    </Badge>
  );
}