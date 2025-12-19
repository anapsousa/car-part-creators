import { Card, CardContent, CardFooter } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ShoppingCart, Heart } from "lucide-react";
import { useCart } from "@/contexts/CartContext";
import { useWishlist } from "@/contexts/WishlistContext";
import { useNavigate } from "react-router-dom";
import { useContent } from "@/hooks/useContent";

interface ProductCardProps {
  id: string;
  name: string;
  description?: string;
  price: number;
  images: string[];
  stock_quantity: number;
  base_price?: number | null;
  discount_enabled?: boolean;
  discount_percent?: number | null;
}

export const ProductCard = ({ 
  id, 
  name, 
  description, 
  price, 
  images, 
  stock_quantity,
  base_price,
  discount_enabled,
  discount_percent 
}: ProductCardProps) => {
  const { addToCart, isLoading } = useCart();
  const { addToWishlist, removeFromWishlist, isInWishlist } = useWishlist();
  const navigate = useNavigate();
  const inWishlist = isInWishlist(id);
  const { content } = useContent("shop");

  const handleAddToCart = async (e: React.MouseEvent) => {
    e.stopPropagation();
    await addToCart(id, 1);
  };

  const handleToggleWishlist = async (e: React.MouseEvent) => {
    e.stopPropagation();
    if (inWishlist) {
      await removeFromWishlist(id);
    } else {
      await addToWishlist(id);
    }
  };

  const imageUrl = images && images.length > 0 ? images[0] : '/placeholder.svg';

  // Calculate displayed prices
  const hasDiscount = discount_enabled && discount_percent && discount_percent > 0;
  const originalPrice = base_price || price;
  const finalPrice = hasDiscount 
    ? originalPrice * (1 - (discount_percent || 0) / 100) 
    : price;

  return (
    <Card 
      className="overflow-hidden hover:shadow-glow transition-all duration-300 hover:scale-105 cursor-pointer bg-gradient-to-br from-card via-card to-primary/5 border-2 hover:border-primary/30"
      onClick={() => navigate(`/product/${id}`)}
    >
      <div className="aspect-square overflow-hidden bg-muted relative group">
        <img
          src={imageUrl}
          alt={name}
          className="w-full h-full object-cover hover:scale-110 transition-transform duration-300"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent opacity-0 hover:opacity-100 transition-opacity duration-300" />
        
        {/* Discount Badge */}
        {hasDiscount && (
          <Badge 
            variant="destructive" 
            className="absolute top-2 left-2 text-sm font-bold"
          >
            -{discount_percent}%
          </Badge>
        )}
        
        <Button
          variant="ghost"
          size="icon"
          className={`absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity ${
            inWishlist ? 'bg-background/80' : 'bg-background/60'
          }`}
          onClick={handleToggleWishlist}
        >
          <Heart className={`h-5 w-5 ${inWishlist ? 'fill-primary text-primary' : ''}`} />
        </Button>
      </div>
      <CardContent className="p-4">
        <h3 className="font-semibold text-lg line-clamp-1">{name}</h3>
        {description && (
          <p className="text-sm text-muted-foreground line-clamp-2 mt-1">{description}</p>
        )}
        
        {/* Price Display */}
        <div className="mt-2 flex items-center gap-2">
          {hasDiscount ? (
            <>
              <span className="text-sm line-through text-muted-foreground">
                €{originalPrice.toFixed(2)}
              </span>
              <span className="text-xl font-bold text-destructive">
                €{finalPrice.toFixed(2)}
              </span>
            </>
          ) : (
            <span className="text-xl font-bold bg-gradient-primary bg-clip-text text-transparent">
              €{price.toFixed(2)}
            </span>
          )}
        </div>
        
        {stock_quantity === 0 && (
          <p className="text-sm text-destructive mt-1">{content["shop.product.out_of_stock"] || "Out of stock"}</p>
        )}
      </CardContent>
      <CardFooter className="p-4 pt-0">
        <Button
          variant="gradient"
          className="w-full"
          onClick={handleAddToCart}
          disabled={stock_quantity === 0 || isLoading}
        >
          <ShoppingCart className="mr-2 h-4 w-4" />
          {content["shop.product.add_to_cart"] || "Add to Cart"}
        </Button>
      </CardFooter>
    </Card>
  );
};
