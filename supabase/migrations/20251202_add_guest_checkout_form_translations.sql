-- Add guest checkout form translation keys
INSERT INTO public.content_translations (content_key, content_type, page, section, english_text, description) VALUES
-- Guest form section
('checkout.guest.title', 'text', 'checkout', 'guest_form', 'Guest Checkout Information', 'Title for guest checkout form section'),
('checkout.guest.description', 'text', 'checkout', 'guest_form', 'Complete your purchase without creating an account', 'Description for guest checkout form'),
('checkout.guest.email', 'input', 'checkout', 'guest_form', 'Email Address', 'Label for email input field'),
('checkout.guest.name', 'input', 'checkout', 'guest_form', 'Full Name', 'Label for full name input field'),
('checkout.guest.phone', 'input', 'checkout', 'guest_form', 'Phone Number', 'Label for phone number input field'),
('checkout.guest.phone_hint', 'text', 'checkout', 'guest_form', 'Include country code (e.g., +351 912 345 678)', 'Hint text for phone number field'),
('checkout.guest.address', 'input', 'checkout', 'guest_form', 'Street Address', 'Label for street address input field'),
('checkout.guest.city', 'input', 'checkout', 'guest_form', 'City', 'Label for city input field'),
('checkout.guest.postal_code', 'input', 'checkout', 'guest_form', 'Postal Code', 'Label for postal code input field'),
('checkout.guest.country', 'input', 'checkout', 'guest_form', 'Country', 'Label for country input field'),
('checkout.guest.gdpr_consent', 'text', 'checkout', 'guest_form', 'I agree to the processing of my personal data in accordance with the', 'GDPR consent text before privacy policy link'),
('checkout.guest.privacy_policy', 'link', 'checkout', 'guest_form', 'Privacy Policy', 'Privacy policy link text'),
('checkout.guest.have_account', 'text', 'checkout', 'guest_form', 'Already have an account?', 'Prompt asking if user has an account'),
('checkout.guest.login', 'link', 'checkout', 'guest_form', 'Log in', 'Login link text'),

-- Validation section
('checkout.validation.required', 'text', 'checkout', 'validation', 'This field is required', 'Validation message for required fields'),
('checkout.validation.invalid_email', 'text', 'checkout', 'validation', 'Please enter a valid email address', 'Validation message for invalid email'),
('checkout.validation.gdpr_required', 'text', 'checkout', 'validation', 'You must agree to the privacy policy to continue', 'Validation message for GDPR consent requirement'),
('checkout.validation.form_errors', 'text', 'checkout', 'validation', 'Please correct the errors in the form', 'Summary message for form validation errors'),

-- Product checkout section
('checkout.product.title', 'text', 'checkout', 'product', 'Product Checkout', 'Title for product checkout section'),
('checkout.product.cart_empty', 'text', 'checkout', 'product', 'Your cart is empty', 'Message when cart is empty'),
('checkout.product.items_summary', 'text', 'checkout', 'product', 'Order Items', 'Label for order items summary')
ON CONFLICT (content_key) DO NOTHING;

-- Add Portuguese translations
UPDATE public.content_translations SET portuguese_text = 'Informações de Checkout como Convidado' WHERE content_key = 'checkout.guest.title';
UPDATE public.content_translations SET portuguese_text = 'Complete a sua compra sem criar uma conta' WHERE content_key = 'checkout.guest.description';
UPDATE public.content_translations SET portuguese_text = 'Endereço de Email' WHERE content_key = 'checkout.guest.email';
UPDATE public.content_translations SET portuguese_text = 'Nome Completo' WHERE content_key = 'checkout.guest.name';
UPDATE public.content_translations SET portuguese_text = 'Número de Telefone' WHERE content_key = 'checkout.guest.phone';
UPDATE public.content_translations SET portuguese_text = 'Inclua o código do país (ex: +351 912 345 678)' WHERE content_key = 'checkout.guest.phone_hint';
UPDATE public.content_translations SET portuguese_text = 'Morada' WHERE content_key = 'checkout.guest.address';
UPDATE public.content_translations SET portuguese_text = 'Cidade' WHERE content_key = 'checkout.guest.city';
UPDATE public.content_translations SET portuguese_text = 'Código Postal' WHERE content_key = 'checkout.guest.postal_code';
UPDATE public.content_translations SET portuguese_text = 'País' WHERE content_key = 'checkout.guest.country';
UPDATE public.content_translations SET portuguese_text = 'Concordo com o processamento dos meus dados pessoais de acordo com a' WHERE content_key = 'checkout.guest.gdpr_consent';
UPDATE public.content_translations SET portuguese_text = 'Política de Privacidade' WHERE content_key = 'checkout.guest.privacy_policy';
UPDATE public.content_translations SET portuguese_text = 'Já tem uma conta?' WHERE content_key = 'checkout.guest.have_account';
UPDATE public.content_translations SET portuguese_text = 'Entrar' WHERE content_key = 'checkout.guest.login';

UPDATE public.content_translations SET portuguese_text = 'Este campo é obrigatório' WHERE content_key = 'checkout.validation.required';
UPDATE public.content_translations SET portuguese_text = 'Por favor, insira um endereço de email válido' WHERE content_key = 'checkout.validation.invalid_email';
UPDATE public.content_translations SET portuguese_text = 'Deve concordar com a política de privacidade para continuar' WHERE content_key = 'checkout.validation.gdpr_required';
UPDATE public.content_translations SET portuguese_text = 'Por favor, corrija os erros no formulário' WHERE content_key = 'checkout.validation.form_errors';

UPDATE public.content_translations SET portuguese_text = 'Checkout de Produtos' WHERE content_key = 'checkout.product.title';
UPDATE public.content_translations SET portuguese_text = 'O seu carrinho está vazio' WHERE content_key = 'checkout.product.cart_empty';
UPDATE public.content_translations SET portuguese_text = 'Itens do Pedido' WHERE content_key = 'checkout.product.items_summary';