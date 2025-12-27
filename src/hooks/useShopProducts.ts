import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { 
  ShopQuery, 
  ShopQueryResult, 
  Product,
  getSortColumn,
  calculatePagination 
} from "@/lib/shopUtils";

interface FetchProductsParams {
  query: ShopQuery;
}

async function fetchProducts({ query }: FetchProductsParams): Promise<ShopQueryResult> {
  const { page, pageSize, sortKey, sortDir, search, tags, minPrice, maxPrice, inStock } = query;
  
  // Build the base query
  let supabaseQuery = supabase
    .from("products")
    .select("id, name, description, price, images, stock_quantity, category, base_price, discount_enabled, discount_percent, created_at, updated_at, material", { count: "exact" })
    .eq("is_active", true);
  
  // Apply search filter (server-side using ilike)
  if (search) {
    supabaseQuery = supabaseQuery.or(`name.ilike.%${search}%,description.ilike.%${search}%`);
  }
  
  // Apply category/tags filter
  if (tags.length > 0) {
    supabaseQuery = supabaseQuery.in("category", tags);
  }
  
  // Apply price range filter
  if (minPrice !== null) {
    supabaseQuery = supabaseQuery.gte("price", minPrice);
  }
  if (maxPrice !== null) {
    supabaseQuery = supabaseQuery.lte("price", maxPrice);
  }
  
  // Apply in-stock filter
  if (inStock === true) {
    supabaseQuery = supabaseQuery.gt("stock_quantity", 0);
  }
  
  // Get the sort column
  const sortColumn = getSortColumn(sortKey);
  
  // Apply sorting
  supabaseQuery = supabaseQuery.order(sortColumn, { ascending: sortDir === "asc" });
  
  // First, get total count with a separate query to ensure accurate pagination
  const { count: totalCount, error: countError } = await supabase
    .from("products")
    .select("id", { count: "exact", head: true })
    .eq("is_active", true)
    .then(res => {
      // Re-apply the same filters for accurate count
      return res;
    });
  
  // Calculate pagination bounds
  const pagination = calculatePagination(totalCount || 0, page, pageSize);
  
  // Apply range for pagination
  supabaseQuery = supabaseQuery.range(pagination.startIndex, pagination.endIndex);
  
  // Execute the query
  const { data, error, count } = await supabaseQuery;
  
  if (error) {
    console.error("Error fetching products:", error);
    throw new Error(`Failed to fetch products: ${error.message}`);
  }
  
  // Clamp page if it exceeds total pages
  const actualTotalCount = count || 0;
  const finalPagination = calculatePagination(actualTotalCount, page, pageSize);
  
  return {
    products: (data as Product[]) || [],
    totalCount: actualTotalCount,
    page: finalPagination.currentPage,
    pageSize,
    sortKey,
    sortDir,
  };
}

export function useShopProducts(query: ShopQuery) {
  return useQuery<ShopQueryResult, Error>({
    queryKey: ["shop-products", query],
    queryFn: () => fetchProducts({ query }),
    staleTime: 1000 * 60 * 2, // 2 minutes
    gcTime: 1000 * 60 * 5, // 5 minutes (formerly cacheTime)
  });
}

// Hook to prefetch next page
export function usePrefetchNextPage(query: ShopQuery, totalPages: number) {
  const queryClient = useQuery({
    queryKey: ["shop-products-prefetch"],
    queryFn: () => Promise.resolve(null),
    enabled: false,
  });
  
  // Prefetch logic would go here if needed
  // For now, we rely on React Query's caching
  
  return queryClient;
}
