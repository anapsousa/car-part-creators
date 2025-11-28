-- Add footer sections content keys for Help & Support, Useful Info, Newsletter, and Social Media
INSERT INTO public.content_translations (content_key, content_type, page, section, english_text, portuguese_text, description) VALUES
-- Help & Support Section
('footer.help.title', 'heading', 'footer', 'help', 'Help & Support', 'Ajuda & Suporte', 'Footer help and support section title'),
('footer.help.my_order', 'text', 'footer', 'help', 'My Order', 'A minha encomenda', 'Footer link to user orders'),
('footer.help.delivery', 'text', 'footer', 'help', 'Delivery & Shipping', 'Entrega e Envio', 'Footer link to delivery information'),
('footer.help.returns', 'text', 'footer', 'help', 'Returns & Refunds', 'Devoluções e Reembolsos', 'Footer link to returns policy'),
('footer.help.terms', 'text', 'footer', 'help', 'Terms & Conditions', 'Termos e Condições', 'Footer link to terms and conditions'),

-- Useful Info Section
('footer.info.title', 'heading', 'footer', 'info', 'Useful Information', 'Informação Útil', 'Footer useful information section title'),
('footer.info.complaints', 'text', 'footer', 'info', 'Complaints Book', 'Livro de Reclamações', 'Footer link to complaints book'),

-- Newsletter Section
('footer.newsletter.title', 'heading', 'footer', 'newsletter', 'Receive offers and discounts by email:', 'Receber ofertas e descontos por e-mail:', 'Footer newsletter section title'),
('footer.newsletter.description', 'text', 'footer', 'newsletter', 'Subscribe to our newsletter and stay updated with our incredible offers and latest news.', 'Assine a newsletter e fique por dentro de nossas ofertas incríveis e das últimas novidades.', 'Footer newsletter description text'),
('footer.newsletter.email_label', 'label', 'footer', 'newsletter', 'Email', 'Email', 'Footer newsletter email field label'),
('footer.newsletter.placeholder', 'placeholder', 'footer', 'newsletter', 'your@email.com', 'seu@email.com', 'Footer newsletter email placeholder'),
('footer.newsletter.consent', 'text', 'footer', 'newsletter', 'By confirming registration, you accept that your data will be processed by us, in accordance with the Data Protection Policy.', 'Ao confirmar o registo, aceitas que os teus dados sejam processados por nós, conforme a Política de Proteção de Dados.', 'Footer newsletter consent text'),
('footer.newsletter.button', 'button', 'footer', 'newsletter', 'Subscribe', 'Subscrever', 'Footer newsletter subscribe button'),
('footer.newsletter.success', 'text', 'footer', 'newsletter', 'Thank you for subscribing!', 'Obrigado por subscrever!', 'Footer newsletter success message'),

-- Social Media Section
('footer.social.title', 'heading', 'footer', 'social', 'Follow us!', 'Segue-nos!', 'Footer social media section title'),
('footer.social.instagram_url', 'url', 'footer', 'social', 'https://instagram.com/pompousweek', 'https://instagram.com/pompousweek', 'Footer Instagram URL'),
('footer.social.instagram_label', 'label', 'footer', 'social', 'Follow us on Instagram', 'Segue-nos no Instagram', 'Footer Instagram link label'),
('footer.social.youtube_url', 'url', 'footer', 'social', 'https://youtube.com/@pompousweek', 'https://youtube.com/@pompousweek', 'Footer YouTube URL'),
('footer.social.youtube_label', 'label', 'footer', 'social', 'Follow us on YouTube', 'Segue-nos no YouTube', 'Footer YouTube link label'),
('footer.social.facebook_url', 'url', 'footer', 'social', 'https://facebook.com/pompousweek', 'https://facebook.com/pompousweek', 'Footer Facebook URL'),
('footer.social.facebook_label', 'label', 'footer', 'social', 'Follow us on Facebook', 'Segue-nos no Facebook', 'Footer Facebook link label');