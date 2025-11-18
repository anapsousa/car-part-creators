import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { ShoppingCart, Menu, User, LogOut, Package, BarChart3, Settings, Heart } from "lucide-react";
import { useCart } from "@/contexts/CartContext";
import { useWishlist } from "@/contexts/WishlistContext";
import { supabase } from "@/integrations/supabase/client";
import { useEffect, useState } from "react";
import pompousweekLogo from "@/assets/pompousweek-logo.png";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { toast } from "sonner";

interface HeaderProps {
  pageTitle?: string;
  pageSubtitle?: string;
  showCart?: boolean;
  showAuth?: boolean;
}

export const Header = ({ 
  pageTitle, 
  pageSubtitle, 
  showCart = true, 
  showAuth = true 
}: HeaderProps) => {
  const navigate = useNavigate();
  const { cartCount } = useCart();
  const { wishlistItems } = useWishlist();
  const [user, setUser] = useState<any>(null);
  const [isAdmin, setIsAdmin] = useState(false);

  useEffect(() => {
    checkAuth();
  }, []);

  const checkAuth = async () => {
    const { data: { session } } = await supabase.auth.getSession();
    setUser(session?.user || null);

    if (session?.user) {
      const { data: roles } = await supabase
        .from("user_roles")
        .select("role")
        .eq("user_id", session.user.id)
        .eq("role", "admin")
        .single();
      
      setIsAdmin(!!roles);
    }

    supabase.auth.onAuthStateChange((_event, session) => {
      setUser(session?.user || null);
    });
  };

  const handleLogout = async () => {
    await supabase.auth.signOut();
    toast.success("Logged out successfully");
    navigate("/");
  };

  return (
    <header className="border-b border-border/50 bg-gradient-to-r from-card/80 via-card/90 to-card/80 backdrop-blur-md sticky top-0 z-50 shadow-glow">
      <div className="container mx-auto px-4 py-4">
        <div className="flex items-center justify-between">
          {/* Logo and Title */}
          <div className="flex items-center gap-4">
            <img 
              src={pompousweekLogo} 
              alt="Pompousweek" 
              className="h-10 w-auto cursor-pointer" 
              onClick={() => navigate("/")}
            />
            {pageTitle && (
              <div>
                <h1 className="text-xl font-bold">{pageTitle}</h1>
                {pageSubtitle && (
                  <p className="text-xs text-muted-foreground">{pageSubtitle}</p>
                )}
              </div>
            )}
          </div>

          {/* Navigation Actions */}
          <div className="flex items-center gap-2">
            {showCart && (
              <>
                <Button 
                  variant="ghost" 
                  size="icon" 
                  onClick={() => navigate("/wishlist")}
                  className="relative hover:scale-110 transition-transform"
                >
                  <Heart className="h-5 w-5" />
                  {wishlistItems.length > 0 && (
                    <span className="absolute -top-1 -right-1 bg-secondary text-secondary-foreground text-xs rounded-full h-5 w-5 flex items-center justify-center">
                      {wishlistItems.length}
                    </span>
                  )}
                </Button>
                <Button 
                  variant="ghost" 
                  size="icon" 
                  onClick={() => navigate("/cart")}
                  className="relative hover:scale-110 transition-transform"
                >
                  <ShoppingCart className="h-5 w-5" />
                  {cartCount > 0 && (
                    <span className="absolute -top-1 -right-1 bg-primary text-primary-foreground text-xs rounded-full h-5 w-5 flex items-center justify-center">
                      {cartCount}
                    </span>
                  )}
                </Button>
              </>
            )}

            {showAuth && (
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" size="icon">
                    <Menu className="h-5 w-5" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="w-56">
                  {user ? (
                    <>
                      <DropdownMenuItem onClick={() => navigate("/dashboard")}>
                        <User className="mr-2 h-4 w-4" />
                        My Dashboard
                      </DropdownMenuItem>
                      <DropdownMenuItem onClick={() => navigate("/shop")}>
                        <ShoppingCart className="mr-2 h-4 w-4" />
                        Shop
                      </DropdownMenuItem>
                      <DropdownMenuItem onClick={() => navigate("/generator")}>
                        <Settings className="mr-2 h-4 w-4" />
                        AI Generator
                      </DropdownMenuItem>
                      <DropdownMenuItem onClick={() => navigate("/faq")}>
                        FAQ
                      </DropdownMenuItem>
                      <DropdownMenuItem onClick={() => navigate("/contact")}>
                        Contact Us
                      </DropdownMenuItem>
                      <DropdownMenuItem onClick={() => navigate("/about")}>
                        About Us
                      </DropdownMenuItem>
                      
                      {isAdmin && (
                        <>
                          <DropdownMenuSeparator />
                          <DropdownMenuItem onClick={() => navigate("/admin")}>
                            <Package className="mr-2 h-4 w-4" />
                            Admin Dashboard
                          </DropdownMenuItem>
                          <DropdownMenuItem onClick={() => navigate("/admin/products")}>
                            <Package className="mr-2 h-4 w-4" />
                            Manage Products
                          </DropdownMenuItem>
                          <DropdownMenuItem onClick={() => navigate("/admin/stats")}>
                            <BarChart3 className="mr-2 h-4 w-4" />
                            Business Stats
                          </DropdownMenuItem>
                        </>
                      )}
                      
                      <DropdownMenuSeparator />
                      <DropdownMenuItem onClick={handleLogout}>
                        <LogOut className="mr-2 h-4 w-4" />
                        Logout
                      </DropdownMenuItem>
                    </>
                  ) : (
                    <>
                      <DropdownMenuItem onClick={() => navigate("/shop")}>
                        <ShoppingCart className="mr-2 h-4 w-4" />
                        Shop
                      </DropdownMenuItem>
                      <DropdownMenuItem onClick={() => navigate("/faq")}>
                        FAQ
                      </DropdownMenuItem>
                      <DropdownMenuItem onClick={() => navigate("/contact")}>
                        Contact Us
                      </DropdownMenuItem>
                      <DropdownMenuItem onClick={() => navigate("/about")}>
                        About Us
                      </DropdownMenuItem>
                      <DropdownMenuSeparator />
                      <DropdownMenuItem onClick={() => navigate("/auth")}>
                        <User className="mr-2 h-4 w-4" />
                        Login / Sign Up
                      </DropdownMenuItem>
                    </>
                  )}
                </DropdownMenuContent>
              </DropdownMenu>
            )}
          </div>
        </div>
      </div>
    </header>
  );
};
