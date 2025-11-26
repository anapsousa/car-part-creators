-- Add new columns to designs table for advanced customization
ALTER TABLE public.designs 
ADD COLUMN material text,
ADD COLUMN width numeric,
ADD COLUMN height numeric,
ADD COLUMN depth numeric,
ADD COLUMN category text DEFAULT 'custom',
ADD COLUMN is_favorited boolean DEFAULT false;

-- Add check constraint for category
ALTER TABLE public.designs
ADD CONSTRAINT valid_category CHECK (category IN ('car_parts', 'home_decorations', 'custom'));

-- Add check constraint for material
ALTER TABLE public.designs
ADD CONSTRAINT valid_material CHECK (material IS NULL OR material IN ('PLA', 'ABS', 'PETG', 'TPU', 'Nylon', 'Resin'));

-- Add index for category filtering
CREATE INDEX idx_designs_category ON public.designs(category);

-- Add index for favorites
CREATE INDEX idx_designs_favorited ON public.designs(is_favorited) WHERE is_favorited = true;