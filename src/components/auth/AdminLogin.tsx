import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Navigate } from 'react-router-dom';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { useToast } from '@/hooks/use-toast';
import { useAuth } from '@/hooks/useAuth';
import { authHelpers } from '@/lib/auth';
import { useLanguage, translations } from '@/lib/language';
import { LanguageToggle } from '@/components/ui/LanguageToggle';
import { AlertCircle, Eye, EyeOff, Shield, Mail, Lock } from 'lucide-react';
import { RoleBasedRedirect } from '@/components/auth/RoleBasedRedirect';

const adminLoginSchema = z.object({
  email: z.string().email('Please enter a valid email address'),
  password: z.string().min(1, 'Password is required'),
});

type AdminLoginData = z.infer<typeof adminLoginSchema>;

export const AdminLogin = () => {
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [authError, setAuthError] = useState<string>('');
  const { toast } = useToast();
  const { language } = useLanguage();
  const t = translations[language];
  const { isAuthenticated, isAdmin } = useAuth();

  const form = useForm<AdminLoginData>({
    resolver: zodResolver(adminLoginSchema),
  });

  // Redirect if already authenticated using role-based redirect
  if (isAuthenticated) {
    return <RoleBasedRedirect />;
  }

  const handleLogin = async (data: AdminLoginData) => {
    setLoading(true);
    setAuthError('');
    
    try {
      const { error: signInError } = await authHelpers.signIn(data.email, data.password);
      
      if (signInError) {
        if (signInError.message.includes('Invalid login credentials')) {
          setAuthError('Invalid email or password. Please check your credentials.');
        } else if (signInError.message.includes('Email not confirmed')) {
          setAuthError('Please check your email and click the confirmation link before signing in.');
        } else {
          setAuthError(signInError.message);
        }
        return;
      }

      // Wait a moment for auth state to update, then check role
      setTimeout(async () => {
        const role = await authHelpers.getUserRole();
        if (role !== 'admin') {
          setAuthError('Access denied. Admin privileges required.');
          await authHelpers.signOut();
          return;
        }

        toast({
          title: "Welcome Admin!",
          description: "You have been signed in successfully.",
        });

        // Navigation will be handled by useAuth hook and RoleBasedRedirect
      }, 1000);

    } catch (error) {
      console.error('Admin login error:', error);
      setAuthError('An unexpected error occurred. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-background p-4 pb-32">
      <div className="w-full max-w-md space-y-4">
        <div className="flex justify-end">
          <LanguageToggle />
        </div>
        
        <Card>
          <CardHeader className="text-center">
            <div className="mx-auto mb-4 h-12 w-12 rounded-full bg-red-100 flex items-center justify-center">
              <Shield className="h-6 w-6 text-red-600" />
            </div>
            <CardTitle className="text-2xl font-bold text-red-600">
              Admin Login
            </CardTitle>
            <CardDescription>
              Sign in to access the admin dashboard
            </CardDescription>
          </CardHeader>
          
          <CardContent>
            {authError && (
              <Alert variant="destructive" className="mb-4">
                <AlertCircle className="h-4 w-4" />
                <AlertDescription>{authError}</AlertDescription>
              </Alert>
            )}

            <form onSubmit={form.handleSubmit(handleLogin)} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="email" className="flex items-center gap-2">
                  <Mail className="h-4 w-4" />
                  {t.email}
                </Label>
                <Input
                  id="email"
                  type="email"
                  placeholder="admin@talabat.rw"
                  {...form.register('email')}
                  disabled={loading}
                />
                {form.formState.errors.email && (
                  <p className="text-sm text-destructive">
                    {form.formState.errors.email.message}
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
                    placeholder="Your admin password"
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
                    {form.formState.errors.password.message}
                  </p>
                )}
              </div>
              
              <Button type="submit" className="w-full bg-red-600 hover:bg-red-700" disabled={loading}>
                {loading ? 'Signing in...' : 'Sign In as Admin'}
              </Button>
            </form>

            <div className="mt-4 text-center">
              <p className="text-sm text-muted-foreground">
                Need help? Contact system administrator
              </p>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};