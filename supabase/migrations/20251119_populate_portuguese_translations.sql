-- Populate Portuguese translations for all content keys based on pt.json reference and consistent translation style

-- Navigation section
UPDATE public.content_translations SET portuguese_text = 'Início' WHERE content_key = 'nav.home';
UPDATE public.content_translations SET portuguese_text = 'Loja' WHERE content_key = 'nav.shop';
UPDATE public.content_translations SET portuguese_text = 'Gerador' WHERE content_key = 'nav.generator';
UPDATE public.content_translations SET portuguese_text = 'Sobre' WHERE content_key = 'nav.about';
UPDATE public.content_translations SET portuguese_text = 'Contacto' WHERE content_key = 'nav.contact';
UPDATE public.content_translations SET portuguese_text = 'Perguntas Frequentes' WHERE content_key = 'nav.faq';
UPDATE public.content_translations SET portuguese_text = 'Carrinho' WHERE content_key = 'nav.cart';
UPDATE public.content_translations SET portuguese_text = 'Favoritos' WHERE content_key = 'nav.wishlist';
UPDATE public.content_translations SET portuguese_text = 'Entrar' WHERE content_key = 'nav.login';
UPDATE public.content_translations SET portuguese_text = 'Sair' WHERE content_key = 'nav.logout';
UPDATE public.content_translations SET portuguese_text = 'Painel' WHERE content_key = 'nav.dashboard';
UPDATE public.content_translations SET portuguese_text = 'Painel de Administração' WHERE content_key = 'nav.admin_dashboard';

-- Home page section
UPDATE public.content_translations SET portuguese_text = 'Transforme as Suas Ideias em Realidade 3D' WHERE content_key = 'home.hero.title';
UPDATE public.content_translations SET portuguese_text = 'Geração de modelos 3D com inteligência artificial para peças de automóvel personalizadas e decorações para casa. Desenhe, personalize e dê vida à sua visão.' WHERE content_key = 'home.hero.subtitle';
UPDATE public.content_translations SET portuguese_text = 'Começar a Criar' WHERE content_key = 'home.hero.cta';
UPDATE public.content_translations SET portuguese_text = '5000+' WHERE content_key = 'home.stats.parts_printed.number';
UPDATE public.content_translations SET portuguese_text = 'Peças Impressas' WHERE content_key = 'home.stats.parts_printed.label';
UPDATE public.content_translations SET portuguese_text = '98%' WHERE content_key = 'home.stats.satisfaction.number';
UPDATE public.content_translations SET portuguese_text = 'Taxa de Satisfação' WHERE content_key = 'home.stats.satisfaction.label';
UPDATE public.content_translations SET portuguese_text = '48h' WHERE content_key = 'home.stats.turnaround.number';
UPDATE public.content_translations SET portuguese_text = 'Entrega Rápida' WHERE content_key = 'home.stats.turnaround.label';
UPDATE public.content_translations SET portuguese_text = 'Peças Disponíveis' WHERE content_key = 'home.features.available_parts.title';
UPDATE public.content_translations SET portuguese_text = 'Desde componentes do painel até puxadores de portas, especializamo-nos em peças difíceis de encontrar' WHERE content_key = 'home.features.available_parts.description';
UPDATE public.content_translations SET portuguese_text = 'Garantia de Qualidade' WHERE content_key = 'home.features.quality.title';
UPDATE public.content_translations SET portuguese_text = 'Materiais premium e fabrico preciso garantem ajuste perfeito e durabilidade' WHERE content_key = 'home.features.quality.description';
UPDATE public.content_translations SET portuguese_text = 'Apoio Especializado' WHERE content_key = 'home.features.support.title';
UPDATE public.content_translations SET portuguese_text = 'A nossa equipa ajuda-o a encontrar a peça exata para a sua restauração de veículo clássico' WHERE content_key = 'home.features.support.description';
UPDATE public.content_translations SET portuguese_text = 'Como Funciona' WHERE content_key = 'home.how_it_works.title';
UPDATE public.content_translations SET portuguese_text = 'Explorar o Nosso Catálogo' WHERE content_key = 'home.how_it_works.step1.title';
UPDATE public.content_translations SET portuguese_text = 'Procure a nossa coleção extensa de peças de automóveis clássicos e decorações para casa' WHERE content_key = 'home.how_it_works.step1.description';
UPDATE public.content_translations SET portuguese_text = 'Faça a Sua Encomenda' WHERE content_key = 'home.how_it_works.step2.title';
UPDATE public.content_translations SET portuguese_text = 'Selecione a sua peça, especifique quaisquer personalizações, e complete o checkout' WHERE content_key = 'home.how_it_works.step2.description';
UPDATE public.content_translations SET portuguese_text = 'Receba a Sua Peça' WHERE content_key = 'home.how_it_works.step3.title';
UPDATE public.content_translations SET portuguese_text = 'Imprimimos em 3D e entregamos a sua peça com garantia de qualidade' WHERE content_key = 'home.how_it_works.step3.description';
UPDATE public.content_translations SET portuguese_text = 'Especialização em Clássicos' WHERE content_key = 'home.usp.vintage.title';
UPDATE public.content_translations SET portuguese_text = 'Especializados em peças de automóveis clássicos da era 1950-1980' WHERE content_key = 'home.usp.vintage.description';
UPDATE public.content_translations SET portuguese_text = 'Decoração Personalizada para Casa' WHERE content_key = 'home.usp.decor.title';
UPDATE public.content_translations SET portuguese_text = 'Transforme o seu espaço com peças decorativas inspiradas em automóveis' WHERE content_key = 'home.usp.decor.description';
UPDATE public.content_translations SET portuguese_text = 'Geração com IA' WHERE content_key = 'home.usp.ai.title';
UPDATE public.content_translations SET portuguese_text = 'Use a nossa IA avançada para gerar modelos 3D personalizados a partir de descrições' WHERE content_key = 'home.usp.ai.description';
UPDATE public.content_translations SET portuguese_text = 'Qualidade Premium' WHERE content_key = 'home.usp.quality.title';
UPDATE public.content_translations SET portuguese_text = 'Materiais de nível profissional e fabrico de precisão' WHERE content_key = 'home.usp.quality.description';
UPDATE public.content_translations SET portuguese_text = 'Comece a Sua Jornada de Restauração' WHERE content_key = 'home.cta.title';
UPDATE public.content_translations SET portuguese_text = 'Explore o nosso catálogo de peças autênticas ou gere designs personalizados' WHERE content_key = 'home.cta.description';
UPDATE public.content_translations SET portuguese_text = 'Explorar Catálogo' WHERE content_key = 'home.cta.button';

-- Shop page section
UPDATE public.content_translations SET portuguese_text = 'Explorar os Nossos Produtos' WHERE content_key = 'shop.hero.title';
UPDATE public.content_translations SET portuguese_text = 'Descubra a nossa coleção de peças impressas em 3D e decorações personalizadas' WHERE content_key = 'shop.hero.subtitle';
UPDATE public.content_translations SET portuguese_text = 'Pesquisar produtos...' WHERE content_key = 'shop.search.placeholder';
UPDATE public.content_translations SET portuguese_text = 'Todos' WHERE content_key = 'shop.category.all';
UPDATE public.content_translations SET portuguese_text = 'Peças de Automóvel' WHERE content_key = 'shop.category.car_parts';
UPDATE public.content_translations SET portuguese_text = 'Decoração para Casa' WHERE content_key = 'shop.category.home_decor';
UPDATE public.content_translations SET portuguese_text = 'Designs Personalizados' WHERE content_key = 'shop.category.custom';
UPDATE public.content_translations SET portuguese_text = 'Não foram encontrados produtos que correspondam aos seus critérios.' WHERE content_key = 'shop.no_products';

-- FAQ page section
UPDATE public.content_translations SET portuguese_text = 'Como Podemos Ajudá-lo?' WHERE content_key = 'faq.hero.title';
UPDATE public.content_translations SET portuguese_text = 'Encontre respostas para questões comuns sobre o nosso serviço de geração de modelos 3D' WHERE content_key = 'faq.hero.subtitle';
UPDATE public.content_translations SET portuguese_text = 'Perguntas Frequentes' WHERE content_key = 'faq.section.title';
UPDATE public.content_translations SET portuguese_text = 'Tudo o que precisa de saber sobre o nosso serviço' WHERE content_key = 'faq.section.description';
UPDATE public.content_translations SET portuguese_text = 'Que formatos de ficheiro fornecem?' WHERE content_key = 'faq.q1.question';
UPDATE public.content_translations SET portuguese_text = 'Geramos ficheiros STL e BLEND para todos os modelos 3D. Os ficheiros STL estão prontos para impressão 3D, enquanto os ficheiros BLEND podem ser editados no Blender.' WHERE content_key = 'faq.q1.answer';
UPDATE public.content_translations SET portuguese_text = 'Quanto tempo demora a gerar um modelo?' WHERE content_key = 'faq.q2.question';
UPDATE public.content_translations SET portuguese_text = 'A maioria dos modelos é gerada em 2-5 minutos. Designs complexos podem demorar até 10 minutos. Receberá uma notificação quando o seu modelo estiver pronto.' WHERE content_key = 'faq.q2.answer';
UPDATE public.content_translations SET portuguese_text = 'Posso personalizar as dimensões?' WHERE content_key = 'faq.q3.question';
UPDATE public.content_translations SET portuguese_text = 'Sim! Pode especificar dimensões personalizadas de largura, altura e profundidade ao criar o seu modelo. Também oferecemos tamanhos predefinidos para casos de uso comuns.' WHERE content_key = 'faq.q3.answer';
UPDATE public.content_translations SET portuguese_text = 'Que métodos de pagamento aceitam?' WHERE content_key = 'faq.q4.question';
UPDATE public.content_translations SET portuguese_text = 'Aceitamos MB Way, PayPal e principais cartões de crédito. Todos os pagamentos são processados de forma segura.' WHERE content_key = 'faq.q4.answer';
UPDATE public.content_translations SET portuguese_text = 'Posso solicitar revisões ao meu modelo?' WHERE content_key = 'faq.q5.question';
UPDATE public.content_translations SET portuguese_text = 'Sim! Após receber o seu modelo inicial, pode solicitar modificações. Podem aplicar-se encargos adicionais para redesenhos maiores.' WHERE content_key = 'faq.q5.answer';
UPDATE public.content_translations SET portuguese_text = 'Que materiais posso escolher?' WHERE content_key = 'faq.q6.question';
UPDATE public.content_translations SET portuguese_text = 'Otimizamos modelos para materiais PLA, ABS, PETG, Resin e TPU. Cada material tem propriedades diferentes adequadas para várias aplicações.' WHERE content_key = 'faq.q6.answer';
UPDATE public.content_translations SET portuguese_text = 'Oferecem reembolsos?' WHERE content_key = 'faq.q7.question';
UPDATE public.content_translations SET portuguese_text = 'Oferecemos reembolsos dentro de 7 dias se não estiver satisfeito com o seu modelo e ainda não descarregou os ficheiros. Contacte o apoio para assistência.' WHERE content_key = 'faq.q7.answer';
UPDATE public.content_translations SET portuguese_text = 'Como uso os ficheiros gerados?' WHERE content_key = 'faq.q8.question';
UPDATE public.content_translations SET portuguese_text = 'Descarregue o ficheiro STL e importe-o no seu software de slicing preferido (como Cura ou PrusaSlicer) para prepará-lo para impressão. Os ficheiros BLEND podem ser editados no Blender.' WHERE content_key = 'faq.q8.answer';

-- Contact page section
UPDATE public.content_translations SET portuguese_text = 'Vamos Conectar' WHERE content_key = 'contact.hero.title';
UPDATE public.content_translations SET portuguese_text = 'Tem uma questão ou precisa de apoio? Estamos aqui para o ajudar a criar modelos 3D incríveis' WHERE content_key = 'contact.hero.subtitle';
UPDATE public.content_translations SET portuguese_text = 'Email' WHERE content_key = 'contact.info.email.title';
UPDATE public.content_translations SET portuguese_text = 'support@pompousweek.com' WHERE content_key = 'contact.info.email.value';
UPDATE public.content_translations SET portuguese_text = 'Chat ao Vivo' WHERE content_key = 'contact.info.chat.title';
UPDATE public.content_translations SET portuguese_text = 'Disponível das 9h às 18h GMT' WHERE content_key = 'contact.info.chat.value';
UPDATE public.content_translations SET portuguese_text = 'Tempo de Resposta' WHERE content_key = 'contact.info.response.title';
UPDATE public.content_translations SET portuguese_text = 'Dentro de 24/48 horas' WHERE content_key = 'contact.info.response.value';
UPDATE public.content_translations SET portuguese_text = 'Envie-nos uma Mensagem' WHERE content_key = 'contact.form.title';
UPDATE public.content_translations SET portuguese_text = 'Preencha o formulário abaixo e entraremos em contacto consigo o mais breve possível' WHERE content_key = 'contact.form.description';
UPDATE public.content_translations SET portuguese_text = 'Nome' WHERE content_key = 'contact.form.name';
UPDATE public.content_translations SET portuguese_text = 'O seu nome' WHERE content_key = 'contact.form.name.placeholder';
UPDATE public.content_translations SET portuguese_text = 'Email' WHERE content_key = 'contact.form.email';
UPDATE public.content_translations SET portuguese_text = 'o.seu.email@exemplo.com' WHERE content_key = 'contact.form.email.placeholder';
UPDATE public.content_translations SET portuguese_text = 'Assunto' WHERE content_key = 'contact.form.subject';
UPDATE public.content_translations SET portuguese_text = 'Sobre o que se trata?' WHERE content_key = 'contact.form.subject.placeholder';
UPDATE public.content_translations SET portuguese_text = 'Mensagem' WHERE content_key = 'contact.form.message';
UPDATE public.content_translations SET portuguese_text = 'Conte-nos mais sobre o seu pedido...' WHERE content_key = 'contact.form.message.placeholder';
UPDATE public.content_translations SET portuguese_text = 'Enviar Mensagem' WHERE content_key = 'contact.form.send';
UPDATE public.content_translations SET portuguese_text = 'A enviar...' WHERE content_key = 'contact.form.sending';
UPDATE public.content_translations SET portuguese_text = 'Mensagem enviada com sucesso! Entraremos em contacto em breve.' WHERE content_key = 'contact.form.success';

-- About page section
UPDATE public.content_translations SET portuguese_text = 'Empoderando Criadores' WHERE content_key = 'about.hero.title';
UPDATE public.content_translations SET portuguese_text = 'Estamos numa missão para democratizar o design 3D e tornar a fabricação personalizada acessível a todos' WHERE content_key = 'about.hero.subtitle';
UPDATE public.content_translations SET portuguese_text = 'A Nossa História' WHERE content_key = 'about.story.title';
UPDATE public.content_translations SET portuguese_text = 'Como tudo começou' WHERE content_key = 'about.story.subtitle';
UPDATE public.content_translations SET portuguese_text = 'Fundada em 2021, a Pompousweek começou com uma ideia simples em torno da Garantia de Qualidade. Depois decidimos crescer como empresa e tivemos esta ideia: e se qualquer pessoa pudesse criar modelos 3D de qualidade profissional sem anos de formação em CAD? Vimos o surgimento da impressão 3D e da tecnologia de IA convergindo, criando uma oportunidade única para preencher a lacuna entre imaginação e realidade.' WHERE content_key = 'about.story.paragraph1';
UPDATE public.content_translations SET portuguese_text = 'A nossa equipa de engenheiros, designers e especialistas em IA juntou-se para construir uma plataforma que entende as suas necessidades e as traduz em modelos 3D prontos para impressão. Quer seja um entusiasta DIY a criar peças de automóvel personalizadas ou um designer a criar decorações únicas para casa, estamos aqui para o ajudar a dar vida às suas ideias.' WHERE content_key = 'about.story.paragraph2';
UPDATE public.content_translations SET portuguese_text = 'Hoje, orgulhamo-nos de servir uma comunidade crescente de makers, entusiastas DIY e designers profissionais que usam a nossa plataforma para criar tudo, desde protótipos funcionais até obras de arte.' WHERE content_key = 'about.story.paragraph3';
UPDATE public.content_translations SET portuguese_text = 'Os Nossos Valores' WHERE content_key = 'about.values.heading';
UPDATE public.content_translations SET portuguese_text = 'O que nos impulsiona todos os dias' WHERE content_key = 'about.values.subtitle';
UPDATE public.content_translations SET portuguese_text = 'Inovação' WHERE content_key = 'about.values.innovation.title';
UPDATE public.content_translations SET portuguese_text = 'Aproveitando a tecnologia de IA de ponta para tornar o modelação 3D acessível a todos' WHERE content_key = 'about.values.innovation.description';
UPDATE public.content_translations SET portuguese_text = 'Qualidade' WHERE content_key = 'about.values.quality.title';
UPDATE public.content_translations SET portuguese_text = 'Entregando modelos de alta qualidade, prontos para impressão, que cumprem padrões profissionais' WHERE content_key = 'about.values.quality.description';
UPDATE public.content_translations SET portuguese_text = 'Comunidade' WHERE content_key = 'about.values.community.title';
UPDATE public.content_translations SET portuguese_text = 'Construindo uma comunidade de makers, designers e entusiastas da impressão 3D' WHERE content_key = 'about.values.community.description';
UPDATE public.content_translations SET portuguese_text = 'Paixão' WHERE content_key = 'about.values.passion.title';
UPDATE public.content_translations SET portuguese_text = 'Impulsionados pelo nosso amor pela inovação, design e ajudar os outros a criar' WHERE content_key = 'about.values.passion.description';

-- Generator page section
UPDATE public.content_translations SET portuguese_text = 'Crie o Seu Modelo 3D' WHERE content_key = 'generator.form.title';
UPDATE public.content_translations SET portuguese_text = 'Descreva a sua visão e deixe a nossa IA dar-lhe vida' WHERE content_key = 'generator.form.subtitle';

-- Cart page section
UPDATE public.content_translations SET portuguese_text = 'Carrinho de Compras' WHERE content_key = 'cart.title';
UPDATE public.content_translations SET portuguese_text = 'Os Seus Artigos' WHERE content_key = 'cart.subtitle';
UPDATE public.content_translations SET portuguese_text = 'O Seu Carrinho Está Vazio' WHERE content_key = 'cart.empty.title';
UPDATE public.content_translations SET portuguese_text = 'Adicione alguns produtos para começar' WHERE content_key = 'cart.empty.description';
UPDATE public.content_translations SET portuguese_text = 'Explorar Produtos' WHERE content_key = 'cart.empty.button';
UPDATE public.content_translations SET portuguese_text = 'artigos' WHERE content_key = 'cart.items_count';
UPDATE public.content_translations SET portuguese_text = 'Resumo do Pedido' WHERE content_key = 'cart.summary.title';
UPDATE public.content_translations SET portuguese_text = 'Subtotal' WHERE content_key = 'cart.summary.subtotal';
UPDATE public.content_translations SET portuguese_text = 'Envio' WHERE content_key = 'cart.summary.shipping';
UPDATE public.content_translations SET portuguese_text = 'Calculado no checkout' WHERE content_key = 'cart.summary.shipping_calculated';
UPDATE public.content_translations SET portuguese_text = 'Total' WHERE content_key = 'cart.summary.total';
UPDATE public.content_translations SET portuguese_text = 'Proceder ao Pagamento' WHERE content_key = 'cart.checkout_button';

-- Wishlist page section
UPDATE public.content_translations SET portuguese_text = 'A Minha Lista de Favoritos' WHERE content_key = 'wishlist.title';
UPDATE public.content_translations SET portuguese_text = 'Os Seus Artigos Guardados' WHERE content_key = 'wishlist.subtitle';
UPDATE public.content_translations SET portuguese_text = 'Produtos' WHERE content_key = 'wishlist.tabs.products';
UPDATE public.content_translations SET portuguese_text = 'Designs' WHERE content_key = 'wishlist.tabs.designs';
UPDATE public.content_translations SET portuguese_text = 'Ainda não há produtos na sua lista de favoritos' WHERE content_key = 'wishlist.products.empty';
UPDATE public.content_translations SET portuguese_text = 'Explorar Produtos' WHERE content_key = 'wishlist.products.browse';
UPDATE public.content_translations SET portuguese_text = 'Ainda não há designs na sua lista de favoritos' WHERE content_key = 'wishlist.designs.empty';
UPDATE public.content_translations SET portuguese_text = 'Gerar Designs' WHERE content_key = 'wishlist.designs.generate';
UPDATE public.content_translations SET portuguese_text = 'Adicionar ao Carrinho' WHERE content_key = 'wishlist.add_to_cart';
UPDATE public.content_translations SET portuguese_text = 'Esgotado' WHERE content_key = 'wishlist.out_of_stock';
UPDATE public.content_translations SET portuguese_text = 'Descarregar STL' WHERE content_key = 'wishlist.download_stl';
UPDATE public.content_translations SET portuguese_text = 'Criado' WHERE content_key = 'wishlist.created';

-- Auth page section
UPDATE public.content_translations SET portuguese_text = 'Gerador de Modelos 3D' WHERE content_key = 'auth.title';
UPDATE public.content_translations SET portuguese_text = 'Bem-vindo de volta! Faça login para continuar.' WHERE content_key = 'auth.login.subtitle';
UPDATE public.content_translations SET portuguese_text = 'Crie uma conta para começar a gerar modelos 3D.' WHERE content_key = 'auth.signup.subtitle';
UPDATE public.content_translations SET portuguese_text = 'Email' WHERE content_key = 'auth.email';
UPDATE public.content_translations SET portuguese_text = 'voce@exemplo.com' WHERE content_key = 'auth.email.placeholder';
UPDATE public.content_translations SET portuguese_text = 'Palavra-passe' WHERE content_key = 'auth.password';
UPDATE public.content_translations SET portuguese_text = '••••••••' WHERE content_key = 'auth.password.placeholder';
UPDATE public.content_translations SET portuguese_text = 'Entrar' WHERE content_key = 'auth.login.button';
UPDATE public.content_translations SET portuguese_text = 'Criar Conta' WHERE content_key = 'auth.signup.button';
UPDATE public.content_translations SET portuguese_text = 'A entrar...' WHERE content_key = 'auth.login.loading';
UPDATE public.content_translations SET portuguese_text = 'A criar conta...' WHERE content_key = 'auth.signup.loading';
UPDATE public.content_translations SET portuguese_text = 'Precisa de uma conta? Registe-se' WHERE content_key = 'auth.switch.to_signup';
UPDATE public.content_translations SET portuguese_text = 'Já tem uma conta? Entre' WHERE content_key = 'auth.switch.to_login';

-- Checkout page section
UPDATE public.content_translations SET portuguese_text = 'Finalizar Compra' WHERE content_key = 'checkout.title';
UPDATE public.content_translations SET portuguese_text = 'Complete a Sua Compra' WHERE content_key = 'checkout.subtitle';
UPDATE public.content_translations SET portuguese_text = 'Resumo do Pedido' WHERE content_key = 'checkout.summary.title';
UPDATE public.content_translations SET portuguese_text = 'Geração de Modelos 3D' WHERE content_key = 'checkout.summary.description';
UPDATE public.content_translations SET portuguese_text = 'Total' WHERE content_key = 'checkout.summary.total';
UPDATE public.content_translations SET portuguese_text = 'Método de Pagamento' WHERE content_key = 'checkout.payment.title';
UPDATE public.content_translations SET portuguese_text = 'Pagamento seguro powered by Stripe' WHERE content_key = 'checkout.payment.subtitle';
UPDATE public.content_translations SET portuguese_text = 'Métodos de Pagamento Aceites' WHERE content_key = 'checkout.payment.methods.title';
UPDATE public.content_translations SET portuguese_text = '• Cartões de Crédito e Débito (Visa, Mastercard, Amex)' WHERE content_key = 'checkout.payment.methods.cards';
UPDATE public.content_translations SET portuguese_text = '• PayPal' WHERE content_key = 'checkout.payment.methods.paypal';
UPDATE public.content_translations SET portuguese_text = '• Multibanco (Portugal)' WHERE content_key = 'checkout.payment.methods.multibanco';
UPDATE public.content_translations SET portuguese_text = '• MB WAY disponível através do Multibanco' WHERE content_key = 'checkout.payment.methods.mbway';
UPDATE public.content_translations SET portuguese_text = 'Pagar €9.99 com Stripe' WHERE content_key = 'checkout.payment.button';
UPDATE public.content_translations SET portuguese_text = 'A redirecionar para o Stripe...' WHERE content_key = 'checkout.payment.processing';
UPDATE public.content_translations SET portuguese_text = '🔒 O seu pagamento é assegurado pelo Stripe' WHERE content_key = 'checkout.security.stripe';
UPDATE public.content_translations SET portuguese_text = '💳 Todos os principais métodos de pagamento aceites' WHERE content_key = 'checkout.security.methods';
UPDATE public.content_translations SET portuguese_text = '🇵🇹 Métodos de pagamento portugueses suportados' WHERE content_key = 'checkout.security.portuguese';
UPDATE public.content_translations SET portuguese_text = 'Ao completar esta compra, concorda com os nossos Termos de Serviço' WHERE content_key = 'checkout.terms';

-- Dashboard page section
UPDATE public.content_translations SET portuguese_text = 'O Meu Painel' WHERE content_key = 'dashboard.title';
UPDATE public.content_translations SET portuguese_text = 'Gere a sua conta' WHERE content_key = 'dashboard.subtitle';
UPDATE public.content_translations SET portuguese_text = 'Voltar ao Início' WHERE content_key = 'dashboard.back_home';
UPDATE public.content_translations SET portuguese_text = 'Os Meus Designs' WHERE content_key = 'dashboard.tabs.designs';
UPDATE public.content_translations SET portuguese_text = 'Histórico de Encomendas' WHERE content_key = 'dashboard.tabs.orders';
UPDATE public.content_translations SET portuguese_text = 'Informações Pessoais' WHERE content_key = 'dashboard.tabs.profile';
UPDATE public.content_translations SET portuguese_text = 'Faturação e Endereço' WHERE content_key = 'dashboard.tabs.billing';
UPDATE public.content_translations SET portuguese_text = 'Histórico de Pagamentos' WHERE content_key = 'dashboard.orders.title';
UPDATE public.content_translations SET portuguese_text = 'Veja todas as suas transações passadas' WHERE content_key = 'dashboard.orders.description';
UPDATE public.content_translations SET portuguese_text = 'Ainda não há pagamentos' WHERE content_key = 'dashboard.orders.empty';
UPDATE public.content_translations SET portuguese_text = 'Informações Pessoais' WHERE content_key = 'dashboard.profile.title';
UPDATE public.content_translations SET portuguese_text = 'Atualize os seus dados pessoais' WHERE content_key = 'dashboard.profile.description';
UPDATE public.content_translations SET portuguese_text = 'Email' WHERE content_key = 'dashboard.profile.email';
UPDATE public.content_translations SET portuguese_text = 'Primeiro Nome' WHERE content_key = 'dashboard.profile.first_name';
UPDATE public.content_translations SET portuguese_text = 'Obrigatório para envio' WHERE content_key = 'dashboard.profile.first_name.required';
UPDATE public.content_translations SET portuguese_text = 'Último Nome' WHERE content_key = 'dashboard.profile.last_name';
UPDATE public.content_translations SET portuguese_text = 'Obrigatório para envio' WHERE content_key = 'dashboard.profile.last_name.required';
UPDATE public.content_translations SET portuguese_text = 'Número de Telefone' WHERE content_key = 'dashboard.profile.phone';
UPDATE public.content_translations SET portuguese_text = 'Obrigatório para atualizações de encomendas. Use formato internacional (ex.: +1234567890)' WHERE content_key = 'dashboard.profile.phone.help';
UPDATE public.content_translations SET portuguese_text = 'Guardar Alterações' WHERE content_key = 'dashboard.profile.save';
UPDATE public.content_translations SET portuguese_text = 'Informações de Faturação e Endereço' WHERE content_key = 'dashboard.billing.title';
UPDATE public.content_translations SET portuguese_text = 'Gere os seus detalhes de faturação' WHERE content_key = 'dashboard.billing.description';
UPDATE public.content_translations SET portuguese_text = 'Nome da Empresa (Opcional)' WHERE content_key = 'dashboard.billing.company';
UPDATE public.content_translations SET portuguese_text = 'Número de IVA (Opcional)' WHERE content_key = 'dashboard.billing.vat';
UPDATE public.content_translations SET portuguese_text = 'Endereço' WHERE content_key = 'dashboard.billing.address';
UPDATE public.content_translations SET portuguese_text = 'Obrigatório para envio de produtos' WHERE content_key = 'dashboard.billing.address.required';
UPDATE public.content_translations SET portuguese_text = 'Cidade' WHERE content_key = 'dashboard.billing.city';
UPDATE public.content_translations SET portuguese_text = 'Código Postal' WHERE content_key = 'dashboard.billing.postal_code';
UPDATE public.content_translations SET portuguese_text = 'País' WHERE content_key = 'dashboard.billing.country';
UPDATE public.content_translations SET portuguese_text = 'Use código de 2 letras (ex.: GB, US, DE)' WHERE content_key = 'dashboard.billing.country.help';
UPDATE public.content_translations SET portuguese_text = 'Guardar Informações de Faturação' WHERE content_key = 'dashboard.billing.save';

-- Footer section
UPDATE public.content_translations SET portuguese_text = 'Especializados em peças de automóveis clássicos impressas em 3D e decorações personalizadas para casa' WHERE content_key = 'footer.company.description';
UPDATE public.content_translations SET portuguese_text = 'Ligações Rápidas' WHERE content_key = 'footer.links.title';
UPDATE public.content_translations SET portuguese_text = 'Legal' WHERE content_key = 'footer.legal.title';
UPDATE public.content_translations SET portuguese_text = 'Política de Privacidade' WHERE content_key = 'footer.legal.privacy';
UPDATE public.content_translations SET portuguese_text = 'Termos de Serviço' WHERE content_key = 'footer.legal.terms';
UPDATE public.content_translations SET portuguese_text = '© 2024 PompousWeek. Todos os direitos reservados.' WHERE content_key = 'footer.copyright';
UPDATE public.content_translations SET portuguese_text = 'Soluções personalizadas impressas em 3D para entusiastas de automóveis e decoradores de casa. Qualidade, precisão e inovação em cada design.' WHERE content_key = 'footer.brand.description';
UPDATE public.content_translations SET portuguese_text = 'Produtos' WHERE content_key = 'footer.products.title';
UPDATE public.content_translations SET portuguese_text = 'Todos os Produtos' WHERE content_key = 'footer.products.all';
UPDATE public.content_translations SET portuguese_text = 'Modelos 3D' WHERE content_key = 'footer.products.models';
UPDATE public.content_translations SET portuguese_text = 'Peças de Automóvel' WHERE content_key = 'footer.products.car_parts';
UPDATE public.content_translations SET portuguese_text = 'Decoração para Casa' WHERE content_key = 'footer.products.home_decor';
UPDATE public.content_translations SET portuguese_text = 'Serviços' WHERE content_key = 'footer.services.title';
UPDATE public.content_translations SET portuguese_text = 'Gerador de Modelos IA' WHERE content_key = 'footer.services.ai_generator';
UPDATE public.content_translations SET portuguese_text = 'Impressão Personalizada' WHERE content_key = 'footer.services.custom_printing';
UPDATE public.content_translations SET portuguese_text = 'Serviços de Restauração' WHERE content_key = 'footer.services.restoration';
UPDATE public.content_translations SET portuguese_text = 'Consulta de Design' WHERE content_key = 'footer.services.consultation';
UPDATE public.content_translations SET portuguese_text = 'Empresa' WHERE content_key = 'footer.company.title';
UPDATE public.content_translations SET portuguese_text = 'Sobre Nós' WHERE content_key = 'footer.company.about';
UPDATE public.content_translations SET portuguese_text = 'Contacto' WHERE content_key = 'footer.company.contact';
UPDATE public.content_translations SET portuguese_text = 'Perguntas Frequentes' WHERE content_key = 'footer.company.faq';
UPDATE public.content_translations SET portuguese_text = 'Termos de Serviço' WHERE content_key = 'footer.company.terms';