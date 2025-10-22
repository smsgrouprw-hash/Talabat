import { Link } from 'react-router-dom';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Users, Building2, ArrowLeft } from 'lucide-react';
import { useLanguage } from '@/lib/language';

const RoleSelection = () => {
  const { language } = useLanguage();

  return (
    <div className="min-h-screen bg-background p-4 pb-24">
      <div className="container mx-auto max-w-2xl">
        {/* Header */}
        <div className="flex items-center gap-4 mb-8 pt-4">
          <Link to="/" className="p-2 hover:bg-muted rounded-lg transition-colors">
            <ArrowLeft className="h-5 w-5 text-muted-foreground" />
          </Link>
          <div>
            <h1 className="text-2xl font-bold text-primary">
              {language === 'ar' ? 'نوع الحساب' : 'Account Type'}
            </h1>
            <p className="text-muted-foreground">
              {language === 'ar' ? 'اختر نوع حسابك للمتابعة' : 'Choose your account type to continue'}
            </p>
          </div>
        </div>

        {/* Role Selection Cards */}
        <div className="space-y-4">
          {/* Customer Card */}
          <Card className="group hover:shadow-lg transition-all duration-300 hover:scale-[1.02] cursor-pointer border-2 hover:border-primary/50">
            <Link to="/auth?tab=customer" className="block">
              <CardHeader className="text-center pb-4">
                <div className="mx-auto mb-4 p-4 rounded-full bg-gradient-to-r from-primary/10 to-accent/10 group-hover:from-primary/20 group-hover:to-accent/20 transition-all duration-300">
                  <Users className="h-12 w-12 text-primary group-hover:scale-110 transition-transform duration-300" />
                </div>
                <CardTitle className="text-xl font-bold">
                  {language === 'ar' ? 'تسجيل دخول العملاء' : 'Customer Login/Register'}
                </CardTitle>
                <CardDescription className="text-base">
                  {language === 'ar' 
                    ? 'احصل على طعامك المفضل من المطاعم والمتاجر المحلية' 
                    : 'Order your favorite food from local restaurants and stores'
                  }
                </CardDescription>
              </CardHeader>
              <CardContent>
                <Button className="w-full" size="lg">
                  {language === 'ar' ? 'متابعة كعميل' : 'Continue as Customer'}
                </Button>
              </CardContent>
            </Link>
          </Card>

          {/* Business Card */}
          <Card className="group hover:shadow-lg transition-all duration-300 hover:scale-[1.02] cursor-pointer border-2 hover:border-primary/50">
            <Link to="/auth?tab=business" className="block">
              <CardHeader className="text-center pb-4">
                <div className="mx-auto mb-4 p-4 rounded-full bg-gradient-to-r from-accent/10 to-primary/10 group-hover:from-accent/20 group-hover:to-primary/20 transition-all duration-300">
                  <Building2 className="h-12 w-12 text-accent group-hover:scale-110 transition-transform duration-300" />
                </div>
                <CardTitle className="text-xl font-bold">
                  {language === 'ar' ? 'تسجيل دخول الأعمال' : 'Business Login/Register'}
                </CardTitle>
                <CardDescription className="text-base">
                  {language === 'ar' 
                    ? 'انضم إلى منصتنا وابدأ في بيع منتجاتك للعملاء' 
                    : 'Join our platform and start selling your products to customers'
                  }
                </CardDescription>
              </CardHeader>
              <CardContent>
                <Button className="w-full" size="lg" variant="secondary">
                  {language === 'ar' ? 'متابعة كشركة' : 'Continue as Business'}
                </Button>
              </CardContent>
            </Link>
          </Card>
        </div>

        {/* Help Text */}
        <div className="mt-8 text-center">
          <p className="text-sm text-muted-foreground">
            {language === 'ar' 
              ? 'هل تحتاج مساعدة؟ تواصل معنا'
              : 'Need help? Contact us'
            }
          </p>
          <Link 
            to="/contact" 
            className="text-sm text-primary hover:underline font-medium"
          >
            {language === 'ar' ? 'خدمة العملاء' : 'Customer Support'}
          </Link>
        </div>
      </div>
    </div>
  );
};

export default RoleSelection;