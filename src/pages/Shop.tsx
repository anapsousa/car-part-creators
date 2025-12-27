import { useState, useEffect, useCallback, useRef } from "react";
import { useSearchParams, useNavigate, useLocation } from "react-router-dom";
import { RefreshCw, AlertCircle, Package, Eye } from "lucide-react";
import { ProductCard } from "@/components/ProductCard";
import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";
import { Button } from "@/components/ui/button";
import { useContent } from "@/hooks/useContent";
import { useShopProducts } from "@/hooks/useShopProducts";
import { ShopPagination } from "@/components/shop/ShopPagination";
import { ShopFilters } from "@/components/shop/ShopFilters";
import { ProductQuickView } from "@/components/shop/ProductQuickView";
import {
  parseShopQuery,
  shopQueryToParams,
  ShopQuery,
  saveScrollPosition,
  restoreScrollPosition,
  calculatePagination,
  Product,
} from "@/lib/shopUtils";

export default function Shop() {
  const { content } = useContent("shop");
  const [searchParams, setSearchParams] = useSearchParams();
  const navigate = useNavigate();
  const location = useLocation();
  const resultsRef = useRef<HTMLDivElement>(null);
  const isRestoringScroll = useRef(false);
  
  // Quick view state
  const [quickViewProduct, setQuickViewProduct] = useState<Product | null>(null);
  const [isQuickViewOpen, setIsQuickViewOpen] = useState(false);
  
  // Parse query from URL
  const query = parseShopQuery(searchParams);
  
  // Fetch products with the current query
  const { data, isLoading, isError, error, refetch } = useShopProducts(query);
  
  // Handle scroll restoration on mount and when returning from product detail
  useEffect(() => {
    // Check if we're returning from a product page
    const navType = window.performance?.getEntriesByType?.("navigation")?.[0] as PerformanceNavigationTiming | undefined;
    const isBackNavigation = navType?.type === "back_forward" || 
      (location.state as { fromProduct?: boolean })?.fromProduct;
    
    if (isBackNavigation && !isRestoringScroll.current) {
      isRestoringScroll.current = true;
      // Wait for data to load before restoring scroll
      if (data) {
        requestAnimationFrame(() => {
          restoreScrollPosition(query);
          isRestoringScroll.current = false;
        });
      }
    }
  }, [data, query, location.state]);
  
  // Save scroll position before navigating away
  useEffect(() => {
    const handleBeforeUnload = () => {
      saveScrollPosition(query);
    };
    
    window.addEventListener("beforeunload", handleBeforeUnload);
    return () => window.removeEventListener("beforeunload", handleBeforeUnload);
  }, [query]);
  
  // Update URL with query changes
  const updateQuery = useCallback((updates: Partial<ShopQuery>) => {
    const newQuery = { ...query, ...updates };
    const params = shopQueryToParams(newQuery);
    
    // Save current scroll position before changing
    saveScrollPosition(query);
    
    setSearchParams(params, { replace: false });
    
    // Scroll to top of results when changing page/filters
    if (updates.page !== undefined || updates.search !== undefined || 
        updates.tags !== undefined || updates.sortKey !== undefined) {
      resultsRef.current?.scrollIntoView({ behavior: "smooth", block: "start" });
    }
  }, [query, setSearchParams]);
  
  const handlePageChange = useCallback((page: number) => {
    updateQuery({ page });
  }, [updateQuery]);
  
  const handleQuickView = useCallback((product: Product) => {
    setQuickViewProduct(product);
    setIsQuickViewOpen(true);
  }, []);
  
  const handleCloseQuickView = useCallback(() => {
    setIsQuickViewOpen(false);
    setQuickViewProduct(null);
  }, []);
  
  // Clamp page if it exceeds total pages after data loads
  useEffect(() => {
    if (data && data.page !== query.page) {
      const params = shopQueryToParams({ ...query, page: data.page });
      setSearchParams(params, { replace: true });
    }
  }, [data, query.page, setSearchParams]);
  
  const products = data?.products || [];
  const totalCount = data?.totalCount || 0;
  const pagination = calculatePagination(totalCount, query.page, query.pageSize);
  
  // Calculate max price for filter
  const maxProductPrice = 500; // Could be fetched dynamically
  
  return (
    <div className="min-h-screen bg-gradient-mesh">
      <Header
        pageTitle={content["shop.title"] || "Shop"}
        pageSubtitle={content["shop.subtitle"] || "Browse Our Products"}
      />
      
      <main className="container mx-auto px-4 py-8">
        {/* Page heading */}
        <div className="mb-8 text-center">
          <h1 className="text-3xl font-bold mb-2" id="shop-results-heading">
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
          </h1>
          <p className="text-muted-foreground">
            {content["shop.subtitle"] || "Discover custom 3D printed car parts, home decor, and unique designs"}
          </p>
        </div>
        
        {/* Filters and sorting */}
        <div className="mb-6">
          <ShopFilters
            query={query}
            onQueryChange={updateQuery}
            maxProductPrice={maxProductPrice}
            isLoading={isLoading}
          />
        </div>
        
        {/* Results section */}
        <div ref={resultsRef} tabIndex={-1} aria-labelledby="shop-results-heading">
          {/* Loading state */}
          {isLoading && (
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
              {[...Array(query.pageSize > 8 ? 8 : query.pageSize)].map((_, i) => (
                <div
                  key={i}
                  className="h-80 bg-muted animate-pulse rounded-lg"
                  aria-hidden
                />
              ))}
            </div>
          )}
          
          {/* Error state */}
          {isError && !isLoading && (
            <div className="text-center py-16">
              <AlertCircle className="h-12 w-12 text-destructive mx-auto mb-4" />
              <p className="text-lg text-muted-foreground mb-4">
                {error?.message || (content["shop.loadError"] || "Failed to load products")}
              </p>
              <Button onClick={() => refetch()} variant="outline">
                <RefreshCw className="h-4 w-4 mr-2" />
                {content["shop.tryAgain"] || "Try again"}
              </Button>
            </div>
          )}
          
          {/* Empty state */}
          {!isLoading && !isError && products.length === 0 && (
            <div className="text-center py-16">
              <Package className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
              <p className="text-lg text-muted-foreground mb-4">
                {content["shop.noProducts"] || "No products found"}
              </p>
              <Button
                onClick={() => updateQuery({
                  search: "",
                  tags: [],
                  minPrice: null,
                  maxPrice: null,
                  inStock: null,
                  page: 1,
                })}
                variant="outline"
              >
                {content["shop.clearFilters"] || "Clear filters"}
              </Button>
            </div>
          )}
          
          {/* Product grid */}
          {!isLoading && !isError && products.length > 0 && (
            <>
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
                {products.map((product) => (
                  <div
                    key={product.id}
                    className="relative group"
                  >
                    <div
                      onClick={() => {
                        // Save scroll position before navigating
                        saveScrollPosition(query);
                      }}
                    >
                      <ProductCard
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
                    </div>
                    
                    {/* Quick view button overlay */}
                    <Button
                      variant="secondary"
                      size="sm"
                      className="absolute bottom-20 left-1/2 -translate-x-1/2 opacity-0 group-hover:opacity-100 transition-opacity z-10"
                      onClick={(e) => {
                        e.stopPropagation();
                        handleQuickView(product);
                      }}
                    >
                      <Eye className="h-4 w-4 mr-2" />
                      {content["shop.quickView"] || "Quick View"}
                    </Button>
                  </div>
                ))}
              </div>
              
              {/* Pagination */}
              <ShopPagination
                currentPage={pagination.currentPage}
                totalCount={totalCount}
                pageSize={query.pageSize}
                onPageChange={handlePageChange}
                isLoading={isLoading}
              />
              
              {/* IVA disclosure */}
              <p className="text-xs text-muted-foreground text-center mt-6">
                * {content["shop.iva_disclosure"] || "Todos os preços incluem IVA à taxa legal em vigor (23%)."}
              </p>
            </>
          )}
        </div>
      </main>
      
      <Footer />
      
      {/* Quick View Modal */}
      <ProductQuickView
        product={quickViewProduct}
        isOpen={isQuickViewOpen}
        onClose={handleCloseQuickView}
      />
    </div>
  );
}
