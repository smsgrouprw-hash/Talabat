import { useLocation, Link, useNavigate } from 'react-router-dom';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { useLanguage, translations } from '@/lib/language';
import { LanguageToggle } from '@/components/ui/LanguageToggle';
import { CheckCircle, Clock, Mail, MessageSquare, Home, LogOut } from 'lucide-react';
import { authHelpers } from '@/lib/auth';
import { useToast } from '@/hooks/use-toast';

export const RegistrationPendingPage = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const { language } = useLanguage();
  const t = translations[language];
  const { toast } = useToast();
  
  const { email, businessName, whatsapp } = location.state || {};

  const handleSignOut = async () => {
    const { error } = await authHelpers.signOut();
    if (error) {
      toast({
        title: "Error",
        description: "Failed to sign out. Please try again.",
        variant: "destructive",
      });
    } else {
      navigate('/');
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-background p-4">
      <div className="w-full max-w-2xl space-y-4">
        <div className="flex justify-between items-center">
          <Button 
            variant="outline" 
            onClick={handleSignOut}
            className="gap-2"
          >
            <LogOut className="h-4 w-4" />
            {language === 'ar' ? 'تسجيل الخروج' : 'Sign Out'}
          </Button>
          <LanguageToggle />
        </div>
        
        <Card>
          <CardHeader className="text-center">
            <div className="mx-auto mb-4 h-16 w-16 rounded-full bg-green-100 flex items-center justify-center">
              <CheckCircle className="h-8 w-8 text-green-600" />
            </div>
            <CardTitle className="text-2xl font-bold text-green-600">
              {t.applicationSubmitted}
            </CardTitle>
            <CardDescription>
              {t.registrationPending}
            </CardDescription>
          </CardHeader>
          
          <CardContent className="space-y-6">
            {/* Application details */}
            {businessName && (
              <Alert>
                <CheckCircle className="h-4 w-4" />
                <AlertDescription>
                  Application submitted for: <strong>{businessName}</strong>
                </AlertDescription>
              </Alert>
            )}

            {/* Review process */}
            <div className="space-y-4">
              <h3 className="font-semibold text-lg">What happens next?</h3>
              
              <div className="space-y-3">
                <div className="flex items-start space-x-3">
                  <div className="h-8 w-8 rounded-full bg-blue-100 flex items-center justify-center mt-0.5">
                    <Clock className="h-4 w-4 text-blue-600" />
                  </div>
                  <div>
                    <h4 className="font-medium">Review Process</h4>
                    <p className="text-sm text-muted-foreground">
                      {t.approvalProcess}
                    </p>
                  </div>
                </div>

                <div className="flex items-start space-x-3">
                  <div className="h-8 w-8 rounded-full bg-green-100 flex items-center justify-center mt-0.5">
                    <Mail className="h-4 w-4 text-green-600" />
                  </div>
                  <div>
                    <h4 className="font-medium">Email Notification</h4>
                    <p className="text-sm text-muted-foreground">
                      We'll send updates to: <span className="font-medium">{email}</span>
                    </p>
                  </div>
                </div>

                {whatsapp && (
                  <div className="flex items-start space-x-3">
                    <div className="h-8 w-8 rounded-full bg-green-100 flex items-center justify-center mt-0.5">
                      <MessageSquare className="h-4 w-4 text-green-600" />
                    </div>
                    <div>
                      <h4 className="font-medium">WhatsApp Contact</h4>
                      <p className="text-sm text-muted-foreground">
                        We'll also contact you on: <span className="font-medium">{whatsapp}</span>
                      </p>
                    </div>
                  </div>
                )}
              </div>
            </div>

            {/* Requirements checklist */}
            <div className="space-y-4">
              <h3 className="font-semibold text-lg">During Review</h3>
              <div className="space-y-2 text-sm">
                <p className="text-muted-foreground">
                  Our team will verify:
                </p>
                <ul className="space-y-1 ml-4">
                  <li>• Business registration and licenses</li>
                  <li>• Food safety compliance</li>
                  <li>• Location and service area</li>
                  <li>• Menu and pricing setup</li>
                </ul>
              </div>
            </div>

            {/* Contact information */}
            <div className="space-y-4">
              <h3 className="font-semibold text-lg">Need Help?</h3>
              <div className="text-sm space-y-2">
                <p>If you have questions about your application:</p>
                <div className="flex flex-col space-y-1">
                  <span>📧 Email: support@talabat.rw</span>
                  <span>📱 WhatsApp: +250 123 456 789</span>
                  <span>⏰ Mon-Fri: 8:00 AM - 6:00 PM</span>
                </div>
              </div>
            </div>

            {/* Action buttons */}
            <div className="flex flex-col space-y-3 pt-4">
              <Link to="/">
                <Button className="w-full">
                  <Home className="mr-2 h-4 w-4" />
                  {t.backToHome}
                </Button>
              </Link>
              
              <Link to="/auth">
                <Button variant="outline" className="w-full">
                  Sign In to Check Status
                </Button>
              </Link>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};