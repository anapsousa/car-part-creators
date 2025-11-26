-- Add FAQ page support section translation keys
INSERT INTO public.content_translations (content_key, content_type, page, section, english_text, description) VALUES
('faq.support.title', 'heading', 'faq', 'support', 'Still Have Questions?', 'Support CTA section title on FAQ page'),
('faq.support.description', 'text', 'faq', 'support', 'Our support team is here to help', 'Support CTA section description on FAQ page'),
('faq.support.button', 'button', 'faq', 'support', 'Contact Support', 'Contact Support button text in support section');