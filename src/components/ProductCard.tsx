import { Card, CardContent, CardFooter } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { ShoppingCart } from "lucide-react";
import { useCart } from "@/contexts/CartContext";
import { useNavigate } from "react-router-dom";

interface ProductCardProps {
  id: string;
  name: string;
  description?: string;
  price: number;
  images: string[];
  stock_quantity: number;
}

export const ProductCard = ({ id, name, description, price, images, stock_quantity }: ProductCardProps) => {
  const { addToCart, isLoading } = useCart();
  const navigate = useNavigate();

  const handleAddToCart = async (e: React.MouseEvent) => {
    e.stopPropagation();
    await addToCart(id, 1);
  };

  const imageUrl = images && images.length > 0 ? images[0] : '/placeholder.svg';

  return (
    <Card 
      className="overflow-hidden hover:shadow-glow transition-all duration-300 hover:scale-105 cursor-pointer bg-gradient-to-br from-card via-card to-primary/5 border-2 hover:border-primary/30"
      onClick={() => navigate(`/product/${id}`)}
    >
      <div className="aspect-square overflow-hidden bg-muted relative">
        <img
          src={imageUrl}
          alt={name}
          className="w-full h-full object-cover hover:scale-110 transition-transform duration-300"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent opacity-0 hover:opacity-100 transition-opacity duration-300" />
      </div>
      <CardContent className="p-4">
        <h3 className="font-semibold text-lg line-clamp-1">{name}</h3>
        {description && (
          <p className="text-sm text-muted-foreground line-clamp-2 mt-1">{description}</p>
        )}
        <p className="text-xl font-bold bg-gradient-primary bg-clip-text text-transparent mt-2">€{price.toFixed(2)}</p>
        {stock_quantity === 0 && (
          <p className="text-sm text-destructive mt-1">Out of stock</p>
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
          Add to Cart
        </Button>
      </CardFooter>
    </Card>
  );
};
