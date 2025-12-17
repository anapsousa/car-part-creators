import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

// Types for calculator data
export interface CalcPrinter {
  id: string;
  user_id: string;
  name: string;
  brand: string | null;
  model: string | null;
  purchase_cost: number | null;
  depreciation_months: number | null;
  depreciation_hours: number | null;
  maintenance_cost: number | null;
  power_watts: number | null;
  default_electricity_settings_id: string | null;
  notes: string | null;
  is_active: boolean | null;
  created_at: string;
  updated_at: string;
}

export interface CalcFilament {
  id: string;
  user_id: string;
  name: string;
  brand: string | null;
  material: string;
  color: string | null;
  spool_weight_grams: number;
  spool_cost: number;
  density: number | null;
  notes: string | null;
  is_active: boolean | null;
  created_at: string;
  updated_at: string;
}

export interface CalcElectricitySettings {
  id: string;
  user_id: string;
  name: string;
  contracted_power_kva: number | null;
  price_per_kwh: number;
  daily_fixed_cost: number | null;
  notes: string | null;
  is_default: boolean | null;
  created_at: string;
  updated_at: string;
}

export interface CalcLaborSettings {
  id: string;
  user_id: string;
  hourly_rate: number;
  include_in_cost: boolean | null;
  default_minutes_per_print: number | null;
  created_at: string;
  updated_at: string;
}

export interface CalcFixedExpense {
  id: string;
  user_id: string;
  name: string;
  monthly_amount: number;
  is_active: boolean | null;
  created_at: string;
  updated_at: string;
}

export interface CalcConsumable {
  id: string;
  user_id: string;
  name: string;
  cost: number;
  is_active: boolean | null;
  created_at: string;
  updated_at: string;
}

export interface CalcShippingOption {
  id: string;
  user_id: string;
  name: string;
  description: string | null;
  price: number;
  is_active: boolean | null;
  created_at: string;
  updated_at: string;
}

export interface CalcPrint {
  id: string;
  user_id: string;
  name: string;
  print_time_minutes: number;
  printer_id: string | null;
  electricity_settings_id: string | null;
  shipping_option_id: string | null;
  labor_time_minutes: number | null;
  notes: string | null;
  quantity: number | null;
  wastage_percent: number | null;
  failure_rate_percent: number | null;
  model_cost: number | null;
  markup_percent: number | null;
  filament_cost: number | null;
  electricity_cost: number | null;
  depreciation_cost: number | null;
  labor_cost: number | null;
  shipping_cost: number | null;
  consumables_cost: number | null;
  fixed_expenses_cost: number | null;
  total_cost: number | null;
  sell_price: number | null;
  profit: number | null;
  profit_margin_percent: number | null;
  is_template: boolean | null;
  created_at: string;
  updated_at: string;
}

export function useCalculatorData() {
  const { toast } = useToast();
  const [loading, setLoading] = useState(true);
  const [printers, setPrinters] = useState<CalcPrinter[]>([]);
  const [filaments, setFilaments] = useState<CalcFilament[]>([]);
  const [electricitySettings, setElectricitySettings] = useState<CalcElectricitySettings[]>([]);
  const [laborSettings, setLaborSettings] = useState<CalcLaborSettings | null>(null);
  const [fixedExpenses, setFixedExpenses] = useState<CalcFixedExpense[]>([]);
  const [consumables, setConsumables] = useState<CalcConsumable[]>([]);
  const [shippingOptions, setShippingOptions] = useState<CalcShippingOption[]>([]);
  const [prints, setPrints] = useState<CalcPrint[]>([]);

  const fetchAllData = async () => {
    try {
      setLoading(true);
      
      const [
        printersRes,
        filamentsRes,
        electricityRes,
        laborRes,
        expensesRes,
        consumablesRes,
        shippingRes,
        printsRes,
      ] = await Promise.all([
        supabase.from('calc_printers').select('*').order('name'),
        supabase.from('calc_filaments').select('*').order('name'),
        supabase.from('calc_electricity_settings').select('*').order('name'),
        supabase.from('calc_labor_settings').select('*').maybeSingle(),
        supabase.from('calc_fixed_expenses').select('*').order('name'),
        supabase.from('calc_consumables').select('*').order('name'),
        supabase.from('calc_shipping_options').select('*').order('name'),
        supabase.from('calc_prints').select('*').order('created_at', { ascending: false }),
      ]);

      if (printersRes.error) throw printersRes.error;
      if (filamentsRes.error) throw filamentsRes.error;
      if (electricityRes.error) throw electricityRes.error;
      if (laborRes.error) throw laborRes.error;
      if (expensesRes.error) throw expensesRes.error;
      if (consumablesRes.error) throw consumablesRes.error;
      if (shippingRes.error) throw shippingRes.error;
      if (printsRes.error) throw printsRes.error;

      setPrinters(printersRes.data || []);
      setFilaments(filamentsRes.data || []);
      setElectricitySettings(electricityRes.data || []);
      setLaborSettings(laborRes.data);
      setFixedExpenses(expensesRes.data || []);
      setConsumables(consumablesRes.data || []);
      setShippingOptions(shippingRes.data || []);
      setPrints(printsRes.data || []);
    } catch (error: any) {
      console.error('Error fetching calculator data:', error);
      toast({
        title: 'Error',
        description: 'Failed to load calculator data',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAllData();
  }, []);

  return {
    loading,
    printers,
    filaments,
    electricitySettings,
    laborSettings,
    fixedExpenses,
    consumables,
    shippingOptions,
    prints,
    refetch: fetchAllData,
    setPrinters,
    setFilaments,
    setElectricitySettings,
    setLaborSettings,
    setFixedExpenses,
    setConsumables,
    setShippingOptions,
    setPrints,
  };
}

// Helper hook for checking if user has completed initial setup
export function useCalculatorSetup() {
  const { printers, filaments, electricitySettings, loading } = useCalculatorData();
  
  const hasCompletedSetup = !loading && (
    printers.length > 0 &&
    filaments.length > 0 &&
    electricitySettings.length > 0
  );

  const setupProgress = {
    hasPrinters: printers.length > 0,
    hasFilaments: filaments.length > 0,
    hasElectricity: electricitySettings.length > 0,
    completedSteps: [
      printers.length > 0,
      filaments.length > 0,
      electricitySettings.length > 0,
    ].filter(Boolean).length,
    totalSteps: 3,
  };

  return {
    hasCompletedSetup,
    setupProgress,
    loading,
  };
}
