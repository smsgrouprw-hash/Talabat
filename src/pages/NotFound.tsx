import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { useLanguage, translations } from '@/lib/language';
import { LanguageToggle } from '@/components/ui/LanguageToggle';
import { ROUTES } from '@/lib/routes';
import { AlertTriangle, Home, ArrowLeft } from 'lucide-react';

const NotFound = () => {
  const { language } = useLanguage();
  const t = translations[language];

  return (
    <div className="min-h-screen flex items-center justify-center bg-background p-4">
      <div className="w-full max-w-lg space-y-4">
        <div className="flex justify-end">
          <LanguageToggle />
        </div>
        
        <Card>
          <CardHeader className="text-center">
            <div className="mx-auto mb-4 h-16 w-16 rounded-full bg-orange-100 flex items-center justify-center">
              <AlertTriangle className="h-8 w-8 text-orange-600" />
            </div>
            <CardTitle className="text-4xl font-bold text-orange-600">
              404
            </CardTitle>
            <CardDescription className="text-lg">
              Page Not Found
            </CardDescription>
          </CardHeader>
          
          <CardContent className="space-y-6">
            <div className="text-center space-y-2">
              <p className="text-muted-foreground">
                The page you're looking for doesn't exist or has been moved.
              </p>
            </div>

            <div className="space-y-3">
              <Link to={ROUTES.HOME}>
                <Button className="w-full">
                  <Home className="mr-2 h-4 w-4" />
                  Go to Home
                </Button>
              </Link>
              
              <Button 
                variant="outline" 
                className="w-full" 
                onClick={() => window.history.back()}
              >
                <ArrowLeft className="mr-2 h-4 w-4" />
                Go Back
              </Button>
            </div>

            <div className="text-center space-y-2">
              <p className="text-sm text-muted-foreground">
                Quick Links:
              </p>
              <div className="flex flex-wrap gap-2 justify-center">
                <Link to={ROUTES.REGISTER}>
                  <Button variant="link" size="sm">Register</Button>
                </Link>
                <Link to={ROUTES.LOGIN}>
                  <Button variant="link" size="sm">Login</Button>
                </Link>
                <Link to={ROUTES.DASHBOARD}>
                  <Button variant="link" size="sm">Dashboard</Button>
                </Link>
              </div>
            </div>

            <div className="text-center">
              <p className="text-xs text-muted-foreground">
                Need help? Contact support@talabat.rw
              </p>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default NotFound;