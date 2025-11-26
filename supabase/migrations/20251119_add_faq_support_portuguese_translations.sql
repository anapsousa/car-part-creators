-- Add Portuguese translations for FAQ support section
UPDATE public.content_translations SET portuguese_text = 'Ainda tem questões?' WHERE content_key = 'faq.support.title';
UPDATE public.content_translations SET portuguese_text = 'A nossa equipa de apoio está aqui para ajudar' WHERE content_key = 'faq.support.description';
UPDATE public.content_translations SET portuguese_text = 'Contactar Apoio' WHERE content_key = 'faq.support.button';