import { Link, useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { useAuth } from '@/hooks/useAuth';
import { authHelpers } from '@/lib/auth';
import { useLanguage, translations } from '@/lib/language';
import { LanguageToggle } from '@/components/ui/LanguageToggle';
import { ROUTES } from '@/lib/routes';
import { Shield, Home, LogOut, AlertTriangle, ArrowLeft } from 'lucide-react';

const UnauthorizedAccess = () => {
  const { isAuthenticated, role, user } = useAuth();
  const { language } = useLanguage();
  const t = translations[language];
  const navigate = useNavigate();

  const handleSignOut = async () => {
    await authHelpers.signOut();
    navigate(ROUTES.HOME);
  };

  const getRoleBasedDashboard = () => {
    switch (role) {
      case 'admin':
        return ROUTES.ADMIN.DASHBOARD;
      case 'supplier':
        return ROUTES.SUPPLIER.DASHBOARD;
      case 'customer':
        return ROUTES.CUSTOMER.DASHBOARD;
      default:
        return ROUTES.HOME;
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-background p-4">
      <div className="w-full max-w-lg space-y-4">
        <div className="flex justify-end">
          <LanguageToggle />
        </div>
        
        <Card>
          <CardHeader className="text-center">
            <div className="mx-auto mb-4 h-16 w-16 rounded-full bg-red-100 flex items-center justify-center">
              <Shield className="h-8 w-8 text-red-600" />
            </div>
            <CardTitle className="text-2xl font-bold text-red-600">
              Access Denied
            </CardTitle>
            <CardDescription>
              You don't have permission to access this page
            </CardDescription>
          </CardHeader>
          
          <CardContent className="space-y-6">
            {/* Error Details */}
            <div className="bg-red-50 border border-red-200 rounded-lg p-4">
              <div className="flex items-start space-x-3">
                <AlertTriangle className="h-5 w-5 text-red-600 mt-0.5" />
                <div className="text-sm">
                  <p className="font-medium text-red-800">
                    Unauthorized Access Attempt
                  </p>
                  <p className="text-red-600 mt-1">
                    The page you're trying to access requires different permissions than your current account has.
                  </p>
                </div>
              </div>
            </div>

            {/* User Info */}
            {isAuthenticated && (
              <div className="space-y-2">
                <h3 className="font-semibold">Current Account:</h3>
                <div className="bg-muted rounded-lg p-3 space-y-1">
                  <div className="flex justify-between text-sm">
                    <span className="text-muted-foreground">Email:</span>
                    <span className="font-medium">{user?.email}</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-muted-foreground">Role:</span>
                    <span className="capitalize font-medium">
                      {role || 'No role assigned'}
                    </span>
                  </div>
                </div>
              </div>
            )}

            {/* Action Buttons */}
            <div className="space-y-3">
              {isAuthenticated ? (
                <>
                  <Link to={getRoleBasedDashboard()}>
                    <Button className="w-full">
                      <Home className="mr-2 h-4 w-4" />
                      Go to My Dashboard
                    </Button>
                  </Link>
                  
                  <Button 
                    variant="outline" 
                    className="w-full" 
                    onClick={() => navigate(-1)}
                  >
                    <ArrowLeft className="mr-2 h-4 w-4" />
                    Go Back
                  </Button>
                  
                  <Button 
                    variant="outline" 
                    className="w-full" 
                    onClick={handleSignOut}
                  >
                    <LogOut className="mr-2 h-4 w-4" />
                    Sign Out
                  </Button>
                </>
              ) : (
                <>
                  <Link to={ROUTES.LOGIN}>
                    <Button className="w-full">
                      <LogOut className="mr-2 h-4 w-4" />
                      Sign In
                    </Button>
                  </Link>
                  
                  <Link to={ROUTES.HOME}>
                    <Button variant="outline" className="w-full">
                      <Home className="mr-2 h-4 w-4" />
                      Go to Home
                    </Button>
                  </Link>
                </>
              )}
            </div>

            {/* Help Section */}
            <div className="text-center space-y-2">
              <p className="text-sm text-muted-foreground">
                Need help accessing the right account?
              </p>
              <div className="text-xs text-muted-foreground space-y-1">
                <div>📧 Email: support@talabat.rw</div>
                <div>📱 WhatsApp: +250 123 456 789</div>
              </div>
            </div>

            {/* Role-specific Messages */}
            {isAuthenticated && (
              <div className="text-center">
                <p className="text-xs text-muted-foreground">
                  {role === 'customer' && (
                    "Customer accounts cannot access supplier or admin areas."
                  )}
                  {role === 'supplier' && (
                    "Supplier accounts cannot access customer or admin areas."
                  )}
                  {role === 'admin' && (
                    "This seems like an error. Admin accounts should have access to all areas."
                  )}
                  {!role && (
                    "Your account doesn't have a role assigned. Please contact support."
                  )}
                </p>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default UnauthorizedAccess;