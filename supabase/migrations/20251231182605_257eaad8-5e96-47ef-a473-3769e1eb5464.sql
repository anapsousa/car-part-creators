-- Add view_count and sales_count to products for popularity sorting and analytics
ALTER TABLE public.products
ADD COLUMN IF NOT EXISTS view_count integer NOT NULL DEFAULT 0,
ADD COLUMN IF NOT EXISTS sales_count integer NOT NULL DEFAULT 0;

-- Create index for popularity sorting
CREATE INDEX IF NOT EXISTS idx_products_view_count ON public.products(view_count DESC);
CREATE INDEX IF NOT EXISTS idx_products_sales_count ON public.products(sales_count DESC);

-- Add is_featured column to tags for homepage featured section
ALTER TABLE public.tags
ADD COLUMN IF NOT EXISTS is_featured boolean NOT NULL DEFAULT false;

-- Create function to increment product view count (called by edge function)
CREATE OR REPLACE FUNCTION public.increment_product_view(p_product_id uuid)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $$
BEGIN
  UPDATE public.products
  SET view_count = view_count + 1
  WHERE id = p_product_id;
END;
$$;

-- Create function to increment product sales count (called when order is placed)
CREATE OR REPLACE FUNCTION public.increment_product_sales(p_product_id uuid, p_quantity integer DEFAULT 1)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $$
BEGIN
  UPDATE public.products
  SET sales_count = sales_count + p_quantity
  WHERE id = p_product_id;
END;
$$;

-- Mark some existing tags as featured for the homepage
UPDATE public.tags SET is_featured = true WHERE slug IN ('christmas', 'gifts', 'vases', 'statues', 'valentines');