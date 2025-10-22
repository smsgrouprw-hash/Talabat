import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { SupplierOrderList } from "@/components/supplier/SupplierOrderList";
import { useAuth } from "@/hooks/useAuth";
import { useToast } from "@/hooks/use-toast";

export default function SupplierOrderManagement() {
  const [supplierId, setSupplierId] = useState<string>("");
  const [loading, setLoading] = useState(true);
  const { user } = useAuth();
  const { toast } = useToast();

  useEffect(() => {
    if (user) {
      fetchSupplierInfo();
    }
  }, [user]);

  const fetchSupplierInfo = async () => {
    try {
      const { data, error } = await supabase
        .from("suppliers")
        .select("id")
        .eq("user_id", user?.id)
        .single();

      if (error) throw error;

      setSupplierId(data.id);
    } catch (error) {
      console.error("Error fetching supplier info:", error);
      toast({
        title: "Error",
        description: "Failed to fetch supplier information",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="container mx-auto py-6">
        <div className="flex justify-center items-center min-h-[400px]">
          <p className="text-muted-foreground">Loading...</p>
        </div>
      </div>
    );
  }

  if (!supplierId) {
    return (
      <div className="container mx-auto py-6">
        <div className="text-center">
          <h1 className="text-2xl font-bold mb-4">Supplier Not Found</h1>
          <p className="text-muted-foreground">
            No supplier account found. Please contact support.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto py-6">
      <SupplierOrderList supplierId={supplierId} />
    </div>
  );
}