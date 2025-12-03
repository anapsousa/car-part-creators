import { useCart } from "@/contexts/CartContext";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Minus, Plus, Trash2 } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";
import { useContent } from "@/hooks/useContent";
import { supabase } from '@/integrations/supabase/client';
import { useState, useEffect } from 'react';

export default function Cart() {
  const { cartItems, removeFromCart, updateQuantity, cartCount } = useCart();
  const navigate = useNavigate();
  const { content } = useContent("cart");
  const [user, setUser] = useState<any>(null);
  const [isCheckingAuth, setIsCheckingAuth] = useState(true);

  const subtotal = cartItems.reduce(
    (sum, item) => sum + item.product.price * item.quantity,
    0
  );

  useEffect(() => {
    const checkAuth = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      setUser(user);
      setIsCheckingAuth(false);
    };
    checkAuth();
  }, []);

  const handleCheckout = () => {
    navigate(`/checkout?type=products`);
  };

  if (cartCount === 0) {
    return (
      <div className="min-h-screen bg-background">
        <Header pageTitle={content["cart.title"] || "Shopping Cart"} pageSubtitle={content["cart.subtitle"] || "Your Items"} />
        <main className="container mx-auto px-4 py-16 text-center">
          <h1 className="text-3xl font-bold mb-4">{content["cart.empty.title"] || "Your Cart is Empty"}</h1>
          <p className="text-muted-foreground mb-8">{content["cart.empty.description"] || "Add some products to get started"}</p>
          <Button onClick={() => navigate("/shop")}>{content["cart.empty.button"] || "Browse Products"}</Button>
        </main>
        <Footer />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <Header pageTitle={content["cart.title"] || "Shopping Cart"} pageSubtitle={`${cartCount} ${content["cart.items_count"] || "items"}`} />

      <main className="container mx-auto px-4 py-8">
        <h1 className="text-3xl font-bold mb-8">{content["cart.title"] || "Shopping Cart"} ({cartCount} {content["cart.items_count"] || "items"})</h1>

        {!user && !isCheckingAuth && (
          <div className="bg-muted/50 p-4 rounded-lg mb-6">
            <p className="text-sm text-muted-foreground">
              💡 {content['cart.anonymous_banner.message'] || 'You can complete your purchase without creating an account, or'} or <Button variant="link" className="h-auto p-0 text-sm" onClick={() => navigate('/auth')}>{content['cart.anonymous_banner.login_link'] || 'log in'}</Button> {content['cart.anonymous_banner.suffix'] || 'to save your order history'}
            </p>
          </div>
        )}

        <div className="grid lg:grid-cols-3 gap-8">
          <div className="lg:col-span-2 space-y-4">
            {cartItems.map((item) => (
              <Card key={item.id}>
                <CardContent className="p-4">
                  <div className="flex gap-4">
                    <div className="w-24 h-24 bg-muted rounded overflow-hidden flex-shrink-0">
                      <img
                        src={item.product.images?.[0] || '/placeholder.svg'}
                        alt={item.product.name}
                        className="w-full h-full object-cover"
                      />
                    </div>
                    <div className="flex-1">
                      <h3 className="font-semibold">{item.product.name}</h3>
                      <p className="text-sm text-primary font-semibold mt-1">
                        €{item.product.price.toFixed(2)}
                      </p>
                      <div className="flex items-center gap-2 mt-3">
                        <Button
                          variant="outline"
                          size="icon"
                          className="h-8 w-8"
                          onClick={() => updateQuantity(item.id, item.quantity - 1)}
                          disabled={item.quantity <= 1}
                        >
                          <Minus className="h-3 w-3" />
                        </Button>
                        <span className="w-8 text-center text-sm font-semibold">
                          {item.quantity}
                        </span>
                        <Button
                          variant="outline"
                          size="icon"
                          className="h-8 w-8"
                          onClick={() => updateQuantity(item.id, item.quantity + 1)}
                        >
                          <Plus className="h-3 w-3" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-8 w-8 ml-auto text-destructive"
                          onClick={() => removeFromCart(item.id)}
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="font-semibold">
                        €{(item.product.price * item.quantity).toFixed(2)}
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>

          <div>
            <Card>
              <CardContent className="p-6">
                <h2 className="text-xl font-semibold mb-4">{content["cart.summary.title"] || "Order Summary"}</h2>
                <div className="space-y-2 mb-4">
                  <div className="flex justify-between text-sm">
                    <span className="text-muted-foreground">{content["cart.summary.subtotal"] || "Subtotal"}</span>
                    <span>€{subtotal.toFixed(2)}</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-muted-foreground">{content["cart.summary.shipping"] || "Shipping"}</span>
                    <span>{content["cart.summary.shipping_calculated"] || "Calculated at checkout"}</span>
                  </div>
                </div>
                <div className="border-t pt-4 mb-6">
                  <div className="flex justify-between font-semibold text-lg">
                    <span>{content["cart.summary.total"] || "Total"}</span>
                    <span>€{subtotal.toFixed(2)}</span>
                  </div>
                </div>
                <Button className="w-full" size="lg" onClick={handleCheckout}>
                  {content["cart.checkout_button"] || "Proceed to Checkout"}
                </Button>
              </CardContent>
            </Card>
          </div>
        </div>
      </main>
    </div>
  );
}
