import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { ProductCard } from "@/components/ProductCard";
import { Button } from "@/components/ui/button";
import { TrendingUp, ArrowRight } from "lucide-react";
import { useTranslation } from "react-i18next";

interface ProductColor {
  name: string;
  hex: string;
}

interface Product {
  id: string;
  name: string;
  price: number;
  images: string[];
  category: string;
  stock_quantity: number;
  base_price: number | null;
  discount_enabled: boolean | null;
  discount_percent: number | null;
  sales_count: number;
  colors?: ProductColor[];
}

interface ProductTag {
  id: string;
  slug: string;
  name_en: string;
  name_pt: string;
}

interface BestSellersProps {
  title?: string;
  subtitle?: string;
  limit?: number;
}

export function BestSellers({ 
  title, 
  subtitle, 
  limit = 4 
}: BestSellersProps) {
  const navigate = useNavigate();
  const { t, i18n } = useTranslation();
  const [products, setProducts] = useState<Product[]>([]);
  const [productTags, setProductTags] = useState<Record<string, ProductTag[]>>({});
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    fetchBestSellers();
  }, [limit]);

  const fetchBestSellers = async () => {
    setIsLoading(true);
    
    // Fetch top selling products
    const { data, error } = await supabase
      .from("products")
      .select("*")
      .eq("is_active", true)
      .gt("sales_count", 0)
      .order("sales_count", { ascending: false })
      .limit(limit);

    if (error) {
      console.error("Error fetching best sellers:", error);
      setIsLoading(false);
      return;
    }

    if (data && data.length > 0) {
      // Parse colors from JSONB
      const productsWithColors = data.map(p => ({
        ...p,
        colors: Array.isArray(p.colors) ? (p.colors as unknown as ProductColor[]) : []
      }));
      setProducts(productsWithColors);
      
      // Fetch tags for all products
      const productIds = data.map(p => p.id);
      const { data: tagsData } = await supabase
        .from("product_tags")
        .select("product_id, tag_id, tags(id, slug, name_en, name_pt)")
        .in("product_id", productIds);

      if (tagsData) {
        const tagsByProduct: Record<string, ProductTag[]> = {};
        tagsData.forEach((pt: any) => {
          if (pt.tags) {
            if (!tagsByProduct[pt.product_id]) {
              tagsByProduct[pt.product_id] = [];
            }
            tagsByProduct[pt.product_id].push(pt.tags);
          }
        });
        setProductTags(tagsByProduct);
      }
    }
    
    setIsLoading(false);
  };

  if (isLoading) {
    return (
      <section className="py-16 bg-gradient-to-br from-accent/5 via-background to-primary/5">
        <div className="container mx-auto px-4">
          <div className="animate-pulse">
            <div className="h-8 bg-muted rounded w-48 mx-auto mb-4" />
            <div className="h-4 bg-muted rounded w-64 mx-auto mb-8" />
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              {[...Array(limit)].map((_, i) => (
                <div key={i} className="aspect-square bg-muted rounded-lg" />
              ))}
            </div>
          </div>
        </div>
      </section>
    );
  }

  if (products.length === 0) {
    return null;
  }

  const isPT = i18n.language?.startsWith("pt");

  return (
    <section className="py-16 bg-gradient-to-br from-accent/5 via-background to-primary/5">
      <div className="container mx-auto px-4">
        <div className="flex items-center justify-between mb-8">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-primary/10 rounded-lg">
              <TrendingUp className="h-6 w-6 text-primary" />
            </div>
            <div>
              <h2 className="text-2xl lg:text-3xl font-bold">
                {title || (isPT ? "Mais Vendidos" : "Best Sellers")}
              </h2>
              {subtitle && (
                <p className="text-muted-foreground text-sm mt-1">{subtitle}</p>
              )}
            </div>
          </div>
          <Button 
            variant="ghost" 
            onClick={() => navigate("/shop?sort=popularity")}
            className="hidden md:flex items-center gap-2"
          >
            {isPT ? "Ver Todos" : "View All"}
            <ArrowRight className="h-4 w-4" />
          </Button>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 lg:gap-6">
          {products.map((product) => (
            <ProductCard
              key={product.id}
              id={product.id}
              name={product.name}
              price={product.price}
              images={product.images || []}
              stock_quantity={product.stock_quantity}
              base_price={product.base_price}
              discount_enabled={product.discount_enabled}
              discount_percent={product.discount_percent}
              tags={productTags[product.id] || []}
            />
          ))}
        </div>

        <div className="mt-6 text-center md:hidden">
          <Button 
            variant="outline" 
            onClick={() => navigate("/shop?sort=popularity")}
            className="w-full"
          >
            {isPT ? "Ver Todos os Mais Vendidos" : "View All Best Sellers"}
            <ArrowRight className="ml-2 h-4 w-4" />
          </Button>
        </div>
      </div>
    </section>
  );
}
