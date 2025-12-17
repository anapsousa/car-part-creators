-- Calculator Tables for Price Calculator Integration

-- 1. Electricity Settings (needed first as referenced by printers)
CREATE TABLE public.calc_electricity_settings (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  contracted_power_kva NUMERIC DEFAULT 3.45,
  price_per_kwh NUMERIC NOT NULL DEFAULT 0.15,
  daily_fixed_cost NUMERIC DEFAULT 0,
  notes TEXT,
  is_default BOOLEAN DEFAULT false,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- 2. Printers
CREATE TABLE public.calc_printers (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  brand TEXT,
  model TEXT,
  purchase_cost NUMERIC DEFAULT 0,
  depreciation_months INTEGER DEFAULT 36,
  depreciation_hours INTEGER DEFAULT 5000,
  maintenance_cost NUMERIC DEFAULT 0,
  power_watts NUMERIC DEFAULT 200,
  default_electricity_settings_id UUID REFERENCES public.calc_electricity_settings(id) ON DELETE SET NULL,
  notes TEXT,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- 3. Filaments
CREATE TABLE public.calc_filaments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  brand TEXT,
  material TEXT NOT NULL DEFAULT 'PLA',
  color TEXT,
  spool_weight_grams NUMERIC NOT NULL DEFAULT 1000,
  spool_cost NUMERIC NOT NULL DEFAULT 20,
  density NUMERIC DEFAULT 1.24,
  notes TEXT,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- 4. Fixed Expenses
CREATE TABLE public.calc_fixed_expenses (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  monthly_amount NUMERIC NOT NULL DEFAULT 0,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- 5. Consumables
CREATE TABLE public.calc_consumables (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  cost NUMERIC NOT NULL DEFAULT 0,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- 6. Shipping Options
CREATE TABLE public.calc_shipping_options (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  description TEXT,
  price NUMERIC NOT NULL DEFAULT 0,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- 7. Labor Settings
CREATE TABLE public.calc_labor_settings (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  hourly_rate NUMERIC NOT NULL DEFAULT 10,
  include_in_cost BOOLEAN DEFAULT true,
  default_minutes_per_print INTEGER DEFAULT 15,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now(),
  UNIQUE(user_id)
);

-- 8. Prints (main calculation table)
CREATE TABLE public.calc_prints (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  print_time_minutes INTEGER NOT NULL DEFAULT 60,
  printer_id UUID REFERENCES public.calc_printers(id) ON DELETE SET NULL,
  electricity_settings_id UUID REFERENCES public.calc_electricity_settings(id) ON DELETE SET NULL,
  shipping_option_id UUID REFERENCES public.calc_shipping_options(id) ON DELETE SET NULL,
  labor_time_minutes INTEGER DEFAULT 15,
  notes TEXT,
  quantity INTEGER DEFAULT 1,
  wastage_percent NUMERIC DEFAULT 5,
  failure_rate_percent NUMERIC DEFAULT 5,
  model_cost NUMERIC DEFAULT 0,
  markup_percent NUMERIC DEFAULT 50,
  -- Calculated totals (stored for history)
  filament_cost NUMERIC DEFAULT 0,
  electricity_cost NUMERIC DEFAULT 0,
  depreciation_cost NUMERIC DEFAULT 0,
  labor_cost NUMERIC DEFAULT 0,
  shipping_cost NUMERIC DEFAULT 0,
  consumables_cost NUMERIC DEFAULT 0,
  fixed_expenses_cost NUMERIC DEFAULT 0,
  total_cost NUMERIC DEFAULT 0,
  sell_price NUMERIC DEFAULT 0,
  profit NUMERIC DEFAULT 0,
  profit_margin_percent NUMERIC DEFAULT 0,
  is_template BOOLEAN DEFAULT false,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- 9. Print Filaments (junction table for multi-filament support)
CREATE TABLE public.calc_print_filaments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  print_id UUID NOT NULL REFERENCES public.calc_prints(id) ON DELETE CASCADE,
  filament_id UUID NOT NULL REFERENCES public.calc_filaments(id) ON DELETE CASCADE,
  grams_used NUMERIC NOT NULL DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- Enable RLS on all tables
ALTER TABLE public.calc_electricity_settings ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.calc_printers ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.calc_filaments ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.calc_fixed_expenses ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.calc_consumables ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.calc_shipping_options ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.calc_labor_settings ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.calc_prints ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.calc_print_filaments ENABLE ROW LEVEL SECURITY;

-- RLS Policies for calc_electricity_settings
CREATE POLICY "Users can view own electricity settings" ON public.calc_electricity_settings FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can insert own electricity settings" ON public.calc_electricity_settings FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update own electricity settings" ON public.calc_electricity_settings FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "Users can delete own electricity settings" ON public.calc_electricity_settings FOR DELETE USING (auth.uid() = user_id);
CREATE POLICY "Admins can view all electricity settings" ON public.calc_electricity_settings FOR SELECT USING (public.has_role(auth.uid(), 'admin'));

-- RLS Policies for calc_printers
CREATE POLICY "Users can view own printers" ON public.calc_printers FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can insert own printers" ON public.calc_printers FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update own printers" ON public.calc_printers FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "Users can delete own printers" ON public.calc_printers FOR DELETE USING (auth.uid() = user_id);
CREATE POLICY "Admins can view all printers" ON public.calc_printers FOR SELECT USING (public.has_role(auth.uid(), 'admin'));

-- RLS Policies for calc_filaments
CREATE POLICY "Users can view own filaments" ON public.calc_filaments FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can insert own filaments" ON public.calc_filaments FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update own filaments" ON public.calc_filaments FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "Users can delete own filaments" ON public.calc_filaments FOR DELETE USING (auth.uid() = user_id);
CREATE POLICY "Admins can view all filaments" ON public.calc_filaments FOR SELECT USING (public.has_role(auth.uid(), 'admin'));

-- RLS Policies for calc_fixed_expenses
CREATE POLICY "Users can view own fixed expenses" ON public.calc_fixed_expenses FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can insert own fixed expenses" ON public.calc_fixed_expenses FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update own fixed expenses" ON public.calc_fixed_expenses FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "Users can delete own fixed expenses" ON public.calc_fixed_expenses FOR DELETE USING (auth.uid() = user_id);
CREATE POLICY "Admins can view all fixed expenses" ON public.calc_fixed_expenses FOR SELECT USING (public.has_role(auth.uid(), 'admin'));

-- RLS Policies for calc_consumables
CREATE POLICY "Users can view own consumables" ON public.calc_consumables FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can insert own consumables" ON public.calc_consumables FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update own consumables" ON public.calc_consumables FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "Users can delete own consumables" ON public.calc_consumables FOR DELETE USING (auth.uid() = user_id);
CREATE POLICY "Admins can view all consumables" ON public.calc_consumables FOR SELECT USING (public.has_role(auth.uid(), 'admin'));

-- RLS Policies for calc_shipping_options
CREATE POLICY "Users can view own shipping options" ON public.calc_shipping_options FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can insert own shipping options" ON public.calc_shipping_options FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update own shipping options" ON public.calc_shipping_options FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "Users can delete own shipping options" ON public.calc_shipping_options FOR DELETE USING (auth.uid() = user_id);
CREATE POLICY "Admins can view all shipping options" ON public.calc_shipping_options FOR SELECT USING (public.has_role(auth.uid(), 'admin'));

-- RLS Policies for calc_labor_settings
CREATE POLICY "Users can view own labor settings" ON public.calc_labor_settings FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can insert own labor settings" ON public.calc_labor_settings FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update own labor settings" ON public.calc_labor_settings FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "Users can delete own labor settings" ON public.calc_labor_settings FOR DELETE USING (auth.uid() = user_id);
CREATE POLICY "Admins can view all labor settings" ON public.calc_labor_settings FOR SELECT USING (public.has_role(auth.uid(), 'admin'));

-- RLS Policies for calc_prints
CREATE POLICY "Users can view own prints" ON public.calc_prints FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can insert own prints" ON public.calc_prints FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update own prints" ON public.calc_prints FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "Users can delete own prints" ON public.calc_prints FOR DELETE USING (auth.uid() = user_id);
CREATE POLICY "Admins can view all prints" ON public.calc_prints FOR SELECT USING (public.has_role(auth.uid(), 'admin'));

-- RLS Policies for calc_print_filaments (access via print ownership)
CREATE POLICY "Users can view own print filaments" ON public.calc_print_filaments FOR SELECT 
  USING (EXISTS (SELECT 1 FROM public.calc_prints WHERE id = print_id AND user_id = auth.uid()));
CREATE POLICY "Users can insert own print filaments" ON public.calc_print_filaments FOR INSERT 
  WITH CHECK (EXISTS (SELECT 1 FROM public.calc_prints WHERE id = print_id AND user_id = auth.uid()));
CREATE POLICY "Users can update own print filaments" ON public.calc_print_filaments FOR UPDATE 
  USING (EXISTS (SELECT 1 FROM public.calc_prints WHERE id = print_id AND user_id = auth.uid()));
CREATE POLICY "Users can delete own print filaments" ON public.calc_print_filaments FOR DELETE 
  USING (EXISTS (SELECT 1 FROM public.calc_prints WHERE id = print_id AND user_id = auth.uid()));
CREATE POLICY "Admins can view all print filaments" ON public.calc_print_filaments FOR SELECT 
  USING (public.has_role(auth.uid(), 'admin'));

-- Create updated_at triggers
CREATE TRIGGER update_calc_electricity_settings_updated_at BEFORE UPDATE ON public.calc_electricity_settings FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
CREATE TRIGGER update_calc_printers_updated_at BEFORE UPDATE ON public.calc_printers FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
CREATE TRIGGER update_calc_filaments_updated_at BEFORE UPDATE ON public.calc_filaments FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
CREATE TRIGGER update_calc_fixed_expenses_updated_at BEFORE UPDATE ON public.calc_fixed_expenses FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
CREATE TRIGGER update_calc_consumables_updated_at BEFORE UPDATE ON public.calc_consumables FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
CREATE TRIGGER update_calc_shipping_options_updated_at BEFORE UPDATE ON public.calc_shipping_options FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
CREATE TRIGGER update_calc_labor_settings_updated_at BEFORE UPDATE ON public.calc_labor_settings FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
CREATE TRIGGER update_calc_prints_updated_at BEFORE UPDATE ON public.calc_prints FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();