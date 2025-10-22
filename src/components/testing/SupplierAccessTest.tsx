import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';
import { CheckCircle, XCircle, AlertCircle } from 'lucide-react';

export const SupplierAccessTest = () => {
  const [safeData, setSafeData] = useState<any[]>([]);
  const [sensitiveData, setSensitiveData] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const { user, role } = useAuth();

  const testSafeDataAccess = async () => {
    setLoading(true);
    try {
      // Test access to safe supplier data - should work for everyone
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
          logo_url,
          cover_image_url,
          is_featured,
          is_verified
        `)
        .eq('is_active', true)
        .limit(3);
      
      if (error) {
        setSafeData([{ error: error.message }]);
      } else {
        setSafeData(data || []);
      }
    } catch (err) {
      setSafeData([{ error: 'Access failed' }]);
    }
    setLoading(false);
  };

  const testSensitiveDataAccess = async () => {
    setLoading(true);
    try {
      // Test access to sensitive data - should be restricted
      const { data, error } = await supabase
        .from('suppliers')
        .select('id, business_name, email, phone, address, user_id')
        .eq('is_active', true)
        .limit(3);
      
      if (error) {
        setSensitiveData([{ error: error.message }]);
      } else {
        setSensitiveData(data || []);
      }
    } catch (err) {
      setSensitiveData([{ error: 'Access failed' }]);
    }
    setLoading(false);
  };

  const hasError = (data: any[]) => data.some(item => item.error);
  const hasData = (data: any[]) => data.length > 0 && !hasError(data);

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Supplier Data Access Test</CardTitle>
          <div className="flex gap-2">
            <Badge variant={user ? "default" : "secondary"}>
              {user ? `${role}: ${user.email}` : 'Not authenticated'}
            </Badge>
          </div>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex gap-4">
            <Button onClick={testSafeDataAccess} disabled={loading}>
              Test Safe Data Access
            </Button>
            <Button onClick={testSensitiveDataAccess} disabled={loading} variant="outline">
              Test Sensitive Data Access
            </Button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Card>
              <CardHeader>
                <CardTitle className="text-sm flex items-center gap-2">
                  {hasData(safeData) ? (
                    <CheckCircle className="h-4 w-4 text-green-500" />
                  ) : hasError(safeData) ? (
                    <XCircle className="h-4 w-4 text-red-500" />
                  ) : (
                    <AlertCircle className="h-4 w-4 text-gray-400" />
                  )}
                  Safe Data (Should Work)
                </CardTitle>
              </CardHeader>
              <CardContent className="text-xs">
                <p className="mb-2 text-muted-foreground">
                  Business info, ratings, delivery details
                </p>
                <pre className="bg-muted p-2 rounded text-xs overflow-auto max-h-32">
                  {safeData.length > 0 ? (
                    JSON.stringify(safeData.slice(0, 1), null, 2)
                  ) : (
                    'No data yet - click test button'
                  )}
                </pre>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="text-sm flex items-center gap-2">
                  {hasError(sensitiveData) ? (
                    <CheckCircle className="h-4 w-4 text-green-500" />
                  ) : hasData(sensitiveData) ? (
                    <XCircle className="h-4 w-4 text-red-500" />
                  ) : (
                    <AlertCircle className="h-4 w-4 text-gray-400" />
                  )}
                  Sensitive Data (Should Be Protected)
                </CardTitle>
              </CardHeader>
              <CardContent className="text-xs">
                <p className="mb-2 text-muted-foreground">
                  Email, phone, address, user_id
                </p>
                <pre className="bg-muted p-2 rounded text-xs overflow-auto max-h-32">
                  {sensitiveData.length > 0 ? (
                    JSON.stringify(sensitiveData.slice(0, 1), null, 2)
                  ) : (
                    'No data yet - click test button'
                  )}
                </pre>
              </CardContent>
            </Card>
          </div>

          <div className="text-sm text-muted-foreground">
            <p><strong>Expected behavior:</strong></p>
            <ul className="list-disc list-inside space-y-1">
              <li>✅ Safe data should be accessible to browse suppliers</li>
              <li>❌ Sensitive data should still be properly protected</li>
              <li>🔐 Contact details only via secure function for authenticated customers</li>
            </ul>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};