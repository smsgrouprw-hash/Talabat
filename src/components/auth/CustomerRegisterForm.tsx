import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Link, useNavigate } from 'react-router-dom';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { useToast } from '@/hooks/use-toast';
import { authHelpers, type UserRole } from '@/lib/auth';
import { useLanguage, translations } from '@/lib/language';
import { LanguageToggle } from '@/components/ui/LanguageToggle';
import { AlertCircle, Eye, EyeOff, User, Mail, Phone, Lock } from 'lucide-react';
import { SocialAuthButtons } from './SocialAuthButtons';
import { cn } from '@/lib/utils';

const customerRegistrationSchema = z.object({
  fullName: z.string().min(2, 'fullNameRequired').max(100, 'Full name must be less than 100 characters'),
  email: z.string().email('invalidEmail'),
  password: z.string().min(8, 'passwordMinLength'),
  confirmPassword: z.string().min(8, 'confirmPasswordRequired'),
  phone: z.string().min(10, 'phoneMinLength').max(15, 'Phone number must be less than 15 characters'),
}).refine((data) => data.password === data.confirmPassword, {
  message: 'passwordsDontMatch',
  path: ['confirmPassword'],
});

type CustomerRegistrationData = z.infer<typeof customerRegistrationSchema>;

export const CustomerRegisterForm = () => {
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [authError, setAuthError] = useState<string>('');
  const { toast } = useToast();
  const navigate = useNavigate();
  const { language } = useLanguage();
  const t = translations[language];

  const form = useForm<CustomerRegistrationData>({
    resolver: zodResolver(customerRegistrationSchema),
    defaultValues: {
      fullName: '',
      email: '',
      password: '',
      confirmPassword: '',
      phone: '',
    },
  });

  const handleRegister = async (data: CustomerRegistrationData) => {
    console.log('🟢 CUSTOMER REG: Starting registration process...');
    
    setLoading(true);
    setAuthError('');
    
    try {
      const userMetadata = {
        first_name: data.fullName.split(' ')[0] || '',
        last_name: data.fullName.split(' ').slice(1).join(' ') || '',
        phone: data.phone,
        role: 'customer' as UserRole
      };

      console.log('🟢 CUSTOMER REG: Registration data:', JSON.stringify({
        email: data.email,
        fullName: data.fullName,
        phone: data.phone
      }, null, 2));
      console.log('🟢 CUSTOMER REG: User metadata:', JSON.stringify(userMetadata, null, 2));
      
      console.log('🟢 CUSTOMER REG: Calling authHelpers.signUp...');
      const { data: authData, error } = await authHelpers.signUp(data.email, data.password, userMetadata);
      
      if (error) {
        console.error('❌ CUSTOMER REG: Registration failed:', error);
        console.error('❌ CUSTOMER REG: Error details:', JSON.stringify(error, null, 2));
        
        if (error.message.includes('User already registered')) {
          setAuthError('An account with this email already exists. Please sign in instead.');
        } else {
          setAuthError(`Registration failed: ${error.message}`);
        }
        return;
      }

      console.log('✅ CUSTOMER REG: Registration successful');
      console.log('✅ CUSTOMER REG: User ID:', authData?.user?.id);
      console.log('✅ CUSTOMER REG: Session created:', !!authData?.session);

      toast({
        title: t.accountCreated,
        description: t.checkEmail,
      });
      
      // Navigate to email verification page
      navigate('/email-verification', { 
        state: { email: data.email } 
      });
      
    } catch (error) {
      console.error('💥 CUSTOMER REG: Unexpected error during registration:', error);
      console.error('💥 CUSTOMER REG: Error stack:', (error as Error).stack);
      setAuthError(`An unexpected error occurred: ${(error as Error).message}`);
    } finally {
      setLoading(false);
    }
  };

  const getErrorMessage = (error: any) => {
    if (typeof error?.message === 'string') {
      return t[error.message as keyof typeof t] || error.message;
    }
    return error?.message || '';
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-background p-4 pb-24 safe-area-inset">
      <div className="w-full max-w-md space-y-4 fade-in mb-8">
        <div className="flex justify-end">
          <LanguageToggle />
        </div>
        
        <Card className="shadow-lg border-0">
          <CardHeader className="text-center space-y-4">
            <div className="mx-auto h-12 w-12 rounded-full bg-primary/10 flex items-center justify-center">
              <User className="h-6 w-6 text-primary" />
            </div>
            <CardTitle className="heading-secondary text-primary text-balance">
              {t.customerRegistration}
            </CardTitle>
            <CardDescription className="text-balance">
              {t.joinTalabat}
            </CardDescription>
          </CardHeader>
          
          <CardContent>
            {/* Social Auth Buttons */}
            <div className="mb-6">
              <SocialAuthButtons defaultRole="customer" disabled={loading} />
              
              {/* Divider */}
              <div className="flex items-center my-6">
                <div className="flex-1 border-t border-muted"></div>
                <span className="px-4 text-sm text-muted-foreground bg-background">
                  {language === 'ar' ? 'أو' : 'OR'}
                </span>
                <div className="flex-1 border-t border-muted"></div>
              </div>
            </div>

            {authError && (
              <Alert variant="destructive" className="mb-4">
                <AlertCircle className="h-4 w-4" />
                <AlertDescription>{authError}</AlertDescription>
              </Alert>
            )}

            <form onSubmit={form.handleSubmit(handleRegister)} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="fullName" className="flex items-center gap-2">
                  <User className="h-4 w-4" />
                  {t.fullName}
                </Label>
                <Input
                  id="fullName"
                  placeholder="John Doe"
                  {...form.register('fullName')}
                  disabled={loading}
                  className={cn(
                    "touch-target focus-ring",
                    language === 'ar' ? 'text-right' : ''
                  )}
                />
                {form.formState.errors.fullName && (
                  <p className="text-sm text-destructive">
                    {getErrorMessage(form.formState.errors.fullName)}
                  </p>
                )}
              </div>

              <div className="space-y-2">
                <Label htmlFor="email" className="flex items-center gap-2">
                  <Mail className="h-4 w-4" />
                  {t.email}
                </Label>
                <Input
                  id="email"
                  type="email"
                  placeholder="john@example.com"
                  {...form.register('email')}
                  disabled={loading}
                />
                {form.formState.errors.email && (
                  <p className="text-sm text-destructive">
                    {getErrorMessage(form.formState.errors.email)}
                  </p>
                )}
              </div>

              <div className="space-y-2">
                <Label htmlFor="phone" className="flex items-center gap-2">
                  <Phone className="h-4 w-4" />
                  {t.phone}
                </Label>
                <Input
                  id="phone"
                  type="tel"
                  placeholder="+250 123 456 789"
                  {...form.register('phone')}
                  disabled={loading}
                  className={language === 'ar' ? 'text-right' : ''}
                />
                {form.formState.errors.phone && (
                  <p className="text-sm text-destructive">
                    {getErrorMessage(form.formState.errors.phone)}
                  </p>
                )}
              </div>

              <div className="space-y-2">
                <Label htmlFor="password" className="flex items-center gap-2">
                  <Lock className="h-4 w-4" />
                  {t.password}
                </Label>
                <div className="relative">
                  <Input
                    id="password"
                    type={showPassword ? 'text' : 'password'}
                    placeholder={t.password}
                    {...form.register('password')}
                    disabled={loading}
                  />
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    className="absolute right-0 top-0 h-full px-3 py-2 hover:bg-transparent"
                    onClick={() => setShowPassword(!showPassword)}
                    disabled={loading}
                  >
                    {showPassword ? (
                      <EyeOff className="h-4 w-4" />
                    ) : (
                      <Eye className="h-4 w-4" />
                    )}
                  </Button>
                </div>
                {form.formState.errors.password && (
                  <p className="text-sm text-destructive">
                    {getErrorMessage(form.formState.errors.password)}
                  </p>
                )}
              </div>

              <div className="space-y-2">
                <Label htmlFor="confirmPassword" className="flex items-center gap-2">
                  <Lock className="h-4 w-4" />
                  {t.confirmPassword}
                </Label>
                <div className="relative">
                  <Input
                    id="confirmPassword"
                    type={showPassword ? 'text' : 'password'}
                    placeholder={t.confirmPassword}
                    {...form.register('confirmPassword')}
                    disabled={loading}
                  />
                </div>
                {form.formState.errors.confirmPassword && (
                  <p className="text-sm text-destructive">
                    {getErrorMessage(form.formState.errors.confirmPassword)}
                  </p>
                )}
              </div>

              <Button 
                type="submit" 
                className="w-full touch-target focus-ring" 
                disabled={loading}
                size="lg"
              >
                {loading ? t.registering : t.register}
              </Button>
            </form>

            <div className="mt-4 text-center">
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