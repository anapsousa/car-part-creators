-- Create VAT settings table for calculator
CREATE TABLE public.calc_vat_settings (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  show_vat_in_calculator BOOLEAN DEFAULT true,
  vat_rate NUMERIC DEFAULT 23,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  UNIQUE(user_id)
);

-- Enable Row Level Security
ALTER TABLE public.calc_vat_settings ENABLE ROW LEVEL SECURITY;

-- Create policies
CREATE POLICY "Users can view their own VAT settings"
ON public.calc_vat_settings
FOR SELECT
USING (auth.uid() = user_id);

CREATE POLICY "Users can create their own VAT settings"
ON public.calc_vat_settings
FOR INSERT
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own VAT settings"
ON public.calc_vat_settings
FOR UPDATE
USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own VAT settings"
ON public.calc_vat_settings
FOR DELETE
USING (auth.uid() = user_id);