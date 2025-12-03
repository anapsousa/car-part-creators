-- Add cart anonymous banner translation keys
INSERT INTO public.content_translations (content_key, content_type, page, section, english_text, description) VALUES
('cart.anonymous_banner.message', 'text', 'cart', 'anonymous_banner', 'You can complete your purchase without creating an account, or', 'Message in anonymous banner on cart page'),
('cart.anonymous_banner.login_link', 'link', 'cart', 'anonymous_banner', 'log in', 'Login link text in anonymous banner'),
('cart.anonymous_banner.suffix', 'text', 'cart', 'anonymous_banner', 'to save your order history', 'Suffix text in anonymous banner')
ON CONFLICT (content_key) DO NOTHING;

UPDATE public.content_translations SET portuguese_text = 'Pode finalizar a compra sem criar conta, ou' WHERE content_key = 'cart.anonymous_banner.message';
UPDATE public.content_translations SET portuguese_text = 'fazer login' WHERE content_key = 'cart.anonymous_banner.login_link';
UPDATE public.content_translations SET portuguese_text = 'para guardar o histórico de pedidos' WHERE content_key = 'cart.anonymous_banner.suffix';