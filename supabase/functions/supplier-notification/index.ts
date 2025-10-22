import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.58.0';

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type",
};

interface SupplierNotificationRequest {
  supplierId: string;
  action: 'approved' | 'rejected';
  adminEmail?: string;
}

const handler = async (req: Request): Promise<Response> => {
  // Handle CORS preflight requests
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    console.log('Processing supplier notification request...');
    
    const { supplierId, action, adminEmail }: SupplierNotificationRequest = await req.json();

    // Initialize Supabase client
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
    const supabase = createClient(supabaseUrl, supabaseKey);

    // Fetch supplier and user details
    const { data: supplier, error: supplierError } = await supabase
      .from('suppliers')
      .select(`
        *,
        users (
          email,
          first_name,
          last_name
        )
      `)
      .eq('id', supplierId)
      .single();

    if (supplierError || !supplier) {
      console.error('Error fetching supplier:', supplierError);
      throw new Error('Supplier not found');
    }

    console.log('Found supplier:', supplier.business_name);

    // Prepare notification data
    const isApproved = action === 'approved';
    const userEmail = supplier.users?.email;
    const userName = supplier.users?.first_name || 'Supplier';
    const businessName = supplier.business_name;

    if (!userEmail) {
      throw new Error('Supplier email not found');
    }

    const subject = isApproved 
      ? `🎉 Welcome to Talabat Rwanda! Your supplier application has been approved`
      : `Application Update - Talabat Rwanda`;

    const message = isApproved 
      ? `Dear ${userName}, your supplier application for "${businessName}" has been APPROVED! You can now access your dashboard and start managing your business.`
      : `Dear ${userName}, your supplier application for "${businessName}" has been rejected. Please contact support for more information.`;

    // Log the notification (in a real scenario, you would send an actual email here)
    console.log('Email notification would be sent:', {
      to: userEmail,
      subject,
      message,
      businessName,
      action
    });

    // For demo purposes, we'll just return success
    // In production, you would integrate with an email service like Resend, SendGrid, etc.
    
    return new Response(JSON.stringify({ 
      success: true, 
      message: `Notification prepared for ${action} supplier`,
      details: {
        email: userEmail,
        businessName,
        action,
        subject
      }
    }), {
      status: 200,
      headers: {
        "Content-Type": "application/json",
        ...corsHeaders,
      },
    });
  } catch (error: any) {
    console.error("Error in supplier notification function:", error);
    return new Response(
      JSON.stringify({ 
        error: error.message,
        success: false 
      }),
      {
        status: 500,
        headers: { "Content-Type": "application/json", ...corsHeaders },
      }
    );
  }
};

serve(handler);