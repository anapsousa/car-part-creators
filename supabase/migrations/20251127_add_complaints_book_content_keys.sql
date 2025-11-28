-- Add complaints book content keys for CMS internationalization
INSERT INTO public.content_translations (content_key, content_type, page, section, english_text, portuguese_text, description) VALUES
-- Header Section
('complaints.header.pageTitle', 'heading', 'complaints', 'header', 'Complaints Book', 'Livro de Reclamações', 'Page title for complaints book'),
('complaints.header.subtitle', 'text', 'complaints', 'header', 'Consumer Rights', 'Direitos do Consumidor', 'Subtitle for complaints header'),

-- Hero Section
('complaints.hero.title', 'heading', 'complaints', 'hero', 'Portuguese Complaints Book', 'Livro de Reclamações Português', 'Main hero title for complaints page'),
('complaints.hero.subtitle', 'text', 'complaints', 'hero', 'Your right to complain and be heard as a consumer', 'O seu direito de reclamar e ser ouvido como consumidor', 'Hero subtitle for complaints page'),

-- What is Section
('complaints.what.title', 'heading', 'complaints', 'what', 'What is the Livro de Reclamações?', 'O que é o Livro de Reclamações?', 'What is section title'),
('complaints.what.subtitle', 'text', 'complaints', 'what', 'Understanding your rights', 'Compreender os seus direitos', 'What is section subtitle'),
('complaints.what.description', 'text', 'complaints', 'what', 'The Complaints Book is a legal instrument in Portugal that protects consumer rights and regulates complaints about goods and services', 'O Livro de Reclamações é um instrumento legal em Portugal que protege os direitos do consumidor e regula reclamações sobre bens e serviços', 'What is section description'),
('complaints.what.legal_requirement', 'text', 'complaints', 'what', 'All businesses providing goods or services to consumers in Portugal are legally required to have a Complaints Book available', 'Todas as empresas que fornecem bens ou serviços a consumidores em Portugal são legalmente obrigadas a ter um Livro de Reclamações disponível', 'Legal requirement description'),
('complaints.what.purpose', 'text', 'complaints', 'what', 'It ensures businesses are accountable and consumer rights are protected through formal complaint channels', 'Garante que as empresas são responsabilizadas e os direitos do consumidor são protegidos através de canais formais de reclamação', 'Purpose description'),

-- Rights Section
('complaints.rights.title', 'heading', 'complaints', 'rights', 'Your Consumer Rights', 'Os Seus Direitos de Consumidor', 'Rights section title'),
('complaints.rights.subtitle', 'text', 'complaints', 'rights', 'What you need to know', 'O que precisa de saber', 'Rights section subtitle'),
('complaints.rights.right_to_complain', 'text', 'complaints', 'rights', 'You have the legal right to file a complaint about any product or service', 'Tem o direito legal de apresentar uma reclamação sobre qualquer produto ou serviço', 'Right to complain description'),
('complaints.rights.response_time', 'text', 'complaints', 'rights', 'Businesses must respond to your complaint within 15 working days', 'As empresas devem responder à sua reclamação dentro de 15 dias úteis', 'Response time description'),
('complaints.rights.authority', 'text', 'complaints', 'rights', 'Complaints are overseen by ASAE (Economic and Food Safety Authority)', 'As reclamações são supervisionadas pela ASAE (Autoridade de Segurança Alimentar e Económica)', 'Authority description'),

-- How To Section
('complaints.howto.title', 'heading', 'complaints', 'howto', 'How to File a Complaint', 'Como Apresentar uma Reclamação', 'How to section title'),
('complaints.howto.subtitle', 'text', 'complaints', 'howto', 'Step-by-step process', 'Processo passo a passo', 'How to section subtitle'),
('complaints.howto.step1', 'text', 'complaints', 'howto', 'Access the Electronic Complaints Book at www.livroreclamacoes.pt', 'Aceda ao Livro de Reclamações Eletrónico em www.livroreclamacoes.pt', 'Step 1 description'),
('complaints.howto.step2', 'text', 'complaints', 'howto', 'Click on ''Make a Complaint'' and fill in the required information', 'Clique em ''Fazer uma Reclamação'' e preencha as informações necessárias', 'Step 2 description'),
('complaints.howto.step3', 'text', 'complaints', 'howto', 'Provide our company details (listed below) and describe your complaint', 'Forneça os detalhes da nossa empresa (listados abaixo) e descreva a sua reclamação', 'Step 3 description'),
('complaints.howto.step4', 'text', 'complaints', 'howto', 'Submit your complaint - you''ll receive confirmation and we''ll respond within 15 days', 'Submeta a sua reclamação - receberá confirmação e responderemos dentro de 15 dias', 'Step 4 description'),
('complaints.howto.note', 'text', 'complaints', 'howto', 'Electronic complaints have the same legal validity as paper complaints', 'As reclamações eletrónicas têm a mesma validade legal que as reclamações em papel', 'Note description'),

-- Company Details Section
('complaints.company.title', 'heading', 'complaints', 'company', 'Pompousweek Company Details', 'Detalhes da Empresa Pompousweek', 'Company details section title'),
('complaints.company.subtitle', 'text', 'complaints', 'company', 'Information needed for complaints', 'Informação necessária para reclamações', 'Company details section subtitle'),
('complaints.company.name', 'text', 'complaints', 'company', 'Company Name: Pompousweek - 3D Printing Solutions', 'Nome da Empresa: Pompousweek - Soluções de Impressão 3D', 'Company name description'),
('complaints.company.nif', 'text', 'complaints', 'company', 'Tax ID (NIF): [To be provided]', 'NIF: [A fornecer]', 'Tax ID description'),
('complaints.company.address', 'text', 'complaints', 'company', 'Address: [Company address to be provided]', 'Morada: [Morada da empresa a fornecer]', 'Address description'),
('complaints.company.email', 'text', 'complaints', 'company', 'Email: support@pompousweek.com', 'Email: support@pompousweek.com', 'Email description'),
('complaints.company.phone', 'text', 'complaints', 'company', 'Phone: [To be provided]', 'Telefone: [A fornecer]', 'Phone description'),

-- CTA Section
('complaints.cta.title', 'heading', 'complaints', 'cta', 'File a Complaint', 'Apresentar uma Reclamação', 'CTA section title'),
('complaints.cta.description', 'text', 'complaints', 'cta', 'Access the official Electronic Complaints Book platform', 'Aceda à plataforma oficial do Livro de Reclamações Eletrónico', 'CTA section description'),
('complaints.cta.button', 'text', 'complaints', 'cta', 'Go to Livro de Reclamações', 'Ir para Livro de Reclamações', 'CTA button text');