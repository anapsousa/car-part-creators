import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { ShoppingCart, Heart, User, LogOut, LayoutDashboard, Package, Settings, BarChart3, FileText } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useCart } from "@/contexts/CartContext";
import { useWishlist } from "@/contexts/WishlistContext";
import { NavLink } from "./NavLink";
import { LanguageSelector } from "./LanguageSelector";
import { useContent } from "@/hooks/useContent";
import pompousweekLogo from "@/assets/pompousweek-logo.png";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Button } from "./ui/button";

interface HeaderProps {
  pageTitle?: string;
  pageSubtitle?: string;
  showCart?: boolean;
  showAuth?: boolean;
}

export function Header({ pageTitle, pageSubtitle, showCart = true, showAuth = true }: HeaderProps) {
  const navigate = useNavigate();
  const { content } = useContent("navigation");
  const { cartItems } = useCart();
  const { wishlistItems } = useWishlist();
  const [user, setUser] = useState<any>(null);
  const [isAdmin, setIsAdmin] = useState(false);

  useEffect(() => {
    let subscription: { unsubscribe: () => void } | null = null;

    const initAuth = async () => {
      subscription = await checkAuth();
    };

    initAuth();

    return () => {
      if (subscription) {
        subscription.unsubscribe();
      }
    };
  }, []);

  const checkAuth = async () => {
    const { data: { session } } = await supabase.auth.getSession();
    
    if (session?.user) {
      setUser(session.user);

      const { data: roles } = await supabase
        .from("user_roles")
        .select("role")
        .eq("user_id", session.user.id);

      const hasAdminRole = roles?.some((r) => r.role === "admin");
      setIsAdmin(hasAdminRole || false);
    } else {
      setUser(null);
      setIsAdmin(false);
    }

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      if (session?.user) {
        setUser(session.user);
      } else {
        setUser(null);
        setIsAdmin(false);
      }
    });

    return subscription;
  };

  const handleLogout = async () => {
    await supabase.auth.signOut();
    navigate("/");
  };

  return (
    <header className="border-b border-border/40 bg-card/95 backdrop-blur-md sticky top-0 z-50 shadow-sm">
      <div className="container mx-auto px-4 py-4">
        <div className="flex items-center justify-between">
          {/* Logo and Title */}
          <div className="flex items-center gap-4 cursor-pointer" onClick={() => navigate("/")}>
            <img
              src={pompousweekLogo}
              alt="From Dream To Real 3D"
              className="h-10 w-auto"
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

          {/* Navigation */}
          <nav className="hidden md:flex items-center space-x-8">
            <NavLink to="/">{content["nav.home"] || "Home"}</NavLink>
            <NavLink to="/shop">{content["nav.shop"] || "Shop"}</NavLink>
            <NavLink to="/priceCalculator">{content["nav.pricecalculator"] || "Price Calculator"}</NavLink>
            <NavLink to="/about">{content["nav.about"] || "About"}</NavLink>
            <NavLink to="/contact">{content["nav.contact"] || "Contact"}</NavLink>
            <NavLink to="/faq">{content["nav.faq"] || "FAQ"}</NavLink>
          </nav>

          {/* Actions */}
          <div className="flex items-center gap-2">
            <LanguageSelector />
            
            {showCart && (
              <>
              <button
                onClick={() => navigate("/wishlist")}
                className="relative p-2 text-foreground hover:text-primary transition-colors"
                aria-label={content["nav.wishlist_label"] || "Wishlist"}
              >
                <Heart className="h-5 w-5" />
                {wishlistItems.length > 0 && (
                  <span className="absolute -top-1 -right-1 bg-primary text-primary-foreground text-xs rounded-full h-5 w-5 flex items-center justify-center">
                    {wishlistItems.length}
                  </span>
                )}
              </button>
              <button
                onClick={() => navigate("/cart")}
                className="relative p-2 text-foreground hover:text-primary transition-colors"
                aria-label={content["nav.cart_label"] || "Cart"}
              >
                <ShoppingCart className="h-5 w-5" />
                {cartItems.length > 0 && (
                  <span className="absolute -top-1 -right-1 bg-primary text-primary-foreground text-xs rounded-full h-5 w-5 flex items-center justify-center">
                    {cartItems.length}
                  </span>
                )}
              </button>
              </>
            )}

            {showAuth && (
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" size="icon">
                    <User className="h-5 w-5" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end">
                {user ? (
                  <>
                    <DropdownMenuItem onClick={() => navigate("/dashboard")}>
                      <LayoutDashboard className="mr-2 h-4 w-4" />
                      {content["nav.dashboard"] || "Dashboard"}
                    </DropdownMenuItem>
                    {isAdmin && (
                      <>
                        <DropdownMenuItem onClick={() => navigate("/admin/dashboard")}>
                          <BarChart3 className="mr-2 h-4 w-4" />
                          {content["nav.admin_dashboard"] || "Admin Dashboard"}
                        </DropdownMenuItem>
                        <DropdownMenuItem onClick={() => navigate("/admin/products")}>
                          <Package className="mr-2 h-4 w-4" />
                          {content["nav.admin_products"] || "Products"}
                        </DropdownMenuItem>
                        <DropdownMenuItem onClick={() => navigate("/admin/stats")}>
                          <Settings className="mr-2 h-4 w-4" />
                          {content["nav.admin_statistics"] || "Statistics"}
                        </DropdownMenuItem>
                        <DropdownMenuItem onClick={() => navigate("/admin/content")}>
                          <FileText className="mr-2 h-4 w-4" />
                          {content["nav.admin_content"] || "Content Manager"}
                        </DropdownMenuItem>
                        <DropdownMenuItem onClick={() => navigate("/generator")}>
                          <FileText className="mr-2 h-4 w-4" />
                          {content["nav.generator"] || "Generator"}
                        </DropdownMenuItem>
                      </>
                    )}
                    <DropdownMenuSeparator />
                    <DropdownMenuItem onClick={handleLogout}>
                      <LogOut className="mr-2 h-4 w-4" />
                      {content["nav.logout"] || "Logout"}
                    </DropdownMenuItem>
                  </>
                ) : (
                  <DropdownMenuItem onClick={() => navigate("/auth")}>
                    <User className="mr-2 h-4 w-4" />
                    {content["nav.login"] || "Login"}
                  </DropdownMenuItem>
                )}
                </DropdownMenuContent>
              </DropdownMenu>
            )}
          </div>
        </div>
      </div>
    </header>
  );
}
