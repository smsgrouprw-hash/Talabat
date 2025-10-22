import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { useLanguage, translations } from '@/lib/language';
import { LanguageToggle } from '@/components/ui/LanguageToggle';
import { UserPlus, Users, Store } from 'lucide-react';

const CustomerRegister = () => {
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
            <CardTitle className="text-2xl font-bold text-primary">
              {t.createAccount}
            </CardTitle>
            <CardDescription>
              Choose how you want to join Talabat Rwanda
            </CardDescription>
          </CardHeader>
          
          <CardContent className="space-y-4">
            <div className="grid gap-4">
              <Link to="/customer-register">
                <Card className="cursor-pointer hover:bg-accent/50 transition-colors">
                  <CardContent className="flex items-center p-4 space-x-4">
                    <div className="h-12 w-12 rounded-full bg-blue-100 flex items-center justify-center">
                      <Users className="h-6 w-6 text-blue-600" />
                    </div>
                    <div className="flex-1">
                      <h3 className="font-semibold">Customer Account</h3>
                      <p className="text-sm text-muted-foreground">
                        Order food from your favorite restaurants
                      </p>
                    </div>
                    <UserPlus className="h-5 w-5 text-muted-foreground" />
                  </CardContent>
                </Card>
              </Link>

              <Link to="/supplier-register">
                <Card className="cursor-pointer hover:bg-accent/50 transition-colors">
                  <CardContent className="flex items-center p-4 space-x-4">
                    <div className="h-12 w-12 rounded-full bg-green-100 flex items-center justify-center">
                      <Store className="h-6 w-6 text-green-600" />
                    </div>
                    <div className="flex-1">
                      <h3 className="font-semibold">Restaurant Partner</h3>
                      <p className="text-sm text-muted-foreground">
                        List your restaurant and reach more customers
                      </p>
                    </div>
                    <UserPlus className="h-5 w-5 text-muted-foreground" />
                  </CardContent>
                </Card>
              </Link>
            </div>

            <div className="pt-4 text-center">
              <p className="text-sm text-muted-foreground">
                {t.alreadyHaveAccount}{' '}
                <Link to="/auth" className="text-primary hover:underline">
                  {t.signIn}
                </Link>
              </p>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default CustomerRegister;