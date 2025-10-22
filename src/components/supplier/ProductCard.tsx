import React from 'react';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { useLanguage } from '@/lib/language';
import { 
  Edit, 
  Trash2, 
  Clock, 
  Eye, 
  EyeOff 
} from 'lucide-react';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from '@/components/ui/alert-dialog';

interface ProductCardProps {
  product: any;
  onEdit: (product: any) => void;
  onDelete: (productId: string) => void;
  categories: any[];
}

export const ProductCard: React.FC<ProductCardProps> = ({ 
  product, 
  onEdit, 
  onDelete, 
  categories 
}) => {
  const { language } = useLanguage();
  
  const formatPrice = (price: number) => {
    return `RWF ${price.toLocaleString()}`;
  };

  const getCategoryName = (categoryId: string) => {
    const category = categories.find(cat => cat.id === categoryId);
    if (!category) return 'No Category';
    return language === 'ar' ? (category.name_ar || category.name_en) : (category.name_en || category.name);
  };

  return (
    <Card className={`relative ${!product.is_available ? 'opacity-60' : ''}`}>
      {!product.is_available && (
        <div className="absolute top-2 left-2 z-10">
          <Badge variant="secondary" className="bg-red-100 text-red-800">
            <EyeOff className="h-3 w-3 mr-1" />
            Unavailable
          </Badge>
        </div>
      )}

      <CardHeader className="p-0">
        <div className="relative w-full aspect-video overflow-hidden rounded-t-lg bg-muted">
          {product.image_url ? (
            <img 
              src={product.image_url} 
              alt={product.name_en}
              className="absolute inset-0 w-full h-full object-cover"
              onError={(e) => {
                e.currentTarget.style.display = 'none';
                e.currentTarget.parentElement!.innerHTML = '<div class="flex items-center justify-center h-full"><span class="text-muted-foreground">No Image</span></div>';
              }}
            />
          ) : (
            <div className="flex items-center justify-center h-full">
              <span className="text-muted-foreground">No Image</span>
            </div>
          )}
        </div>
      </CardHeader>

      <CardContent className="p-4">
        <div className="space-y-3">
          {/* Product Name */}
          <div>
            <h3 className="font-semibold text-lg line-clamp-1">
              {product.name_en}
            </h3>
            {product.name_ar && (
              <p className="text-sm text-muted-foreground" dir="rtl">
                {product.name_ar}
              </p>
            )}
          </div>

          {/* Description */}
          {product.description_en && (
            <p className="text-sm text-muted-foreground line-clamp-2">
              {product.description_en}
            </p>
          )}

           {/* Price and Category */}
          <div className="flex justify-between items-center">
            <span className="text-lg font-bold text-primary">
              {formatPrice(product.price)}
            </span>
            <Badge variant="outline" className="text-xs">
              {product.category_id ? getCategoryName(product.category_id) : 'No Category'}
            </Badge>
          </div>

          {/* Preparation Time */}
          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            <Clock className="h-4 w-4" />
            <span>{product.preparation_time} min prep</span>
          </div>

          {/* Availability Badge */}
          <div className="flex items-center gap-2">
            {product.is_available ? (
              <Badge className="bg-green-100 text-green-800">
                <Eye className="h-3 w-3 mr-1" />
                Available
              </Badge>
            ) : (
              <Badge variant="secondary" className="bg-red-100 text-red-800">
                <EyeOff className="h-3 w-3 mr-1" />
                Unavailable
              </Badge>
            )}
          </div>

          {/* Action Buttons */}
          <div className="flex gap-2 pt-2">
            <Button 
              variant="outline" 
              size="sm" 
              onClick={() => onEdit(product)}
              className="flex-1"
            >
              <Edit className="h-4 w-4 mr-2" />
              Edit
            </Button>

            <AlertDialog>
              <AlertDialogTrigger asChild>
                <Button variant="destructive" size="sm">
                  <Trash2 className="h-4 w-4" />
                </Button>
              </AlertDialogTrigger>
              <AlertDialogContent>
                <AlertDialogHeader>
                  <AlertDialogTitle>Delete Product</AlertDialogTitle>
                  <AlertDialogDescription>
                    Are you sure you want to delete "{product.name_en}"? This action cannot be undone.
                  </AlertDialogDescription>
                </AlertDialogHeader>
                <AlertDialogFooter>
                  <AlertDialogCancel>Cancel</AlertDialogCancel>
                  <AlertDialogAction 
                    onClick={() => onDelete(product.id)}
                    className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                  >
                    Delete
                  </AlertDialogAction>
                </AlertDialogFooter>
              </AlertDialogContent>
            </AlertDialog>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};