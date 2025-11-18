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
  const { cartItems } = useCart();
  const [user, setUser] = useState<User | null>(null);

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      setUser(session?.user || null);
    });

    const { data: { subscription } } = supabase.auth.onAuthStateChange((event, session) => {
      setUser(session?.user || null);
    });

    return () => subscription.unsubscribe();
  }, []);

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="border-b bg-card/80 backdrop-blur-md sticky top-0 z-50">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4 cursor-pointer" onClick={() => navigate("/")}>
              <ShoppingBag className="h-6 w-6 text-primary" />
              <span className="text-xl font-bold">ClassicPrint3D</span>
            </div>
            <nav className="hidden md:flex items-center gap-6">
              <Button variant="ghost" onClick={() => navigate("/shop")}>Products</Button>
              <Button variant="ghost" onClick={() => user ? navigate("/generator") : navigate("/auth")}>
                <Sparkles className="mr-2 h-4 w-4" />
                AI Generator
              </Button>
              <Button variant="ghost" onClick={() => navigate("/cart")}>
                <ShoppingCart className="mr-2 h-4 w-4" />
                Cart {cartItems.length > 0 && `(${cartItems.length})`}
              </Button>
              {user ? (
                <Button variant="outline" onClick={() => navigate("/dashboard")}>
                  <UserIcon className="mr-2 h-4 w-4" />
                  Dashboard
                </Button>
              ) : (
                <Button onClick={() => navigate("/auth")}>Sign In</Button>
              )}
            </nav>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section className="bg-gradient-to-br from-primary/10 via-background to-secondary/10 py-20">
        <div className="container mx-auto px-4">
          <div className="flex flex-col lg:flex-row items-center gap-12">
            <div className="flex-1 space-y-6">
              <Badge className="w-fit">
                <ShoppingBag className="mr-2 h-3 w-3" />
                Premium 3D Printing Services
              </Badge>
              <h1 className="text-5xl lg:text-6xl font-bold">
                Restore Your Classic.{" "}
                <span className="text-primary">Enhance Your Home.</span>
              </h1>
              <p className="text-lg text-muted-foreground max-w-xl">
                Precision 3D printed classic car parts and custom home decor. From vintage restoration components to modern interior accents, we bring your vision to life with cutting-edge technology.
              </p>
              <div className="flex gap-4">
                <Button size="lg" onClick={() => navigate("/shop")}>
                  Browse Catalog
                </Button>
                <Button size="lg" variant="outline" onClick={() => user ? navigate("/generator") : navigate("/auth")}>
                  <Sparkles className="mr-2 h-4 w-4" />
                  Try AI Generator
                </Button>
              </div>
              <div className="flex gap-8 pt-4">
                <div>
                  <div className="text-3xl font-bold text-primary">500+</div>
                  <div className="text-sm text-muted-foreground">Parts Printed</div>
                </div>
                <div>
                  <div className="text-3xl font-bold text-primary">98%</div>
                  <div className="text-sm text-muted-foreground">Satisfaction Rate</div>
                </div>
                <div>
                  <div className="text-3xl font-bold text-primary">24h</div>
                  <div className="text-sm text-muted-foreground">Fast Turnaround</div>
                </div>
              </div>
            </div>
            <div className="flex-1">
              <div className="bg-muted/50 rounded-lg p-8 aspect-video flex items-center justify-center">
                <ShoppingBag className="h-32 w-32 text-muted-foreground/30" />
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-20 bg-card/50">
        <div className="container mx-auto px-4">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold mb-4">Why Choose ClassicPrint3D?</h2>
            <p className="text-muted-foreground">Specialized expertise in classic automotive and home decor 3D printing</p>
          </div>
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
            <Card>
              <CardContent className="pt-6 space-y-2">
                <div className="h-12 w-12 bg-primary/10 rounded-lg flex items-center justify-center mb-4">
                  <Shield className="h-6 w-6 text-primary" />
                </div>
                <h3 className="font-semibold text-lg">Vintage Expertise</h3>
                <p className="text-sm text-muted-foreground">Specialized in reproducing hard-to-find classic car parts with museum-quality accuracy</p>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="pt-6 space-y-2">
                <div className="h-12 w-12 bg-primary/10 rounded-lg flex items-center justify-center mb-4">
                  <ShoppingBag className="h-6 w-6 text-primary" />
                </div>
                <h3 className="font-semibold text-lg">Custom Decor</h3>
                <p className="text-sm text-muted-foreground">Unique home accessories designed to match your interior style and preferences</p>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="pt-6 space-y-2">
                <div className="h-12 w-12 bg-primary/10 rounded-lg flex items-center justify-center mb-4">
                  <Sparkles className="h-6 w-6 text-primary" />
                </div>
                <h3 className="font-semibold text-lg">AI-Powered Design</h3>
                <p className="text-sm text-muted-foreground">Generate custom 3D models from photos or descriptions using advanced AI technology</p>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="pt-6 space-y-2">
                <div className="h-12 w-12 bg-primary/10 rounded-lg flex items-center justify-center mb-4">
                  <Zap className="h-6 w-6 text-primary" />
                </div>
                <h3 className="font-semibold text-lg">Digital Models</h3>
                <p className="text-sm text-muted-foreground">Purchase and download ready-to-print 3D models for your own printer</p>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 bg-primary text-primary-foreground">
        <div className="container mx-auto px-4 text-center">
          <Sparkles className="h-16 w-16 mx-auto mb-6 opacity-90" />
          <h2 className="text-4xl font-bold mb-4">Ready to Create Something Amazing?</h2>
          <p className="text-lg mb-8 opacity-90 max-w-2xl mx-auto">
            Whether you need a rare classic car part or a unique home decor piece, our AI-powered tools and expert printing services are here to help
          </p>
          <div className="flex gap-4 justify-center">
            <Button size="lg" variant="secondary" onClick={() => navigate("/shop")}>
              Browse Catalog
            </Button>
            <Button size="lg" variant="outline" className="bg-transparent border-primary-foreground text-primary-foreground hover:bg-primary-foreground hover:text-primary" onClick={() => user ? navigate("/generator") : navigate("/auth")}>
              Try AI Generator
            </Button>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-card border-t py-12">
        <div className="container mx-auto px-4">
          <div className="grid md:grid-cols-4 gap-8">
            <div>
              <div className="flex items-center gap-2 mb-4">
                <ShoppingBag className="h-6 w-6 text-primary" />
                <span className="font-bold text-lg">ClassicPrint3D</span>
              </div>
              <p className="text-sm text-muted-foreground">Premium 3D printing services for classic car enthusiasts and home decor lovers</p>
            </div>
            <div>
              <h3 className="font-semibold mb-4">Products</h3>
              <ul className="space-y-2 text-sm text-muted-foreground">
                <li><Button variant="link" className="h-auto p-0" onClick={() => navigate("/shop")}>All Products</Button></li>
                <li><Button variant="link" className="h-auto p-0" onClick={() => navigate("/dashboard")}>3D Models</Button></li>
                <li><Button variant="link" className="h-auto p-0" onClick={() => navigate("/shop")}>Car Parts</Button></li>
                <li><Button variant="link" className="h-auto p-0" onClick={() => navigate("/shop")}>Home Decor</Button></li>
              </ul>
            </div>
            <div>
              <h3 className="font-semibold mb-4">Services</h3>
              <ul className="space-y-2 text-sm text-muted-foreground">
                <li><Button variant="link" className="h-auto p-0" onClick={() => navigate("/generator")}>AI Model Generator</Button></li>
                <li><span>Custom Printing</span></li>
                <li><span>Restoration Services</span></li>
                <li><span>Design Consultation</span></li>
              </ul>
            </div>
            <div>
              <h3 className="font-semibold mb-4">Company</h3>
              <ul className="space-y-2 text-sm text-muted-foreground">
                <li><Button variant="link" className="h-auto p-0" onClick={() => navigate("/about")}>About Us</Button></li>
                <li><Button variant="link" className="h-auto p-0" onClick={() => navigate("/contact")}>Contact</Button></li>
                <li><Button variant="link" className="h-auto p-0" onClick={() => navigate("/faq")}>FAQ</Button></li>
                <li><span>Terms of Service</span></li>
              </ul>
            </div>
          </div>
          <div className="mt-8 pt-8 border-t text-center text-sm text-muted-foreground">
            © 2025 ClassicPrint3D. All rights reserved.
          </div>
        </div>
      </footer>
    </div>
  );
};

export default Index;
