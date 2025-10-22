import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { MapPin, Clock, Star, Truck } from "lucide-react";
import { Link } from "react-router-dom";

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
  is_featured: boolean;
  is_verified: boolean;
  is_active: boolean;
  business_hours?: any;
  created_at?: string;
  updated_at?: string;
}

interface SupplierCardProps {
  supplier: Supplier;
}

export function SupplierCard({ supplier }: SupplierCardProps) {
  return (
    <Card className="card-hover overflow-hidden group">
      {supplier.cover_image_url && (
        <div className="h-48 overflow-hidden relative">
          <img
            src={supplier.cover_image_url}
            alt={supplier.business_name}
            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-normal"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-normal" />
        </div>
      )}
      
      <CardHeader className="pb-3">
        <div className="flex items-start justify-between">
          <div className="flex items-center space-x-3">
            {supplier.logo_url && (
              <img
                src={supplier.logo_url}
                alt={`${supplier.business_name} logo`}
                className="h-12 w-12 rounded-full object-cover border-2 border-background shadow-md ring-2 ring-primary/10"
              />
            )}
            <div className="flex-1 min-w-0">
              <CardTitle className="text-lg truncate">{supplier.business_name}</CardTitle>
              {supplier.cuisine_type && (
                <Badge variant="secondary" className="mt-1 text-xs">
                  {supplier.cuisine_type}
                </Badge>
              )}
            </div>
          </div>
          {supplier.is_featured && (
            <Badge className="btn-gradient border-0 text-white font-medium">
              Featured
            </Badge>
          )}
        </div>
      </CardHeader>

      <CardContent className="space-y-4">
        {supplier.description && (
          <p className="text-sm text-muted-foreground line-clamp-2">
            {supplier.description}
          </p>
        )}

        <div className="flex items-center space-x-4 text-sm text-muted-foreground">
          <div className="flex items-center space-x-1">
            <MapPin className="h-4 w-4" />
            <span>{supplier.city}</span>
          </div>
          
          {supplier.rating && supplier.rating > 0 && (
            <div className="flex items-center space-x-1">
              <Star className="h-4 w-4 fill-yellow-400 text-yellow-400" />
              <span>{supplier.rating.toFixed(1)}</span>
              {supplier.total_reviews && supplier.total_reviews > 0 && (
                <span>({supplier.total_reviews})</span>
              )}
            </div>
          )}
        </div>

        <div className="flex items-center justify-between text-sm">
          <div className="flex items-center space-x-1 text-muted-foreground">
            <Clock className="h-4 w-4" />
            <span>
              {supplier.delivery_time_min}-{supplier.delivery_time_max} min
            </span>
          </div>
          
          <div className="flex items-center space-x-1 text-muted-foreground">
            <Truck className="h-4 w-4" />
            <span>
              {supplier.delivery_fee ? `${supplier.delivery_fee} RWF` : 'Free delivery'}
            </span>
          </div>
        </div>

        {supplier.minimum_order && supplier.minimum_order > 0 && (
          <div className="text-sm text-muted-foreground">
            Minimum order: {supplier.minimum_order} RWF
          </div>
        )}

        <Link to={`/customer/supplier/${supplier.id}`}>
          <Button className="w-full touch-target focus-ring" size="lg">
            View Menu
          </Button>
        </Link>
      </CardContent>
    </Card>
  );
}