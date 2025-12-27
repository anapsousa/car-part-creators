import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { X, ShoppingCart, Heart, ExternalLink, ChevronLeft, ChevronRight } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { useCart } from "@/contexts/CartContext";
import { useWishlist } from "@/contexts/WishlistContext";
import { useContent } from "@/hooks/useContent";
import { cn } from "@/lib/utils";

interface ProductQuickViewProps {
  product: {
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
    material?: string | null;
  } | null;
  isOpen: boolean;
  onClose: () => void;
}

export function ProductQuickView({ product, isOpen, onClose }: ProductQuickViewProps) {
  const { content } = useContent("shop");
  const navigate = useNavigate();
  const { addToCart, isLoading: isCartLoading } = useCart();
  const { addToWishlist, removeFromWishlist, isInWishlist } = useWishlist();
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const [isAddingToCart, setIsAddingToCart] = useState(false);
  
  if (!product) return null;
  
  const isOutOfStock = product.stock_quantity <= 0;
  const hasDiscount = product.discount_enabled && product.discount_percent && product.discount_percent > 0;
  const originalPrice = product.base_price || product.price;
  const inWishlist = isInWishlist(product.id);
  
  const images = product.images?.length > 0 
    ? product.images 
    : ["/placeholder.svg"];
  
  const handleAddToCart = async () => {
    if (isOutOfStock) return;
    setIsAddingToCart(true);
    try {
      await addToCart(product.id, 1);
    } finally {
      setIsAddingToCart(false);
    }
  };
  
  const handleToggleWishlist = async () => {
    if (inWishlist) {
      await removeFromWishlist(product.id);
    } else {
      await addToWishlist(product.id);
    }
  };
  
  const handleViewDetails = () => {
    onClose();
    navigate(`/product/${product.id}`);
  };
  
  const nextImage = () => {
    setCurrentImageIndex((prev) => (prev + 1) % images.length);
  };
  
  const prevImage = () => {
    setCurrentImageIndex((prev) => (prev - 1 + images.length) % images.length);
  };
  
  const categoryLabels: Record<string, string> = {
    car_parts: content["shop.categories.car_parts"] || "Car Parts",
    home_decor: content["shop.categories.decorations"] || "Home Decor",
    custom_designs: content["shop.categories.custom"] || "Custom Designs",
  };
  
  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="max-w-3xl p-0 overflow-hidden">
        <DialogHeader className="sr-only">
          <DialogTitle>{product.name}</DialogTitle>
        </DialogHeader>
        
        <div className="grid md:grid-cols-2 gap-0">
          {/* Image section */}
          <div className="relative bg-muted aspect-square md:aspect-auto md:h-full">
            <img
              src={images[currentImageIndex]}
              alt={product.name}
              className="w-full h-full object-cover"
            />
            
            {/* Image navigation */}
            {images.length > 1 && (
              <>
                <Button
                  variant="ghost"
                  size="icon"
                  className="absolute left-2 top-1/2 -translate-y-1/2 bg-background/80 hover:bg-background"
                  onClick={prevImage}
                  aria-label={content["shop.quickview.prevImage"] || "Previous image"}
                >
                  <ChevronLeft className="h-4 w-4" />
                </Button>
                <Button
                  variant="ghost"
                  size="icon"
                  className="absolute right-2 top-1/2 -translate-y-1/2 bg-background/80 hover:bg-background"
                  onClick={nextImage}
                  aria-label={content["shop.quickview.nextImage"] || "Next image"}
                >
                  <ChevronRight className="h-4 w-4" />
                </Button>
                
                {/* Image dots */}
                <div className="absolute bottom-4 left-1/2 -translate-x-1/2 flex gap-1.5">
                  {images.map((_, index) => (
                    <button
                      key={index}
                      className={cn(
                        "w-2 h-2 rounded-full transition-colors",
                        index === currentImageIndex ? "bg-primary" : "bg-background/60"
                      )}
                      onClick={() => setCurrentImageIndex(index)}
                      aria-label={`${content["shop.quickview.viewImage"] || "View image"} ${index + 1}`}
                    />
                  ))}
                </div>
              </>
            )}
            
            {/* Badges */}
            <div className="absolute top-4 left-4 flex flex-col gap-2">
              {hasDiscount && (
                <Badge variant="destructive">
                  -{product.discount_percent}%
                </Badge>
              )}
              {isOutOfStock && (
                <Badge variant="secondary">
                  {content["shop.outOfStock"] || "Out of stock"}
                </Badge>
              )}
            </div>
          </div>
          
          {/* Details section */}
          <div className="p-6 flex flex-col">
            {/* Category */}
            <Badge variant="outline" className="w-fit mb-2">
              {categoryLabels[product.category] || product.category}
            </Badge>
            
            {/* Title */}
            <h2 className="text-2xl font-bold mb-2">{product.name}</h2>
            
            {/* Price */}
            <div className="flex items-baseline gap-2 mb-4">
              <span className="text-2xl font-bold text-primary">
                €{product.price.toFixed(2)}
              </span>
              {hasDiscount && originalPrice > product.price && (
                <span className="text-lg text-muted-foreground line-through">
                  €{originalPrice.toFixed(2)}
                </span>
              )}
            </div>
            
            {/* Description */}
            {product.description && (
              <p className="text-muted-foreground mb-4 line-clamp-4">
                {product.description}
              </p>
            )}
            
            {/* Material */}
            {product.material && (
              <p className="text-sm text-muted-foreground mb-4">
                <span className="font-medium">{content["shop.quickview.material"] || "Material"}:</span>{" "}
                {product.material}
              </p>
            )}
            
            {/* Stock status */}
            <p className={cn(
              "text-sm mb-6",
              isOutOfStock ? "text-destructive" : "text-green-600"
            )}>
              {isOutOfStock 
                ? (content["shop.outOfStock"] || "Out of stock")
                : `${product.stock_quantity} ${content["shop.quickview.inStock"] || "in stock"}`
              }
            </p>
            
            {/* Actions */}
            <div className="mt-auto space-y-3">
              <div className="flex gap-3">
                <Button
                  className="flex-1"
                  onClick={handleAddToCart}
                  disabled={isOutOfStock || isAddingToCart}
                >
                  <ShoppingCart className="h-4 w-4 mr-2" />
                  {content["shop.addToCart"] || "Add to Cart"}
                </Button>
                <Button
                  variant="outline"
                  size="icon"
                  onClick={handleToggleWishlist}
                  aria-label={inWishlist 
                    ? (content["shop.removeFromWishlist"] || "Remove from wishlist")
                    : (content["shop.addToWishlist"] || "Add to wishlist")
                  }
                >
                  <Heart className={cn("h-4 w-4", inWishlist && "fill-current text-red-500")} />
                </Button>
              </div>
              
              <Button
                variant="outline"
                className="w-full"
                onClick={handleViewDetails}
              >
                <ExternalLink className="h-4 w-4 mr-2" />
                {content["shop.quickview.viewDetails"] || "View Full Details"}
              </Button>
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
