import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { ShoppingCart, Heart, User, LogOut, LayoutDashboard, Package, Settings, BarChart3, FileText, Calculator, Menu, X } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useCart } from "@/contexts/CartContext";
import { useWishlist } from "@/contexts/WishlistContext";
import { NavLink } from "./NavLink";
import { LanguageSelector } from "./LanguageSelector";
import { useContent } from "@/hooks/useContent";
import pompousweekLogo from "@/assets/pompousweek-logo.png";
import dr3amtorealLogo from "@/assets/dr3amtoreal-logo.png";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";
import { Button } from "./ui/button";

interface HeaderProps {
  pageTitle?: string;
  pageSubtitle?: string;
  showCart?: boolean;
  showAuth?: boolean;
}

type AppRole = "admin" | "creator" | "user";

export function Header({ pageTitle, pageSubtitle, showCart = true, showAuth = true }: HeaderProps) {
  const navigate = useNavigate();
  const { content } = useContent("navigation");
  const { cartItems } = useCart();
  const { wishlistItems } = useWishlist();
  const [user, setUser] = useState<any>(null);
  const [roles, setRoles] = useState<AppRole[]>([]);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const isAdmin = roles.includes("admin");
  const isCreator = roles.includes("creator") || isAdmin;

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
      await fetchUserRoles(session.user.id);
    } else {
      setUser(null);
      setRoles([]);
    }

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      if (session?.user) {
        setUser(session.user);
        // Defer role fetch to avoid deadlock
        setTimeout(() => {
          fetchUserRoles(session.user.id);
        }, 0);
      } else {
        setUser(null);
        setRoles([]);
      }
    });

    return subscription;
  };

  const fetchUserRoles = async (userId: string) => {
    const { data: userRoles } = await supabase
      .from("user_roles")
      .select("role")
      .eq("user_id", userId);

    const fetchedRoles = userRoles?.map((r) => r.role as AppRole) || [];
    setRoles(fetchedRoles);
  };

  const handleLogout = async () => {
    await supabase.auth.signOut();
    navigate("/");
  };

  return (
    <header className="border-b border-border/40 bg-card/95 backdrop-blur-md sticky top-0 z-50 shadow-sm">
      <div className="container mx-auto px-4 py-4">
        <div className="flex items-center justify-between">
          {/* Logo and Title with Mobile Menu */}
          <div className="flex items-center gap-4">
            {/* Mobile Menu Button */}
            <Sheet open={mobileMenuOpen} onOpenChange={setMobileMenuOpen}>
              <SheetTrigger asChild>
                <Button
                  variant="ghost"
                  size="icon"
                  className="md:hidden"
                  aria-label="Open menu"
                >
                  <Menu className="h-6 w-6" />
                </Button>
              </SheetTrigger>
              <SheetContent side="left" className="w-[300px] sm:w-[400px]">
                <SheetHeader>
                  <SheetTitle className="flex items-center gap-3">
                    <img
                      src={dr3amtorealLogo}
                      alt="Dr3amToReal"
                      className="h-8 w-auto"
                    />
                    <span>Menu</span>
                  </SheetTitle>
                </SheetHeader>
                <nav className="flex flex-col gap-4 mt-8">
                  <Button
                    variant="ghost"
                    className="justify-start text-lg"
                    onClick={() => {
                      navigate("/");
                      setMobileMenuOpen(false);
                    }}
                  >
                    {content["nav.home"] || "Home"}
                  </Button>
                  <Button
                    variant="ghost"
                    className="justify-start text-lg"
                    onClick={() => {
                      navigate("/shop");
                      setMobileMenuOpen(false);
                    }}
                  >
                    {content["nav.shop"] || "Shop"}
                  </Button>
                  <Button
                    variant="ghost"
                    className="justify-start text-lg"
                    onClick={() => {
                      navigate("/about");
                      setMobileMenuOpen(false);
                    }}
                  >
                    {content["nav.about"] || "About"}
                  </Button>
                  <Button
                    variant="ghost"
                    className="justify-start text-lg"
                    onClick={() => {
                      navigate("/contact");
                      setMobileMenuOpen(false);
                    }}
                  >
                    {content["nav.contact"] || "Contact"}
                  </Button>
                  <Button
                    variant="ghost"
                    className="justify-start text-lg"
                    onClick={() => {
                      navigate("/faq");
                      setMobileMenuOpen(false);
                    }}
                  >
                    {content["nav.faq"] || "FAQ"}
                  </Button>
                </nav>
              </SheetContent>
            </Sheet>

            {/* Logo - clickable to home */}
            <div 
              className="flex items-center gap-4 cursor-pointer" 
              onClick={() => navigate("/")}
            >
              <img
                src={dr3amtorealLogo}
                alt="From Dream To Real 3D"
                className="h-10 w-auto"
              />
              {pageTitle && (
                <div className="hidden sm:block">
                  <div className="text-xl font-bold">{pageTitle}</div>
                  {pageSubtitle && (
                    <p className="text-xs text-muted-foreground">{pageSubtitle}</p>
                  )}
                </div>
              )}
            </div>
          </div>

          {/* Desktop Navigation */}
          <nav className="hidden md:flex items-center space-x-8">
            <NavLink to="/">{content["nav.home"] || "Home"}</NavLink>
            <NavLink to="/shop">{content["nav.shop"] || "Shop"}</NavLink>
            {/* <NavLink to="/costcalculator">{content["nav.costcalculator"] || "Cost Calculator"}</NavLink> */}
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
                    {/* Only show Price Calculator to creators and admins */}
                    {isCreator && (
                      <DropdownMenuItem onClick={() => navigate("/calculator")}>
                        <Calculator className="mr-2 h-4 w-4" />
                        {content["nav.calculator"] || "Price Calculator"}
                      </DropdownMenuItem>
                    )}
                    {isAdmin && (
                      <>
                        <DropdownMenuSeparator />
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
