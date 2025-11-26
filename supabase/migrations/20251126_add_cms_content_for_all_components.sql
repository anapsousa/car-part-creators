-- Add missing content keys for CMS internationalization
INSERT INTO public.content_translations (content_key, content_type, page, section, english_text, description) VALUES
-- Shop Namespace
('shop.product.out_of_stock', 'text', 'shop', 'product', 'Out of Stock', 'Text displayed when a product is out of stock'),
('shop.product.add_to_cart', 'button', 'shop', 'product', 'Add to Cart', 'Button text for adding products to cart'),

-- Navigation Namespace
('nav.wishlist_label', 'label', 'nav', 'menu', 'Wishlist', 'Aria-label for wishlist button'),
('nav.cart_label', 'label', 'nav', 'menu', 'Cart', 'Aria-label for cart button'),
('nav.admin_products', 'text', 'nav', 'menu', 'Products', 'Admin products menu item'),
('nav.admin_statistics', 'text', 'nav', 'menu', 'Statistics', 'Admin statistics menu item'),
('nav.admin_content', 'text', 'nav', 'menu', 'Content Manager', 'Admin content manager menu item'),

-- Home Namespace
('home.hero.badge', 'text', 'home', 'hero', 'AI-Powered', 'Badge text in hero section'),
('home.hero.cta_generator', 'button', 'home', 'hero', 'Try Generator', 'Secondary CTA button for generator'),
('home.features.subtitle', 'text', 'home', 'features', 'Discover the features that make us stand out', 'Features section subtitle'),
('home.how_it_works.subtitle', 'text', 'home', 'how_it_works', 'Learn how our platform works', 'How it works section subtitle'),
('home.cta.button_generator', 'button', 'home', 'cta', 'Start Generating', 'Generator button in final CTA'),

-- Wishlist Namespace
('wishlist.heading', 'heading', 'wishlist', 'header', 'My Wishlist', 'Main heading with gradient styling support'),

-- Dashboard Namespace
('dashboard.credits.title', 'heading', 'dashboard', 'credits', 'Credits', 'Credits card title'),
('dashboard.credits.description', 'text', 'dashboard', 'credits', 'Your current credits balance', 'Credits card description'),
('dashboard.credits.remaining', 'text', 'dashboard', 'credits', 'Remaining Credits', 'Credits remaining label'),
('dashboard.profile.first_name.placeholder', 'placeholder', 'dashboard', 'profile', 'First Name', 'First name input placeholder'),
('dashboard.profile.last_name.placeholder', 'placeholder', 'dashboard', 'profile', 'Last Name', 'Last name input placeholder'),

-- Admin Namespace
('admin.dashboard.title', 'heading', 'admin', 'dashboard', 'Admin Dashboard', 'Admin dashboard page title'),
('admin.dashboard.subtitle', 'text', 'admin', 'dashboard', 'Overview of your platform', 'Admin dashboard page subtitle'),
('admin.dashboard.empty.title', 'heading', 'admin', 'dashboard', 'No Designs to Review', 'Empty state title when no designs to review'),
('admin.dashboard.empty.description', 'text', 'admin', 'dashboard', 'All caught up! No new designs need review.', 'Empty state description'),
('admin.dashboard.review_notes', 'label', 'admin', 'dashboard', 'Review Notes', 'Review notes label'),
('admin.stats.title', 'heading', 'admin', 'stats', 'Statistics', 'Statistics page title'),
('admin.stats.subtitle', 'text', 'admin', 'stats', 'Key metrics and analytics', 'Statistics page subtitle'),
('admin.stats.revenue', 'heading', 'admin', 'stats', 'Total Revenue', 'Revenue card title'),
('admin.products.title', 'heading', 'admin', 'products', 'Products Management', 'Products management page title'),
('admin.products.add_button', 'button', 'admin', 'products', 'Add New Product', 'Add product button text'),
('admin.products.loading', 'text', 'admin', 'products', 'Loading products...', 'Loading products message'),
('admin.products.empty', 'text', 'admin', 'products', 'No products available', 'Empty products message'),
('admin.content.title', 'heading', 'admin', 'content', 'Content Manager', 'Content manager page title'),
('admin.content.add_button', 'button', 'admin', 'content', 'Add New Content', 'Add content button text'),
('admin.product_form.material.placeholder', 'placeholder', 'admin', 'product_form', 'Material', 'Material input placeholder'),
('admin.product_form.width.placeholder', 'placeholder', 'admin', 'product_form', 'Width', 'Width input placeholder'),
('admin.product_form.height.placeholder', 'placeholder', 'admin', 'product_form', 'Height', 'Height input placeholder'),
('admin.product_form.depth.placeholder', 'placeholder', 'admin', 'product_form', 'Depth', 'Depth input placeholder'),
('admin.upload_image', 'button', 'admin', 'upload', 'Upload Image', 'Upload image button text'),

-- Product Namespace
('product.not_found', 'text', 'product', 'content', 'Product Not Found', 'Product not found message'),
('product.back_to_shop', 'button', 'product', 'content', 'Back to Shop', 'Back to shop button text'),
('product.description_title', 'heading', 'product', 'content', 'Product Description', 'Description section title'),

-- Checkout Namespace
('checkout.success.title', 'heading', 'checkout', 'success', 'Order Successful', 'Success page title'),
('checkout.success.subtitle', 'text', 'checkout', 'success', 'Your order has been placed successfully', 'Success page subtitle');