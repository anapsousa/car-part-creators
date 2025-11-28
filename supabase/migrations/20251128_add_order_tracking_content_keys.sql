-- Add order tracking content keys for dashboard orders section
INSERT INTO public.content_translations (content_key, content_type, page, section, english_text, portuguese_text, description) VALUES
-- Order Status Labels
('dashboard.orders.status.pending', 'text', 'dashboard', 'orders', 'Order Placed', 'Encomenda Efetuada', 'Dashboard order status label for pending status'),
('dashboard.orders.status.paid', 'text', 'dashboard', 'orders', 'Payment Confirmed', 'Pagamento Confirmado', 'Dashboard order status label for paid status'),
('dashboard.orders.status.shipped', 'text', 'dashboard', 'orders', 'Shipped', 'Enviado', 'Dashboard order status label for shipped status'),
('dashboard.orders.status.completed', 'text', 'dashboard', 'orders', 'Delivered', 'Entregue', 'Dashboard order status label for completed status'),
('dashboard.orders.status.cancelled', 'text', 'dashboard', 'orders', 'Cancelled', 'Cancelado', 'Dashboard order status label for cancelled status'),

-- Timeline Step Labels
('dashboard.orders.timeline.pending', 'text', 'dashboard', 'orders', 'Order Placed', 'Encomenda Efetuada', 'Dashboard order timeline label for pending step'),
('dashboard.orders.timeline.paid', 'text', 'dashboard', 'orders', 'Payment Confirmed', 'Pagamento Confirmado', 'Dashboard order timeline label for paid step'),
('dashboard.orders.timeline.shipped', 'text', 'dashboard', 'orders', 'In Transit', 'Em Trânsito', 'Dashboard order timeline label for shipped step'),
('dashboard.orders.timeline.completed', 'text', 'dashboard', 'orders', 'Delivered', 'Entregue', 'Dashboard order timeline label for completed step'),

-- Tracking Information
('dashboard.orders.tracking.title', 'heading', 'dashboard', 'orders', 'Order Tracking', 'Rastreamento da Encomenda', 'Dashboard order tracking section title'),
('dashboard.orders.tracking.number', 'label', 'dashboard', 'orders', 'Tracking Number', 'Número de Rastreamento', 'Dashboard tracking number label'),
('dashboard.orders.tracking.copy', 'button', 'dashboard', 'orders', 'Copy tracking number', 'Copiar número de rastreamento', 'Dashboard copy tracking number button text'),
('dashboard.orders.tracking.copied', 'text', 'dashboard', 'orders', 'Copied!', 'Copiado!', 'Dashboard tracking number copied confirmation'),
('dashboard.orders.tracking.estimated_delivery', 'label', 'dashboard', 'orders', 'Estimated Delivery', 'Entrega Estimada', 'Dashboard estimated delivery label'),
('dashboard.orders.tracking.no_tracking', 'text', 'dashboard', 'orders', 'Tracking number will be available once shipped', 'O número de rastreamento estará disponível após o envio', 'Dashboard no tracking number message'),

-- Order Details Section
('dashboard.orders.title', 'heading', 'dashboard', 'orders', 'Order History', 'Histórico de Encomendas', 'Dashboard order history section title'),
('dashboard.orders.description', 'text', 'dashboard', 'orders', 'Track your physical product orders', 'Acompanhe as suas encomendas de produtos físicos', 'Dashboard order history description'),
('dashboard.orders.empty', 'text', 'dashboard', 'orders', 'No orders yet', 'Ainda não há encomendas', 'Dashboard empty orders state message'),
('dashboard.orders.empty.cta', 'button', 'dashboard', 'orders', 'Browse Products', 'Ver Produtos', 'Dashboard empty orders call to action button'),
('dashboard.orders.items.title', 'heading', 'dashboard', 'orders', 'Order Items', 'Itens da Encomenda', 'Dashboard order items section title'),
('dashboard.orders.shipping.title', 'heading', 'dashboard', 'orders', 'Shipping Address', 'Morada de Envio', 'Dashboard shipping address section title'),
('dashboard.orders.total', 'label', 'dashboard', 'orders', 'Total', 'Total', 'Dashboard order total label'),
('dashboard.orders.order_id', 'label', 'dashboard', 'orders', 'Order ID', 'ID da Encomenda', 'Dashboard order ID label'),

-- Date Formatting
('dashboard.orders.placed_on', 'text', 'dashboard', 'orders', 'Placed on', 'Efetuada em', 'Dashboard order placed date prefix'),
('dashboard.orders.expected_by', 'text', 'dashboard', 'orders', 'Expected by', 'Prevista para', 'Dashboard estimated delivery date prefix');