-- Create content_translations table for CMS
CREATE TABLE public.content_translations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  content_key TEXT UNIQUE NOT NULL,
  content_type TEXT NOT NULL DEFAULT 'text',
  page TEXT NOT NULL,
  section TEXT NOT NULL,
  english_text TEXT NOT NULL,
  portuguese_text TEXT,
  description TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.content_translations ENABLE ROW LEVEL SECURITY;

-- Anyone can read content
CREATE POLICY "Anyone can view content translations"
ON public.content_translations
FOR SELECT
USING (true);

-- Only admins can insert content
CREATE POLICY "Admins can insert content translations"
ON public.content_translations
FOR INSERT
WITH CHECK (public.has_role(auth.uid(), 'admin'));

-- Only admins can update content
CREATE POLICY "Admins can update content translations"
ON public.content_translations
FOR UPDATE
USING (public.has_role(auth.uid(), 'admin'));

-- Only admins can delete content
CREATE POLICY "Admins can delete content translations"
ON public.content_translations
FOR DELETE
USING (public.has_role(auth.uid(), 'admin'));

-- Create trigger for updated_at
CREATE TRIGGER update_content_translations_updated_at
BEFORE UPDATE ON public.content_translations
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();

-- Seed initial content from the landing page
INSERT INTO public.content_translations (content_key, content_type, page, section, english_text, description) VALUES
-- Navigation
('nav.home', 'text', 'navigation', 'main', 'Home', 'Navigation link to home page'),
('nav.shop', 'text', 'navigation', 'main', 'Shop', 'Navigation link to shop page'),
('nav.generator', 'text', 'navigation', 'main', 'Generator', 'Navigation link to 3D model generator'),
('nav.about', 'text', 'navigation', 'main', 'About', 'Navigation link to about page'),
('nav.contact', 'text', 'navigation', 'main', 'Contact', 'Navigation link to contact page'),
('nav.faq', 'text', 'navigation', 'main', 'FAQ', 'Navigation link to FAQ page'),
('nav.cart', 'text', 'navigation', 'main', 'Cart', 'Cart link text'),
('nav.wishlist', 'text', 'navigation', 'main', 'Wishlist', 'Wishlist link text'),
('nav.login', 'text', 'navigation', 'main', 'Login', 'Login button text'),
('nav.logout', 'text', 'navigation', 'main', 'Logout', 'Logout button text'),
('nav.dashboard', 'text', 'navigation', 'main', 'Dashboard', 'User dashboard link'),
('nav.admin_dashboard', 'text', 'navigation', 'main', 'Admin Dashboard', 'Admin dashboard link'),

-- Home Hero Section
('home.hero.title', 'heading', 'home', 'hero', 'Authentic Classic Car Parts', 'Main hero heading'),
('home.hero.subtitle', 'text', 'home', 'hero', 'Preserve automotive heritage with precision 3D-printed restoration parts', 'Hero subtitle'),
('home.hero.cta', 'button', 'home', 'hero', 'Browse Catalog', 'Hero call-to-action button'),

-- Home Stats
('home.stats.parts_printed.number', 'text', 'home', 'stats', '5000+', 'Parts printed statistic number'),
('home.stats.parts_printed.label', 'text', 'home', 'stats', 'Parts Printed', 'Parts printed label'),
('home.stats.satisfaction.number', 'text', 'home', 'stats', '98%', 'Satisfaction rate number'),
('home.stats.satisfaction.label', 'text', 'home', 'stats', 'Satisfaction Rate', 'Satisfaction rate label'),
('home.stats.turnaround.number', 'text', 'home', 'stats', '48h', 'Turnaround time number'),
('home.stats.turnaround.label', 'text', 'home', 'stats', 'Fast Turnaround', 'Turnaround time label'),

-- Home Features
('home.features.available_parts.title', 'heading', 'home', 'features', 'Available Parts', 'Available parts feature title'),
('home.features.available_parts.description', 'text', 'home', 'features', 'From dashboard components to door handles, we specialize in hard-to-find parts', 'Available parts description'),
('home.features.quality.title', 'heading', 'home', 'features', 'Quality Guarantee', 'Quality guarantee feature title'),
('home.features.quality.description', 'text', 'home', 'features', 'Premium materials and precise manufacturing ensure perfect fit and durability', 'Quality guarantee description'),
('home.features.support.title', 'heading', 'home', 'features', 'Expert Support', 'Expert support feature title'),
('home.features.support.description', 'text', 'home', 'features', 'Our team helps you find the exact part for your classic vehicle restoration', 'Expert support description'),

-- Home How It Works
('home.how_it_works.title', 'heading', 'home', 'process', 'How It Works', 'How it works section title'),
('home.how_it_works.step1.title', 'heading', 'home', 'process', 'Browse Our Catalog', 'Step 1 title'),
('home.how_it_works.step1.description', 'text', 'home', 'process', 'Search our extensive collection of classic car parts and home decorations', 'Step 1 description'),
('home.how_it_works.step2.title', 'heading', 'home', 'process', 'Place Your Order', 'Step 2 title'),
('home.how_it_works.step2.description', 'text', 'home', 'process', 'Select your part, specify any customizations, and complete checkout', 'Step 2 description'),
('home.how_it_works.step3.title', 'heading', 'home', 'process', 'Receive Your Part', 'Step 3 title'),
('home.how_it_works.step3.description', 'text', 'home', 'process', 'We 3D print and deliver your part with quality assurance', 'Step 3 description'),

-- Home USPs
('home.usp.vintage.title', 'heading', 'home', 'usp', 'Vintage Expertise', 'Vintage expertise title'),
('home.usp.vintage.description', 'text', 'home', 'usp', 'Specialized in classic car parts from the 1950s-1980s era', 'Vintage expertise description'),
('home.usp.decor.title', 'heading', 'home', 'usp', 'Custom Home Decor', 'Custom decor title'),
('home.usp.decor.description', 'text', 'home', 'usp', 'Transform your space with automotive-inspired decorative pieces', 'Custom decor description'),
('home.usp.ai.title', 'heading', 'home', 'usp', 'AI-Powered Generation', 'AI generation title'),
('home.usp.ai.description', 'text', 'home', 'usp', 'Use our advanced AI to generate custom 3D models from descriptions', 'AI generation description'),
('home.usp.quality.title', 'heading', 'home', 'usp', 'Premium Quality', 'Premium quality title'),
('home.usp.quality.description', 'text', 'home', 'usp', 'Professional-grade materials and precision manufacturing', 'Premium quality description'),

-- Home CTA
('home.cta.title', 'heading', 'home', 'cta', 'Start Your Restoration Journey', 'Final CTA title'),
('home.cta.description', 'text', 'home', 'cta', 'Browse our catalog of authentic parts or generate custom designs', 'Final CTA description'),
('home.cta.button', 'button', 'home', 'cta', 'Browse Catalog', 'Final CTA button'),

-- Footer
('footer.company.description', 'text', 'footer', 'company', 'Specialized in 3D-printed classic car parts and custom home decorations', 'Company description in footer'),
('footer.links.title', 'heading', 'footer', 'links', 'Quick Links', 'Quick links section title'),
('footer.legal.title', 'heading', 'footer', 'links', 'Legal', 'Legal section title'),
('footer.legal.privacy', 'text', 'footer', 'links', 'Privacy Policy', 'Privacy policy link'),
('footer.legal.terms', 'text', 'footer', 'links', 'Terms of Service', 'Terms of service link'),
('footer.copyright', 'text', 'footer', 'bottom', '© 2024 PompousWeek. All rights reserved.', 'Copyright text');