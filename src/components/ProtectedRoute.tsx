import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { useUserRole } from "@/hooks/useUserRole";
import { Loader2, Lock } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";

interface ProtectedRouteProps {
  children: React.ReactNode;
  requiredRole?: "creator" | "admin";
  redirectTo?: string;
}

export function ProtectedRoute({ 
  children, 
  requiredRole = "creator",
  redirectTo = "/dashboard" 
}: ProtectedRouteProps) {
  const navigate = useNavigate();
  const { isAdmin, isCreator, isLoading, userId } = useUserRole();
  const [isAuthenticated, setIsAuthenticated] = useState<boolean | null>(null);

  useEffect(() => {
    const checkAuth = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      setIsAuthenticated(!!session?.user);
      
      if (!session?.user) {
        navigate("/auth");
      }
    };
    
    checkAuth();
  }, [navigate]);

  // Still checking authentication
  if (isAuthenticated === null || isLoading) {
    return (
      <div className="min-h-screen bg-gradient-mesh flex items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  // Not authenticated - will be redirected
  if (!isAuthenticated) {
    return null;
  }

  // Check role access
  const hasAccess = requiredRole === "admin" ? isAdmin : isCreator;

  if (!hasAccess) {
    return (
      <div className="min-h-screen bg-gradient-mesh flex items-center justify-center p-4">
        <Card className="max-w-md w-full border-2 border-destructive/20">
          <CardHeader className="text-center">
            <div className="mx-auto p-3 bg-destructive/10 rounded-full w-fit mb-4">
              <Lock className="h-8 w-8 text-destructive" />
            </div>
            <CardTitle className="text-2xl">Access Restricted</CardTitle>
            <CardDescription>
              This feature is only available to creator accounts.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <p className="text-sm text-muted-foreground text-center">
              The Price Calculator is a premium feature for creators who need to calculate 3D printing costs. 
              If you need access, please contact support to upgrade your account.
            </p>
            <div className="flex flex-col gap-2">
              <Button onClick={() => navigate(redirectTo)} className="w-full">
                Go to Dashboard
              </Button>
              <Button variant="outline" onClick={() => navigate("/contact")} className="w-full">
                Contact Support
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  return <>{children}</>;
}
