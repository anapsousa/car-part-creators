-- Add terms conditions content keys for CMS internationalization
INSERT INTO public.content_translations (content_key, content_type, page, section, english_text, portuguese_text, description) VALUES
-- Header Section
('terms.header.pageTitle', 'heading', 'terms', 'header', 'Terms & Conditions', 'Termos e Condições', 'Page title for terms and conditions'),
('terms.header.subtitle', 'text', 'terms', 'header', 'Legal Information', 'Informações Legais', 'Subtitle for terms header'),

-- Hero Section
('terms.hero.title', 'heading', 'terms', 'hero', 'Terms and Conditions', 'Termos e Condições', 'Main hero title for terms page'),
('terms.hero.subtitle', 'text', 'terms', 'hero', 'Please read these terms carefully before using our services', 'Por favor, leia estes termos atentamente antes de utilizar os nossos serviços', 'Hero subtitle for terms page'),
('terms.hero.last_updated', 'text', 'terms', 'hero', 'Last updated: November 2024', 'Última atualização: Novembro 2024', 'Last updated date for terms'),

-- Introduction Section
('terms.intro.title', 'heading', 'terms', 'intro', 'Introduction', 'Introdução', 'Introduction section title'),
('terms.intro.paragraph1', 'text', 'terms', 'intro', 'At Pompousweek, we respect your privacy and are committed to protecting your personal data. By using our 3D printing services for car parts, home decor, and AI-generated models, you agree to the collection and use of information in accordance with this policy.', 'Na Pompousweek, respeitamos a sua privacidade e estamos comprometidos em proteger os seus dados pessoais. Ao utilizar os nossos serviços de impressão 3D para peças de automóvel, decoração para casa e modelos gerados por IA, concorda com a recolha e utilização de informações de acordo com esta política.', 'First paragraph of introduction'),
('terms.intro.paragraph2', 'text', 'terms', 'intro', 'We comply with the General Data Protection Regulation (GDPR) and Portuguese Law 67/98 on the Protection of Personal Data, ensuring your rights are protected at all times.', 'Cumprimos o Regulamento Geral de Proteção de Dados (RGPD) e a Lei Portuguesa 67/98 sobre a Proteção de Dados Pessoais, garantindo que os seus direitos são protegidos em todos os momentos.', 'Second paragraph of introduction'),

-- Privacy Section
('terms.privacy.title', 'heading', 'terms', 'privacy', 'Data Protection & Privacy', 'Proteção de Dados e Privacidade', 'Privacy section title'),
('terms.privacy.subtitle', 'text', 'terms', 'privacy', 'How we protect your information', 'Como protegemos as suas informações', 'Privacy section subtitle'),
('terms.privacy.company_info', 'text', 'terms', 'privacy', 'Pompousweek is a Portuguese company specializing in 3D printing services. Our registered address is [Company Address], Portugal, and we are committed to transparent data handling practices.', 'A Pompousweek é uma empresa portuguesa especializada em serviços de impressão 3D. A nossa morada registada é [Morada da Empresa], Portugal, e estamos comprometidos com práticas transparentes de tratamento de dados.', 'Company information for privacy'),
('terms.privacy.purpose', 'text', 'terms', 'privacy', 'We collect personal data to provide our 3D printing services, process orders, deliver products, and improve our AI model generation capabilities.', 'Recolhemos dados pessoais para fornecer os nossos serviços de impressão 3D, processar encomendas, entregar produtos e melhorar as nossas capacidades de geração de modelos por IA.', 'Purpose of data collection'),
('terms.privacy.security', 'text', 'terms', 'privacy', 'We implement industry-standard security measures including encryption, secure servers, and regular security audits to protect your data from unauthorized access.', 'Implementamos medidas de segurança padrão da indústria, incluindo encriptação, servidores seguros e auditorias de segurança regulares para proteger os seus dados contra acesso não autorizado.', 'Security measures description'),
('terms.privacy.compliance', 'text', 'terms', 'privacy', 'We are fully compliant with GDPR requirements and Portuguese data protection laws, ensuring lawful processing of personal data with appropriate safeguards.', 'Estamos totalmente em conformidade com os requisitos do RGPD e as leis portuguesas de proteção de dados, garantindo o tratamento lícito de dados pessoais com salvaguardas adequadas.', 'Legal compliance statement'),

-- Data Collection Section
('terms.data_collection.title', 'heading', 'terms', 'data_collection', 'Information We Collect', 'Informações que Recolhemos', 'Data collection section title'),
('terms.data_collection.subtitle', 'text', 'terms', 'data_collection', 'Types of data we collect', 'Tipos de dados que recolhemos', 'Data collection section subtitle'),
('terms.data_collection.account_data', 'text', 'terms', 'data_collection', 'Account information including name, email address, phone number, and tax identification number for order processing and communication.', 'Informações da conta incluindo nome, endereço de email, número de telefone e número de identificação fiscal para processamento de encomendas e comunicação.', 'Account data details'),
('terms.data_collection.billing_data', 'text', 'terms', 'data_collection', 'Billing information such as payment details, invoices, and shipping addresses required for transaction processing.', 'Informações de faturação como detalhes de pagamento, faturas e endereços de envio necessários para processamento de transações.', 'Billing data details'),
('terms.data_collection.order_data', 'text', 'terms', 'data_collection', 'Order history, preferences, and customization details for 3D printing services and AI model generation.', 'Histórico de encomendas, preferências e detalhes de personalização para serviços de impressão 3D e geração de modelos por IA.', 'Order data details'),
('terms.data_collection.technical_data', 'text', 'terms', 'data_collection', 'Technical data including IP address, browser information, and device details for website functionality and security.', 'Dados técnicos incluindo endereço IP, informações do navegador e detalhes do dispositivo para funcionalidade do website e segurança.', 'Technical data details'),

-- Data Usage Section
('terms.data_usage.title', 'heading', 'terms', 'data_usage', 'How We Use Your Information', 'Como Utilizamos as Suas Informações', 'Data usage section title'),
('terms.data_usage.service_provision', 'text', 'terms', 'data_usage', 'To provide 3D printing services, process orders, generate AI models, and deliver products to your specified address.', 'Para fornecer serviços de impressão 3D, processar encomendas, gerar modelos por IA e entregar produtos no seu endereço especificado.', 'Service provision usage'),
('terms.data_usage.communication', 'text', 'terms', 'data_usage', 'To send order confirmations, delivery updates, and customer support communications regarding your 3D printing projects.', 'Para enviar confirmações de encomendas, atualizações de entrega e comunicações de apoio ao cliente relativamente aos seus projetos de impressão 3D.', 'Communication usage'),
('terms.data_usage.improvement', 'text', 'terms', 'data_usage', 'To analyze usage patterns, improve our AI generation algorithms, and enhance the quality of our 3D printing services.', 'Para analisar padrões de utilização, melhorar os nossos algoritmos de geração por IA e aumentar a qualidade dos nossos serviços de impressão 3D.', 'Service improvement usage'),
('terms.data_usage.marketing', 'text', 'terms', 'data_usage', 'To send promotional offers and updates about new 3D printing materials or AI features, only with your explicit consent.', 'Para enviar ofertas promocionais e atualizações sobre novos materiais de impressão 3D ou funcionalidades de IA, apenas com o seu consentimento explícito.', 'Marketing usage with consent'),

-- User Rights Section
('terms.user_rights.title', 'heading', 'terms', 'user_rights', 'Your Rights (GDPR)', 'Os Seus Direitos (RGPD)', 'User rights section title'),
('terms.user_rights.subtitle', 'text', 'terms', 'user_rights', 'Rights you have regarding your data', 'Direitos que tem relativamente aos seus dados', 'User rights section subtitle'),
('terms.user_rights.access', 'text', 'terms', 'user_rights', 'Right to access: You can request a copy of the personal data we hold about you.', 'Direito de acesso: Pode solicitar uma cópia dos dados pessoais que detemos sobre si.', 'Right to access description'),
('terms.user_rights.rectification', 'text', 'terms', 'user_rights', 'Right to rectification: You can request correction of inaccurate or incomplete personal data.', 'Direito de retificação: Pode solicitar a correção de dados pessoais inexatos ou incompletos.', 'Right to rectification description'),
('terms.user_rights.erasure', 'text', 'terms', 'user_rights', 'Right to erasure: You can request deletion of your personal data in certain circumstances.', 'Direito ao apagamento: Pode solicitar a eliminação dos seus dados pessoais em certas circunstâncias.', 'Right to erasure description'),
('terms.user_rights.portability', 'text', 'terms', 'user_rights', 'Right to data portability: You can request your data in a structured format for transfer to another service.', 'Direito à portabilidade: Pode solicitar os seus dados num formato estruturado para transferência para outro serviço.', 'Right to portability description'),
('terms.user_rights.objection', 'text', 'terms', 'user_rights', 'Right to object: You can object to processing of your data for direct marketing or profiling purposes.', 'Direito de oposição: Pode opor-se ao tratamento dos seus dados para fins de marketing direto ou perfilamento.', 'Right to object description'),
('terms.user_rights.withdraw', 'text', 'terms', 'user_rights', 'Right to withdraw consent: You can withdraw consent for data processing at any time.', 'Direito de retirada do consentimento: Pode retirar o consentimento para o tratamento de dados a qualquer momento.', 'Right to withdraw consent description'),

-- Cookies Section
('terms.cookies.title', 'heading', 'terms', 'cookies', 'Cookies Policy', 'Política de Cookies', 'Cookies section title'),
('terms.cookies.subtitle', 'text', 'terms', 'cookies', 'How we use cookies', 'Como utilizamos cookies', 'Cookies section subtitle'),
('terms.cookies.description', 'text', 'terms', 'cookies', 'We use cookies to enhance your experience on our 3D printing platform, remember your preferences, and analyze website usage.', 'Utilizamos cookies para melhorar a sua experiência na nossa plataforma de impressão 3D, recordar as suas preferências e analisar a utilização do website.', 'Cookie usage description'),
('terms.cookies.types', 'text', 'terms', 'cookies', 'Essential cookies for website functionality, analytics cookies for usage insights, and marketing cookies for personalized offers (with consent).', 'Cookies essenciais para a funcionalidade do website, cookies analíticos para insights de utilização e cookies de marketing para ofertas personalizadas (com consentimento).', 'Types of cookies used'),
('terms.cookies.control', 'text', 'terms', 'cookies', 'You can control cookie settings through your browser preferences or our cookie consent banner.', 'Pode controlar as definições de cookies através das preferências do seu navegador ou do nosso banner de consentimento de cookies.', 'How to control cookies'),

-- Data Retention Section
('terms.retention.title', 'heading', 'terms', 'retention', 'Data Retention', 'Retenção de Dados', 'Data retention section title'),
('terms.retention.description', 'text', 'terms', 'retention', 'We retain personal data for as long as necessary to provide our services, comply with legal obligations, and resolve disputes. Account data is kept for 7 years for tax purposes, while order data is retained for 5 years.', 'Retemos dados pessoais durante o tempo necessário para fornecer os nossos serviços, cumprir obrigações legais e resolver disputas. Os dados da conta são mantidos por 7 anos para fins fiscais, enquanto os dados de encomendas são retidos por 5 anos.', 'Data retention policy'),

-- Third Party Section
('terms.third_party.title', 'heading', 'terms', 'third_party', 'Third Party Sharing', 'Partilha com Terceiros', 'Third party section title'),
('terms.third_party.description', 'text', 'terms', 'third_party', 'We share data with shipping companies for delivery, payment processors for transactions, and do not sell personal data to third parties. All partners are GDPR compliant.', 'Partilhamos dados com empresas de envio para entrega, processadores de pagamentos para transações, e não vendemos dados pessoais a terceiros. Todos os parceiros estão em conformidade com o RGPD.', 'Third party sharing policy'),

-- Contact Section
('terms.contact.title', 'heading', 'terms', 'contact', 'Contact Us', 'Contacte-nos', 'Contact section title'),
('terms.contact.subtitle', 'text', 'terms', 'contact', 'Exercise your rights', 'Exerça os seus direitos', 'Contact section subtitle'),
('terms.contact.email', 'text', 'terms', 'contact', 'support@pompousweek.com', 'support@pompousweek.com', 'Contact email'),
('terms.contact.address', 'text', 'terms', 'contact', 'Pompousweek, [Company Address], Portugal', 'Pompousweek, [Morada da Empresa], Portugal', 'Company address'),
('terms.contact.phone', 'text', 'terms', 'contact', '+351 [Phone Number]', '+351 [Número de Telefone]', 'Contact phone'),
('terms.contact.rights_form', 'text', 'terms', 'contact', 'Use our online form at [rights form URL] to exercise your GDPR rights', 'Utilize o nosso formulário online em [URL do formulário de direitos] para exercer os seus direitos do RGPD', 'Link to rights exercise form');