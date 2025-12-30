import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { 
  ShopQuery, 
  ShopQueryResult, 
  Product,
  getSortColumn,
  calculatePagination 
} from "@/lib/shopUtils";

// Extended product with tags
export interface ProductWithTags extends Product {
  tags?: Array<{ id: string; slug: string; name_en: string; name_pt: string }>;
}

export interface ShopQueryResultWithTags extends Omit<ShopQueryResult, 'products'> {
  products: ProductWithTags[];
}

interface FetchProductsParams {
  query: ShopQuery;
}

async function fetchProducts({ query }: FetchProductsParams): Promise<ShopQueryResultWithTags> {
  const { page, pageSize, sortKey, sortDir, search, tags, minPrice, maxPrice, inStock } = query;
  
  // If filtering by tags, first get the product IDs that match any of the selected tags
  let productIdsWithTags: string[] | null = null;
  
  if (tags.length > 0) {
    // Get tag IDs from slugs
    const { data: tagData, error: tagError } = await supabase
      .from("tags")
      .select("id")
      .in("slug", tags);
    
    if (tagError) {
      console.error("Error fetching tag IDs:", tagError);
      throw new Error(`Failed to fetch tags: ${tagError.message}`);
    }
    
    if (tagData && tagData.length > 0) {
      const tagIds = tagData.map(t => t.id);
      
      // Get product IDs that have any of these tags
      const { data: productTagData, error: productTagError } = await supabase
        .from("product_tags")
        .select("product_id")
        .in("tag_id", tagIds);
      
      if (productTagError) {
        console.error("Error fetching product tags:", productTagError);
        throw new Error(`Failed to fetch product tags: ${productTagError.message}`);
      }
      
      // Get unique product IDs
      productIdsWithTags = [...new Set(productTagData?.map(pt => pt.product_id) || [])];
      
      // If no products match the tags, return empty result
      if (productIdsWithTags.length === 0) {
        return {
          products: [],
          totalCount: 0,
          page: 1,
          pageSize,
          sortKey,
          sortDir,
        };
      }
    } else {
      // No matching tags found, return empty
      return {
        products: [],
        totalCount: 0,
        page: 1,
        pageSize,
        sortKey,
        sortDir,
      };
    }
  }
  
  // Build the base query
  let supabaseQuery = supabase
    .from("products")
    .select("id, name, description, price, images, stock_quantity, category, base_price, discount_enabled, discount_percent, created_at, updated_at, material", { count: "exact" })
    .eq("is_active", true);
  
  // Apply tag filter (by product IDs)
  if (productIdsWithTags !== null) {
    supabaseQuery = supabaseQuery.in("id", productIdsWithTags);
  }
  
  // Apply search filter (server-side using ilike)
  if (search) {
    supabaseQuery = supabaseQuery.or(`name.ilike.%${search}%,description.ilike.%${search}%`);
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
  
  // First, get total count for pagination
  let countQuery = supabase
    .from("products")
    .select("id", { count: "exact", head: true })
    .eq("is_active", true);
  
  if (productIdsWithTags !== null) {
    countQuery = countQuery.in("id", productIdsWithTags);
  }
  if (search) {
    countQuery = countQuery.or(`name.ilike.%${search}%,description.ilike.%${search}%`);
  }
  if (minPrice !== null) {
    countQuery = countQuery.gte("price", minPrice);
  }
  if (maxPrice !== null) {
    countQuery = countQuery.lte("price", maxPrice);
  }
  if (inStock === true) {
    countQuery = countQuery.gt("stock_quantity", 0);
  }
  
  const { count: totalCount } = await countQuery;
  
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
  
  // Fetch tags for all products in the result
  const productIds = data?.map(p => p.id) || [];
  let productsWithTags: ProductWithTags[] = (data as Product[]) || [];
  
  if (productIds.length > 0) {
    const { data: productTagsData } = await supabase
      .from("product_tags")
      .select(`
        product_id,
        tags:tag_id (id, slug, name_en, name_pt)
      `)
      .in("product_id", productIds);
    
    if (productTagsData) {
      // Group tags by product_id
      const tagsByProduct = productTagsData.reduce((acc, pt) => {
        if (!acc[pt.product_id]) {
          acc[pt.product_id] = [];
        }
        if (pt.tags) {
          acc[pt.product_id].push(pt.tags as { id: string; slug: string; name_en: string; name_pt: string });
        }
        return acc;
      }, {} as Record<string, Array<{ id: string; slug: string; name_en: string; name_pt: string }>>);
      
      // Attach tags to products
      productsWithTags = productsWithTags.map(product => ({
        ...product,
        tags: tagsByProduct[product.id] || [],
      }));
    }
  }
  
  // Clamp page if it exceeds total pages
  const actualTotalCount = count || 0;
  const finalPagination = calculatePagination(actualTotalCount, page, pageSize);
  
  return {
    products: productsWithTags,
    totalCount: actualTotalCount,
    page: finalPagination.currentPage,
    pageSize,
    sortKey,
    sortDir,
  };
}

export function useShopProducts(query: ShopQuery) {
  return useQuery<ShopQueryResultWithTags, Error>({
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
