import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { ShoppingBag, Sparkles, Zap, Shield, ArrowRight, Menu, LogOut, User as UserIcon, ShoppingCart, HelpCircle, Mail, Info, ShieldCheck } from "lucide-react";
import { User } from "@supabase/supabase-js";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { Badge } from "@/components/ui/badge";
import pompousweekLogo from "@/assets/pompousweek-logo.png";
import { useCart } from "@/contexts/CartContext";
import { toast } from "sonner";
import GenerateForm from "@/components/GenerateForm";
import DesignHistory from "@/components/DesignHistory";

const Index = () => {
  const navigate = useNavigate();
  const [user, setUser] = useState<User | null>(null);
  const [refreshTrigger, setRefreshTrigger] = useState(0);
  const [isAdmin, setIsAdmin] = useState(false);

  useEffect(() => {
    // Check authentication status
    supabase.auth.getSession().then(({ data: { session } }) => {
      if (!session) {
        navigate("/auth");
      } else {
        setUser(session.user);
        checkAdminStatus(session.user.id);
      }
    });

    const { data: { subscription } } = supabase.auth.onAuthStateChange((event, session) => {
      if (!session) {
        navigate("/auth");
      } else {
        setUser(session.user);
        checkAdminStatus(session.user.id);
      }
    });

    return () => subscription.unsubscribe();
  }, [navigate]);

  const checkAdminStatus = async (userId: string) => {
    const { data } = await supabase
      .from("user_roles")
      .select("role")
      .eq("user_id", userId)
      .eq("role", "admin")
      .single();
    
    setIsAdmin(!!data);
  };

  const handleLogout = async () => {
    try {
      await supabase.auth.signOut();
      toast.success("Logged out successfully");
      navigate("/auth");
    } catch (error: any) {
      toast.error("Failed to logout");
    }
  };

  const handleGenerate = () => {
    setRefreshTrigger(prev => prev + 1);
  };

  if (!user) {
    return null;
  }

  return (
    <div className="min-h-screen bg-gradient-mesh">
      {/* Header */}
      <header className="border-b border-border/50 bg-card/80 backdrop-blur-md sticky top-0 z-50">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <img src={pompousweekLogo} alt="Pompousweek" className="h-10 w-auto" />
              <div>
                <h1 className="text-xl font-bold">3D Model Generator</h1>
                <p className="text-xs text-muted-foreground">AI-Powered Design Tool</p>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" size="icon">
                    <Menu className="h-5 w-5" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="w-48">
                  <DropdownMenuItem onClick={() => navigate("/dashboard")}>
                    <UserIcon className="mr-2 h-4 w-4" />
                    My Dashboard
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={() => navigate("/faq")}>
                    <HelpCircle className="mr-2 h-4 w-4" />
                    FAQ
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={() => navigate("/contact")}>
                    <Mail className="mr-2 h-4 w-4" />
                    Contact Us
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={() => navigate("/about")}>
                    <Info className="mr-2 h-4 w-4" />
                    About Us
                  </DropdownMenuItem>
                  {isAdmin && (
                    <>
                      <DropdownMenuItem onClick={() => navigate("/admin")}>
                        <ShieldCheck className="mr-2 h-4 w-4" />
                        Review Designs
                      </DropdownMenuItem>
                      <DropdownMenuItem onClick={() => navigate("/admin/stats")}>
                        <ShieldCheck className="mr-2 h-4 w-4" />
                        Business Stats
                      </DropdownMenuItem>
                    </>
                  )}
                </DropdownMenuContent>
              </DropdownMenu>
              <Button variant="outline" onClick={handleLogout}>
                <LogOut className="mr-2 h-4 w-4" />
                Logout
              </Button>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="container mx-auto px-4 py-8">
        <div className="max-w-5xl mx-auto space-y-8">
          {/* Hero Section */}
          <div className="text-center space-y-4 py-8">
            <h2 className="text-4xl md:text-5xl font-bold">
              Create Custom{" "}
              <span className="bg-gradient-primary bg-clip-text text-transparent">
                3D Models
              </span>
            </h2>
            <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
              Generate printable STL and BLEND files for car parts and home decorations using AI
            </p>
          </div>

          {/* Generate Form */}
          <GenerateForm onGenerate={handleGenerate} />

          {/* Design History */}
          <DesignHistory refreshTrigger={refreshTrigger} />
        </div>
      </main>
    </div>
  );
};

export default Index;
