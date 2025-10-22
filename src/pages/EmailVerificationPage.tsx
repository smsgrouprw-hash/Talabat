import { useState } from 'react';
import { useLocation, Link } from 'react-router-dom';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { useToast } from '@/hooks/use-toast';
import { authHelpers } from '@/lib/auth';
import { useLanguage, translations } from '@/lib/language';
import { LanguageToggle } from '@/components/ui/LanguageToggle';
import { Mail, CheckCircle, RefreshCw } from 'lucide-react';

export const EmailVerificationPage = () => {
  const [loading, setLoading] = useState(false);
  const location = useLocation();
  const { toast } = useToast();
  const { language } = useLanguage();
  const t = translations[language];
  
  const email = location.state?.email || '';

  const handleResendVerification = async () => {
    if (!email) return;
    
    setLoading(true);
    try {
      const { error } = await authHelpers.resetPassword(email);
      
      if (error) {
        toast({
          title: "Error",
          description: error.message,
          variant: "destructive",
        });
        return;
      }

      toast({
        title: "Verification Sent",
        description: t.verificationSent,
      });
    } catch (error) {
      console.error('Resend verification error:', error);
      toast({
        title: "Error",
        description: "Failed to resend verification email",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-background p-4">
      <div className="w-full max-w-md space-y-4">
        <div className="flex justify-end">
          <LanguageToggle />
        </div>
        
        <Card>
          <CardHeader className="text-center">
            <div className="mx-auto mb-4 h-12 w-12 rounded-full bg-primary/10 flex items-center justify-center">
              <Mail className="h-6 w-6 text-primary" />
            </div>
            <CardTitle className="text-2xl font-bold">
              {t.emailVerification}
            </CardTitle>
            <CardDescription>
              {t.verifyYourEmail}
            </CardDescription>
          </CardHeader>
          
          <CardContent className="space-y-4">
            <Alert>
              <CheckCircle className="h-4 w-4" />
              <AlertDescription>
                {t.verificationSent}
              </AlertDescription>
            </Alert>

            <div className="text-center space-y-4">
              <p className="text-sm text-muted-foreground">
                {t.checkInbox}
              </p>
              
              {email && (
                <p className="text-sm font-medium break-all">
                  {email}
                </p>
              )}

              <Button
                variant="outline"
                onClick={handleResendVerification}
                disabled={loading || !email}
                className="w-full"
              >
                {loading ? (
                  <RefreshCw className="mr-2 h-4 w-4 animate-spin" />
                ) : (
                  <Mail className="mr-2 h-4 w-4" />
                )}
                {t.resendVerification}
              </Button>

              <div className="pt-4">
                <Link to="/auth">
                  <Button variant="ghost" className="w-full">
                    Back to Sign In
                  </Button>
                </Link>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};