import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { useCart } from "@/contexts/CartContext";
import { useWishlist } from "@/contexts/WishlistContext";
import { ArrowLeft, ShoppingCart, Minus, Plus, Heart } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Footer } from "@/components/Footer";
import { Model3DViewer } from "@/components/Model3DViewer";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

interface Product {
  id: string;
  name: string;
  description: string | null;
  price: number;
  images: string[];
  stock_quantity: number;
  category: string;
  width: number | null;
  height: number | null;
  depth: number | null;
  material: string | null;
}

export default function ProductDetail() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { addToCart, isLoading: cartLoading } = useCart();
  const { addToWishlist, removeFromWishlist, isInWishlist } = useWishlist();
  const [product, setProduct] = useState<Product | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [quantity, setQuantity] = useState(1);
  const [selectedImageIndex, setSelectedImageIndex] = useState(0);
  
  const inWishlist = product ? isInWishlist(product.id) : false;

  useEffect(() => {
    if (id) fetchProduct();
  }, [id]);

  const fetchProduct = async () => {
    setIsLoading(true);
    const { data, error } = await supabase
      .from("products")
      .select("*")
      .eq("id", id)
      .eq("is_active", true)
      .single();

    if (error) {
      console.error("Error fetching product:", error);
    } else {
      setProduct(data);
    }
    setIsLoading(false);
  };

  const handleAddToCart = async () => {
    if (product) {
      await addToCart(product.id, quantity);
    }
  };

  const handleToggleWishlist = async () => {
    if (product) {
      if (inWishlist) {
        await removeFromWishlist(product.id);
      } else {
        await addToWishlist(product.id);
      }
    }
  };

  const categoryLabels: Record<string, string> = {
    car_parts: "Car Parts",
    home_decor: "Home Decor",
    custom_designs: "Custom Designs",
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto"></div>
          <p className="mt-4 text-muted-foreground">Loading product...</p>
        </div>
      </div>
    );
  }

  if (!product) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <p className="text-xl text-muted-foreground">Product not found</p>
          <Button onClick={() => navigate("/shop")} className="mt-4">
            Back to Shop
          </Button>
        </div>
      </div>
    );
  }

  const mainImage = product.images && product.images.length > 0 
    ? product.images[selectedImageIndex] 
    : '/placeholder.svg';

  return (
    <div className="min-h-screen bg-background">
      <header className="border-b bg-card">
        <div className="container mx-auto px-4 py-4">
          <Button variant="ghost" onClick={() => navigate("/shop")}>
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back to Shop
          </Button>
        </div>
      </header>

      <main className="container mx-auto px-4 py-8">
        <div className="grid md:grid-cols-2 gap-8">
          <div className="space-y-4">
            <Tabs defaultValue="images" className="w-full">
              <TabsList className="grid w-full grid-cols-2">
                <TabsTrigger value="images">Images</TabsTrigger>
                <TabsTrigger value="3d-view">3D View</TabsTrigger>
              </TabsList>
              
              <TabsContent value="images" className="mt-4">
                <div className="aspect-square bg-muted rounded-lg overflow-hidden mb-4">
                  <img
                    src={mainImage}
                    alt={product.name}
                    className="w-full h-full object-cover"
                  />
                </div>
                {product.images && product.images.length > 1 && (
                  <div className="grid grid-cols-4 gap-2">
                    {product.images.map((img, idx) => (
                      <div
                        key={idx}
                        className={`aspect-square bg-muted rounded cursor-pointer overflow-hidden ${
                          selectedImageIndex === idx ? "ring-2 ring-primary" : ""
                        }`}
                        onClick={() => setSelectedImageIndex(idx)}
                      >
                        <img src={img} alt={`${product.name} ${idx + 1}`} className="w-full h-full object-cover" />
                      </div>
                    ))}
                  </div>
                )}
              </TabsContent>
              
              <TabsContent value="3d-view" className="mt-4">
                <Model3DViewer modelUrl={undefined} />
                <p className="text-xs text-muted-foreground text-center mt-2">
                  Interactive 3D preview - Product visualization coming soon
                </p>
              </TabsContent>
            </Tabs>
          </div>

          <div>
            <div className="flex items-center justify-between mb-2">
              <Badge className="mb-2">{categoryLabels[product.category]}</Badge>
              <Button
                variant="ghost"
                size="icon"
                onClick={handleToggleWishlist}
                className="hover:scale-110 transition-transform"
              >
                <Heart className={`h-5 w-5 ${inWishlist ? 'fill-primary text-primary' : ''}`} />
              </Button>
            </div>
            <h1 className="text-4xl font-bold mb-4">{product.name}</h1>
            <p className="text-3xl font-bold text-primary mb-6">€{product.price.toFixed(2)}</p>

            {product.description && (
              <div className="mb-6">
                <h2 className="text-lg font-semibold mb-2">Description</h2>
                <p className="text-muted-foreground">{product.description}</p>
              </div>
            )}

            {(product.width || product.height || product.depth || product.material) && (
              <div className="mb-6 space-y-2">
                <h2 className="text-lg font-semibold">Specifications</h2>
                {product.material && (
                  <p className="text-sm text-muted-foreground">Material: {product.material}</p>
                )}
                {(product.width || product.height || product.depth) && (
                  <p className="text-sm text-muted-foreground">
                    Dimensions: {product.width}cm × {product.height}cm × {product.depth}cm
                  </p>
                )}
              </div>
            )}

            <div className="mb-6">
              <p className="text-sm mb-2">
                <span className={product.stock_quantity > 0 ? "text-green-600" : "text-destructive"}>
                  {product.stock_quantity > 0 ? `In Stock (${product.stock_quantity} available)` : "Out of Stock"}
                </span>
              </p>

              <div className="flex items-center gap-4 mb-4">
                <label className="text-sm font-medium">Quantity:</label>
                <div className="flex items-center gap-2">
                  <Button
                    variant="outline"
                    size="icon"
                    onClick={() => setQuantity(Math.max(1, quantity - 1))}
                    disabled={quantity <= 1}
                  >
                    <Minus className="h-4 w-4" />
                  </Button>
                  <span className="w-12 text-center font-semibold">{quantity}</span>
                  <Button
                    variant="outline"
                    size="icon"
                    onClick={() => setQuantity(Math.min(product.stock_quantity, quantity + 1))}
                    disabled={quantity >= product.stock_quantity}
                  >
                    <Plus className="h-4 w-4" />
                  </Button>
                </div>
              </div>

              <Button
                variant="gradient"
                size="lg"
                className="w-full"
                onClick={handleAddToCart}
                disabled={product.stock_quantity === 0 || cartLoading}
              >
                <ShoppingCart className="mr-2 h-5 w-5" />
                {product.stock_quantity === 0 ? "Out of Stock" : "Add to Cart"}
              </Button>
            </div>
          </div>
        </div>
      </main>
      <Footer />
    </div>
  );
}
