-- Add returns refunds content keys for CMS internationalization
INSERT INTO public.content_translations (content_key, content_type, page, section, english_text, portuguese_text, description) VALUES
-- Header Section
('returns.header.pageTitle', 'heading', 'returns', 'header', 'Returns & Refunds', 'Devoluções e Reembolsos', 'Page title for returns and refunds'),
('returns.header.subtitle', 'text', 'returns', 'header', 'Return Policy', 'Política de Devoluções', 'Subtitle for returns header'),

-- Hero Section
('returns.hero.title', 'heading', 'returns', 'hero', 'Easy Returns & Refunds', 'Devoluções e Reembolsos Fáceis', 'Main hero title for returns page'),
('returns.hero.subtitle', 'text', 'returns', 'hero', 'We want you to be completely satisfied with your 3D printed products', 'Queremos que fique completamente satisfeito com os seus produtos impressos em 3D', 'Hero subtitle for returns page'),

-- Return Policy Section
('returns.policy.title', 'heading', 'returns', 'policy', 'Return Policy', 'Política de Devoluções', 'Return policy section title'),
('returns.policy.subtitle', 'text', 'returns', 'policy', 'Your rights', 'Os seus direitos', 'Return policy section subtitle'),
('returns.policy.period', 'text', 'returns', 'policy', '15-day return period from delivery date', 'Período de devolução de 15 dias a partir da data de entrega', 'Return period description'),
('returns.policy.condition', 'text', 'returns', 'policy', 'Products must be in original condition, unused, and in original packaging', 'Os produtos devem estar em condição original, não utilizados e na embalagem original', 'Return condition requirements'),
('returns.policy.applicable', 'text', 'returns', 'policy', 'Applies to all 3D printed car parts and home decor items', 'Aplica-se a todas as peças de automóvel e artigos de decoração impressos em 3D', 'Applicable products description'),
('returns.policy.custom_note', 'text', 'returns', 'policy', 'Custom AI-generated models may have different return conditions - contact us for details', 'Modelos personalizados gerados por IA podem ter condições de devolução diferentes - contacte-nos para detalhes', 'Custom models return note'),

-- Return Process Section
('returns.process.title', 'heading', 'returns', 'process', 'How to Return', 'Como Devolver', 'Return process section title'),
('returns.process.subtitle', 'text', 'returns', 'process', 'Step-by-step guide', 'Guia passo a passo', 'Return process section subtitle'),
('returns.process.step1', 'text', 'returns', 'process', 'Contact our support team via the contact form, selecting ''Returns & Refunds''', 'Contacte a nossa equipa de apoio através do formulário de contacto, selecionando ''Devoluções e Reembolsos''', 'Return process step 1'),
('returns.process.step2', 'text', 'returns', 'process', 'Receive return authorization and detailed instructions via email', 'Receba autorização de devolução e instruções detalhadas por email', 'Return process step 2'),
('returns.process.step3', 'text', 'returns', 'process', 'Pack items carefully in original packaging to prevent damage', 'Embale os artigos cuidadosamente na embalagem original para prevenir danos', 'Return process step 3'),
('returns.process.step4', 'text', 'returns', 'process', 'Ship with tracking number and keep proof of shipment', 'Envie com número de rastreamento e guarde prova de envio', 'Return process step 4'),
('returns.process.step5', 'text', 'returns', 'process', 'Receive confirmation and refund once we process your return', 'Receba confirmação e reembolso assim que processarmos a sua devolução', 'Return process step 5'),
('returns.process.shipping_costs', 'text', 'returns', 'process', 'Return shipping costs are the customer''s responsibility unless the item is defective or incorrect', 'Os custos de envio de devolução são da responsabilidade do cliente, a menos que o artigo seja defeituoso ou incorrecto', 'Return shipping costs note'),

-- Refund Timeline Section
('returns.refund.title', 'heading', 'returns', 'refund', 'Refund Process', 'Processo de Reembolso', 'Refund process section title'),
('returns.refund.subtitle', 'text', 'returns', 'refund', 'When will you receive your refund', 'Quando receberá o seu reembolso', 'Refund process section subtitle'),
('returns.refund.processing_time', 'text', 'returns', 'refund', 'Refunds are processed within 5-7 business days after receiving the returned item', 'Os reembolsos são processados dentro de 5-7 dias úteis após receber o artigo devolvido', 'Refund processing time'),
('returns.refund.method', 'text', 'returns', 'refund', 'Refunds are issued to the original payment method (credit card, MB Way, PayPal)', 'Os reembolsos são emitidos para o método de pagamento original (cartão de crédito, MB Way, PayPal)', 'Refund method description'),
('returns.refund.voucher_option', 'text', 'returns', 'refund', 'Alternatively, you can request a store voucher for the same amount', 'Alternativamente, pode solicitar um voucher da loja pelo mesmo montante', 'Voucher option description'),
('returns.refund.confirmation', 'text', 'returns', 'refund', 'You''ll receive an email confirmation once the refund is processed', 'Receberá uma confirmação por email assim que o reembolso for processado', 'Refund confirmation note'),

-- Damaged/Defective Items Section
('returns.damaged.title', 'heading', 'returns', 'damaged', 'Damaged or Defective Items', 'Artigos Danificados ou Defeituosos', 'Damaged items section title'),
('returns.damaged.subtitle', 'text', 'returns', 'damaged', 'We''re here to help', 'Estamos aqui para ajudar', 'Damaged items section subtitle'),
('returns.damaged.report', 'text', 'returns', 'damaged', 'If you receive a damaged or defective 3D printed item, contact us immediately', 'Se receber um artigo impresso em 3D danificado ou defeituoso, contacte-nos imediatamente', 'Damaged item report instruction'),
('returns.damaged.contact', 'text', 'returns', 'damaged', 'Use the contact form and select ''Returns & Refunds'' with photos of the issue', 'Utilize o formulário de contacto e selecione ''Devoluções e Reembolsos'' com fotos do problema', 'Damaged item contact instruction'),
('returns.damaged.replacement', 'text', 'returns', 'damaged', 'We''ll arrange a free replacement or full refund at no cost to you', 'Organizaremos uma substituição gratuita ou reembolso total sem custos para si', 'Replacement or refund offer'),
('returns.damaged.shipping_covered', 'text', 'returns', 'damaged', 'Return shipping costs are covered by us for damaged or defective items', 'Os custos de envio de devolução são cobertos por nós para artigos danificados ou defeituosos', 'Shipping costs coverage for damaged items'),

-- CTA Section
('returns.cta.title', 'heading', 'returns', 'cta', 'Need to Return Something?', 'Precisa de Devolver Algo?', 'CTA section title'),
('returns.cta.description', 'text', 'returns', 'cta', 'Our support team is ready to assist you with your return', 'A nossa equipa de apoio está pronta para o ajudar com a sua devolução', 'CTA section description'),
('returns.cta.button', 'text', 'returns', 'cta', 'Contact Support', 'Contactar Apoio', 'CTA button text');