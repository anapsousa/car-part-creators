import { useState, useEffect } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { toast } from "sonner";
import { Loader2, Facebook, Twitter, Github, Globe, MessageCircle } from "lucide-react";
import { Separator } from "@/components/ui/separator";
import { useContent } from "@/hooks/useContent";
import { LanguageSelector } from "@/components/LanguageSelector";

const Auth = () => {
  const navigate = useNavigate();
  const { content } = useContent("auth");
  const [searchParams] = useSearchParams();
  const emailParam = searchParams.get('email');
  const [isLoading, setIsLoading] = useState(false);
  const [isLogin, setIsLogin] = useState(true);
  const [email, setEmail] = useState(emailParam || "");
  const [password, setPassword] = useState("");

  useEffect(() => {
    // Check if user is already logged in
    supabase.auth.getSession().then(({ data: { session } }) => {
      if (session) {
        navigate("/dashboard");
      }
    });

    const { data: { subscription } } = supabase.auth.onAuthStateChange((event, session) => {
      if (session && (event === "SIGNED_IN" || event === "TOKEN_REFRESHED")) {
        navigate("/dashboard");
      }
    });

    return () => {
      if (subscription) {
        subscription.unsubscribe();
      }
    };
  }, [navigate]);

  useEffect(() => {
    if (emailParam) {
      setEmail(emailParam);
    }
  }, [emailParam]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!email || !password) {
      toast.error("Please fill in all fields");
      return;
    }

    if (password.length < 6) {
      toast.error("Password must be at least 6 characters");
      return;
    }

    setIsLoading(true);

    try {
      if (isLogin) {
        const { data, error } = await supabase.auth.signInWithPassword({
          email,
          password,
        });
        
        if (error) throw error;
        
        if (data.session) {
          toast.success(content["auth.login.success"] || "Welcome back!");
          // Navigation will be handled by the auth state change listener
          setTimeout(() => {
            navigate("/dashboard");
          }, 500);
        }
      } else {
        const { data, error } = await supabase.auth.signUp({
          email,
          password,
          options: {
            emailRedirectTo: `${window.location.origin}/dashboard`,
          },
        });
        
        if (error) throw error;
        
        if (data.user && !data.session) {
          // Email confirmation required
          toast.success(content["auth.signup.success"] || "Account created! Please check your email to confirm your account.");
          setIsLogin(true);
        } else if (data.session) {
          // Auto-logged in
          toast.success(content["auth.signup.success"] || "Account created! Welcome!");
          setTimeout(() => {
            navigate("/dashboard");
          }, 500);
        }
      }
    } catch (error: any) {
      if (error.message.includes("already registered")) {
        toast.error("This email is already registered. Please login instead.");
      } else if (error.message.includes("Invalid login credentials")) {
        toast.error("Invalid email or password");
      } else {
        toast.error(error.message || "An error occurred");
      }
    } finally {
      setIsLoading(false);
    }
  };

  const handleSocialLogin = async (provider: "google" | "facebook" | "twitter" | "github" | "discord") => {
    setIsLoading(true);
    try {
      const redirectUrl = `${window.location.origin}/auth`;
      
      const { data, error } = await supabase.auth.signInWithOAuth({
        provider: provider as any,
        options: {
          redirectTo: redirectUrl,
          skipBrowserRedirect: false,
        },
      });
      
      if (error) {
        if (error.message.includes("provider is not enabled")) {
          toast.error(`${provider.charAt(0).toUpperCase() + provider.slice(1)} login is not configured. Please use email/password or contact support.`);
        } else {
          throw error;
        }
      }
    } catch (error: any) {
      console.error("OAuth error:", error);
      toast.error((content["auth.social.error"] || "Failed to sign in with {provider}. Please try again.").replace("{provider}", provider.charAt(0).toUpperCase() + provider.slice(1)));
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-background to-primary/5 flex flex-col">
      <div className="absolute top-4 right-4">
        <LanguageSelector />
      </div>
      <div className="flex-1 flex items-center justify-center p-4 py-12">
        <Card className="w-full max-w-md border-2 border-primary/20 shadow-2xl backdrop-blur-sm bg-card/98">
          <CardHeader className="space-y-2">
            <CardTitle className="text-3xl font-bold bg-gradient-primary bg-clip-text text-transparent">
              {content["auth.title"] || "Welcome to our page"}
            </CardTitle>
            <CardDescription>
              {isLogin ? content["auth.login.subtitle"] || "Please login to continue." : content["auth.signup.subtitle"] || "Create an account to start generating 3D models."}
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="email">{content["auth.email"] || "Email"}</Label>
                <Input
                  id="email"
                  type="email"
                  placeholder={content["auth.email.placeholder"] || "you@example.com"}
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                  disabled={isLoading}
                />
                {emailParam && (
                  <p className="text-xs text-muted-foreground mt-1">
                    {content['auth.email.prefilled'] || 'Email pre-filled from your order'}
                  </p>
                )}
              </div>
              <div className="space-y-2">
                <Label htmlFor="password">{content["auth.password"] || "Password"}</Label>
                <Input
                  id="password"
                  type="password"
                  placeholder={content["auth.password.placeholder"] || "••••••••"}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  disabled={isLoading}
                  minLength={6}
                />
              </div>
              <Button
                type="submit"
                className="w-full"
                disabled={isLoading}
              >
                {isLoading ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    {isLogin ? content["auth.login.loading"] || "Logging in..." : content["auth.signup.loading"] || "Creating account..."}
                  </>
                ) : (
                  isLogin ? content["auth.login.button"] || "Login" : content["auth.signup.button"] || "Sign Up"
                )}
              </Button>
            </form>
            <Separator decorative />
            <div className="text-sm text-muted-foreground my-4 text-center">
              {content["auth.social.title"] || "Or continue with"}
            </div>
            <div className="flex flex-col gap-3 mb-4">
              <Button
                variant="outline"
                type="button"
                className="w-full flex items-center justify-center gap-2"
                disabled={isLoading}
                onClick={() => handleSocialLogin('google')}
              >
                <Globe className="h-4 w-4" />
                {content["auth.social.google"] || "Google"}
              </Button>
              <Button
                variant="outline"
                type="button"
                className="w-full flex items-center justify-center gap-2"
                disabled={isLoading}
                onClick={() => handleSocialLogin('facebook')}
              >
                <Facebook className="h-4 w-4" />
                {content["auth.social.facebook"] || "Facebook"}
              </Button>
              <Button
                variant="outline"
                type="button"
                className="w-full flex items-center justify-center gap-2"
                disabled={isLoading}
                onClick={() => handleSocialLogin('twitter')}
              >
                <Twitter className="h-4 w-4" />
                {content["auth.social.twitter"] || "Twitter/X"}
              </Button>
              <Button
                variant="outline"
                type="button"
                className="w-full flex items-center justify-center gap-2"
                disabled={isLoading}
                onClick={() => handleSocialLogin('github')}
              >
                <Github className="h-4 w-4" />
                {content["auth.social.github"] || "GitHub"}
              </Button>
              <Button
                variant="outline"
                type="button"
                className="w-full flex items-center justify-center gap-2"
                disabled={isLoading}
                onClick={() => handleSocialLogin('discord')}
              >
                <MessageCircle className="h-4 w-4" />
                {content["auth.social.discord"] || "Discord"}
              </Button>
            </div>
            <div className="mt-4 text-center text-sm">
              <button
                type="button"
                onClick={() => setIsLogin(!isLogin)}
                className="text-primary hover:underline"
                disabled={isLoading}
              >
                {isLogin ? content["auth.switch.to_signup"] || "Need an account? Sign up" : content["auth.switch.to_login"] || "Already have an account? Login"}
              </button>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default Auth;
