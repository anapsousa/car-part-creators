-- Add calculator integration columns to products table
ALTER TABLE public.products 
ADD COLUMN IF NOT EXISTS calc_print_id uuid,
ADD COLUMN IF NOT EXISTS base_price numeric,
ADD COLUMN IF NOT EXISTS discount_enabled boolean DEFAULT false,
ADD COLUMN IF NOT EXISTS discount_percent numeric DEFAULT 0,
ADD COLUMN IF NOT EXISTS cost_price numeric;

-- Add comment for documentation
COMMENT ON COLUMN public.products.calc_print_id IS 'Reference to the calc_prints calculation used to price this product';
COMMENT ON COLUMN public.products.base_price IS 'Original price before any discounts';
COMMENT ON COLUMN public.products.discount_enabled IS 'Whether discount is active on this product';
COMMENT ON COLUMN public.products.discount_percent IS 'Discount percentage to apply (0-100)';
COMMENT ON COLUMN public.products.cost_price IS 'Production cost from calculator for profit tracking';