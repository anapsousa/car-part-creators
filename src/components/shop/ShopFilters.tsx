import { useState, useCallback, useEffect } from "react";
import { Search, X, SlidersHorizontal } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import {
  ShopQuery,
  SortKey,
  SortDir,
  PAGE_SIZE_OPTIONS,
  SORT_OPTIONS,
} from "@/lib/shopUtils";
import { useContent } from "@/hooks/useContent";
import { cn } from "@/lib/utils";

interface ShopFiltersProps {
  query: ShopQuery;
  onQueryChange: (updates: Partial<ShopQuery>) => void;
  availableCategories?: string[];
  isLoading?: boolean;
}

export function ShopFilters({
  query,
  onQueryChange,
  availableCategories = ["car_parts", "home_decor", "custom_designs"],
  isLoading = false,
}: ShopFiltersProps) {
  const { content } = useContent("shop");
  const [searchInput, setSearchInput] = useState(query.search);
  
  // Sync search input with query
  useEffect(() => {
    setSearchInput(query.search);
  }, [query.search]);
  
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
  
  const handleCategoryToggle = useCallback((category: string) => {
    const newTags = query.tags.includes(category)
      ? query.tags.filter(t => t !== category)
      : [...query.tags, category];
    onQueryChange({ tags: newTags, page: 1 });
  }, [query.tags, onQueryChange]);
  
  const handleClearFilters = useCallback(() => {
    setSearchInput("");
    onQueryChange({
      search: "",
      tags: [],
      minPrice: null,
      maxPrice: null,
      inStock: null,
      page: 1,
    });
  }, [onQueryChange]);
  
  const currentSortValue = `${query.sortKey}-${query.sortDir}`;
  
  const hasActiveFilters = query.search || query.tags.length > 0 || 
    query.minPrice !== null || query.maxPrice !== null || query.inStock !== null;
  
  const categoryLabels: Record<string, string> = {
    car_parts: content["shop.categories.car_parts"] || "Car Parts",
    home_decor: content["shop.categories.decorations"] || "Home Decor",
    custom_designs: content["shop.categories.custom"] || "Custom Designs",
  };
  
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
            aria-label="Search products"
          />
          {searchInput && (
            <Button
              variant="ghost"
              size="icon"
              className="absolute right-1 top-1/2 transform -translate-y-1/2 h-7 w-7"
              onClick={() => setSearchInput("")}
              aria-label="Clear search"
            >
              <X className="h-4 w-4" />
            </Button>
          )}
        </div>
        
        {/* Sort dropdown */}
        <Select value={currentSortValue} onValueChange={handleSortChange} disabled={isLoading}>
          <SelectTrigger className="w-full sm:w-[200px]" aria-label="Sort products">
            <SlidersHorizontal className="h-4 w-4 mr-2" />
            <SelectValue placeholder="Sort by" />
          </SelectTrigger>
          <SelectContent>
            {SORT_OPTIONS.map((option) => (
              <SelectItem key={`${option.key}-${option.dir}`} value={`${option.key}-${option.dir}`}>
                {option.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
        
        {/* Page size dropdown */}
        <Select value={String(query.pageSize)} onValueChange={handlePageSizeChange} disabled={isLoading}>
          <SelectTrigger className="w-full sm:w-[140px]" aria-label="Items per page">
            <SelectValue placeholder="Per page" />
          </SelectTrigger>
          <SelectContent>
            {PAGE_SIZE_OPTIONS.map((size) => (
              <SelectItem key={size} value={String(size)}>
                {size} per page
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>
      
      {/* Category filter chips */}
      <div className="flex flex-wrap items-center gap-2">
        <span className="text-sm text-muted-foreground mr-2">Categories:</span>
        <Badge
          variant={query.tags.length === 0 ? "default" : "outline"}
          className="cursor-pointer hover:bg-primary/80 transition-colors"
          onClick={() => onQueryChange({ tags: [], page: 1 })}
        >
          {content["shop.categories.all"] || "All"}
        </Badge>
        {availableCategories.map((category) => (
          <Badge
            key={category}
            variant={query.tags.includes(category) ? "default" : "outline"}
            className="cursor-pointer hover:bg-primary/80 transition-colors"
            onClick={() => handleCategoryToggle(category)}
          >
            {categoryLabels[category] || category}
          </Badge>
        ))}
        
        {/* Clear filters button */}
        {hasActiveFilters && (
          <Button
            variant="ghost"
            size="sm"
            onClick={handleClearFilters}
            className="ml-auto text-muted-foreground hover:text-foreground"
          >
            <X className="h-4 w-4 mr-1" />
            Clear filters
          </Button>
        )}
      </div>
    </div>
  );
}
