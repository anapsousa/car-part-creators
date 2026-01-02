-- Add colors column to products table
-- Using JSONB array to store color options with name and hex values
ALTER TABLE public.products 
ADD COLUMN colors jsonb DEFAULT '[]'::jsonb;

-- Add comment for documentation
COMMENT ON COLUMN public.products.colors IS 'Array of color objects with name and hex properties, e.g., [{"name": "Red", "hex": "#FF0000"}]';