import { useEffect, useRef } from "react";
import { supabase } from "@/integrations/supabase/client";

/**
 * Hook to track product views for analytics
 * Increments view count once per session per product
 */
export function useProductView(productId: string | undefined) {
  const hasTracked = useRef<Set<string>>(new Set());
  
  useEffect(() => {
    if (!productId) return;
    
    // Check if already tracked in this session
    const sessionKey = `viewed_product_${productId}`;
    const alreadyViewed = sessionStorage.getItem(sessionKey);
    
    if (alreadyViewed || hasTracked.current.has(productId)) {
      return;
    }
    
    // Mark as tracked immediately to prevent duplicate calls
    hasTracked.current.add(productId);
    sessionStorage.setItem(sessionKey, "1");
    
    // Call the increment function
    const trackView = async () => {
      try {
        const { error } = await supabase.rpc("increment_product_view", {
          p_product_id: productId,
        });
        
        if (error) {
          console.error("Failed to track product view:", error);
        }
      } catch (err) {
        console.error("Error tracking product view:", err);
      }
    };
    
    trackView();
  }, [productId]);
}
