-- Add delivery shipping content keys for CMS internationalization
INSERT INTO public.content_translations (content_key, content_type, page, section, english_text, portuguese_text, description) VALUES
-- Header Section
('delivery.header.pageTitle', 'heading', 'delivery', 'header', 'Delivery & Shipping', 'Entrega e Envio', 'Page title for delivery and shipping'),
('delivery.header.subtitle', 'text', 'delivery', 'header', 'Shipping Information', 'Informações de Envio', 'Subtitle for delivery header'),

-- Hero Section
('delivery.hero.title', 'heading', 'delivery', 'hero', 'Fast & Reliable Delivery', 'Entrega Rápida e Confiável', 'Main hero title for delivery page'),
('delivery.hero.subtitle', 'text', 'delivery', 'hero', 'Get your 3D printed parts delivered quickly and safely', 'Receba as suas peças impressas em 3D de forma rápida e segura', 'Hero subtitle for delivery page'),

-- Delivery Times Section
('delivery.times.title', 'heading', 'delivery', 'times', 'Delivery Times', 'Prazos de Entrega', 'Delivery times section title'),
('delivery.times.subtitle', 'text', 'delivery', 'times', 'When will you receive your order', 'Quando receberá a sua encomenda', 'Delivery times section subtitle'),
('delivery.times.portugal_continental', 'text', 'delivery', 'times', '24h/48h delivery to Portugal Continental for all 3D printed car parts and home decor items', 'Entrega em 24h/48h para Portugal Continental para todas as peças de automóvel e decoração impressas em 3D', 'Portugal Continental delivery description'),
('delivery.times.cutoff', 'text', 'delivery', 'times', 'Orders placed and paid before 15:45 are dispatched the same day', 'Encomendas feitas e pagas até às 15:45 são enviadas no mesmo dia', 'Order cutoff time description'),
('delivery.times.processing', 'text', 'delivery', 'times', 'Custom AI-generated models may require 1-2 additional days for processing and printing', 'Modelos personalizados gerados por IA podem requerer 1-2 dias adicionais para processamento e impressão', 'Processing time for custom models'),
('delivery.times.business_days', 'text', 'delivery', 'times', 'Delivery times are calculated in business days (Monday to Friday)', 'Os prazos de entrega são calculados em dias úteis (segunda a sexta-feira)', 'Business days calculation note'),

-- Shipping Costs Section
('delivery.costs.title', 'heading', 'delivery', 'costs', 'Shipping Costs', 'Custos de Envio', 'Shipping costs section title'),
('delivery.costs.subtitle', 'text', 'delivery', 'costs', 'Transparent pricing', 'Preços transparentes', 'Shipping costs section subtitle'),
('delivery.costs.portugal_standard', 'text', 'delivery', 'costs', 'Portugal Continental: €2.99 for standard delivery (1-5 business days)', 'Portugal Continental: €2,99 para entrega padrão (1-5 dias úteis)', 'Portugal Continental standard shipping cost'),
('delivery.costs.portugal_express', 'text', 'delivery', 'costs', 'Express delivery (24h/48h): €4.99 for urgent orders', 'Entrega expressa (24h/48h): €4,99 para encomendas urgentes', 'Portugal Continental express shipping cost'),
('delivery.costs.pickup', 'text', 'delivery', 'costs', 'Pickup point option: €1.99 (collect at your convenience)', 'Opção de ponto de recolha: €1,99 (recolha à sua conveniência)', 'Pickup point shipping cost'),
('delivery.costs.free_shipping', 'text', 'delivery', 'costs', 'Free shipping on orders over €50', 'Envio gratuito em encomendas acima de €50', 'Free shipping threshold'),
('delivery.costs.islands', 'text', 'delivery', 'costs', 'Azores and Madeira: Additional costs apply, calculated at checkout', 'Açores e Madeira: Custos adicionais aplicam-se, calculados no checkout', 'Islands shipping additional costs'),

-- Order Tracking Section
('delivery.tracking.title', 'heading', 'delivery', 'tracking', 'Order Tracking', 'Rastreamento de Encomendas', 'Order tracking section title'),
('delivery.tracking.subtitle', 'text', 'delivery', 'tracking', 'Follow your order', 'Acompanhe a sua encomenda', 'Order tracking section subtitle'),
('delivery.tracking.email', 'text', 'delivery', 'tracking', 'You''ll receive a shipping confirmation email with a tracking number when your 3D printed parts are dispatched', 'Receberá um email de confirmação de envio com um número de rastreamento quando as suas peças impressas em 3D forem enviadas', 'Tracking email notification'),
('delivery.tracking.dashboard', 'text', 'delivery', 'tracking', 'Track your order status in real-time through your user dashboard', 'Acompanhe o estado da sua encomenda em tempo real através do seu painel de utilizador', 'Real-time tracking via dashboard'),
('delivery.tracking.updates', 'text', 'delivery', 'tracking', 'Receive automatic updates via email at each delivery milestone', 'Receba atualizações automáticas por email em cada etapa da entrega', 'Automatic email updates'),
('delivery.tracking.estimated', 'text', 'delivery', 'tracking', 'Estimated delivery dates are provided at checkout and in your order confirmation', 'As datas estimadas de entrega são fornecidas no checkout e na confirmação da encomenda', 'Estimated delivery dates'),

-- International Shipping Section
('delivery.international.title', 'heading', 'delivery', 'international', 'International Shipping', 'Envio Internacional', 'International shipping section title'),
('delivery.international.subtitle', 'text', 'delivery', 'international', 'Worldwide delivery', 'Entrega mundial', 'International shipping section subtitle'),
('delivery.international.eu', 'text', 'delivery', 'international', 'European Union: 3-7 business days, starting at €9.99', 'União Europeia: 3-7 dias úteis, a partir de €9,99', 'EU shipping details'),
('delivery.international.europe', 'text', 'delivery', 'international', 'Rest of Europe: 5-10 business days, starting at €14.99', 'Resto da Europa: 5-10 dias úteis, a partir de €14,99', 'Rest of Europe shipping details'),
('delivery.international.worldwide', 'text', 'delivery', 'international', 'Worldwide shipping: 7-15 business days, costs calculated at checkout', 'Envio mundial: 7-15 dias úteis, custos calculados no checkout', 'Worldwide shipping details'),
('delivery.international.customs', 'text', 'delivery', 'international', 'International orders may be subject to customs duties and taxes in the destination country', 'Encomendas internacionais podem estar sujeitas a direitos aduaneiros e impostos no país de destino', 'Customs duties note'),
('delivery.international.contact', 'text', 'delivery', 'international', 'For large or custom orders, contact us for special shipping arrangements', 'Para encomendas grandes ou personalizadas, contacte-nos para acordos de envio especiais', 'Contact for special arrangements'),

-- CTA Section
('delivery.cta.title', 'heading', 'delivery', 'cta', 'Questions About Shipping?', 'Questões Sobre Envio?', 'CTA section title'),
('delivery.cta.description', 'text', 'delivery', 'cta', 'Our support team is here to help with any delivery questions', 'A nossa equipa de apoio está aqui para ajudar com quaisquer questões de entrega', 'CTA section description'),
('delivery.cta.button', 'text', 'delivery', 'cta', 'Contact Support', 'Contactar Apoio', 'CTA button text'),

-- Additional Info
('delivery.info.packaging', 'text', 'delivery', 'info', 'All 3D printed parts are carefully packaged to ensure safe delivery', 'Todas as peças impressas em 3D são cuidadosamente embaladas para garantir uma entrega segura', 'Packaging information'),
('delivery.info.quality', 'text', 'delivery', 'info', 'We use protective materials to prevent damage during shipping', 'Utilizamos materiais de proteção para prevenir danos durante o envio', 'Quality protection information');