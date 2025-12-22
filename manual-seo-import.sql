-- =====================================================
-- SEO Translations Import Script
-- Copy and paste this entire script into Supabase SQL Editor
-- =====================================================

-- Create a function to insert SEO translations (bypasses RLS)
CREATE OR REPLACE FUNCTION public.insert_seo_translations()
RETURNS VOID
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  INSERT INTO public.content_translations (content_key, content_type, page, section, english_text, portuguese_text, description) VALUES
  -- Homepage SEO
  ('home.seo.title', 'seo', 'home', 'seo', 'Custom 3D Printing & Original Designs | Dr3amToReal Portugal', 'Impressão 3D Personalizada e Designs Originais | Dr3amToReal Portugal', 'SEO meta title for homepage'),
  ('home.seo.description', 'seo', 'home', 'seo', 'Design-led custom 3D printing studio in Portugal. Original designs, personalised parts, and small-batch prints — from dream to real object.', 'Estúdio de impressão 3D personalizada orientado para o design em Portugal. Designs originais, peças personalizadas e impressões em pequenas séries — do sonho ao objeto real.', 'SEO meta description for homepage'),
  ('home.seo.keywords', 'seo', 'home', 'seo', 'custom 3D printing Portugal, 3D printing studio Portugal, custom 3D prints, personalised 3D printing, bespoke 3D printing, original 3D designs, small batch 3D printing, 3D printed parts Portugal, design-led 3D printing', 'impressão 3D personalizada Portugal, estúdio de impressão 3D Portugal, impressões 3D personalizadas, impressão 3D personalizada, impressão 3D sob medida, designs 3D originais, impressão 3D em pequenas séries, peças impressas em 3D Portugal, impressão 3D orientada para o design', 'SEO keywords for homepage'),
  ('home.seo.og_title', 'seo', 'home', 'seo', 'Custom 3D Printing & Original Designs | Dr3amToReal Portugal', 'Impressão 3D Personalizada e Designs Originais | Dr3amToReal Portugal', 'Open Graph title for homepage'),
  ('home.seo.og_description', 'seo', 'home', 'seo', 'Design-led custom 3D printing studio in Portugal. Original designs, personalised parts, and small-batch prints — from dream to real object.', 'Estúdio de impressão 3D personalizada orientado para o design em Portugal. Designs originais, peças personalizadas e impressões em pequenas séries — do sonho ao objeto real.', 'Open Graph description for homepage'),
  
  -- Homepage internal links
  ('home.hero.link_about', 'text', 'home', 'hero', 'About Dr3amToReal', 'Sobre Dr3amToReal', 'Link text to about page'),
  ('home.hero.link_custom_work', 'text', 'home', 'hero', 'Custom Work Services', 'Serviços de Trabalho Personalizado', 'Link text to custom work page'),
  
  -- About page SEO
  ('about.seo.title', 'seo', 'about', 'seo', 'About Dr3amToReal | Design-Led 3D Printing Studio in Portugal', 'Sobre Dr3amToReal | Estúdio de Impressão 3D Orientado para o Design em Portugal', 'SEO meta title for about page'),
  ('about.seo.description', 'seo', 'about', 'seo', 'Dr3amToReal is a design-led 3D printing studio based in Portugal, creating custom parts, original designs, and personalised objects with care.', 'A Dr3amToReal é um estúdio de impressão 3D orientado para o design sediado em Portugal, criando peças personalizadas, designs originais e objetos personalizados com cuidado.', 'SEO meta description for about page'),
  ('about.seo.og_title', 'seo', 'about', 'seo', 'About Dr3amToReal | Design-Led 3D Printing Studio in Portugal', 'Sobre Dr3amToReal | Estúdio de Impressão 3D Orientado para o Design em Portugal', 'Open Graph title for about page'),
  ('about.seo.og_description', 'seo', 'about', 'seo', 'Dr3amToReal is a design-led 3D printing studio based in Portugal, creating custom parts, original designs, and personalised objects with care.', 'A Dr3amToReal é um estúdio de impressão 3D orientado para o design sediado em Portugal, criando peças personalizadas, designs originais e objetos personalizados com cuidado.', 'Open Graph description for about page'),
  ('about.hero.link_manifesto', 'text', 'about', 'hero', 'Learn more about our values and approach', 'Saiba mais sobre os nossos valores e abordagem', 'Link text to homepage manifesto section'),
  
  -- Contact page SEO
  ('contact.seo.title', 'seo', 'contact', 'seo', 'Custom 3D Design & Printing Services | Dr3amToReal', 'Serviços de Design e Impressão 3D Personalizados | Dr3amToReal', 'SEO meta title for contact/custom work page'),
  ('contact.seo.description', 'seo', 'contact', 'seo', 'Bespoke 3D design and printing for functional parts, personalised objects, and unique projects. Small-batch, quality-driven, Portugal-based.', 'Design e impressão 3D sob medida para peças funcionais, objetos personalizados e projetos únicos. Pequenas séries, orientado para a qualidade, sediado em Portugal.', 'SEO meta description for contact/custom work page'),
  ('contact.seo.og_title', 'seo', 'contact', 'seo', 'Custom 3D Design & Printing Services | Dr3amToReal', 'Serviços de Design e Impressão 3D Personalizados | Dr3amToReal', 'Open Graph title for contact page'),
  ('contact.seo.og_description', 'seo', 'contact', 'seo', 'Bespoke 3D design and printing for functional parts, personalised objects, and unique projects. Small-batch, quality-driven, Portugal-based.', 'Design e impressão 3D sob medida para peças funcionais, objetos personalizados e projetos únicos. Pequenas séries, orientado para a qualidade, sediado em Portugal.', 'Open Graph description for contact page'),
  
  -- Product page SEO templates
  ('product.seo.car_parts.title', 'seo', 'product', 'seo', 'Custom 3D Printed Replacement Part | Dr3amToReal', 'Peça de Substituição Impressa em 3D Personalizada | Dr3amToReal', 'SEO title template for car parts products'),
  ('product.seo.car_parts.description', 'seo', 'product', 'seo', 'High-quality custom 3D printed replacement part, designed and tested for fit and function. Made to order by Dr3amToReal in Portugal.', 'Peça de substituição impressa em 3D personalizada de alta qualidade, desenhada e testada para ajuste e função. Feito sob encomenda pela Dr3amToReal em Portugal.', 'SEO description template for car parts products'),
  ('product.seo.home_decor.title', 'seo', 'product', 'seo', '3D Printed Home Décor | Custom & Original Designs – Dr3amToReal', 'Decoração para Casa Impressa em 3D | Designs Personalizados e Originais – Dr3amToReal', 'SEO title template for home decor products'),
  ('product.seo.home_decor.description', 'seo', 'product', 'seo', 'Original 3D printed home décor designed with intention. Customisable, small-batch pieces made in Portugal by Dr3amToReal.', 'Decoração para casa impressa em 3D original desenhada com intenção. Peças personalizáveis em pequenas séries feitas em Portugal pela Dr3amToReal.', 'SEO description template for home decor products'),
  ('product.seo.personalised.title', 'seo', 'product', 'seo', 'Personalised 3D Printed Object | Made to Order – Dr3amToReal', 'Objeto Impresso em 3D Personalizado | Feito Sob Encomenda – Dr3amToReal', 'SEO title template for personalised products'),
  ('product.seo.personalised.description', 'seo', 'product', 'seo', 'Personalised 3D printed object tailored to your needs. Designed and printed with care by Dr3amToReal, a Portugal-based studio.', 'Objeto impresso em 3D personalizado adaptado às suas necessidades. Desenhado e impresso com cuidado pela Dr3amToReal, um estúdio sediado em Portugal.', 'SEO description template for personalised products'),
  
  -- Product custom work CTA
  ('product.custom_work.question', 'text', 'product', 'custom_work', 'Need this adapted?', 'Precisa de adaptação?', 'Question text for custom work CTA on product pages'),
  ('product.custom_work.cta', 'button', 'product', 'custom_work', 'Request custom work', 'Solicitar trabalho personalizado', 'Button text for custom work CTA on product pages'),
  
  -- Navigation
  ('nav.menu', 'text', 'navigation', 'nav', 'Menu', 'Menu', 'Mobile menu label')
  
  ON CONFLICT (content_key) DO UPDATE SET
    content_type = EXCLUDED.content_type,
    page = EXCLUDED.page,
    section = EXCLUDED.section,
    english_text = EXCLUDED.english_text,
    portuguese_text = EXCLUDED.portuguese_text,
    description = EXCLUDED.description,
    updated_at = NOW();
END;
$$;

-- Execute the function to insert/update all translations
SELECT public.insert_seo_translations();

-- Clean up the function (optional - you can leave it if you want to reuse it)
DROP FUNCTION IF EXISTS public.insert_seo_translations();

-- Verify the import (optional - uncomment to check)
-- SELECT content_key, page, section, english_text, portuguese_text 
-- FROM content_translations 
-- WHERE content_key LIKE '%.seo.%' OR content_key IN ('home.hero.link_about', 'home.hero.link_custom_work', 'about.hero.link_manifesto', 'product.custom_work.question', 'product.custom_work.cta', 'nav.menu')
-- ORDER BY content_key;

