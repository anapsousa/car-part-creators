import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { ProductCard } from "@/components/ProductCard";
import { Input } from "@/components/ui/input";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Search } from "lucide-react";
import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";
import { useContent } from "@/hooks/useContent";

interface Product {
  id: string;
  name: string;
  description: string | null;
  price: number;
  images: string[];
  stock_quantity: number;
  category: string;
  base_price: number | null;
  discount_enabled: boolean | null;
  discount_percent: number | null;
}

export default function Shop() {
  const { content } = useContent("shop");
  const [products, setProducts] = useState<Product[]>([]);
  const [filteredProducts, setFilteredProducts] = useState<Product[]>([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("all");
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    fetchProducts();
  }, []);

  useEffect(() => {
    filterProducts();
  }, [searchQuery, selectedCategory, products]);

  const fetchProducts = async () => {
    setIsLoading(true);
    const { data, error } = await supabase
      .from("products")
      .select("id, name, description, price, images, stock_quantity, category, base_price, discount_enabled, discount_percent")
      .eq("is_active", true)
      .order("created_at", { ascending: false });

    if (error) {
      console.error("Error fetching products:", error);
    } else {
      setProducts(data || []);
    }
    setIsLoading(false);
  };

  const filterProducts = () => {
    let filtered = products;

    if (selectedCategory !== "all") {
      filtered = filtered.filter((p) => p.category === selectedCategory);
    }

    if (searchQuery) {
      filtered = filtered.filter(
        (p) =>
          p.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
          p.description?.toLowerCase().includes(searchQuery.toLowerCase())
      );
    }

    setFilteredProducts(filtered);
  };

  return (
    <div className="min-h-screen bg-gradient-mesh">
      <Header
        pageTitle={content["shop.title"] || "Shop"}
        pageSubtitle={content["shop.subtitle"] || "Browse Our Products"}
      />
      <main className="container mx-auto px-4 py-8">
        <div className="mb-8 text-center">
          <h2 className="text-3xl font-bold mb-2">
            {(() => {
              const title = content["shop.title"] || "Browse Our Products";
              const words = title.split(/\s+/);
              if (words.length >= 2) {
                return (
                  <>
                    {words.slice(0, -1).join(" ")}{" "}
                    <span className="bg-gradient-primary bg-clip-text text-transparent">
                      {words[words.length - 1]}
                    </span>
                  </>
                );
              }
              return title;
            })()}
          </h2>
          <p className="text-muted-foreground">
            {content["shop.subtitle"] || "Discover custom 3D printed car parts, home decor, and unique designs"}
          </p>
        </div>

        <div className="mb-6 flex flex-col md:flex-row gap-4">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder={content["shop.search"] || "Search products..."}
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10"
            />
          </div>
          <Tabs value={selectedCategory} onValueChange={setSelectedCategory}>
            <TabsList>
              <TabsTrigger value="all">{content["shop.categories.all"] || "All"}</TabsTrigger>
              <TabsTrigger value="car_parts">{content["shop.categories.car_parts"] || "Car Parts"}</TabsTrigger>
              <TabsTrigger value="home_decor">{content["shop.categories.decorations"] || "Home Decor"}</TabsTrigger>
              <TabsTrigger value="custom_designs">{content["shop.categories.custom"] || "Custom Designs"}</TabsTrigger>
            </TabsList>
          </Tabs>
        </div>

        {isLoading ? (
          <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-4 gap-6">
            {[...Array(8)].map((_, i) => (
              <div key={i} className="h-80 bg-muted animate-pulse rounded-lg" />
            ))}
          </div>
        ) : filteredProducts.length === 0 ? (
          <div className="text-center py-16">
            <p className="text-lg text-muted-foreground">{content["shop.noProducts"] || "No products found"}</p>
          </div>
        ) : (
          <>
            <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-4 gap-6">
              {filteredProducts.map((product) => (
                <ProductCard 
                  key={product.id} 
                  id={product.id}
                  name={product.name}
                  description={product.description || undefined}
                  price={product.price}
                  images={product.images}
                  stock_quantity={product.stock_quantity}
                  base_price={product.base_price}
                  discount_enabled={product.discount_enabled || false}
                  discount_percent={product.discount_percent}
                />
              ))}
            </div>
            <p className="text-xs text-muted-foreground text-center mt-6">
              * {content["shop.iva_disclosure"] || "Todos os preços incluem IVA à taxa legal em vigor (23%)."}
            </p>
          </>
        )}
      </main>

      <Footer />
    </div>
  );
}
