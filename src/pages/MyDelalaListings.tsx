import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { useLanguage } from "@/lib/language";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Eye, Phone, Edit, Trash2, CheckCircle, RefreshCw, Package, TrendingUp, FileText, Clock } from "lucide-react";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";

interface Listing {
  id: string;
  title_ar: string;
  title_en: string;
  price: number;
  currency: string;
  status: string;
  images: any;
  views_count: number;
  contact_views_count: number;
  created_at: string;
  expires_at: string;
}

export default function MyDelalaListings() {
  const [listings, setListings] = useState<Listing[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState("active");
  const [deleteId, setDeleteId] = useState<string | null>(null);
  const { toast } = useToast();
  const navigate = useNavigate();
  const { language } = useLanguage();
  const isArabic = language === "ar";

  useEffect(() => {
    fetchListings();
  }, []);

  const fetchListings = async () => {
    try {
      const {
        data: { user },
      } = await supabase.auth.getUser();
      if (!user) {
        navigate("/auth");
        return;
      }

      const { data, error } = await (supabase as any)
        .from("delala_listings")
        .select("*")
        .eq("user_id", user.id)
        .order("created_at", { ascending: false });

      if (error) throw error;
      setListings(data || []);
    } catch (error: any) {
      toast({
        title: isArabic ? "خطأ" : "Error",
        description: error.message,
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const filterListings = (status: string) => {
    const now = new Date();
    return listings.filter((listing) => {
      if (status === "expired") {
        return listing.status === "expired" || new Date(listing.expires_at) < now;
      }
      return listing.status === status;
    });
  };

  const handleMarkAsSold = async (id: string) => {
    try {
      const { error } = await (supabase as any).from("delala_listings").update({ status: "sold" }).eq("id", id);

      if (error) throw error;

      toast({
        title: isArabic ? "نجح" : "Success",
        description: isArabic ? "تم وضع علامة على العنصر كمباع" : "Item marked as sold",
      });
      fetchListings();
    } catch (error: any) {
      toast({
        title: isArabic ? "خطأ" : "Error",
        description: error.message,
        variant: "destructive",
      });
    }
  };

  const handleDelete = async () => {
    if (!deleteId) return;

    try {
      const { error } = await (supabase as any).from("delala_listings").delete().eq("id", deleteId);

      if (error) throw error;

      toast({
        title: isArabic ? "نجح" : "Success",
        description: isArabic ? "تم حذف الإعلان" : "Listing deleted",
      });
      fetchListings();
    } catch (error: any) {
      toast({
        title: isArabic ? "خطأ" : "Error",
        description: error.message,
        variant: "destructive",
      });
    } finally {
      setDeleteId(null);
    }
  };

  const handleRenew = async (id: string) => {
    try {
      const newExpiry = new Date();
      newExpiry.setDate(newExpiry.getDate() + 60);

      const { error } = await (supabase as any)
        .from("delala_listings")
        .update({
          expires_at: newExpiry.toISOString(),
          status: "active",
        })
        .eq("id", id);

      if (error) throw error;

      toast({
        title: isArabic ? "نجح" : "Success",
        description: isArabic ? "تم تجديد الإعلان لـ 60 يومًا" : "Listing renewed for 60 days",
      });
      fetchListings();
    } catch (error: any) {
      toast({
        title: isArabic ? "خطأ" : "Error",
        description: error.message,
        variant: "destructive",
      });
    }
  };

  const statistics = {
    total: listings.length,
    totalViews: listings.reduce((sum, l) => sum + l.views_count, 0),
    sold: listings.filter((l) => l.status === "sold").length,
    active: listings.filter((l) => l.status === "active").length,
  };

  const ListingCard = ({ listing }: { listing: Listing }) => {
    const images = Array.isArray(listing.images) ? listing.images : [];
    const firstImage = images[0];

    return (
      <Card className="overflow-hidden hover:shadow-md transition-shadow">
        <div className={`flex gap-4 p-4 ${isArabic ? "flex-row-reverse" : ""}`}>
          <div className="w-24 h-24 flex-shrink-0 bg-muted rounded-lg overflow-hidden">
            {firstImage ? (
              <img src={firstImage} alt={listing.title_en} className="w-full h-full object-cover" />
            ) : (
              <div className="w-full h-full flex items-center justify-center text-muted-foreground">
                <Package className="w-8 h-8" />
              </div>
            )}
          </div>

          <div className="flex-1 min-w-0">
            <div className={`flex items-start justify-between gap-2 ${isArabic ? "flex-row-reverse" : ""}`}>
              <div className="flex-1 min-w-0">
                <h3 className="font-semibold truncate">{isArabic ? listing.title_ar : listing.title_en}</h3>
                <p className="text-sm text-muted-foreground truncate">
                  {isArabic ? listing.title_en : listing.title_ar}
                </p>
                <p className="text-lg font-bold text-primary mt-1">
                  {listing.price.toLocaleString()} {listing.currency}
                </p>
              </div>
              <Badge
                variant={
                  listing.status === "active"
                    ? "default"
                    : listing.status === "sold"
                      ? "secondary"
                      : listing.status === "draft"
                        ? "outline"
                        : "destructive"
                }
              >
                {listing.status === "active"
                  ? isArabic
                    ? "نشط"
                    : "Active"
                  : listing.status === "sold"
                    ? isArabic
                      ? "مباع"
                      : "Sold"
                    : listing.status === "draft"
                      ? isArabic
                        ? "مسودة"
                        : "Draft"
                      : isArabic
                        ? "منتهي"
                        : "Expired"}
              </Badge>
            </div>

            <div className={`flex gap-4 mt-2 text-sm text-muted-foreground ${isArabic ? "flex-row-reverse" : ""}`}>
              <span className="flex items-center gap-1">
                <Eye className="w-4 h-4" />
                {listing.views_count}
              </span>
              <span className="flex items-center gap-1">
                <Phone className="w-4 h-4" />
                {listing.contact_views_count}
              </span>
            </div>

            <div className={`flex flex-wrap gap-2 mt-3 ${isArabic ? "flex-row-reverse" : ""}`}>
              <Button
                size="sm"
                variant="outline"
                onClick={() => navigate(`/delala/edit/${listing.id}`)}
                className="flex items-center gap-1"
              >
                <Edit className="w-4 h-4" />
                {isArabic ? "تعديل" : "Edit"}
              </Button>

              {listing.status === "active" && (
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => handleMarkAsSold(listing.id)}
                  className="flex items-center gap-1"
                >
                  <CheckCircle className="w-4 h-4" />
                  {isArabic ? "تم البيع" : "Sold"}
                </Button>
              )}

              {(listing.status === "expired" || new Date(listing.expires_at) < new Date()) && (
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => handleRenew(listing.id)}
                  className="flex items-center gap-1"
                >
                  <RefreshCw className="w-4 h-4" />
                  {isArabic ? "تجديد" : "Renew"}
                </Button>
              )}

              <Button
                size="sm"
                variant="destructive"
                onClick={() => setDeleteId(listing.id)}
                className="flex items-center gap-1"
              >
                <Trash2 className="w-4 h-4" />
                {isArabic ? "حذف" : "Delete"}
              </Button>
            </div>
          </div>
        </div>
      </Card>
    );
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary" />
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-6 sm:py-8 max-w-6xl" dir={isArabic ? "rtl" : "ltr"}>
      <div
        className={`flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-6 ${isArabic ? "sm:flex-row-reverse" : ""}`}
      >
        <h1 className="text-2xl sm:text-3xl font-bold">{isArabic ? "إعلاناتي" : "My Listings"}</h1>
        <Button onClick={() => navigate("/delala/post")} className="w-full sm:w-auto">
          {isArabic ? "إضافة إعلان جديد" : "Add New Listing"}
        </Button>
      </div>

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4 mb-6 sm:mb-8">
        <Card>
          <CardHeader
            className={`flex flex-row items-center justify-between space-y-0 pb-2 ${isArabic ? "flex-row-reverse" : ""}`}
          >
            <CardTitle className="text-xs sm:text-sm font-medium">{isArabic ? "إجمالي الإعلانات" : "Total"}</CardTitle>
            <FileText className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-xl sm:text-2xl font-bold">{statistics.total}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader
            className={`flex flex-row items-center justify-between space-y-0 pb-2 ${isArabic ? "flex-row-reverse" : ""}`}
          >
            <CardTitle className="text-xs sm:text-sm font-medium">{isArabic ? "إجمالي المشاهدات" : "Views"}</CardTitle>
            <Eye className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-xl sm:text-2xl font-bold">{statistics.totalViews}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader
            className={`flex flex-row items-center justify-between space-y-0 pb-2 ${isArabic ? "flex-row-reverse" : ""}`}
          >
            <CardTitle className="text-xs sm:text-sm font-medium">{isArabic ? "تم البيع" : "Sold"}</CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-xl sm:text-2xl font-bold">{statistics.sold}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader
            className={`flex flex-row items-center justify-between space-y-0 pb-2 ${isArabic ? "flex-row-reverse" : ""}`}
          >
            <CardTitle className="text-xs sm:text-sm font-medium">{isArabic ? "نشط" : "Active"}</CardTitle>
            <Clock className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-xl sm:text-2xl font-bold">{statistics.active}</div>
          </CardContent>
        </Card>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="grid w-full grid-cols-2 sm:grid-cols-4 h-auto">
          <TabsTrigger value="active" className="text-xs sm:text-sm py-2">
            {isArabic ? "نشط" : "Active"} ({filterListings("active").length})
          </TabsTrigger>
          <TabsTrigger value="sold" className="text-xs sm:text-sm py-2">
            {isArabic ? "مباع" : "Sold"} ({filterListings("sold").length})
          </TabsTrigger>
          <TabsTrigger value="draft" className="text-xs sm:text-sm py-2">
            {isArabic ? "مسودة" : "Draft"} ({filterListings("draft").length})
          </TabsTrigger>
          <TabsTrigger value="expired" className="text-xs sm:text-sm py-2">
            {isArabic ? "منتهي" : "Expired"} ({filterListings("expired").length})
          </TabsTrigger>
        </TabsList>

        <TabsContent value="active" className="space-y-4 mt-6">
          {filterListings("active").length === 0 ? (
            <div className="text-center py-12 text-muted-foreground">
              {isArabic ? "لا توجد إعلانات نشطة" : "No active listings"}
            </div>
          ) : (
            filterListings("active").map((listing) => <ListingCard key={listing.id} listing={listing} />)
          )}
        </TabsContent>

        <TabsContent value="sold" className="space-y-4 mt-6">
          {filterListings("sold").length === 0 ? (
            <div className="text-center py-12 text-muted-foreground">
              {isArabic ? "لا توجد عناصر مباعة" : "No sold items"}
            </div>
          ) : (
            filterListings("sold").map((listing) => <ListingCard key={listing.id} listing={listing} />)
          )}
        </TabsContent>

        <TabsContent value="draft" className="space-y-4 mt-6">
          {filterListings("draft").length === 0 ? (
            <div className="text-center py-12 text-muted-foreground">{isArabic ? "لا توجد مسودات" : "No drafts"}</div>
          ) : (
            filterListings("draft").map((listing) => <ListingCard key={listing.id} listing={listing} />)
          )}
        </TabsContent>

        <TabsContent value="expired" className="space-y-4 mt-6">
          {filterListings("expired").length === 0 ? (
            <div className="text-center py-12 text-muted-foreground">
              {isArabic ? "لا توجد إعلانات منتهية" : "No expired listings"}
            </div>
          ) : (
            filterListings("expired").map((listing) => <ListingCard key={listing.id} listing={listing} />)
          )}
        </TabsContent>
      </Tabs>

      <AlertDialog open={!!deleteId} onOpenChange={() => setDeleteId(null)}>
        <AlertDialogContent dir={isArabic ? "rtl" : "ltr"}>
          <AlertDialogHeader>
            <AlertDialogTitle>{isArabic ? "هل أنت متأكد؟" : "Are you sure?"}</AlertDialogTitle>
            <AlertDialogDescription>
              {isArabic
                ? "لا يمكن التراجع عن هذا الإجراء. سيتم حذف الإعلان نهائيًا."
                : "This action cannot be undone. The listing will be permanently deleted."}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter className={isArabic ? "flex-row-reverse" : ""}>
            <AlertDialogCancel>{isArabic ? "إلغاء" : "Cancel"}</AlertDialogCancel>
            <AlertDialogAction onClick={handleDelete}>{isArabic ? "حذف" : "Delete"}</AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
