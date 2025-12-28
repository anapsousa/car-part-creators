-- Create tags table with bilingual support
CREATE TABLE public.tags (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  slug TEXT NOT NULL UNIQUE,
  name_en TEXT NOT NULL,
  name_pt TEXT NOT NULL,
  description_en TEXT,
  description_pt TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create product_tags join table
CREATE TABLE public.product_tags (
  product_id UUID NOT NULL REFERENCES public.products(id) ON DELETE CASCADE,
  tag_id UUID NOT NULL REFERENCES public.tags(id) ON DELETE CASCADE,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  PRIMARY KEY (product_id, tag_id)
);

-- Create indexes for performance
CREATE INDEX idx_tags_slug ON public.tags(slug);
CREATE INDEX idx_product_tags_product_id ON public.product_tags(product_id);
CREATE INDEX idx_product_tags_tag_id ON public.product_tags(tag_id);

-- Enable RLS on tags table
ALTER TABLE public.tags ENABLE ROW LEVEL SECURITY;

-- RLS policies for tags: anyone can read, only admins can modify
CREATE POLICY "Anyone can view tags" 
ON public.tags 
FOR SELECT 
USING (true);

CREATE POLICY "Admins can insert tags" 
ON public.tags 
FOR INSERT 
WITH CHECK (public.has_role(auth.uid(), 'admin'));

CREATE POLICY "Admins can update tags" 
ON public.tags 
FOR UPDATE 
USING (public.has_role(auth.uid(), 'admin'));

CREATE POLICY "Admins can delete tags" 
ON public.tags 
FOR DELETE 
USING (public.has_role(auth.uid(), 'admin'));

-- Enable RLS on product_tags table
ALTER TABLE public.product_tags ENABLE ROW LEVEL SECURITY;

-- RLS policies for product_tags: anyone can read, only admins can modify
CREATE POLICY "Anyone can view product tags" 
ON public.product_tags 
FOR SELECT 
USING (true);

CREATE POLICY "Admins can insert product tags" 
ON public.product_tags 
FOR INSERT 
WITH CHECK (public.has_role(auth.uid(), 'admin'));

CREATE POLICY "Admins can delete product tags" 
ON public.product_tags 
FOR DELETE 
USING (public.has_role(auth.uid(), 'admin'));

-- Create trigger for updated_at on tags
CREATE TRIGGER update_tags_updated_at
BEFORE UPDATE ON public.tags
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();

-- Seed initial tags from existing categories (as supplemental tags)
INSERT INTO public.tags (slug, name_en, name_pt, description_en, description_pt) VALUES
('car-parts', 'Car Parts', 'Peças de Automóvel', 'Replacement and custom parts for vehicles', 'Peças de substituição e personalizadas para veículos'),
('home-decor', 'Home Decor', 'Decoração', 'Decorative items for your home', 'Artigos decorativos para a sua casa'),
('custom-designs', 'Custom Designs', 'Designs Personalizados', 'Bespoke and personalized creations', 'Criações únicas e personalizadas'),
('christmas', 'Christmas', 'Natal', 'Festive items for Christmas', 'Artigos festivos para o Natal'),
('valentines', 'Valentine''s Day', 'Dia dos Namorados', 'Romantic gifts and decorations', 'Presentes e decorações românticas'),
('easter', 'Easter', 'Páscoa', 'Easter themed items', 'Artigos temáticos de Páscoa'),
('vases', 'Vases', 'Jarras', 'Decorative vases and planters', 'Jarras e vasos decorativos'),
('statues', 'Statues', 'Estatuetas', 'Figurines and decorative statues', 'Figuras e estatuetas decorativas'),
('gifts', 'Gifts', 'Presentes', 'Perfect gift ideas', 'Ideias perfeitas para presentes'),
('functional', 'Functional', 'Funcional', 'Practical everyday items', 'Objetos práticos do dia a dia'),
('limited-edition', 'Limited Edition', 'Edição Limitada', 'Exclusive limited run items', 'Artigos exclusivos em tiragem limitada'),
('new-arrival', 'New Arrival', 'Novidade', 'Recently added items', 'Artigos adicionados recentemente');