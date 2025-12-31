// Shop utilities for query parsing, pagination math, and validation

export type SortKey = 'name' | 'price' | 'newest' | 'tags' | 'popularity';
export type SortDir = 'asc' | 'desc';

export interface ShopQuery {
  page: number;
  pageSize: number;
  sortKey: SortKey;
  sortDir: SortDir;
  search: string;
  tags: string[];
  minPrice: number | null;
  maxPrice: number | null;
  inStock: boolean | null;
}

export interface ShopQueryResult {
  products: Product[];
  totalCount: number;
  page: number;
  pageSize: number;
  sortKey: SortKey;
  sortDir: SortDir;
}

export interface Product {
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
  created_at: string;
  updated_at: string;
  material: string | null;
}

export const DEFAULT_SHOP_QUERY: ShopQuery = {
  page: 1,
  pageSize: 20,
  sortKey: 'newest',
  sortDir: 'desc',
  search: '',
  tags: [],
  minPrice: null,
  maxPrice: null,
  inStock: null,
};

export const PAGE_SIZE_OPTIONS = [10, 20, 50, 100] as const;

export const SORT_OPTIONS = [
  { key: 'popularity', dir: 'desc', label: 'Most Popular' },
  { key: 'name', dir: 'asc', label: 'Name (A–Z)' },
  { key: 'name', dir: 'desc', label: 'Name (Z–A)' },
  { key: 'price', dir: 'asc', label: 'Price (low → high)' },
  { key: 'price', dir: 'desc', label: 'Price (high → low)' },
  { key: 'newest', dir: 'desc', label: 'Newest first' },
  { key: 'newest', dir: 'asc', label: 'Oldest first' },
  { key: 'tags', dir: 'asc', label: 'Category (A–Z)' },
] as const;

/**
 * Parse URL search params into a validated ShopQuery object
 */
export function parseShopQuery(searchParams: URLSearchParams): ShopQuery {
  const page = Math.max(1, parseInt(searchParams.get('page') || '1', 10) || 1);
  
  let pageSize = parseInt(searchParams.get('pageSize') || '20', 10);
  if (!PAGE_SIZE_OPTIONS.includes(pageSize as typeof PAGE_SIZE_OPTIONS[number])) {
    pageSize = 20;
  }
  
  let sortKey = (searchParams.get('sort') || 'newest') as SortKey;
  if (!['name', 'price', 'newest', 'tags', 'popularity'].includes(sortKey)) {
    sortKey = 'newest';
  }
  
  let sortDir = (searchParams.get('dir') || 'desc') as SortDir;
  if (!['asc', 'desc'].includes(sortDir)) {
    sortDir = 'desc';
  }
  
  const search = searchParams.get('q') || '';
  
  const tagsParam = searchParams.get('tags');
  const tags = tagsParam ? tagsParam.split(',').filter(Boolean) : [];
  
  const minPriceParam = searchParams.get('minPrice');
  const minPrice = minPriceParam ? parseFloat(minPriceParam) : null;
  
  const maxPriceParam = searchParams.get('maxPrice');
  const maxPrice = maxPriceParam ? parseFloat(maxPriceParam) : null;
  
  const inStockParam = searchParams.get('inStock');
  const inStock = inStockParam === 'true' ? true : inStockParam === 'false' ? false : null;
  
  return {
    page,
    pageSize,
    sortKey,
    sortDir,
    search,
    tags,
    minPrice,
    maxPrice,
    inStock,
  };
}

/**
 * Convert ShopQuery to URL search params
 */
export function shopQueryToParams(query: Partial<ShopQuery>): URLSearchParams {
  const params = new URLSearchParams();
  
  if (query.page && query.page !== 1) {
    params.set('page', String(query.page));
  }
  if (query.pageSize && query.pageSize !== 20) {
    params.set('pageSize', String(query.pageSize));
  }
  if (query.sortKey && query.sortKey !== 'newest') {
    params.set('sort', query.sortKey);
  }
  if (query.sortDir && query.sortDir !== 'desc') {
    params.set('dir', query.sortDir);
  }
  if (query.search) {
    params.set('q', query.search);
  }
  if (query.tags && query.tags.length > 0) {
    params.set('tags', query.tags.join(','));
  }
  if (query.minPrice !== null && query.minPrice !== undefined) {
    params.set('minPrice', String(query.minPrice));
  }
  if (query.maxPrice !== null && query.maxPrice !== undefined) {
    params.set('maxPrice', String(query.maxPrice));
  }
  if (query.inStock !== null && query.inStock !== undefined) {
    params.set('inStock', String(query.inStock));
  }
  
  return params;
}

/**
 * Calculate pagination details
 */
export function calculatePagination(totalCount: number, page: number, pageSize: number) {
  const totalPages = Math.max(1, Math.ceil(totalCount / pageSize));
  const clampedPage = Math.min(Math.max(1, page), totalPages);
  const startIndex = (clampedPage - 1) * pageSize;
  const endIndex = Math.min(startIndex + pageSize - 1, totalCount - 1);
  const displayStart = totalCount === 0 ? 0 : startIndex + 1;
  const displayEnd = totalCount === 0 ? 0 : endIndex + 1;
  
  return {
    totalPages,
    currentPage: clampedPage,
    startIndex,
    endIndex,
    displayStart,
    displayEnd,
    hasNextPage: clampedPage < totalPages,
    hasPrevPage: clampedPage > 1,
  };
}

/**
 * Generate page numbers for pagination with ellipses
 * Returns array of numbers and 'ellipsis' markers
 */
export function generatePageNumbers(
  currentPage: number,
  totalPages: number,
  siblingsCount = 2
): (number | 'ellipsis')[] {
  if (totalPages <= 7) {
    return Array.from({ length: totalPages }, (_, i) => i + 1);
  }
  
  const pages: (number | 'ellipsis')[] = [];
  
  // Always show first page
  pages.push(1);
  
  // Calculate range around current page
  const leftSibling = Math.max(2, currentPage - siblingsCount);
  const rightSibling = Math.min(totalPages - 1, currentPage + siblingsCount);
  
  // Add left ellipsis if needed
  if (leftSibling > 2) {
    pages.push('ellipsis');
  } else if (leftSibling === 2) {
    pages.push(2);
  }
  
  // Add pages around current
  for (let i = leftSibling; i <= rightSibling; i++) {
    if (i !== 1 && i !== totalPages) {
      pages.push(i);
    }
  }
  
  // Add right ellipsis if needed
  if (rightSibling < totalPages - 1) {
    pages.push('ellipsis');
  } else if (rightSibling === totalPages - 1) {
    pages.push(totalPages - 1);
  }
  
  // Always show last page
  if (totalPages > 1) {
    pages.push(totalPages);
  }
  
  return pages;
}

/**
 * Map sortKey to Supabase column name
 */
export function getSortColumn(sortKey: SortKey): string {
  switch (sortKey) {
    case 'name':
      return 'name';
    case 'price':
      return 'price';
    case 'newest':
      return 'created_at';
    case 'tags':
      return 'category';
    case 'popularity':
      return 'view_count';
    default:
      return 'created_at';
  }
}

/**
 * Session storage key for scroll position
 */
export function getScrollStorageKey(query: ShopQuery): string {
  const params = shopQueryToParams(query);
  return `shopScroll:${params.toString()}`;
}

/**
 * Save scroll position to session storage
 */
export function saveScrollPosition(query: ShopQuery): void {
  const key = getScrollStorageKey(query);
  sessionStorage.setItem(key, String(window.scrollY));
}

/**
 * Restore scroll position from session storage
 */
export function restoreScrollPosition(query: ShopQuery): void {
  const key = getScrollStorageKey(query);
  const savedPosition = sessionStorage.getItem(key);
  
  if (savedPosition) {
    const scrollY = parseInt(savedPosition, 10);
    // Use requestAnimationFrame to ensure DOM is ready
    requestAnimationFrame(() => {
      window.scrollTo(0, scrollY);
    });
  }
}
