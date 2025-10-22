import { useState, useEffect } from "react";
import { useSearchParams } from "react-router-dom";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/hooks/useAuth";
import { authHelpers } from "@/lib/auth";
import { AlertCircle, Eye, EyeOff, User, Briefcase } from "lucide-react";
import { RoleBasedRedirect } from "@/components/auth/RoleBasedRedirect";
import { SocialAuthButtons } from "@/components/auth/SocialAuthButtons";
import talabatLogo from "@/assets/talabat-vertical.png";

// Form schemas
const signInSchema = z.object({
  email: z.string().trim().email("Please enter a valid email address").max(255, "Email too long"),
  password: z.string().min(6, "Password must be at least 6 characters").max(100, "Password too long"),
});

const signUpSchema = z
  .object({
    email: z.string().trim().email("Please enter a valid email address").max(255, "Email too long"),
    password: z.string().min(6, "Password must be at least 6 characters").max(100, "Password too long"),
    confirmPassword: z.string().min(6, "Password must be at least 6 characters").max(100, "Password too long"),
    firstName: z.string().trim().min(1, "First name is required").max(50, "First name too long"),
    lastName: z.string().trim().min(1, "Last name is required").max(50, "Last name too long"),
    phone: z.string().trim().min(10, "Please enter a valid phone number").max(20, "Phone number too long"),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: "Passwords don't match",
    path: ["confirmPassword"],
  });

type SignInData = z.infer<typeof signInSchema>;
type SignUpData = z.infer<typeof signUpSchema>;

const Auth = () => {
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [authError, setAuthError] = useState<string>("");
  const [searchParams] = useSearchParams();
  const [activeUserType, setActiveUserType] = useState<"customer" | "business">("customer");
  const [authMode, setAuthMode] = useState<"signin" | "signup">("signin");
  const { toast } = useToast();
  const { isAuthenticated } = useAuth();

  const signInForm = useForm<SignInData>({
    resolver: zodResolver(signInSchema),
  });

  const signUpForm = useForm<SignUpData>({
    resolver: zodResolver(signUpSchema),
  });

  // Set initial state based on URL parameter
  useEffect(() => {
    const tab = searchParams.get("tab");
    if (tab === "business") {
      setActiveUserType("business");
    } else {
      setActiveUserType("customer");
    }
  }, [searchParams]);

  // Redirect if already authenticated using role-based redirect
  if (isAuthenticated) {
    return <RoleBasedRedirect />;
  }

  const handleSignIn = async (data: SignInData) => {
    setLoading(true);
    setAuthError("");

    try {
      const { error } = await authHelpers.signIn(data.email, data.password);

      if (error) {
        if (error.message.includes("Invalid login credentials")) {
          setAuthError("Invalid email or password. Please check your credentials.");
        } else if (error.message.includes("Email not confirmed")) {
          setAuthError("Please check your email and click the confirmation link before signing in.");
        } else {
          setAuthError(error.message);
        }
        return;
      }

      toast({
        title: "Welcome back!",
        description: "You have been signed in successfully.",
      });
      // Navigation will be handled by the useEffect auto-redirect
    } catch (error) {
      console.error("Sign in error:", error);
      setAuthError("An unexpected error occurred. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const handleSignUp = async (data: SignUpData) => {
    setLoading(true);
    setAuthError("");

    try {
      // Generate unique phone if needed to avoid conflicts
      const uniquePhone = data.phone || `+250${Date.now().toString().slice(-9)}`;

      const { data: authData, error } = await authHelpers.signUp(data.email, data.password, {
        first_name: data.firstName,
        last_name: data.lastName,
        phone: uniquePhone,
        role: activeUserType === "customer" ? "customer" : "supplier",
      });

      if (error) {
        console.error("Registration error:", error);
        if (error.message.includes("User already registered")) {
          setAuthError("An account with this email already exists. Please sign in instead.");
        } else if (error.message?.includes("duplicate key value violates unique constraint")) {
          if (error.message.includes("users_email_key")) {
            setAuthError("This email is already registered. Please try logging in instead.");
          } else if (error.message.includes("users_phone_key")) {
            setAuthError("This phone number is already registered. Please use a different number.");
          } else {
            setAuthError("An account with these details already exists. Please try different information.");
          }
        } else {
          setAuthError(error.message || "Registration failed. Please try again.");
        }
        return;
      }

      if (authData.user && !authData.session) {
        // Email confirmation required
        toast({
          title: "Account created!",
          description: "Please check your email for a confirmation link.",
        });
        // Clear form and switch to sign in
        signUpForm.reset();
        setAuthMode("signin");
      } else if (authData.session) {
        // Direct login (email confirmation disabled)
        toast({
          title: "Account created and logged in!",
          description: "Welcome to Talabat Rwanda!",
        });
        // Navigation will be handled by the useEffect auto-redirect
      }
    } catch (error) {
      console.error("Sign up error:", error);
      setAuthError("An unexpected error occurred. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const handleBusinessRedirect = () => {
    // For business users, redirect to supplier registration
    window.location.href = "/supplier-register";
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-background p-4 pb-32">
      <Card className="w-full max-w-md">
        <CardHeader className="text-center">
          <div className="mb-4">
            <img src={talabatLogo} alt="Talabat Rwanda" className="h-16 w-auto mx-auto" />
          </div>
          <CardTitle className="text-2xl font-bold text-primary">Welcome to Talabat Rwanda</CardTitle>
          <CardDescription>Rwanda's Premier Food & Business Marketplace</CardDescription>
        </CardHeader>

        <CardContent className="space-y-6">
          {authError && (
            <Alert variant="destructive">
              <AlertCircle className="h-4 w-4" />
              <AlertDescription>{authError}</AlertDescription>
            </Alert>
          )}

          {/* User Type Selection */}
          <Tabs
            value={activeUserType}
            onValueChange={(value) => setActiveUserType(value as "customer" | "business")}
            className="w-full"
          >
            <TabsList className="grid w-full grid-cols-2">
              <TabsTrigger value="customer" className="flex items-center gap-2">
                <User className="h-4 w-4" />
                Customer
              </TabsTrigger>
              <TabsTrigger value="business" className="flex items-center gap-2">
                <Briefcase className="h-4 w-4" />
                Business
              </TabsTrigger>
            </TabsList>

            <TabsContent value="customer" className="mt-6">
              {/* Social Auth Buttons */}
              <div className="mb-6">
                <SocialAuthButtons defaultRole="customer" disabled={loading} />

                {/* Divider */}
                <div className="flex items-center my-6">
                  <div className="flex-1 border-t border-muted"></div>
                  <span className="px-4 text-sm text-muted-foreground bg-background">OR</span>
                  <div className="flex-1 border-t border-muted"></div>
                </div>
              </div>

              {/* Login/Signup Toggle */}
              <div className="flex bg-muted rounded-lg p-1 mb-6">
                <button
                  onClick={() => setAuthMode("signin")}
                  className={`flex-1 py-2 px-4 rounded-md text-sm font-medium transition-all ${
                    authMode === "signin"
                      ? "bg-background text-foreground shadow-sm"
                      : "text-muted-foreground hover:text-foreground"
                  }`}
                >
                  Sign In
                </button>
                <button
                  onClick={() => setAuthMode("signup")}
                  className={`flex-1 py-2 px-4 rounded-md text-sm font-medium transition-all ${
                    authMode === "signup"
                      ? "bg-background text-foreground shadow-sm"
                      : "text-muted-foreground hover:text-foreground"
                  }`}
                >
                  Sign Up
                </button>
              </div>

              {/* Customer Sign In Form */}
              {authMode === "signin" && (
                <form onSubmit={signInForm.handleSubmit(handleSignIn)} className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="email">Email</Label>
                    <Input
                      id="email"
                      type="email"
                      placeholder="your@email.com"
                      {...signInForm.register("email")}
                      disabled={loading}
                    />
                    {signInForm.formState.errors.email && (
                      <p className="text-sm text-destructive">{signInForm.formState.errors.email.message}</p>
                    )}
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="password">Password</Label>
                    <div className="relative">
                      <Input
                        id="password"
                        type={showPassword ? "text" : "password"}
                        placeholder="Your password"
                        {...signInForm.register("password")}
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
                        {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                      </Button>
                    </div>
                    {signInForm.formState.errors.password && (
                      <p className="text-sm text-destructive">{signInForm.formState.errors.password.message}</p>
                    )}
                  </div>

                  <Button type="submit" className="w-full" disabled={loading}>
                    {loading ? "Signing in..." : "Sign In"}
                  </Button>
                </form>
              )}

              {/* Customer Sign Up Form */}
              {authMode === "signup" && (
                <form onSubmit={signUpForm.handleSubmit(handleSignUp)} className="space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="firstName">First Name</Label>
                      <Input
                        id="firstName"
                        placeholder="John"
                        {...signUpForm.register("firstName")}
                        disabled={loading}
                      />
                      {signUpForm.formState.errors.firstName && (
                        <p className="text-sm text-destructive">{signUpForm.formState.errors.firstName.message}</p>
                      )}
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="lastName">Last Name</Label>
                      <Input id="lastName" placeholder="Doe" {...signUpForm.register("lastName")} disabled={loading} />
                      {signUpForm.formState.errors.lastName && (
                        <p className="text-sm text-destructive">{signUpForm.formState.errors.lastName.message}</p>
                      )}
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="signup-email">Email</Label>
                    <Input
                      id="signup-email"
                      type="email"
                      placeholder="your@email.com"
                      {...signUpForm.register("email")}
                      disabled={loading}
                    />
                    {signUpForm.formState.errors.email && (
                      <p className="text-sm text-destructive">{signUpForm.formState.errors.email.message}</p>
                    )}
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="phone">Phone Number</Label>
                    <Input
                      id="phone"
                      type="tel"
                      placeholder="+250 123 456 789"
                      {...signUpForm.register("phone")}
                      disabled={loading}
                    />
                    {signUpForm.formState.errors.phone && (
                      <p className="text-sm text-destructive">{signUpForm.formState.errors.phone.message}</p>
                    )}
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="signup-password">Password</Label>
                    <div className="relative">
                      <Input
                        id="signup-password"
                        type={showPassword ? "text" : "password"}
                        placeholder="Create a password"
                        {...signUpForm.register("password")}
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
                        {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                      </Button>
                    </div>
                    {signUpForm.formState.errors.password && (
                      <p className="text-sm text-destructive">{signUpForm.formState.errors.password.message}</p>
                    )}
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="confirmPassword">Confirm Password</Label>
                    <Input
                      id="confirmPassword"
                      type={showPassword ? "text" : "password"}
                      placeholder="Confirm your password"
                      {...signUpForm.register("confirmPassword")}
                      disabled={loading}
                    />
                    {signUpForm.formState.errors.confirmPassword && (
                      <p className="text-sm text-destructive">{signUpForm.formState.errors.confirmPassword.message}</p>
                    )}
                  </div>

                  <Button type="submit" className="w-full" disabled={loading}>
                    {loading ? "Creating account..." : "Create Account"}
                  </Button>
                </form>
              )}
            </TabsContent>

            <TabsContent value="business" className="mt-6">
              {/* Social Auth for Business */}
              <div className="mb-6">
                <SocialAuthButtons defaultRole="supplier" disabled={loading} />

                {/* Divider */}
                <div className="flex items-center my-6">
                  <div className="flex-1 border-t border-muted"></div>
                  <span className="px-4 text-sm text-muted-foreground bg-background">OR</span>
                  <div className="flex-1 border-t border-muted"></div>
                </div>
              </div>

              <div className="text-center space-y-6">
                <div className="space-y-2">
                  <Briefcase className="h-12 w-12 mx-auto text-primary" />
                  <h3 className="text-lg font-semibold">Partner with Talabat Rwanda</h3>
                  <p className="text-muted-foreground text-sm">
                    Ready to grow your business? Join our platform and reach thousands of customers.
                  </p>
                </div>

                <div className="space-y-3">
                  <Button className="w-full" onClick={handleBusinessRedirect}>
                    Start Business Registration
                  </Button>
                  <p className="text-xs text-muted-foreground">Business verification and approval required</p>
                </div>

                <div className="pt-4 border-t">
                  <p className="text-sm text-muted-foreground mb-3">Already have a business account?</p>
                  <form onSubmit={signInForm.handleSubmit(handleSignIn)} className="space-y-4">
                    <div className="space-y-2">
                      <Input
                        type="email"
                        placeholder="business@email.com"
                        {...signInForm.register("email")}
                        disabled={loading}
                      />
                    </div>
                    <div className="space-y-2">
                      <div className="relative">
                        <Input
                          type={showPassword ? "text" : "password"}
                          placeholder="Password"
                          {...signInForm.register("password")}
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
                          {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                        </Button>
                      </div>
                    </div>
                    <Button type="submit" variant="outline" className="w-full" disabled={loading}>
                      {loading ? "Signing in..." : "Business Sign In"}
                    </Button>
                  </form>
                </div>
              </div>
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>
    </div>
  );
};

export default Auth;
