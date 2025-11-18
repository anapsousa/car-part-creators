import { createContext, useContext, useState, useEffect, ReactNode } from "react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

interface WishlistItem {
  id: string;
  user_id: string;
  product_id: string | null;
  design_id: string | null;
  created_at: string;
}

interface WishlistContextType {
  wishlistItems: WishlistItem[];
  isLoading: boolean;
  addToWishlist: (productId?: string, designId?: string) => Promise<void>;
  removeFromWishlist: (productId?: string, designId?: string) => Promise<void>;
  isInWishlist: (productId?: string, designId?: string) => boolean;
  refreshWishlist: () => Promise<void>;
}

const WishlistContext = createContext<WishlistContextType | undefined>(undefined);

export const WishlistProvider = ({ children }: { children: ReactNode }) => {
  const [wishlistItems, setWishlistItems] = useState<WishlistItem[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    const checkAuth = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      if (session) {
        refreshWishlist();
      }
    };
    checkAuth();

    const { data: authListener } = supabase.auth.onAuthStateChange((event, session) => {
      if (event === 'SIGNED_IN' && session) {
        refreshWishlist();
      } else if (event === 'SIGNED_OUT') {
        setWishlistItems([]);
      }
    });

    return () => {
      authListener.subscription.unsubscribe();
    };
  }, []);

  const refreshWishlist = async () => {
    try {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) return;

      const { data, error } = await supabase
        .from("wishlist_items")
        .select("*")
        .eq("user_id", session.user.id);

      if (error) throw error;
      setWishlistItems(data || []);
    } catch (error) {
      console.error("Error fetching wishlist:", error);
    }
  };

  const addToWishlist = async (productId?: string, designId?: string) => {
    try {
      setIsLoading(true);
      const { data: { session } } = await supabase.auth.getSession();
      
      if (!session) {
        toast.error("Please sign in to add items to your wishlist");
        return;
      }

      const { error } = await supabase
        .from("wishlist_items")
        .insert({
          user_id: session.user.id,
          product_id: productId || null,
          design_id: designId || null,
        });

      if (error) {
        if (error.code === '23505') {
          toast.info("Item already in wishlist");
        } else {
          throw error;
        }
        return;
      }

      await refreshWishlist();
      toast.success("Added to wishlist!");
    } catch (error) {
      console.error("Error adding to wishlist:", error);
      toast.error("Failed to add to wishlist");
    } finally {
      setIsLoading(false);
    }
  };

  const removeFromWishlist = async (productId?: string, designId?: string) => {
    try {
      setIsLoading(true);
      const { data: { session } } = await supabase.auth.getSession();
      
      if (!session) {
        toast.error("Please sign in");
        return;
      }

      let query = supabase
        .from("wishlist_items")
        .delete()
        .eq("user_id", session.user.id);

      if (productId) {
        query = query.eq("product_id", productId);
      } else if (designId) {
        query = query.eq("design_id", designId);
      }

      const { error } = await query;

      if (error) throw error;

      await refreshWishlist();
      toast.success("Removed from wishlist");
    } catch (error) {
      console.error("Error removing from wishlist:", error);
      toast.error("Failed to remove from wishlist");
    } finally {
      setIsLoading(false);
    }
  };

  const isInWishlist = (productId?: string, designId?: string): boolean => {
    return wishlistItems.some(item => 
      (productId && item.product_id === productId) ||
      (designId && item.design_id === designId)
    );
  };

  return (
    <WishlistContext.Provider
      value={{
        wishlistItems,
        isLoading,
        addToWishlist,
        removeFromWishlist,
        isInWishlist,
        refreshWishlist,
      }}
    >
      {children}
    </WishlistContext.Provider>
  );
};

export const useWishlist = () => {
  const context = useContext(WishlistContext);
  if (!context) {
    throw new Error("useWishlist must be used within a WishlistProvider");
  }
  return context;
};