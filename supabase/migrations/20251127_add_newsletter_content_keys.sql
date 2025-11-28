-- Add newsletter content keys for success, already subscribed, and error messages
INSERT INTO public.content_translations (content_key, content_type, page, section, language, content, description) VALUES
-- Success message
('footer.newsletter.success', 'text', 'footer', 'newsletter', 'en', 'Thank you for subscribing!', 'Footer newsletter success message shown after successful subscription'),
('footer.newsletter.success', 'text', 'footer', 'newsletter', 'pt', 'Obrigado por subscrever!', 'Footer newsletter success message shown after successful subscription'),

-- Already subscribed message
('footer.newsletter.already_subscribed', 'text', 'footer', 'newsletter', 'en', 'You are already subscribed to our newsletter.', 'Footer newsletter message shown when user tries to subscribe with an already subscribed email'),
('footer.newsletter.already_subscribed', 'text', 'footer', 'newsletter', 'pt', 'Já está subscrito à nossa newsletter.', 'Footer newsletter message shown when user tries to subscribe with an already subscribed email'),

-- Error message
('footer.newsletter.error', 'text', 'footer', 'newsletter', 'en', 'Failed to subscribe. Please try again.', 'Footer newsletter generic error message shown when subscription fails'),
('footer.newsletter.error', 'text', 'footer', 'newsletter', 'pt', 'Erro ao subscrever. Tente novamente.', 'Footer newsletter generic error message shown when subscription fails')
ON CONFLICT DO NOTHING;