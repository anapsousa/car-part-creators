-- Create junction table for print-consumables relationship
CREATE TABLE public.calc_print_consumables (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  print_id UUID NOT NULL REFERENCES public.calc_prints(id) ON DELETE CASCADE,
  consumable_id UUID NOT NULL REFERENCES public.calc_consumables(id) ON DELETE CASCADE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  UNIQUE(print_id, consumable_id)
);

-- Create junction table for print-expenses relationship
CREATE TABLE public.calc_print_expenses (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  print_id UUID NOT NULL REFERENCES public.calc_prints(id) ON DELETE CASCADE,
  expense_id UUID NOT NULL REFERENCES public.calc_fixed_expenses(id) ON DELETE CASCADE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  UNIQUE(print_id, expense_id)
);

-- Enable RLS on both tables
ALTER TABLE public.calc_print_consumables ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.calc_print_expenses ENABLE ROW LEVEL SECURITY;

-- RLS policies for calc_print_consumables
CREATE POLICY "Users can view own print consumables"
ON public.calc_print_consumables FOR SELECT
USING (EXISTS (
  SELECT 1 FROM public.calc_prints
  WHERE calc_prints.id = calc_print_consumables.print_id
  AND calc_prints.user_id = auth.uid()
));

CREATE POLICY "Users can insert own print consumables"
ON public.calc_print_consumables FOR INSERT
WITH CHECK (EXISTS (
  SELECT 1 FROM public.calc_prints
  WHERE calc_prints.id = calc_print_consumables.print_id
  AND calc_prints.user_id = auth.uid()
));

CREATE POLICY "Users can delete own print consumables"
ON public.calc_print_consumables FOR DELETE
USING (EXISTS (
  SELECT 1 FROM public.calc_prints
  WHERE calc_prints.id = calc_print_consumables.print_id
  AND calc_prints.user_id = auth.uid()
));

CREATE POLICY "Admins can view all print consumables"
ON public.calc_print_consumables FOR SELECT
USING (has_role(auth.uid(), 'admin'::app_role));

-- RLS policies for calc_print_expenses
CREATE POLICY "Users can view own print expenses"
ON public.calc_print_expenses FOR SELECT
USING (EXISTS (
  SELECT 1 FROM public.calc_prints
  WHERE calc_prints.id = calc_print_expenses.print_id
  AND calc_prints.user_id = auth.uid()
));

CREATE POLICY "Users can insert own print expenses"
ON public.calc_print_expenses FOR INSERT
WITH CHECK (EXISTS (
  SELECT 1 FROM public.calc_prints
  WHERE calc_prints.id = calc_print_expenses.print_id
  AND calc_prints.user_id = auth.uid()
));

CREATE POLICY "Users can delete own print expenses"
ON public.calc_print_expenses FOR DELETE
USING (EXISTS (
  SELECT 1 FROM public.calc_prints
  WHERE calc_prints.id = calc_print_expenses.print_id
  AND calc_prints.user_id = auth.uid()
));

CREATE POLICY "Admins can view all print expenses"
ON public.calc_print_expenses FOR SELECT
USING (has_role(auth.uid(), 'admin'::app_role));