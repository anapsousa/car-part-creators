import { ChevronLeft, ChevronRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { generatePageNumbers, calculatePagination } from "@/lib/shopUtils";
import { cn } from "@/lib/utils";

interface ShopPaginationProps {
  currentPage: number;
  totalCount: number;
  pageSize: number;
  onPageChange: (page: number) => void;
  isLoading?: boolean;
}

export function ShopPagination({
  currentPage,
  totalCount,
  pageSize,
  onPageChange,
  isLoading = false,
}: ShopPaginationProps) {
  const pagination = calculatePagination(totalCount, currentPage, pageSize);
  const pageNumbers = generatePageNumbers(pagination.currentPage, pagination.totalPages);
  
  if (pagination.totalPages <= 1) {
    return null;
  }
  
  return (
    <nav
      role="navigation"
      aria-label="Pagination"
      className="flex flex-col sm:flex-row items-center justify-between gap-4 mt-8"
    >
      {/* Showing X-Y of Z */}
      <p className="text-sm text-muted-foreground order-2 sm:order-1">
        Showing{" "}
        <span className="font-medium text-foreground">{pagination.displayStart}</span>
        –
        <span className="font-medium text-foreground">{pagination.displayEnd}</span>
        {" "}of{" "}
        <span className="font-medium text-foreground">{totalCount}</span>
        {" "}products
      </p>
      
      {/* Pagination controls */}
      <div className="flex items-center gap-1 order-1 sm:order-2">
        {/* Previous button */}
        <Button
          variant="outline"
          size="icon"
          onClick={() => onPageChange(currentPage - 1)}
          disabled={!pagination.hasPrevPage || isLoading}
          aria-label="Go to previous page"
          className="h-9 w-9"
        >
          <ChevronLeft className="h-4 w-4" />
        </Button>
        
        {/* Page numbers */}
        <div className="flex items-center gap-1">
          {pageNumbers.map((pageNum, index) => (
            pageNum === 'ellipsis' ? (
              <span
                key={`ellipsis-${index}`}
                className="flex h-9 w-9 items-center justify-center text-muted-foreground"
                aria-hidden
              >
                …
              </span>
            ) : (
              <Button
                key={pageNum}
                variant={pageNum === pagination.currentPage ? "default" : "outline"}
                size="icon"
                onClick={() => onPageChange(pageNum)}
                disabled={isLoading}
                aria-label={`Go to page ${pageNum}`}
                aria-current={pageNum === pagination.currentPage ? "page" : undefined}
                className={cn(
                  "h-9 w-9",
                  pageNum === pagination.currentPage && "pointer-events-none"
                )}
              >
                {pageNum}
              </Button>
            )
          ))}
        </div>
        
        {/* Next button */}
        <Button
          variant="outline"
          size="icon"
          onClick={() => onPageChange(currentPage + 1)}
          disabled={!pagination.hasNextPage || isLoading}
          aria-label="Go to next page"
          className="h-9 w-9"
        >
          <ChevronRight className="h-4 w-4" />
        </Button>
      </div>
    </nav>
  );
}
