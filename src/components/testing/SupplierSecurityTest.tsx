import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';

export const SupplierSecurityTest = () => {
  const [publicData, setPublicData] = useState<any[]>([]);
  const [directAccess, setDirectAccess] = useState<any[]>([]);
  const [contactData, setContactData] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const { user } = useAuth();

  const testPublicAccess = async () => {
    setLoading(true);
    try {
      // Test direct access to suppliers table with safe columns only
      const { data, error } = await supabase
        .from('suppliers')
        .select(`
          id,
          business_name,
          business_type,
          cuisine_type,
          description,
          city,
          rating,
          total_reviews,
          delivery_time_min,
          delivery_time_max,
          minimum_order,
          delivery_fee,
          delivery_radius_km,
          logo_url,
          cover_image_url,
          is_featured,
          is_verified,
          is_active,
          business_hours,
          created_at,
          updated_at
        `)
        .eq('is_active', true)
        .limit(3);
      
      if (error) {
        console.error('Public access error:', error);
        setPublicData([{ error: error.message }]);
      } else {
        setPublicData(data || []);
      }
    } catch (err) {
      console.error('Public access failed:', err);
      setPublicData([{ error: 'Failed to access public data' }]);
    }
    setLoading(false);
  };

  const testDirectAccess = async () => {
    setLoading(true);
    try {
      // Test direct table access with sensitive columns - should fail or be filtered
      const { data, error } = await supabase
        .from('suppliers')
        .select('id, business_name, phone, email, address, user_id') // Include sensitive columns
        .eq('is_active', true)
        .limit(3);
      
      if (error) {
        console.error('Direct access error:', error);
        setDirectAccess([{ error: error.message }]);
      } else {
        setDirectAccess(data || []);
      }
    } catch (err) {
      console.error('Direct access failed:', err);
      setDirectAccess([{ error: 'Failed direct access' }]);
    }
    setLoading(false);
  };

  const testContactAccess = async () => {
    setLoading(true);
    try {
      // Test contact information access - should only work for authenticated customers
      const { data, error } = await supabase
        .rpc('get_supplier_contact_for_order', { 
          supplier_id: '550e8400-e29b-41d4-a716-446655440000' // dummy ID
        });
      
      if (error) {
        console.error('Contact access error:', error);
        setContactData([{ error: error.message }]);
      } else {
        setContactData(data || []);
      }
    } catch (err) {
      console.error('Contact access failed:', err);
      setContactData([{ error: 'Failed contact access' }]);
    }
    setLoading(false);
  };

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Supplier Data Security Test</CardTitle>
          <Badge variant={user ? "default" : "secondary"}>
            {user ? `Authenticated as: ${user.email}` : 'Not authenticated'}
          </Badge>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex gap-4">
            <Button onClick={testPublicAccess} disabled={loading}>
              Test Public Data Access
            </Button>
            <Button onClick={testDirectAccess} disabled={loading} variant="outline">
              Test Direct Table Access
            </Button>
            <Button onClick={testContactAccess} disabled={loading} variant="outline">
              Test Contact Access
            </Button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <Card>
              <CardHeader>
                <CardTitle className="text-sm">Safe Column Access (Should Work)</CardTitle>
              </CardHeader>
              <CardContent className="text-xs">
                <pre className="bg-muted p-2 rounded text-xs overflow-auto max-h-32">
                  {JSON.stringify(publicData, null, 2)}
                </pre>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="text-sm">Sensitive Data Access (Should Be Limited)</CardTitle>
              </CardHeader>
              <CardContent className="text-xs">
                <pre className="bg-muted p-2 rounded text-xs overflow-auto max-h-32">
                  {JSON.stringify(directAccess, null, 2)}
                </pre>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="text-sm">Contact Access (Auth Required)</CardTitle>
              </CardHeader>
              <CardContent className="text-xs">
                <pre className="bg-muted p-2 rounded text-xs overflow-auto max-h-32">
                  {JSON.stringify(contactData, null, 2)}
                </pre>
              </CardContent>
            </Card>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};