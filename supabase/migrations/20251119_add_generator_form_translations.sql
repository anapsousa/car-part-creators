-- Add generator form translation keys
INSERT INTO public.content_translations (content_key, content_type, page, section, english_text, description) VALUES
-- Form UI Elements
('generator.form.card_title', 'heading', 'generator', 'form', 'Generate 3D Model', 'Card title for the generator form'),
('generator.form.card_description', 'text', 'generator', 'form', 'Describe the 3D model you want to create. Be specific about details, dimensions, and purpose.', 'Description text under the card title'),
('generator.form.category_label', 'label', 'generator', 'form', 'Category', 'Label for the category selection field'),
('generator.form.category_placeholder', 'placeholder', 'generator', 'form', 'Select category', 'Placeholder text for category dropdown'),
('generator.form.category_car_parts', 'text', 'generator', 'form', 'Car Parts', 'Option text for car parts category'),
('generator.form.category_home_decorations', 'text', 'generator', 'form', 'Home Decorations', 'Option text for home decorations category'),
('generator.form.category_custom', 'text', 'generator', 'form', 'Custom Design', 'Option text for custom design category'),
('generator.form.description_label', 'label', 'generator', 'form', 'Design Description', 'Label for the design description textarea'),
('generator.form.description_placeholder', 'placeholder', 'generator', 'form', 'Example: A front bumper for a 2020 Honda Civic, with mounting holes for standard headlights...', 'Placeholder text for design description'),
('generator.form.reference_images_label', 'label', 'generator', 'form', 'Reference Images (Optional)', 'Label for the reference images upload section'),
('generator.form.reference_images_help', 'text', 'generator', 'form', 'Upload up to 3 reference images to guide the AI generation', 'Help text for reference images upload'),
('generator.form.upload_button', 'button', 'generator', 'form', 'Upload', 'Button text for uploading images'),
('generator.form.material_label', 'label', 'generator', 'form', 'Material Type', 'Label for the material type selection'),
('generator.form.material_placeholder', 'placeholder', 'generator', 'form', 'Select material', 'Placeholder text for material dropdown'),
('generator.form.material_pla', 'text', 'generator', 'form', 'PLA (Standard)', 'Option text for PLA material'),
('generator.form.material_abs', 'text', 'generator', 'form', 'ABS (Durable)', 'Option text for ABS material'),
('generator.form.material_petg', 'text', 'generator', 'form', 'PETG (Strong)', 'Option text for PETG material'),
('generator.form.material_tpu', 'text', 'generator', 'form', 'TPU (Flexible)', 'Option text for TPU material'),
('generator.form.material_nylon', 'text', 'generator', 'form', 'Nylon (Industrial)', 'Option text for Nylon material'),
('generator.form.material_resin', 'text', 'generator', 'form', 'Resin (High Detail)', 'Option text for Resin material'),
('generator.form.dimensions_label', 'label', 'generator', 'form', 'Dimensions (mm) - Optional', 'Label for the dimensions section'),
('generator.form.dimension_width', 'placeholder', 'generator', 'form', 'Width', 'Placeholder for width input'),
('generator.form.dimension_height', 'placeholder', 'generator', 'form', 'Height', 'Placeholder for height input'),
('generator.form.dimension_depth', 'placeholder', 'generator', 'form', 'Depth', 'Placeholder for depth input'),
('generator.form.button_generate', 'button', 'generator', 'form', 'Generate Model', 'Button text for generating the model'),
('generator.form.button_generating', 'text', 'generator', 'form', 'Generating Model...', 'Text shown while generating'),

-- Error Messages
('generator.form.error_max_images', 'text', 'generator', 'errors', 'You can only upload up to 3 reference images', 'Error message for exceeding image upload limit'),
('generator.form.error_upload_failed', 'text', 'generator', 'errors', 'Failed to upload images', 'Error message for failed image upload'),
('generator.form.error_empty_prompt', 'text', 'generator', 'errors', 'Please enter a prompt', 'Error message for empty prompt'),
('generator.form.error_not_logged_in', 'text', 'generator', 'errors', 'You must be logged in', 'Error message for unauthenticated user'),
('generator.form.error_insufficient_credits', 'text', 'generator', 'errors', 'You don''t have enough credits. Please purchase more to continue.', 'Error message for insufficient credits'),
('generator.form.error_service_unavailable', 'text', 'generator', 'errors', 'Service temporarily unavailable. Your credit has been refunded.', 'Error message for service unavailability'),
('generator.form.error_generation_failed', 'text', 'generator', 'errors', 'Failed to start generation', 'Error message for generation failure'),

-- Success Messages
('generator.form.success_images_uploaded', 'text', 'generator', 'success', 'Reference images uploaded', 'Success message for image upload'),
('generator.form.success_generation_started', 'text', 'generator', 'success', '3D model generation started!', 'Success message for generation start'),

-- Action Labels
('generator.form.action_buy_credits', 'button', 'generator', 'actions', 'Buy Credits', 'Button text for buying credits');