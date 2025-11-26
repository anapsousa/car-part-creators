import { useState, useEffect } from "react";
import { useWishlist } from "@/contexts/WishlistContext";
import { supabase } from "@/integrations/supabase/client";
import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";
import { Card, CardContent, CardFooter } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { ShoppingCart, Trash2, Heart } from "lucide-react";
import { useCart } from "@/contexts/CartContext";
import { useNavigate } from "react-router-dom";
import { Badge } from "@/components/ui/badge";
import { useContent } from "@/hooks/useContent";

interface WishlistProduct {
  id: string;
  name: string;
  price: number;
  images: string[];
  stock_quantity: number;
}

interface WishlistDesign {
  id: string;
  prompt_text: string;
  status: string;
  stl_file_url: string | null;
  created_at: string;
}

export default function Wishlist() {
  const { content } = useContent("wishlist");
  const { wishlistItems, removeFromWishlist, isLoading } = useWishlist();
  const { addToCart } = useCart();
  const navigate = useNavigate();
  const [products, setProducts] = useState<WishlistProduct[]>([]);
  const [designs, setDesigns] = useState<WishlistDesign[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchWishlistDetails();
  }, [wishlistItems]);

  const fetchWishlistDetails = async () => {
    try {
      setLoading(true);

      // Fetch products
      const productIds = wishlistItems
        .filter(item => item.product_id)
        .map(item => item.product_id);

      if (productIds.length > 0) {
        const { data: productsData } = await supabase
          .from("products")
          .select("*")
          .in("id", productIds);
        setProducts(productsData || []);
      } else {
        setProducts([]);
      }

      // Fetch designs
      const designIds = wishlistItems
        .filter(item => item.design_id)
        .map(item => item.design_id);

      if (designIds.length > 0) {
        const { data: designsData } = await supabase
          .from("designs")
          .select("*")
          .in("id", designIds);
        setDesigns(designsData || []);
      } else {
        setDesigns([]);
      }
    } catch (error) {
      console.error("Error fetching wishlist details:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleAddToCart = async (productId: string) => {
    await addToCart(productId, 1);
  };

  return (
    <div className="min-h-screen bg-gradient-mesh">
      <Header pageTitle={content["wishlist.title"] || "Wishlist"} pageSubtitle={content["wishlist.subtitle"] || "Your Saved Items"} />

      <main className="container mx-auto px-4 py-8">
        <div className="max-w-6xl mx-auto">
          <div className="flex items-center gap-3 mb-8">
            <Heart className="h-8 w-8 text-primary fill-primary" />
            <h1 className="text-3xl font-bold">
              {(() => {
                const title = content["wishlist.heading"] || "My Wishlist";
                const parts = title.split(/\s+/);
                if (parts.length >= 2) {
                  return (
                    <>
                      {parts[0]}{" "}
                      <span className="bg-gradient-primary bg-clip-text text-transparent">
                        {parts.slice(1).join(" ")}
                      </span>
                    </>
                  );
                }
                return title;
              })()}
            </h1>
          </div>

          <Tabs defaultValue="products" className="space-y-6">
            <TabsList className="grid w-full max-w-md grid-cols-2">
              <TabsTrigger value="products">
                {content["wishlist.tabs.products"] || "Products"} ({products.length})
              </TabsTrigger>
              <TabsTrigger value="designs">
                {content["wishlist.tabs.designs"] || "Designs"} ({designs.length})
              </TabsTrigger>
            </TabsList>

            <TabsContent value="products" className="space-y-4">
              {loading ? (
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  {[...Array(3)].map((_, i) => (
                    <div key={i} className="h-80 bg-muted animate-pulse rounded-lg" />
                  ))}
                </div>
              ) : products.length === 0 ? (
                <Card className="p-12 text-center bg-gradient-to-br from-card via-card to-primary/5">
                  <Heart className="h-16 w-16 mx-auto text-muted-foreground mb-4" />
                  <p className="text-lg text-muted-foreground mb-4">
                    {content["wishlist.products.empty"] || "No products in your wishlist yet"}
                  </p>
                  <Button variant="gradient" onClick={() => navigate("/shop")}>
                    {content["wishlist.products.browse"] || "Browse Products"}
                  </Button>
                </Card>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  {products.map((product) => (
                    <Card
                      key={product.id}
                      className="overflow-hidden hover:shadow-glow transition-all duration-300 hover:scale-105 cursor-pointer bg-gradient-to-br from-card via-card to-primary/5 border-2"
                      onClick={() => navigate(`/product/${product.id}`)}
                    >
                      <div className="aspect-square overflow-hidden bg-muted">
                        <img
                          src={product.images?.[0] || '/placeholder.svg'}
                          alt={product.name}
                          className="w-full h-full object-cover hover:scale-110 transition-transform duration-300"
                        />
                      </div>
                      <CardContent className="p-4">
                        <h3 className="font-semibold text-lg line-clamp-1">{product.name}</h3>
                        <p className="text-xl font-bold bg-gradient-primary bg-clip-text text-transparent mt-2">
                          €{product.price.toFixed(2)}
                        </p>
                        {product.stock_quantity === 0 && (
                          <Badge variant="destructive" className="mt-2">{content["wishlist.out_of_stock"] || "Out of stock"}</Badge>
                        )}
                      </CardContent>
                      <CardFooter className="p-4 pt-0 flex gap-2">
                        <Button
                          variant="gradient"
                          className="flex-1"
                          onClick={(e) => {
                            e.stopPropagation();
                            handleAddToCart(product.id);
                          }}
                          disabled={product.stock_quantity === 0}
                        >
                          <ShoppingCart className="mr-2 h-4 w-4" />
                          {content["wishlist.add_to_cart"] || "Add to Cart"}
                        </Button>
                        <Button
                          variant="outline"
                          size="icon"
                          onClick={(e) => {
                            e.stopPropagation();
                            removeFromWishlist(product.id);
                          }}
                          disabled={isLoading}
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </CardFooter>
                    </Card>
                  ))}
                </div>
              )}
            </TabsContent>

            <TabsContent value="designs" className="space-y-4">
              {loading ? (
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  {[...Array(3)].map((_, i) => (
                    <div key={i} className="h-64 bg-muted animate-pulse rounded-lg" />
                  ))}
                </div>
              ) : designs.length === 0 ? (
                <Card className="p-12 text-center bg-gradient-to-br from-card via-card to-primary/5">
                  <Heart className="h-16 w-16 mx-auto text-muted-foreground mb-4" />
                  <p className="text-lg text-muted-foreground mb-4">
                    {content["wishlist.designs.empty"] || "No designs in your wishlist yet"}
                  </p>
                  <Button variant="gradient" onClick={() => navigate("/generator")}>
                    {content["wishlist.designs.generate"] || "Generate Designs"}
                  </Button>
                </Card>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  {designs.map((design) => (
                    <Card
                      key={design.id}
                      className="overflow-hidden hover:shadow-glow transition-all duration-300 hover:scale-105 bg-gradient-to-br from-card via-card to-secondary/5 border-2"
                    >
                      <CardContent className="p-4">
                        <div className="flex items-start justify-between mb-2">
                          <Badge variant={design.status === 'completed' ? 'success' : 'warning'}>
                            {design.status}
                          </Badge>
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => removeFromWishlist(undefined, design.id)}
                            disabled={isLoading}
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>
                        <p className="text-sm line-clamp-3 mb-2">{design.prompt_text}</p>
                        <p className="text-xs text-muted-foreground">
                          {content["wishlist.created"] || "Created"}: {new Date(design.created_at).toLocaleDateString()}
                        </p>
                      </CardContent>
                      {design.stl_file_url && (
                        <CardFooter className="p-4 pt-0">
                          <Button
                            variant="secondary"
                            className="w-full"
                            onClick={() => window.open(design.stl_file_url!, '_blank')}
                          >
                            {content["wishlist.download_stl"] || "Download STL"}
                          </Button>
                        </CardFooter>
                      )}
                    </Card>
                  ))}
                </div>
              )}
            </TabsContent>
          </Tabs>
        </div>
      </main>

      <Footer />
    </div>
  );
}
