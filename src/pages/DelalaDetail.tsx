import { useParams, Link } from "react-router-dom";
import { useLanguage } from "@/lib/language";
import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { LoadingState } from "@/components/ui/loading-spinner";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Carousel, CarouselContent, CarouselItem, CarouselNext, CarouselPrevious } from "@/components/ui/carousel";
import {
  ArrowLeft,
  Phone,
  MessageCircle,
  Heart,
  Share2,
  Flag,
  MapPin,
  Calendar,
  Truck,
  AlertTriangle,
  User,
} from "lucide-react";
import { formatDistanceToNow } from "date-fns";
import { ar } from "date-fns/locale";
import { ReportModal } from "@/components/delala/ReportModal";
import { useToast } from "@/hooks/use-toast";
import { Alert, AlertDescription } from "@/components/ui/alert";

export default function DelalaDetail() {
  const { id } = useParams();
  const { language } = useLanguage();
  const { toast } = useToast();
  const [listing, setListing] = useState<any>(null);
  const [seller, setSeller] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [isFavorite, setIsFavorite] = useState(false);
  const [reportModalOpen, setReportModalOpen] = useState(false);

  const isRTL = language === "ar";

  useEffect(() => {
    if (id) {
      fetchListing();
      incrementViews();
      checkFavorite();
    }
  }, [id]);

  const incrementViews = async () => {
    await supabase.rpc("increment_listing_views" as any, { listing_uuid: id });
  };

  const fetchListing = async () => {
    setLoading(true);
    try {
      const { data: listingData, error: listingError } = await supabase
        .from("delala_listings" as any)
        .select("*")
        .eq("id", id)
        .single();

      if (listingError) throw listingError;
      setListing(listingData);

      if (!listingData || typeof listingData !== "object") return;
      const dataObj = listingData as Record<string, any>;
      if ("user_id" in dataObj) {
        const userId = dataObj.user_id as string;
        if (userId) {
          const { data: userData } = await supabase
            .from("users")
            .select("first_name, last_name, email, created_at")
            .eq("id", userId)
            .single();

          setSeller(userData);
        }
      }
    } catch (error) {
      console.error("Error fetching listing:", error);
    } finally {
      setLoading(false);
    }
  };

  const checkFavorite = async () => {
    const {
      data: { user },
    } = await supabase.auth.getUser();
    if (!user) return;

    const { data } = await supabase
      .from("delala_favorites" as any)
      .select("id")
      .eq("user_id", user.id)
      .eq("listing_id", id)
      .single();

    setIsFavorite(!!data);
  };

  const handleFavoriteToggle = async () => {
    const {
      data: { user },
    } = await supabase.auth.getUser();
    if (!user) {
      toast({
        title: language === "ar" ? "تسجيل الدخول مطلوب" : "Login Required",
        variant: "destructive",
      });
      return;
    }

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
      console.error("Error toggling favorite:", error);
    }
  };

  const handleCall = () => {
    if (listing?.phone) {
      window.location.href = `tel:${listing.phone}`;
    }
  };

  const handleWhatsApp = () => {
    if (listing?.whatsapp_number) {
      const message = encodeURIComponent(
        `${language === "ar" ? "مرحباً، أنا مهتم بـ" : "Hi, I'm interested in"}: ${listing.title_ar || listing.title_en}`,
      );
      window.open(`https://wa.me/${listing.whatsapp_number}?text=${message}`, "_blank");
    }
  };

  const handleShare = async () => {
    if (navigator.share) {
      try {
        await navigator.share({
          title: listing?.title_ar || listing?.title_en,
          url: window.location.href,
        });
      } catch (error) {
        console.log("Share cancelled");
      }
    } else {
      navigator.clipboard.writeText(window.location.href);
      toast({
        title: language === "ar" ? "تم النسخ" : "Copied",
        description: language === "ar" ? "تم نسخ الرابط" : "Link copied to clipboard",
      });
    }
  };

  const conditionLabels: Record<string, { ar: string; en: string }> = {
    new: { ar: "جديد", en: "New" },
    like_new: { ar: "كالجديد", en: "Like New" },
    good: { ar: "جيد", en: "Good" },
    fair: { ar: "مقبول", en: "Fair" },
    poor: { ar: "سيئ", en: "Poor" },
  };

  if (loading) {
    return <LoadingState message={language === "ar" ? "جاري التحميل..." : "Loading..."} />;
  }

  if (!listing) {
    return (
      <div className="min-h-screen bg-background pb-24 flex items-center justify-center">
        <p>{language === "ar" ? "الإعلان غير موجود" : "Listing not found"}</p>
      </div>
    );
  }

  const images = listing.images || [];

  return (
    <div className="min-h-screen bg-background pb-24" dir={isRTL ? "rtl" : "ltr"}>
      <div className="container mx-auto px-3 sm:px-4 py-4 sm:py-6 max-w-5xl">
        <Link to="/delala">
          <Button variant="ghost" className="mb-4" style={{ flexDirection: isRTL ? "row-reverse" : "row" }}>
            <ArrowLeft
              className={`h-4 w-4 ${isRTL ? "ml-2" : "mr-2"}`}
              style={{ transform: isRTL ? "rotate(180deg)" : "none" }}
            />
            {language === "ar" ? "العودة" : "Back"}
          </Button>
        </Link>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 sm:gap-6">
          {/* Image Gallery - FIXED */}
          <div className="space-y-4">
            {images.length > 0 ? (
              <div className="w-full">
                <Carousel className="w-full" opts={{ align: "center", loop: true }}>
                  <CarouselContent className="-ml-0">
                    {images.map((image: string, index: number) => (
                      <CarouselItem key={index} className="pl-0">
                        <div className="aspect-square rounded-lg overflow-hidden bg-muted mx-auto">
                          <img
                            src={image}
                            alt={`${listing.title_ar || listing.title_en} - ${index + 1}`}
                            className="w-full h-full object-cover"
                          />
                        </div>
                      </CarouselItem>
                    ))}
                  </CarouselContent>
                  {images.length > 1 && (
                    <>
                      <CarouselPrevious className={`${isRTL ? "left-auto right-2" : "left-2"}`} />
                      <CarouselNext className={`${isRTL ? "right-auto left-2" : "right-2"}`} />
                    </>
                  )}
                </Carousel>
              </div>
            ) : (
              <div className="aspect-square rounded-lg bg-muted flex items-center justify-center">
                <p className="text-muted-foreground text-sm">{language === "ar" ? "لا توجد صور" : "No images"}</p>
              </div>
            )}
          </div>

          {/* Details */}
          <div className="space-y-4 sm:space-y-6">
            <div>
              <h1
                className="text-xl sm:text-2xl md:text-3xl font-bold mb-3 leading-tight"
                style={{ textAlign: isRTL ? "right" : "left" }}
              >
                {language === "ar" ? listing.title_ar : listing.title_en}
              </h1>
              <div
                className="flex items-center gap-2 mb-4 flex-wrap"
                style={{ justifyContent: isRTL ? "flex-end" : "flex-start" }}
              >
                <Badge variant="outline" className="text-xs">
                  {language === "ar" ? conditionLabels[listing.condition]?.ar : conditionLabels[listing.condition]?.en}
                </Badge>
                {listing.is_negotiable && (
                  <Badge className="bg-secondary text-xs">{language === "ar" ? "قابل للتفاوض" : "Negotiable"}</Badge>
                )}
                {listing.is_delivery_available && (
                  <Badge variant="outline" className="flex items-center gap-1 text-xs">
                    <Truck className="h-3 w-3" />
                    {language === "ar" ? "توصيل" : "Delivery"}
                  </Badge>
                )}
              </div>
              <p
                className="text-2xl sm:text-3xl md:text-4xl font-bold text-primary mb-4"
                style={{ textAlign: isRTL ? "right" : "left" }}
              >
                {listing.price.toLocaleString()} {listing.currency}
              </p>
            </div>

            <div
              className="flex items-center gap-2 text-xs sm:text-sm text-muted-foreground flex-wrap"
              style={{ direction: isRTL ? "rtl" : "ltr", justifyContent: isRTL ? "flex-end" : "flex-start" }}
            >
              <div className="flex items-center gap-1" style={{ flexDirection: isRTL ? "row-reverse" : "row" }}>
                <MapPin className="h-3.5 w-3.5 sm:h-4 sm:w-4" />
                <span>
                  {listing.location_city}
                  {listing.location_district && `, ${listing.location_district}`}
                </span>
              </div>
              <span>•</span>
              <div className="flex items-center gap-1" style={{ flexDirection: isRTL ? "row-reverse" : "row" }}>
                <Calendar className="h-3.5 w-3.5 sm:h-4 sm:w-4" />
                <span>
                  {formatDistanceToNow(new Date(listing.created_at), {
                    addSuffix: true,
                    locale: language === "ar" ? ar : undefined,
                  })}
                </span>
              </div>
            </div>

            <div style={{ textAlign: isRTL ? "right" : "left" }}>
              <h2 className="font-semibold mb-2 text-sm sm:text-base">{language === "ar" ? "الوصف" : "Description"}</h2>
              <p
                className="text-muted-foreground whitespace-pre-wrap text-sm sm:text-base"
                style={{ direction: isRTL ? "rtl" : "ltr" }}
              >
                {language === "ar" ? listing.description_ar : listing.description_en}
              </p>
            </div>

            {/* Action Buttons */}
            <div className="grid grid-cols-2 gap-2 sm:gap-3">
              <Button onClick={handleCall} size="lg" className="w-full h-11 sm:h-12 text-sm sm:text-base">
                <Phone className={`h-4 w-4 sm:h-5 sm:w-5 ${isRTL ? "ml-2" : "mr-2"}`} />
                {language === "ar" ? "اتصال" : "Call"}
              </Button>
              <Button
                onClick={handleWhatsApp}
                variant="outline"
                size="lg"
                className="w-full h-11 sm:h-12 text-sm sm:text-base"
              >
                <MessageCircle className={`h-4 w-4 sm:h-5 sm:w-5 ${isRTL ? "ml-2" : "mr-2"}`} />
                {language === "ar" ? "واتساب" : "WhatsApp"}
              </Button>
              <Button
                onClick={handleFavoriteToggle}
                variant="outline"
                size="lg"
                className="w-full h-11 sm:h-12 text-sm sm:text-base"
              >
                <Heart
                  className={`h-4 w-4 sm:h-5 sm:w-5 ${isRTL ? "ml-2" : "mr-2"} ${isFavorite ? "fill-primary text-primary" : ""}`}
                />
                {language === "ar" ? "حفظ" : "Save"}
              </Button>
              <Button
                onClick={handleShare}
                variant="outline"
                size="lg"
                className="w-full h-11 sm:h-12 text-sm sm:text-base"
              >
                <Share2 className={`h-4 w-4 sm:h-5 sm:w-5 ${isRTL ? "ml-2" : "mr-2"}`} />
                {language === "ar" ? "مشاركة" : "Share"}
              </Button>
            </div>

            {/* Report Button - FIXED */}
            <Button
              onClick={() => setReportModalOpen(true)}
              variant="destructive"
              size="lg"
              className="w-full h-11 sm:h-12 text-sm sm:text-base flex items-center justify-center gap-2"
            >
              {isRTL && <Flag className="h-4 w-4" />}
              <span>{language === "ar" ? "الإبلاغ عن هذا الإعلان" : "Report this listing"}</span>
              {!isRTL && <Flag className="h-4 w-4" />}
            </Button>

            {/* Safety Notice */}
            <Alert>
              <AlertTriangle className="h-4 w-4" />
              <AlertDescription
                className="text-xs sm:text-sm"
                style={{ direction: isRTL ? "rtl" : "ltr", textAlign: isRTL ? "right" : "left" }}
              >
                <div className="font-semibold mb-2">{language === "ar" ? "⚠️ نصائح السلامة" : "⚠️ Safety Tips"}</div>
                <ul
                  className="space-y-1 text-xs"
                  style={{ paddingRight: isRTL ? "1rem" : "0", paddingLeft: isRTL ? "0" : "1rem" }}
                >
                  <li>• {language === "ar" ? "التقِ في أماكن عامة" : "Meet in public places"}</li>
                  <li>• {language === "ar" ? "افحص قبل الدفع" : "Inspect before payment"}</li>
                  <li>• {language === "ar" ? "لا تشارك معلومات حساسة" : "Don't share sensitive info"}</li>
                  <li>• {language === "ar" ? "بلغ عن نشاط مشبوه" : "Report suspicious activity"}</li>
                </ul>
              </AlertDescription>
            </Alert>
          </div>
        </div>

        {/* Seller Info - FIXED */}
        {seller && (
          <Card className="mt-4 sm:mt-6" dir={isRTL ? "rtl" : "ltr"}>
            <CardHeader>
              <CardTitle
                className="flex items-center gap-2 text-base sm:text-lg"
                style={{
                  flexDirection: isRTL ? "row-reverse" : "row",
                  justifyContent: isRTL ? "flex-end" : "flex-start",
                }}
              >
                <User className="h-4 w-4 sm:h-5 sm:w-5" />
                {language === "ar" ? "معلومات البائع" : "Seller Information"}
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div
                className="flex items-start justify-between gap-4"
                style={{ flexDirection: isRTL ? "row-reverse" : "row" }}
              >
                <div className="flex-1" style={{ textAlign: isRTL ? "right" : "left" }}>
                  <p className="font-semibold text-sm sm:text-base">
                    {seller.first_name} {seller.last_name}
                  </p>
                  <p className="text-xs sm:text-sm text-muted-foreground">
                    {language === "ar" ? "عضو منذ" : "Member since"}{" "}
                    {new Date(seller.created_at).toLocaleDateString(language === "ar" ? "ar-RW" : "en-RW")}
                  </p>
                </div>
                <Button variant="outline" size="sm" className="text-xs sm:text-sm shrink-0 whitespace-nowrap" asChild>
                  <Link to={`/delala?seller=${listing.user_id}`}>
                    {language === "ar" ? "عرض جميع الإعلانات" : "View all listings"}
                  </Link>
                </Button>
              </div>
            </CardContent>
          </Card>
        )}

        <ReportModal open={reportModalOpen} onOpenChange={setReportModalOpen} listingId={id!} />
      </div>
    </div>
  );
}
