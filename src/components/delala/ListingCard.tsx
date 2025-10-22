import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Heart, MapPin } from "lucide-react";
import { useLanguage } from "@/lib/language";
import { formatDistanceToNow } from "date-fns";
import { ar } from "date-fns/locale";
import { Link } from "react-router-dom";
import { useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";

interface ListingCardProps {
  id: string;
  images: any[];
  titleAr: string;
  titleEn: string;
  price: number;
  currency: string;
  isNegotiable: boolean;
  condition: string;
  locationCity: string;
  createdAt: string;
  userId: string;
  isFavorited?: boolean;
}

export function ListingCard({
  id,
  images,
  titleAr,
  titleEn,
  price,
  currency,
  isNegotiable,
  condition,
  locationCity,
  createdAt,
  userId,
  isFavorited = false,
}: ListingCardProps) {
  const { language } = useLanguage();
  const { toast } = useToast();
  const [isFavorite, setIsFavorite] = useState(isFavorited);
  const [isLoading, setIsLoading] = useState(false);

  const firstImage = images && images.length > 0 ? images[0] : null;
  const title = language === "ar" ? titleAr : titleEn;
  const isRTL = language === "ar";

  const conditionLabels: Record<string, { ar: string; en: string }> = {
    new: { ar: "جديد", en: "New" },
    like_new: { ar: "كالجديد", en: "Like New" },
    good: { ar: "جيد", en: "Good" },
    fair: { ar: "مقبول", en: "Fair" },
    poor: { ar: "سيئ", en: "Poor" },
  };

  const handleFavoriteToggle = async (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();

    const {
      data: { user },
    } = await supabase.auth.getUser();
    if (!user) {
      toast({
        title: language === "ar" ? "تسجيل الدخول مطلوب" : "Login Required",
        description: language === "ar" ? "يرجى تسجيل الدخول لحفظ المفضلات" : "Please login to save favorites",
        variant: "destructive",
      });
      return;
    }

    setIsLoading(true);
    try {
      if (isFavorite) {
        await supabase
          .from("delala_favorites" as any)
          .delete()
          .eq("user_id", user.id)
          .eq("listing_id", id);
      } else {
        await supabase.from("delala_favorites" as any).insert({ user_id: user.id, listing_id: id });
      }
      setIsFavorite(!isFavorite);
    } catch (error) {
      toast({
        title: language === "ar" ? "خطأ" : "Error",
        description: language === "ar" ? "فشل في حفظ المفضلة" : "Failed to save favorite",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Link to={`/delala/${id}`}>
      <Card className="overflow-hidden hover:shadow-lg transition-all duration-300 hover-scale group">
        <div className="relative aspect-square overflow-hidden bg-muted">
          {firstImage ? (
            <img
              src={firstImage}
              alt={title}
              className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
            />
          ) : (
            <div className="w-full h-full flex items-center justify-center text-muted-foreground text-xs sm:text-sm">
              {language === "ar" ? "لا توجد صورة" : "No Image"}
            </div>
          )}
          <button
            onClick={handleFavoriteToggle}
            disabled={isLoading}
            style={isRTL ? { left: "0.5rem" } : { right: "0.5rem" }}
            className="absolute top-2 p-1.5 sm:p-2 rounded-full bg-background/80 backdrop-blur-sm hover:bg-background transition-colors"
          >
            <Heart
              className={`h-4 w-4 sm:h-5 sm:w-5 transition-colors ${
                isFavorite ? "fill-primary text-primary" : "text-muted-foreground"
              }`}
            />
          </button>
          {isNegotiable && (
            <Badge
              style={isRTL ? { right: "0.5rem" } : { left: "0.5rem" }}
              className="absolute top-2 bg-secondary/90 backdrop-blur-sm text-[10px] sm:text-xs px-1.5 sm:px-2 py-0.5"
            >
              {language === "ar" ? "قابل للتفاوض" : "Negotiable"}
            </Badge>
          )}
        </div>
        <CardContent
          className="p-2.5 sm:p-3 md:p-4 space-y-2 sm:space-y-2.5"
          style={{ direction: isRTL ? "rtl" : "ltr" }}
        >
          <h3
            className="font-semibold line-clamp-2 text-xs sm:text-sm md:text-base leading-[1.35] sm:leading-[1.4]"
            style={{ textAlign: isRTL ? "right" : "left" }}
          >
            {title}
          </h3>
          <div
            className="flex items-center justify-between gap-1.5 pt-0.5"
            style={{ flexDirection: isRTL ? "row-reverse" : "row" }}
          >
            <p className="text-sm sm:text-base md:text-lg font-bold text-primary">
              {price.toLocaleString()} <span className="text-xs sm:text-sm">{currency}</span>
            </p>
            <Badge variant="outline" className="text-[10px] sm:text-xs px-1.5 sm:px-2 py-0.5 shrink-0">
              {language === "ar" ? conditionLabels[condition]?.ar : conditionLabels[condition]?.en}
            </Badge>
          </div>
          <div className="flex items-center justify-between text-[10px] sm:text-xs text-muted-foreground gap-1">
            <div
              className="flex items-center gap-0.5 sm:gap-1 min-w-0"
              style={{ flexDirection: isRTL ? "row-reverse" : "row" }}
            >
              <MapPin className="h-3 w-3 sm:h-4 sm:w-4 shrink-0" />
              <span className="truncate">{locationCity}</span>
            </div>
            <p className="text-[9px] sm:text-[10px] md:text-xs whitespace-nowrap shrink-0">
              {formatDistanceToNow(new Date(createdAt), {
                addSuffix: true,
                locale: language === "ar" ? ar : undefined,
              })}
            </p>
          </div>
        </CardContent>
      </Card>
    </Link>
  );
}
