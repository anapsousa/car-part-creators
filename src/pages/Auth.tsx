import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { toast } from "sonner";
import { Loader2 } from "lucide-react";
import { Footer } from "@/components/Footer";
import { useContent } from "@/hooks/useContent";

const Auth = () => {
  const navigate = useNavigate();
  const { content } = useContent("auth");
  const [isLoading, setIsLoading] = useState(false);
  const [isLogin, setIsLogin] = useState(true);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  useEffect(() => {
    // Check if user is already logged in
    supabase.auth.getSession().then(({ data: { session } }) => {
      if (session) {
        navigate("/");
      }
    });

    const { data: { subscription } } = supabase.auth.onAuthStateChange((event, session) => {
      if (session) {
        navigate("/");
      }
    });

    return () => subscription.unsubscribe();
  }, [navigate]);

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
        const { error } = await supabase.auth.signInWithPassword({
          email,
          password,
        });
        
        if (error) throw error;
        toast.success("Welcome back!");
      } else {
        const { error } = await supabase.auth.signUp({
          email,
          password,
          options: {
            emailRedirectTo: `${window.location.origin}/`,
          },
        });
        
        if (error) throw error;
        toast.success("Account created! You can now log in.");
        setIsLogin(true);
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

  return (
    <div className="min-h-screen flex items-center justify-center p-4 bg-gradient-mesh">
      <Card className="w-full max-w-md border-border/50 backdrop-blur-sm bg-card/95">
        <CardHeader className="space-y-2">
          <CardTitle className="text-3xl font-bold bg-gradient-primary bg-clip-text text-transparent">
            {content["auth.title"] || "3D Model Generator"}
          </CardTitle>
          <CardDescription>
            {isLogin ? content["auth.login.subtitle"] || "Welcome back! Please login to continue." : content["auth.signup.subtitle"] || "Create an account to start generating 3D models."}
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
      <Footer />
    </div>
  );
};

export default Auth;
