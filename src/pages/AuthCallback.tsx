import { useEffect, useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Loader2, CheckCircle, AlertCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';

export const AuthCallback = () => {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const { toast } = useToast();

  useEffect(() => {
    const handleAuthCallback = async () => {
      try {
        // Handle the OAuth callback
        const { data, error } = await supabase.auth.getSession();
        
        if (error) {
          console.error('Auth callback error:', error);
          setError(error.message);
          return;
        }

        if (data.session) {
          console.log('OAuth session established:', data.session.user.id);
          
          // Get user role from URL params or default to customer
          const roleParam = searchParams.get('role') || 'customer';
          
          // For social auth users, we need to ensure they have proper database records
          // The handle_new_user trigger should handle this, but let's verify
          const user = data.session.user;
          
          // Extract name from user metadata
          const fullName = user.user_metadata?.full_name || 
                           user.user_metadata?.name || 
                           `${user.user_metadata?.first_name || ''} ${user.user_metadata?.last_name || ''}`.trim();
          
          // Set default metadata if not provided by OAuth provider
          const userData = {
            first_name: user.user_metadata?.first_name || fullName.split(' ')[0] || 'User',
            last_name: user.user_metadata?.last_name || fullName.split(' ').slice(1).join(' ') || '',
            phone: user.user_metadata?.phone || user.phone || '',
            role: roleParam as 'customer' | 'supplier'
          };

          console.log('Social auth user data:', userData);

          // Update user metadata to ensure trigger has the right data
          await supabase.auth.updateUser({
            data: userData
          });

          setSuccess(true);
          
          toast({
            title: "Welcome!",
            description: "You have been signed in successfully.",
          });

          // Redirect based on role after a short delay
          setTimeout(() => {
            if (roleParam === 'supplier') {
              navigate('/supplier-dashboard');
            } else {
              navigate('/customer-dashboard');
            }
          }, 2000);
        } else {
          setError('No session found. Please try signing in again.');
        }
      } catch (err) {
        console.error('Unexpected error during auth callback:', err);
        setError('An unexpected error occurred. Please try again.');
      } finally {
        setLoading(false);
      }
    };

    handleAuthCallback();
  }, [navigate, searchParams, toast]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <Card className="w-full max-w-md">
          <CardHeader className="text-center">
            <CardTitle className="flex items-center justify-center gap-2">
              <Loader2 className="h-5 w-5 animate-spin" />
              Completing Sign In...
            </CardTitle>
          </CardHeader>
          <CardContent className="text-center">
            <p className="text-muted-foreground">
              Please wait while we complete your authentication.
            </p>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <Card className="w-full max-w-md">
          <CardHeader className="text-center">
            <CardTitle className="flex items-center justify-center gap-2 text-destructive">
              <AlertCircle className="h-5 w-5" />
              Authentication Failed
            </CardTitle>
          </CardHeader>
          <CardContent className="text-center space-y-4">
            <p className="text-muted-foreground">{error}</p>
            <Button onClick={() => navigate('/auth')} className="w-full">
              Back to Sign In
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (success) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <Card className="w-full max-w-md">
          <CardHeader className="text-center">
            <CardTitle className="flex items-center justify-center gap-2 text-green-600">
              <CheckCircle className="h-5 w-5" />
              Welcome!
            </CardTitle>
          </CardHeader>
          <CardContent className="text-center">
            <p className="text-muted-foreground">
              You have been signed in successfully. Redirecting to your dashboard...
            </p>
          </CardContent>
        </Card>
      </div>
    );
  }

  return null;
};