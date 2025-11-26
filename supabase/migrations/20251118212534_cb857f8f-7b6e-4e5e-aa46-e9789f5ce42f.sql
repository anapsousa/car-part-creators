-- Create wishlist table for products
CREATE TABLE public.wishlist_items (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  product_id UUID,
  design_id UUID,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  CONSTRAINT wishlist_items_user_product_unique UNIQUE (user_id, product_id),
  CONSTRAINT wishlist_items_user_design_unique UNIQUE (user_id, design_id),
  CONSTRAINT wishlist_items_check CHECK (
    (product_id IS NOT NULL AND design_id IS NULL) OR 
    (product_id IS NULL AND design_id IS NOT NULL)
  )
);

-- Enable Row Level Security
ALTER TABLE public.wishlist_items ENABLE ROW LEVEL SECURITY;

-- Create policies for wishlist access
CREATE POLICY "Users can view their own wishlist items"
ON public.wishlist_items
FOR SELECT
USING (auth.uid() = user_id);

CREATE POLICY "Users can add to their own wishlist"
ON public.wishlist_items
FOR INSERT
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can remove from their own wishlist"
ON public.wishlist_items
FOR DELETE
USING (auth.uid() = user_id);

-- Create index for better query performance
CREATE INDEX idx_wishlist_user_id ON public.wishlist_items(user_id);
CREATE INDEX idx_wishlist_product_id ON public.wishlist_items(product_id);
CREATE INDEX idx_wishlist_design_id ON public.wishlist_items(design_id);