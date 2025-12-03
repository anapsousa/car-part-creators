-- Add checkout success and cart UX translation keys
INSERT INTO public.content_translations (content_key, content_type, page, section, english_text, description) VALUES
-- Guest account creation prompt
('checkout.success.guest_prompt.title', 'text', 'checkout', 'success', 'Create an Account?', 'Title for guest account creation prompt'),
('checkout.success.guest_prompt.description', 'text', 'checkout', 'success', 'Save your order history and enjoy faster checkouts in the future', 'Description for guest account creation benefits'),
('checkout.success.guest_prompt.button', 'button', 'checkout', 'success', 'Create Account', 'Button text for account creation'),

-- Order details section
('checkout.success.order_details.title', 'text', 'checkout', 'success', 'Order Details', 'Title for order details section'),
('checkout.success.order_details.items', 'text', 'checkout', 'success', 'Items', 'Label for order items'),
('checkout.success.order_details.total', 'text', 'checkout', 'success', 'Total', 'Label for order total'),
('checkout.success.order_details.shipping', 'text', 'checkout', 'success', 'Shipping Address', 'Label for shipping address'),

-- Cart migration messages
('cart.migration.loading', 'text', 'cart', 'migration', 'Syncing cart...', 'Loading message during cart migration'),
('cart.migration.loading.description', 'text', 'cart', 'migration', 'Transferring your items to your account', 'Description during migration'),
('cart.migration.success.title', 'text', 'cart', 'migration', 'Cart Synchronized', 'Success title after migration'),
('cart.migration.success.description', 'text', 'cart', 'migration', 'Your items have been transferred to your account', 'Success description after migration'),

-- Anonymous cart benefits
('cart.add.anonymous.title', 'text', 'cart', 'anonymous', 'Added to cart', 'Title when adding to anonymous cart'),
('cart.add.anonymous.description', 'text', 'cart', 'anonymous', 'You can checkout without registration. Create an account later to save your order history!', 'Description highlighting benefits'),

-- Auth email prefill
('auth.email.prefilled', 'text', 'auth', 'form', 'Email pre-filled from your order', 'Helper text for pre-filled email')
ON CONFLICT (content_key) DO NOTHING;

-- Add Portuguese translations
UPDATE public.content_translations SET portuguese_text = 'Criar uma Conta?' WHERE content_key = 'checkout.success.guest_prompt.title';
UPDATE public.content_translations SET portuguese_text = 'Guarde o histórico de pedidos e desfrute de checkouts mais rápidos no futuro' WHERE content_key = 'checkout.success.guest_prompt.description';
UPDATE public.content_translations SET portuguese_text = 'Criar Conta' WHERE content_key = 'checkout.success.guest_prompt.button';

UPDATE public.content_translations SET portuguese_text = 'Detalhes do Pedido' WHERE content_key = 'checkout.success.order_details.title';
UPDATE public.content_translations SET portuguese_text = 'Itens' WHERE content_key = 'checkout.success.order_details.items';
UPDATE public.content_translations SET portuguese_text = 'Total' WHERE content_key = 'checkout.success.order_details.total';
UPDATE public.content_translations SET portuguese_text = 'Morada de Envio' WHERE content_key = 'checkout.success.order_details.shipping';

UPDATE public.content_translations SET portuguese_text = 'A sincronizar carrinho...' WHERE content_key = 'cart.migration.loading';
UPDATE public.content_translations SET portuguese_text = 'A transferir os seus itens para a sua conta' WHERE content_key = 'cart.migration.loading.description';
UPDATE public.content_translations SET portuguese_text = 'Carrinho Sincronizado' WHERE content_key = 'cart.migration.success.title';
UPDATE public.content_translations SET portuguese_text = 'Os seus itens foram transferidos para a sua conta' WHERE content_key = 'cart.migration.success.description';

UPDATE public.content_translations SET portuguese_text = 'Adicionado ao carrinho' WHERE content_key = 'cart.add.anonymous.title';
UPDATE public.content_translations SET portuguese_text = 'Pode finalizar a compra sem registo. Crie uma conta mais tarde para guardar o histórico de pedidos!' WHERE content_key = 'cart.add.anonymous.description';

UPDATE public.content_translations SET portuguese_text = 'Email pré-preenchido do seu pedido' WHERE content_key = 'auth.email.prefilled';