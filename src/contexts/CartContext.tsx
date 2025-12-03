import React, { createContext, useContext, useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { getOrCreateSessionId, clearAnonymousSession } from '@/lib/anonymousSession';
import { useContent } from '@/hooks/useContent';

interface CartItem {
  id: string;
  product_id: string;
  quantity: number;
  product: {
    name: string;
    price: number;
    images: string[];
  };
}

interface CartContextType {
  cartItems: CartItem[];
  cartCount: number;
  addToCart: (productId: string, quantity: number) => Promise<void>;
  removeFromCart: (itemId: string) => Promise<void>;
  updateQuantity: (itemId: string, quantity: number) => Promise<void>;
  clearCart: () => Promise<void>;
  refreshCart: () => Promise<void>;
  isLoading: boolean;
  isMigrating: boolean;
}

const CartContext = createContext<CartContextType | undefined>(undefined);

export const CartProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [cartItems, setCartItems] = useState<CartItem[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isMigrating, setIsMigrating] = useState(false);
  const { toast } = useToast();
  const { content } = useContent('cart');

  const refreshCart = async () => {
    const { data: { user } } = await supabase.auth.getUser();
    if (user) {
      const { data, error } = await supabase
        .from('cart_items')
        .select(`
          id,
          product_id,
          quantity,
          product:products(name, price, images)
        `)
        .eq('user_id', user.id);

      if (error) {
        console.error('Error fetching cart:', error);
        return;
      }

      setCartItems(data as CartItem[]);
    } else {
      const sessionId = getOrCreateSessionId();
      const { data, error } = await supabase
        .from('cart_items')
        .select(`
          id,
          product_id,
          quantity,
          product:products(name, price, images)
        `)
        .eq('session_id', sessionId);

      if (error) {
        console.error('Error fetching cart:', error);
        return;
      }

      setCartItems(data as CartItem[]);
    }
  };

  useEffect(() => {
    refreshCart();
  }, []);

  const addToCart = async (productId: string, quantity: number) => {
    setIsLoading(true);
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        const sessionId = getOrCreateSessionId();
        // Check if item already exists in cart
        const { data: existing } = await supabase
          .from('cart_items')
          .select('id, quantity')
          .eq('session_id', sessionId)
          .eq('product_id', productId)
          .single();

        if (existing) {
          // Update quantity
          const { error } = await supabase
            .from('cart_items')
            .update({ quantity: existing.quantity + quantity })
            .eq('id', existing.id);

          if (error) throw error;
        } else {
          // Insert new item
          const { error } = await supabase
            .from('cart_items')
            .insert({ session_id: sessionId, product_id: productId, quantity });

          if (error) throw error;
        }

        await refreshCart();
        toast({
          title: content['cart.add.anonymous.title'] || 'Added to cart',
          description: content['cart.add.anonymous.description'] || 'You can checkout without registration. Create an account later to save your order history!',
        });
        return;
      }

      // Check if item already exists in cart
      const { data: existing } = await supabase
        .from('cart_items')
        .select('id, quantity')
        .eq('user_id', user.id)
        .eq('product_id', productId)
        .single();

      if (existing) {
        // Update quantity
        const { error } = await supabase
          .from('cart_items')
          .update({ quantity: existing.quantity + quantity })
          .eq('id', existing.id);

        if (error) throw error;
      } else {
        // Insert new item
        const { error } = await supabase
          .from('cart_items')
          .insert({ user_id: user.id, product_id: productId, quantity });

        if (error) throw error;
      }

      await refreshCart();
      toast({
        title: "Added to cart",
        description: "Item has been added to your cart",
      });
    } catch (error) {
      console.error('Error adding to cart:', error);
      toast({
        title: "Error",
        description: "Failed to add item to cart",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const removeFromCart = async (itemId: string) => {
    setIsLoading(true);
    try {
      const { error } = await supabase
        .from('cart_items')
        .delete()
        .eq('id', itemId);

      if (error) throw error;

      await refreshCart();
      toast({
        title: "Removed from cart",
        description: "Item has been removed from your cart",
      });
    } catch (error) {
      console.error('Error removing from cart:', error);
      toast({
        title: "Error",
        description: "Failed to remove item from cart",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const updateQuantity = async (itemId: string, quantity: number) => {
    if (quantity < 1) return;

    setIsLoading(true);
    try {
      const { error } = await supabase
        .from('cart_items')
        .update({ quantity })
        .eq('id', itemId);

      if (error) throw error;

      await refreshCart();
    } catch (error) {
      console.error('Error updating quantity:', error);
      toast({
        title: "Error",
        description: "Failed to update quantity",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const clearCart = async () => {
    setIsLoading(true);
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (user) {
        const { error } = await supabase
          .from('cart_items')
          .delete()
          .eq('user_id', user.id);

        if (error) throw error;
      } else {
        const sessionId = getOrCreateSessionId();
        const { error } = await supabase
          .from('cart_items')
          .delete()
          .eq('session_id', sessionId);

        if (error) throw error;
      }

      setCartItems([]);
    } catch (error) {
      console.error('Error clearing cart:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const migrateAnonymousCart = async (userId: string) => {
    setIsMigrating(true);
    try {
      toast({
        title: content['cart.migration.loading'] || 'Syncing cart...',
        description: content['cart.migration.loading.description'] || 'Transferring your items to your account',
      });
      const sessionId = localStorage.getItem('anonymous_session_id');
      if (!sessionId) return;

      const { data: anonymousItems, error: fetchError } = await supabase
        .from('cart_items')
        .select('*')
        .eq('session_id', sessionId);

      if (fetchError) throw fetchError;

      if (!anonymousItems || anonymousItems.length === 0) {
        clearAnonymousSession();
        return;
      }

      for (const item of anonymousItems) {
        const { data: existing } = await supabase
          .from('cart_items')
          .select('id, quantity')
          .eq('user_id', userId)
          .eq('product_id', item.product_id)
          .single();

        if (existing) {
          await supabase
            .from('cart_items')
            .update({ quantity: existing.quantity + item.quantity })
            .eq('id', existing.id);
        } else {
          await supabase
            .from('cart_items')
            .insert({ user_id: userId, product_id: item.product_id, quantity: item.quantity });
        }
      }

      await supabase
        .from('cart_items')
        .delete()
        .eq('session_id', sessionId);

      clearAnonymousSession();
      await refreshCart();
      toast({
        title: content['cart.migration.success.title'] || 'Cart synchronized',
        description: content['cart.migration.success.description'] || 'Your items have been transferred',
      });
    } catch (error) {
      console.error('Error migrating anonymous cart:', error);
    } finally {
      setIsMigrating(false);
    }
  };

  useEffect(() => {
    const { data: { subscription } } = supabase.auth.onAuthStateChange(async (event, session) => {
      if (event === 'SIGNED_IN' && session?.user) {
        await migrateAnonymousCart(session.user.id);
      }
    });

    return () => {
      subscription.unsubscribe();
    };
  }, []);

  useEffect(() => {
    // Fallback for network issues
    localStorage.setItem('cart_backup', JSON.stringify(cartItems));
  }, [cartItems]);

  const cartCount = cartItems.reduce((sum, item) => sum + item.quantity, 0);

  return (
    <CartContext.Provider
      value={{
        cartItems,
        cartCount,
        addToCart,
        removeFromCart,
        updateQuantity,
        clearCart,
        refreshCart,
        isLoading,
        isMigrating,
      }}
    >
      {children}
    </CartContext.Provider>
  );
};

export const useCart = () => {
  const context = useContext(CartContext);
  if (context === undefined) {
    throw new Error('useCart must be used within a CartProvider');
  }
  return context;
};
