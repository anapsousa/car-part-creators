import { useState, useCallback, useEffect } from "react";
import { Search, X, SlidersHorizontal, ChevronDown, ChevronUp } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Slider } from "@/components/ui/slider";
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible";
import { Badge } from "@/components/ui/badge";
import {
  ShopQuery,
  SortKey,
  SortDir,
  PAGE_SIZE_OPTIONS,
} from "@/lib/shopUtils";
import { useContent } from "@/hooks/useContent";
import { cn } from "@/lib/utils";
import { TagFilter } from "./TagFilter";

interface ShopFiltersProps {
  query: ShopQuery;
  onQueryChange: (updates: Partial<ShopQuery>) => void;
  availableCategories?: string[];
  maxProductPrice?: number;
  isLoading?: boolean;
}

export function ShopFilters({
  query,
  onQueryChange,
  availableCategories = ["car_parts", "home_decor", "custom_designs"],
  maxProductPrice = 500,
  isLoading = false,
}: ShopFiltersProps) {
  const { content } = useContent("shop");
  const [searchInput, setSearchInput] = useState(query.search);
  const [priceRange, setPriceRange] = useState<[number, number]>([
    query.minPrice ?? 0,
    query.maxPrice ?? maxProductPrice,
  ]);
  const [showAdvancedFilters, setShowAdvancedFilters] = useState(false);
  
  // Sync search input with query
  useEffect(() => {
    setSearchInput(query.search);
  }, [query.search]);
  
  // Sync price range with query
  useEffect(() => {
    setPriceRange([
      query.minPrice ?? 0,
      query.maxPrice ?? maxProductPrice,
    ]);
  }, [query.minPrice, query.maxPrice, maxProductPrice]);
  
  // Debounced search
  useEffect(() => {
    const timer = setTimeout(() => {
      if (searchInput !== query.search) {
        onQueryChange({ search: searchInput, page: 1 });
      }
    }, 300);
    
    return () => clearTimeout(timer);
  }, [searchInput, query.search, onQueryChange]);
  
  const handleSortChange = useCallback((value: string) => {
    const [sortKey, sortDir] = value.split("-") as [SortKey, SortDir];
    onQueryChange({ sortKey, sortDir, page: 1 });
  }, [onQueryChange]);
  
  const handlePageSizeChange = useCallback((value: string) => {
    const pageSize = parseInt(value, 10);
    onQueryChange({ pageSize, page: 1 });
  }, [onQueryChange]);
  
  const handlePriceRangeChange = useCallback((values: number[]) => {
    setPriceRange([values[0], values[1]]);
  }, []);
  
  const handlePriceRangeCommit = useCallback((values: number[]) => {
    const minPrice = values[0] === 0 ? null : values[0];
    const maxPrice = values[1] === maxProductPrice ? null : values[1];
    onQueryChange({ minPrice, maxPrice, page: 1 });
  }, [maxProductPrice, onQueryChange]);
  
  const handleInStockChange = useCallback((checked: boolean) => {
    onQueryChange({ inStock: checked ? true : null, page: 1 });
  }, [onQueryChange]);
  
  const handleClearFilters = useCallback(() => {
    setSearchInput("");
    setPriceRange([0, maxProductPrice]);
    onQueryChange({
      search: "",
      tags: [],
      minPrice: null,
      maxPrice: null,
      inStock: null,
      page: 1,
    });
  }, [maxProductPrice, onQueryChange]);
  
  const currentSortValue = `${query.sortKey}-${query.sortDir}`;
  
  const hasActiveFilters = query.search || query.tags.length > 0 || 
    query.minPrice !== null || query.maxPrice !== null || query.inStock !== null;
  
  // Localized sort options
  const localizedSortOptions = [
    { key: 'name', dir: 'asc', label: content["shop.sort.nameAsc"] || 'Name (A–Z)' },
    { key: 'name', dir: 'desc', label: content["shop.sort.nameDesc"] || 'Name (Z–A)' },
    { key: 'price', dir: 'asc', label: content["shop.sort.priceLow"] || 'Price (low → high)' },
    { key: 'price', dir: 'desc', label: content["shop.sort.priceHigh"] || 'Price (high → low)' },
    { key: 'newest', dir: 'desc', label: content["shop.sort.newest"] || 'Newest first' },
    { key: 'newest', dir: 'asc', label: content["shop.sort.oldest"] || 'Oldest first' },
    { key: 'tags', dir: 'asc', label: content["shop.sort.category"] || 'Category (A–Z)' },
  ];
  
  return (
    <div className="space-y-4">
      {/* Top row: Search, Sort, Page Size */}
      <div className="flex flex-col sm:flex-row gap-4">
        {/* Search */}
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            type="search"
            placeholder={content["shop.search"] || "Search products..."}
            value={searchInput}
            onChange={(e) => setSearchInput(e.target.value)}
            className="pl-10 pr-10"
            disabled={isLoading}
            aria-label={content["shop.searchLabel"] || "Search products"}
          />
          {searchInput && (
            <Button
              variant="ghost"
              size="icon"
              className="absolute right-1 top-1/2 transform -translate-y-1/2 h-7 w-7"
              onClick={() => setSearchInput("")}
              aria-label={content["shop.clearSearch"] || "Clear search"}
            >
              <X className="h-4 w-4" />
            </Button>
          )}
        </div>
        
        {/* Sort dropdown */}
        <Select value={currentSortValue} onValueChange={handleSortChange} disabled={isLoading}>
          <SelectTrigger className="w-full sm:w-[200px]" aria-label={content["shop.sortLabel"] || "Sort products"}>
            <SlidersHorizontal className="h-4 w-4 mr-2" />
            <SelectValue placeholder={content["shop.sortBy"] || "Sort by"} />
          </SelectTrigger>
          <SelectContent>
            {localizedSortOptions.map((option) => (
              <SelectItem key={`${option.key}-${option.dir}`} value={`${option.key}-${option.dir}`}>
                {option.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
        
        {/* Page size dropdown */}
        <Select value={String(query.pageSize)} onValueChange={handlePageSizeChange} disabled={isLoading}>
          <SelectTrigger className="w-full sm:w-[140px]" aria-label={content["shop.perPageLabel"] || "Items per page"}>
            <SelectValue placeholder={content["shop.perPage"] || "Per page"} />
          </SelectTrigger>
          <SelectContent>
            {PAGE_SIZE_OPTIONS.map((size) => (
              <SelectItem key={size} value={String(size)}>
                {size} {content["shop.perPageSuffix"] || "per page"}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>
      
      {/* Tag Filter Component */}
      <TagFilter
        selectedTags={query.tags}
        onTagsChange={(tags) => onQueryChange({ tags, page: 1 })}
      />
      
      {/* Clear filters button */}
      {hasActiveFilters && (
        <div className="flex justify-end">
          <Button
            variant="ghost"
            size="sm"
            onClick={handleClearFilters}
            className="text-muted-foreground hover:text-foreground"
          >
            <X className="h-4 w-4 mr-1" />
            {content["shop.clearFilters"] || "Clear filters"}
          </Button>
        </div>
      )}
      
      {/* Advanced filters (collapsible) */}
      <Collapsible open={showAdvancedFilters} onOpenChange={setShowAdvancedFilters}>
        <CollapsibleTrigger asChild>
          <Button variant="outline" size="sm" className="w-full sm:w-auto">
            {showAdvancedFilters ? (
              <ChevronUp className="h-4 w-4 mr-2" />
            ) : (
              <ChevronDown className="h-4 w-4 mr-2" />
            )}
            {content["shop.advancedFilters"] || "Advanced Filters"}
          </Button>
        </CollapsibleTrigger>
        
        <CollapsibleContent className="mt-4">
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6 p-4 bg-muted/50 rounded-lg">
            {/* Price range filter */}
            <div className="space-y-4">
              <Label className="text-sm font-medium">
                {content["shop.priceRange"] || "Price Range"}
              </Label>
              <div className="px-2">
                <Slider
                  value={priceRange}
                  min={0}
                  max={maxProductPrice}
                  step={5}
                  onValueChange={handlePriceRangeChange}
                  onValueCommit={handlePriceRangeCommit}
                  disabled={isLoading}
                  className="w-full"
                />
              </div>
              <div className="flex justify-between text-sm text-muted-foreground">
                <span>€{priceRange[0]}</span>
                <span>€{priceRange[1]}{priceRange[1] >= maxProductPrice ? "+" : ""}</span>
              </div>
            </div>
            
            {/* In stock filter */}
            <div className="space-y-4">
              <Label className="text-sm font-medium">
                {content["shop.availability"] || "Availability"}
              </Label>
              <div className="flex items-center space-x-2">
                <Checkbox
                  id="in-stock"
                  checked={query.inStock === true}
                  onCheckedChange={handleInStockChange}
                  disabled={isLoading}
                />
                <Label
                  htmlFor="in-stock"
                  className="text-sm font-normal cursor-pointer"
                >
                  {content["shop.inStockOnly"] || "In stock only"}
                </Label>
              </div>
            </div>
          </div>
        </CollapsibleContent>
      </Collapsible>
    </div>
  );
}
