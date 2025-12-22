import { useState, useEffect, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { useContent } from '@/hooks/useContent';
import { useUserRole } from '@/hooks/useUserRole';
import { CalculatorLayout } from '@/components/calculator/CalculatorLayout';
import { MultiFilamentSelector } from '@/components/calculator/MultiFilamentSelector';
import { ConsumableExpenseSelector } from '@/components/calculator/ConsumableExpenseSelector';
import { PrintListItem } from '@/components/calculator/PrintListItem';
import { PrintImageUpload } from '@/components/calculator/PrintImageUpload';
import { DeleteConfirmDialog } from '@/components/calculator/DeleteConfirmDialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogDescription } from '@/components/ui/dialog';
import { Separator } from '@/components/ui/separator';
import { Switch } from '@/components/ui/switch';
import { Plus, Calculator, Save, Search, FileText, Download, DollarSign, TrendingUp, ShoppingBag, Store } from 'lucide-react';
import { calculatePrintCost, calculatePricingFromMarkup, formatCurrency, formatTime, parseTimeToMinutes, PrintCostBreakdown, PricingResult } from '@/lib/calculator/calculations';
import type { Tables } from '@/integrations/supabase/types';

type Print = Tables<'calc_prints'>;
type Printer = Tables<'calc_printers'>;
type Filament = Tables<'calc_filaments'>;
type ElectricitySettings = Tables<'calc_electricity_settings'>;
type ShippingOption = Tables<'calc_shipping_options'>;
type LaborSettings = Tables<'calc_labor_settings'>;
type Consumable = Tables<'calc_consumables'>;
type FixedExpense = Tables<'calc_fixed_expenses'>;
type PrintFilament = Tables<'calc_print_filaments'>;

interface FilamentUsage {
  filamentId: string;
  filamentName: string;
  gramsUsed: number;
  costPerGram: number;
}

export default function CalcPrints() {
  const navigate = useNavigate();
  const { toast } = useToast();
  const { content } = useContent('calculator');
  const { isAdmin } = useUserRole();
  const t = (key: string, fallback: string) => content[key] || fallback;

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [user, setUser] = useState<any>(null);

  // Data from database
  const [prints, setPrints] = useState<Print[]>([]);
  const [printers, setPrinters] = useState<Printer[]>([]);
  const [filaments, setFilaments] = useState<Filament[]>([]);
  const [electricitySettings, setElectricitySettings] = useState<ElectricitySettings[]>([]);
  const [shippingOptions, setShippingOptions] = useState<ShippingOption[]>([]);
  const [laborSettings, setLaborSettings] = useState<LaborSettings | null>(null);
  const [consumables, setConsumables] = useState<Consumable[]>([]);
  const [fixedExpenses, setFixedExpenses] = useState<FixedExpense[]>([]);
  const [printFilaments, setPrintFilaments] = useState<PrintFilament[]>([]);

  // UI state
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingPrint, setEditingPrint] = useState<Print | null>(null);
  const [selectedPrintId, setSelectedPrintId] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [filterPrinter, setFilterPrinter] = useState<string>('all');
  const [filterFilament, setFilterFilament] = useState<string>('all');
  const [sortBy, setSortBy] = useState<string>('newest');

  // Publish to Shop state
  const [isPublishDialogOpen, setIsPublishDialogOpen] = useState(false);
  const [publishOverridePrice, setPublishOverridePrice] = useState(false);
  const [publishPrice, setPublishPrice] = useState(0);
  const [publishCategory, setPublishCategory] = useState('car-parts');
  const [publishDescription, setPublishDescription] = useState('');
  const [publishStock, setPublishStock] = useState(1);
  const [isPublishing, setIsPublishing] = useState(false);

  // VAT settings
  const [showVatInCalculator, setShowVatInCalculator] = useState(true);
  const [vatRate, setVatRate] = useState(23);

  // Delete confirmation
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [deleteTargetId, setDeleteTargetId] = useState<string | null>(null);
  const [deleteTargetName, setDeleteTargetName] = useState<string>('');

  // Form fields
  const [name, setName] = useState('');
  const [printTimeInput, setPrintTimeInput] = useState('60');
  const [selectedPrinterId, setSelectedPrinterId] = useState<string>('');
  const [selectedElectricityId, setSelectedElectricityId] = useState<string>('');
  const [selectedShippingId, setSelectedShippingId] = useState<string>('');
  const [filamentUsages, setFilamentUsages] = useState<FilamentUsage[]>([]);
  const [laborTimeMinutes, setLaborTimeMinutes] = useState(15);
  const [quantity, setQuantity] = useState(1);
  const [wastagePercent, setWastagePercent] = useState(5);
  const [failureRatePercent, setFailureRatePercent] = useState(5);
  const [modelCost, setModelCost] = useState(0);
  const [markupPercent, setMarkupPercent] = useState(50);
  const [notes, setNotes] = useState('');
  const [imageUrl, setImageUrl] = useState<string | null>(null);
  
  // Per-print consumables and expenses selections
  const [selectedConsumableIds, setSelectedConsumableIds] = useState<string[]>([]);
  const [selectedExpenseIds, setSelectedExpenseIds] = useState<string[]>([]);
  
  // Junction table data for existing prints
  const [printConsumables, setPrintConsumables] = useState<{ print_id: string; consumable_id: string }[]>([]);
  const [printExpenses, setPrintExpenses] = useState<{ print_id: string; expense_id: string }[]>([]);

  // Check auth and load data
  useEffect(() => {
    const checkAuth = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        navigate('/auth');
        return;
      }
      setUser(user);
      await loadAllData(user.id);
    };
    checkAuth();
  }, [navigate]);

  const loadAllData = async (userId: string) => {
    setLoading(true);
    try {
      const [
        printsRes, printersRes, filamentsRes, electricityRes, shippingRes,
        laborRes, consumablesRes, expensesRes, printFilamentsRes, vatRes,
        printConsumablesRes, printExpensesRes
      ] = await Promise.all([
        supabase.from('calc_prints').select('*').eq('user_id', userId).order('created_at', { ascending: false }),
        supabase.from('calc_printers').select('*').eq('user_id', userId).eq('is_active', true),
        supabase.from('calc_filaments').select('*').eq('user_id', userId).eq('is_active', true),
        supabase.from('calc_electricity_settings').select('*').eq('user_id', userId),
        supabase.from('calc_shipping_options').select('*').eq('user_id', userId).eq('is_active', true),
        supabase.from('calc_labor_settings').select('*').eq('user_id', userId).maybeSingle(),
        supabase.from('calc_consumables').select('*').eq('user_id', userId).eq('is_active', true),
        supabase.from('calc_fixed_expenses').select('*').eq('user_id', userId).eq('is_active', true),
        supabase.from('calc_print_filaments').select('*, calc_prints!inner(user_id)').eq('calc_prints.user_id', userId),
        supabase.from('calc_vat_settings').select('*').eq('user_id', userId).maybeSingle(),
        supabase.from('calc_print_consumables').select('print_id, consumable_id'),
        supabase.from('calc_print_expenses').select('print_id, expense_id')
      ]);

      if (printsRes.data) setPrints(printsRes.data);
      if (printersRes.data) setPrinters(printersRes.data);
      if (filamentsRes.data) setFilaments(filamentsRes.data);
      if (electricityRes.data) setElectricitySettings(electricityRes.data);
      if (shippingRes.data) setShippingOptions(shippingRes.data);
      if (laborRes.data) setLaborSettings(laborRes.data);
      if (consumablesRes.data) setConsumables(consumablesRes.data);
      if (expensesRes.data) setFixedExpenses(expensesRes.data);
      if (printFilamentsRes.data) setPrintFilaments(printFilamentsRes.data);
      if (printConsumablesRes.data) setPrintConsumables(printConsumablesRes.data);
      if (printExpensesRes.data) setPrintExpenses(printExpensesRes.data);
      
      // Load VAT settings
      if (vatRes.data) {
        setShowVatInCalculator(vatRes.data.show_vat_in_calculator ?? true);
        setVatRate(Number(vatRes.data.vat_rate) || 23);
      }

      // Set defaults
      if (printersRes.data?.length && !selectedPrinterId) {
        setSelectedPrinterId(printersRes.data[0].id);
        const defaultElectricity = printersRes.data[0].default_electricity_settings_id;
        if (defaultElectricity) setSelectedElectricityId(defaultElectricity);
      }
      if (electricityRes.data?.length && !selectedElectricityId) {
        const defaultSetting = electricityRes.data.find(e => e.is_default) || electricityRes.data[0];
        if (defaultSetting) setSelectedElectricityId(defaultSetting.id);
      }
      if (laborRes.data) {
        setLaborTimeMinutes(laborRes.data.default_minutes_per_print || 15);
      }

      // Auto-select first print
      if (printsRes.data?.length) {
        setSelectedPrintId(printsRes.data[0].id);
      }
    } catch (error) {
      console.error('Error loading data:', error);
      toast({ title: t('calculator.common.errorLoading', 'Error loading data'), variant: 'destructive' });
    } finally {
      setLoading(false);
    }
  };

  // Filter and sort prints
  const filteredPrints = useMemo(() => {
    let result = [...prints];

    // Search filter
    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      result = result.filter(p => p.name.toLowerCase().includes(query));
    }

    // Printer filter
    if (filterPrinter !== 'all') {
      result = result.filter(p => p.printer_id === filterPrinter);
    }

    // Filament filter
    if (filterFilament !== 'all') {
      const printIdsWithFilament = printFilaments
        .filter(pf => pf.filament_id === filterFilament)
        .map(pf => pf.print_id);
      result = result.filter(p => printIdsWithFilament.includes(p.id));
    }

    // Sorting
    switch (sortBy) {
      case 'oldest':
        result.sort((a, b) => new Date(a.created_at!).getTime() - new Date(b.created_at!).getTime());
        break;
      case 'name':
        result.sort((a, b) => a.name.localeCompare(b.name));
        break;
      case 'profit':
        result.sort((a, b) => (Number(b.profit) || 0) - (Number(a.profit) || 0));
        break;
      default: // newest
        result.sort((a, b) => new Date(b.created_at!).getTime() - new Date(a.created_at!).getTime());
    }

    return result;
  }, [prints, searchQuery, filterPrinter, filterFilament, sortBy, printFilaments]);

  // Get print details helpers
  const getPrinterName = (printerId: string | null) => {
    if (!printerId) return undefined;
    return printers.find(p => p.id === printerId)?.name;
  };

  const getFilamentInfo = (printId: string) => {
    const usages = printFilaments.filter(pf => pf.print_id === printId);
    if (usages.length === 0) return { name: undefined, totalGrams: 0 };
    
    const totalGrams = usages.reduce((sum, u) => sum + Number(u.grams_used), 0);
    const firstFilament = filaments.find(f => f.id === usages[0].filament_id);
    const name = firstFilament?.name + (usages.length > 1 ? ` +${usages.length - 1}` : '');
    
    return { name, totalGrams };
  };

  // Calculate costs for form
  const selectedPrinter = useMemo(() => printers.find(p => p.id === selectedPrinterId), [printers, selectedPrinterId]);
  const selectedElectricity = useMemo(() => electricitySettings.find(e => e.id === selectedElectricityId), [electricitySettings, selectedElectricityId]);
  const selectedShipping = useMemo(() => shippingOptions.find(s => s.id === selectedShippingId), [shippingOptions, selectedShippingId]);
  // Calculate selected consumables and expenses costs
  const selectedConsumablesCost = useMemo(() => {
    return consumables
      .filter(c => selectedConsumableIds.includes(c.id))
      .reduce((sum, c) => sum + Number(c.cost), 0);
  }, [consumables, selectedConsumableIds]);
  
  const selectedExpensesCost = useMemo(() => {
    const monthlyTotal = fixedExpenses
      .filter(e => selectedExpenseIds.includes(e.id))
      .reduce((sum, e) => sum + Number(e.monthly_amount), 0);
    return monthlyTotal / 100; // Prorated per print
  }, [fixedExpenses, selectedExpenseIds]);

  const printTimeMinutes = useMemo(() => parseTimeToMinutes(printTimeInput), [printTimeInput]);

  const filamentCosts = useMemo(() => {
    return filamentUsages.map(usage => {
      const filament = filaments.find(f => f.id === usage.filamentId);
      if (!filament) return { gramsUsed: 0, costPerGram: 0 };
      const costPerGram = Number(filament.spool_cost) / Number(filament.spool_weight_grams);
      return { gramsUsed: usage.gramsUsed, costPerGram };
    });
  }, [filamentUsages, filaments]);

  const costBreakdown: PrintCostBreakdown = useMemo(() => {
    return calculatePrintCost({
      filamentCosts,
      printerPowerWatts: Number(selectedPrinter?.power_watts) || 200,
      printTimeMinutes,
      electricityPricePerKwh: Number(selectedElectricity?.price_per_kwh) || 0.15,
      printerPurchaseCost: Number(selectedPrinter?.purchase_cost) || 0,
      printerDepreciationHours: Number(selectedPrinter?.depreciation_hours) || 5000,
      maintenanceCostPerYear: Number(selectedPrinter?.maintenance_cost) || 0,
      printingHoursPerYear: 1000,
      laborTimeMinutes,
      hourlyRate: Number(laborSettings?.hourly_rate) || 10,
      includeLaborInCost: laborSettings?.include_in_cost ?? true,
      shippingCost: Number(selectedShipping?.price) || 0,
      consumablesCost: selectedConsumablesCost,
      fixedExpensesCost: selectedExpensesCost,
      modelCost,
      wastagePercent,
      failureRatePercent,
      quantity,
    });
  }, [filamentCosts, selectedPrinter, printTimeMinutes, selectedElectricity, laborTimeMinutes, laborSettings, selectedShipping, selectedConsumablesCost, selectedExpensesCost, modelCost, wastagePercent, failureRatePercent, quantity]);

  const pricing: PricingResult = useMemo(() => calculatePricingFromMarkup(costBreakdown.costPerUnit, markupPercent), [costBreakdown.costPerUnit, markupPercent]);

  // Reset form
  const resetForm = () => {
    setName('');
    setPrintTimeInput('60');
    setSelectedPrinterId(printers[0]?.id || '');
    setSelectedElectricityId(electricitySettings.find(e => e.is_default)?.id || electricitySettings[0]?.id || '');
    setSelectedShippingId('');
    setFilamentUsages([]);
    setLaborTimeMinutes(laborSettings?.default_minutes_per_print || 15);
    setQuantity(1);
    setWastagePercent(5);
    setFailureRatePercent(5);
    setModelCost(0);
    setMarkupPercent(50);
    setNotes('');
    setImageUrl(null);
    setEditingPrint(null);
    setSelectedConsumableIds([]);
    setSelectedExpenseIds([]);
  };

  const handleNewPrint = () => {
    resetForm();
    setIsDialogOpen(true);
  };

  const handleEditPrint = async (print: Print) => {
    setEditingPrint(print);
    setName(print.name);
    setPrintTimeInput(String(print.print_time_minutes));
    setSelectedPrinterId(print.printer_id || '');
    setSelectedElectricityId(print.electricity_settings_id || '');
    setSelectedShippingId(print.shipping_option_id || '');
    setLaborTimeMinutes(print.labor_time_minutes || 15);
    setQuantity(print.quantity || 1);
    setWastagePercent(Number(print.wastage_percent) || 5);
    setFailureRatePercent(Number(print.failure_rate_percent) || 5);
    setModelCost(Number(print.model_cost) || 0);
    setMarkupPercent(Number(print.markup_percent) || 50);
    setNotes(print.notes || '');
    setImageUrl((print as any).image_url || null);

    // Load filament usages
    const usages = printFilaments
      .filter(pf => pf.print_id === print.id)
      .map(pf => {
        const filament = filaments.find(f => f.id === pf.filament_id);
        const costPerGram = filament ? Number(filament.spool_cost) / Number(filament.spool_weight_grams) : 0;
        return {
          filamentId: pf.filament_id,
          filamentName: filament?.name || '',
          gramsUsed: Number(pf.grams_used),
          costPerGram,
        };
      });
    setFilamentUsages(usages);
    
    // Load selected consumables and expenses for this print
    const consumableIds = printConsumables
      .filter(pc => pc.print_id === print.id)
      .map(pc => pc.consumable_id);
    setSelectedConsumableIds(consumableIds);
    
    const expenseIds = printExpenses
      .filter(pe => pe.print_id === print.id)
      .map(pe => pe.expense_id);
    setSelectedExpenseIds(expenseIds);
    
    setIsDialogOpen(true);
  };

  const handleSavePrint = async () => {
    if (!user || !name.trim()) {
      toast({ title: t('calculator.prints.enterName', 'Please enter a name'), variant: 'destructive' });
      return;
    }

    setSaving(true);
    try {
      const printData = {
        user_id: user.id,
        name: name.trim(),
        print_time_minutes: printTimeMinutes,
        printer_id: selectedPrinterId || null,
        electricity_settings_id: selectedElectricityId || null,
        shipping_option_id: selectedShippingId || null,
        labor_time_minutes: laborTimeMinutes,
        quantity,
        wastage_percent: wastagePercent,
        failure_rate_percent: failureRatePercent,
        model_cost: modelCost,
        markup_percent: markupPercent,
        notes: notes || null,
        image_url: imageUrl,
        filament_cost: costBreakdown.filamentCost,
        electricity_cost: costBreakdown.electricityCost,
        depreciation_cost: costBreakdown.depreciationCost,
        labor_cost: costBreakdown.laborCost,
        shipping_cost: costBreakdown.shippingCost,
        consumables_cost: costBreakdown.consumablesCost,
        fixed_expenses_cost: costBreakdown.fixedExpensesCost,
        total_cost: costBreakdown.totalCost,
        sell_price: pricing.sellPrice,
        profit: pricing.profit,
        profit_margin_percent: pricing.profitMarginPercent,
      };

      let printId: string;

      if (editingPrint) {
        const { error } = await supabase.from('calc_prints').update(printData).eq('id', editingPrint.id);
        if (error) throw error;
        printId = editingPrint.id;
      } else {
        const { data, error } = await supabase.from('calc_prints').insert(printData).select().single();
        if (error) throw error;
        printId = data.id;
      }

      // Save filament usages
      await supabase.from('calc_print_filaments').delete().eq('print_id', printId);
      if (filamentUsages.length > 0) {
        const filamentData = filamentUsages.map(fu => ({
          print_id: printId,
          filament_id: fu.filamentId,
          grams_used: fu.gramsUsed,
        }));
        await supabase.from('calc_print_filaments').insert(filamentData);
      }
      
      // Save selected consumables
      await supabase.from('calc_print_consumables').delete().eq('print_id', printId);
      if (selectedConsumableIds.length > 0) {
        const consumableData = selectedConsumableIds.map(cId => ({
          print_id: printId,
          consumable_id: cId,
        }));
        await supabase.from('calc_print_consumables').insert(consumableData);
      }
      
      // Save selected expenses
      await supabase.from('calc_print_expenses').delete().eq('print_id', printId);
      if (selectedExpenseIds.length > 0) {
        const expenseData = selectedExpenseIds.map(eId => ({
          print_id: printId,
          expense_id: eId,
        }));
        await supabase.from('calc_print_expenses').insert(expenseData);
      }

      toast({ title: editingPrint ? t('calculator.prints.updated', 'Print updated') : t('calculator.prints.saved', 'Print saved') });
      setIsDialogOpen(false);
      resetForm();
      await loadAllData(user.id);
      setSelectedPrintId(printId);
    } catch (error) {
      console.error('Error saving print:', error);
      toast({ title: t('calculator.common.errorSaving', 'Error saving'), variant: 'destructive' });
    } finally {
      setSaving(false);
    }
  };

  const handleDeletePrint = async (printId: string) => {
    if (!user) return;
    try {
      await supabase.from('calc_print_filaments').delete().eq('print_id', printId);
      await supabase.from('calc_prints').delete().eq('id', printId);
      toast({ title: t('calculator.prints.deleted', 'Print deleted') });
      if (selectedPrintId === printId) setSelectedPrintId(null);
      await loadAllData(user.id);
    } catch (error) {
      console.error('Error deleting print:', error);
      toast({ title: t('calculator.common.errorDeleting', 'Error deleting'), variant: 'destructive' });
    }
  };

  const openDeleteDialog = (printId: string, printName: string) => {
    setDeleteTargetId(printId);
    setDeleteTargetName(printName);
    setDeleteDialogOpen(true);
  };

  const handleConfirmDelete = async () => {
    if (deleteTargetId) {
      await handleDeletePrint(deleteTargetId);
    }
    setDeleteDialogOpen(false);
    setDeleteTargetId(null);
    setDeleteTargetName('');
  };

  const handleDuplicatePrint = async (print: Print) => {
    await handleEditPrint(print);
    setEditingPrint(null);
    setName(`${print.name} (copy)`);
  };

  // Open publish dialog
  const openPublishDialog = (print: Print) => {
    // Set default price with IVA (23%)
    const priceWithVat = (Number(print.sell_price) || 0) * 1.23;
    setPublishPrice(priceWithVat);
    setPublishOverridePrice(false);
    setPublishDescription(print.notes || '');
    setPublishStock(1);
    setPublishCategory('car-parts');
    setIsPublishDialogOpen(true);
  };

  // Handle publishing to shop
  const handlePublishToShop = async () => {
    if (!selectedPrint || !user) return;
    
    setIsPublishing(true);
    try {
      // Calculate price with IVA (23%)
      const baseSellPrice = Number(selectedPrint.sell_price) || 0;
      const priceWithVat = baseSellPrice * 1.23;
      const finalPrice = publishOverridePrice ? publishPrice : priceWithVat;
      
      const productData = {
        name: selectedPrint.name,
        description: publishDescription || selectedPrint.notes || '',
        category: publishCategory,
        price: finalPrice,
        base_price: priceWithVat,
        cost_price: Number(selectedPrint.total_cost),
        stock_quantity: publishStock,
        calc_print_id: selectedPrint.id,
        images: selectedPrint.image_url ? [selectedPrint.image_url] : [],
        is_active: true,
      };

      const { error } = await supabase.from('products').insert(productData);
      if (error) throw error;

      toast({ title: 'Product published to shop!' });
      setIsPublishDialogOpen(false);
    } catch (error) {
      console.error('Error publishing to shop:', error);
      toast({ title: 'Error publishing product', variant: 'destructive' });
    } finally {
      setIsPublishing(false);
    }
  };

  // Selected print details
  const selectedPrint = prints.find(p => p.id === selectedPrintId);
  const selectedPrintFilamentUsages = printFilaments.filter(pf => pf.print_id === selectedPrintId);
  const selectedPrintTotalGrams = selectedPrintFilamentUsages.reduce((sum, pf) => sum + Number(pf.grams_used), 0);

  // Discount table calculation
  const discountTable = useMemo(() => {
    if (!selectedPrint) return [];
    const basePrice = Number(selectedPrint.sell_price) || 0;
    const cost = Number(selectedPrint.total_cost) || 0;
    const discounts = [0, 5, 10, 20, 30, 50];
    
    return discounts.map(discount => {
      const discountedPrice = basePrice * (1 - discount / 100);
      const discountAmount = basePrice - discountedPrice;
      const profit = discountedPrice - cost;
      return { discount, price: discountedPrice, cost, discountAmount, profit };
    });
  }, [selectedPrint]);

  if (loading) {
    return (
      <CalculatorLayout>
        <div className="flex items-center justify-center h-64">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
        </div>
      </CalculatorLayout>
    );
  }

  const hasRequiredData = printers.length > 0 && filaments.length > 0;

  return (
    <CalculatorLayout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold">{t('calculator.prints.title', 'Prints')}</h1>
            <p className="text-muted-foreground">{t('calculator.prints.subtitle', 'Calculate costs and pricing for your 3D prints')}</p>
          </div>
          <Button onClick={handleNewPrint} disabled={!hasRequiredData}>
            <Plus className="h-4 w-4 mr-2" />
            {t('calculator.prints.newPrint', 'New Print')}
          </Button>
        </div>

        {/* Warning if missing data */}
        {!hasRequiredData && (
          <Card className="border-yellow-500/50 bg-yellow-500/10">
            <CardContent className="pt-6">
              <p className="text-sm">
                {t('calculator.prints.missingDataWarning', 'Before creating print calculations, you need to add at least one')}{' '}
                {printers.length === 0 && <span className="font-medium">{t('calculator.printers.title', 'printer')}</span>}
                {printers.length === 0 && filaments.length === 0 && ` ${t('calculator.common.and', 'and')} `}
                {filaments.length === 0 && <span className="font-medium">{t('calculator.filaments.title', 'filament')}</span>}.
              </p>
              <div className="flex gap-2 mt-4">
                {printers.length === 0 && (
                  <Button variant="outline" size="sm" onClick={() => navigate('/calculator/printers')}>
                    {t('calculator.prints.addPrinter', 'Add Printer')}
                  </Button>
                )}
                {filaments.length === 0 && (
                  <Button variant="outline" size="sm" onClick={() => navigate('/calculator/filaments')}>
                    {t('calculator.prints.addFilament', 'Add Filament')}
                  </Button>
                )}
              </div>
            </CardContent>
          </Card>
        )}

        {/* Main two-column layout */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Left: Prints list */}
          <Card>
            <CardHeader className="pb-4">
              <div className="flex items-center justify-between">
                <CardTitle className="text-lg">
                  {t('calculator.prints.yourPrints', 'Your Prints')} ({filteredPrints.length})
                </CardTitle>
                <Button variant="outline" size="sm" disabled>
                  <FileText className="h-4 w-4 mr-2" />
                  {t('calculator.prints.batch', 'Batch')}
                </Button>
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              {/* Search */}
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder={t('calculator.prints.searchPlaceholder', 'Search prints...')}
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-10"
                />
              </div>

              {/* Filters */}
              <div className="flex gap-2">
                <Select value={filterPrinter} onValueChange={setFilterPrinter}>
                  <SelectTrigger className="flex-1">
                    <SelectValue placeholder={t('calculator.prints.allPrinters', 'All Printers')} />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">{t('calculator.prints.allPrinters', 'All Printers')}</SelectItem>
                    {printers.map(p => (
                      <SelectItem key={p.id} value={p.id}>{p.name}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <Select value={filterFilament} onValueChange={setFilterFilament}>
                  <SelectTrigger className="flex-1">
                    <SelectValue placeholder={t('calculator.prints.allFilaments', 'All Filaments')} />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">{t('calculator.prints.allFilaments', 'All Filaments')}</SelectItem>
                    {filaments.map(f => (
                      <SelectItem key={f.id} value={f.id}>{f.name}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <Select value={sortBy} onValueChange={setSortBy}>
                  <SelectTrigger className="w-[120px]">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="newest">{t('calculator.prints.sortNewest', 'Newest')}</SelectItem>
                    <SelectItem value="oldest">{t('calculator.prints.sortOldest', 'Oldest')}</SelectItem>
                    <SelectItem value="name">{t('calculator.prints.sortName', 'Name')}</SelectItem>
                    <SelectItem value="profit">{t('calculator.prints.sortProfit', 'Profit')}</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              {/* Print list */}
              <div className="space-y-2 max-h-[600px] overflow-y-auto pr-2">
                {filteredPrints.length === 0 ? (
                  <p className="text-sm text-muted-foreground text-center py-8">
                    {t('calculator.prints.noCalculations', 'No calculations yet. Create your first one!')}
                  </p>
                ) : (
                  filteredPrints.map(print => {
                    const { name: filamentName, totalGrams } = getFilamentInfo(print.id);
                    return (
                      <PrintListItem
                        key={print.id}
                        print={print}
                        printerName={getPrinterName(print.printer_id)}
                        filamentName={filamentName}
                        totalGrams={totalGrams}
                        isSelected={selectedPrintId === print.id}
                        onSelect={setSelectedPrintId}
                        onEdit={(id) => {
                          const p = prints.find(pr => pr.id === id);
                          if (p) handleEditPrint(p);
                        }}
                        onDelete={(id) => {
                          const p = prints.find(pr => pr.id === id);
                          if (p) openDeleteDialog(id, p.name);
                        }}
                        onDuplicate={(id) => {
                          const p = prints.find(pr => pr.id === id);
                          if (p) handleDuplicatePrint(p);
                        }}
                      />
                    );
                  })
                )}
              </div>
            </CardContent>
          </Card>

          {/* Right: Print details & breakdown */}
          <div className="space-y-4">
            {selectedPrint ? (
              <>
                {/* Print header */}
                <Card>
                  <CardHeader className="pb-3">
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <CardTitle className="text-xl">{selectedPrint.name}</CardTitle>
                        <p className="text-sm text-muted-foreground mt-1">
                          {getPrinterName(selectedPrint.printer_id) || t('calculator.prints.noPrinter', 'No printer')} • {getFilamentInfo(selectedPrint.id).name || t('calculator.prints.noFilament', 'No filament')}
                        </p>
                      </div>
                      <div className="flex gap-2">
                        <Button variant="outline" size="sm" disabled>
                          <FileText className="h-4 w-4 mr-1" />
                          CSV
                        </Button>
                        <Button variant="outline" size="sm" disabled>
                          <Download className="h-4 w-4 mr-1" />
                          PDF
                        </Button>
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <div className="grid grid-cols-2 gap-4">
                      {/* Image */}
                      {(selectedPrint as any).image_url && (
                        <div className="col-span-2">
                          <img 
                            src={(selectedPrint as any).image_url} 
                            alt={selectedPrint.name}
                            className="w-full h-48 object-cover rounded-lg"
                          />
                        </div>
                      )}
                      <div className="p-3 bg-muted rounded-lg">
                        <p className="text-xs text-muted-foreground">{t('calculator.prints.filamentUsed', 'Filament Used')}</p>
                        <p className="font-medium">{selectedPrintTotalGrams.toFixed(1)}g</p>
                      </div>
                      <div className="p-3 bg-muted rounded-lg">
                        <p className="text-xs text-muted-foreground">{t('calculator.prints.printTime', 'Print Time')}</p>
                        <p className="font-medium">{formatTime(selectedPrint.print_time_minutes)}</p>
                      </div>
                    </div>
                  </CardContent>
                </Card>

                {/* Recommended Sale Price */}
                <Card className="bg-amber-500 text-amber-950 border-0">
                  <CardContent className="pt-6">
                    <div className="flex items-center gap-2 mb-2">
                      <DollarSign className="h-5 w-5" />
                      <span className="font-medium">{t('calculator.prints.recommendedPrice', 'Recommended Sale Price')}</span>
                    </div>
                    <p className="text-2xl font-bold">{formatCurrency(Number(selectedPrint.sell_price) || 0)}</p>
                    <div className="flex items-center gap-2 mt-2 text-amber-900">
                      <span>+ IVA (23%): {formatCurrency((Number(selectedPrint.sell_price) || 0) * 0.23)}</span>
                    </div>
                    <p className="text-4xl font-bold mt-2">{formatCurrency((Number(selectedPrint.sell_price) || 0) * 1.23)}</p>
                    <p className="text-xs text-amber-800 mt-1">{t('calculator.prints.priceWithTax', 'Price with IVA included')}</p>
                    <div className="flex items-center gap-2 mt-2 text-amber-900">
                      <TrendingUp className="h-4 w-4" />
                      <span>{t('calculator.prints.profit', 'Profit')}: {formatCurrency(Number(selectedPrint.profit) || 0)}</span>
                    </div>
                  </CardContent>
                </Card>

                {/* Publish to Shop Button - Admin Only */}
                {isAdmin && (
                  <Button 
                    className="w-full" 
                    variant="default"
                    onClick={() => openPublishDialog(selectedPrint)}
                  >
                    <Store className="h-4 w-4 mr-2" />
                    Publish to Shop
                  </Button>
                )}

                {/* Cost Breakdown */}
                <Card>
                  <CardHeader className="pb-3">
                    <CardTitle className="text-base">{t('calculator.prints.costBreakdown', 'Cost Breakdown')}</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-2 text-sm">
                    {[
                      { label: t('calculator.prints.filament', 'Filament'), value: selectedPrint.filament_cost },
                      { label: t('calculator.prints.depreciation', 'Depreciation'), value: selectedPrint.depreciation_cost },
                      { label: t('calculator.prints.electricity', 'Electricity'), value: selectedPrint.electricity_cost },
                      { label: t('calculator.prints.consumables', 'Consumables'), value: selectedPrint.consumables_cost },
                      { label: t('calculator.prints.preparation', 'Preparation'), value: selectedPrint.labor_cost },
                      { label: t('calculator.prints.postProcessing', 'Post-Processing'), value: 0 },
                      { label: t('calculator.prints.shipping', 'Shipping'), value: selectedPrint.shipping_cost },
                      { label: t('calculator.prints.subscriptionsFixed', 'Subscriptions/Fixed'), value: selectedPrint.fixed_expenses_cost },
                    ].map((item, i) => (
                      <div key={i} className="flex justify-between">
                        <span className="text-muted-foreground">{item.label}</span>
                        <span>{formatCurrency(Number(item.value) || 0)}</span>
                      </div>
                    ))}
                    <Separator className="my-2" />
                    <div className="flex justify-between font-medium">
                      <span>{t('calculator.prints.totalProductionCost', 'Total Production Cost')}</span>
                      <span>{formatCurrency(Number(selectedPrint.total_cost) || 0)}</span>
                    </div>
                    <div className="flex justify-between text-green-600 font-medium">
                      <span>{t('calculator.prints.profitPercent', 'Profit')} ({(selectedPrint.profit_margin_percent ?? 0).toFixed(0)}%)</span>
                      <span>{formatCurrency(Number(selectedPrint.profit) || 0)}</span>
                    </div>
                    
                    {/* VAT Breakdown */}
                    {showVatInCalculator && (
                      <>
                        <Separator className="my-2" />
                        <div className="bg-muted/50 p-3 rounded-lg space-y-2">
                          <div className="flex justify-between">
                            <span className="text-muted-foreground">{t('calculator.prints.basePrice', 'Base Price (excl. VAT)')}</span>
                            <span>{formatCurrency(Number(selectedPrint.sell_price) || 0)}</span>
                          </div>
                          <div className="flex justify-between">
                            <span className="text-muted-foreground">{t('calculator.prints.vatAmount', 'VAT')} ({vatRate}%)</span>
                            <span>{formatCurrency((Number(selectedPrint.sell_price) || 0) * (vatRate / 100))}</span>
                          </div>
                          <div className="flex justify-between font-bold text-primary">
                            <span>{t('calculator.prints.totalWithVat', 'Total (incl. VAT)')}</span>
                            <span>{formatCurrency((Number(selectedPrint.sell_price) || 0) * (1 + vatRate / 100))}</span>
                          </div>
                        </div>
                      </>
                    )}
                  </CardContent>
                </Card>

                {/* Discount Table */}
                <Card>
                  <CardHeader className="pb-3">
                    <CardTitle className="text-base">{t('calculator.prints.discountTable', 'Discount Table (without VAT)')}</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="overflow-x-auto">
                      <table className="w-full text-sm">
                        <thead>
                          <tr className="border-b">
                            <th className="text-left py-2 font-medium text-muted-foreground">{t('calculator.prints.discount', 'Discount')}</th>
                            {discountTable.map(d => (
                              <th key={d.discount} className="text-center py-2 font-medium text-muted-foreground">{d.discount}%</th>
                            ))}
                          </tr>
                        </thead>
                        <tbody>
                          <tr className="border-b">
                            <td className="py-2">{t('calculator.prints.price', 'Price')}</td>
                            {discountTable.map(d => (
                              <td key={d.discount} className="text-center py-2">{formatCurrency(d.price)}</td>
                            ))}
                          </tr>
                          <tr className="border-b">
                            <td className="py-2">{t('calculator.prints.cost', 'Cost')}</td>
                            {discountTable.map(d => (
                              <td key={d.discount} className="text-center py-2 text-muted-foreground">{formatCurrency(d.cost)}</td>
                            ))}
                          </tr>
                          <tr className="border-b">
                            <td className="py-2">{t('calculator.prints.discountAmount', 'Discount')}</td>
                            {discountTable.map(d => (
                              <td key={d.discount} className="text-center py-2 text-muted-foreground">{formatCurrency(d.discountAmount)}</td>
                            ))}
                          </tr>
                          <tr>
                            <td className="py-2">{t('calculator.prints.profit', 'Profit')}</td>
                            {discountTable.map(d => (
                              <td key={d.discount} className={`text-center py-2 font-medium ${d.profit >= 0 ? 'text-green-600' : 'text-red-500'}`}>
                                {formatCurrency(d.profit)}
                              </td>
                            ))}
                          </tr>
                        </tbody>
                      </table>
                    </div>
                  </CardContent>
                </Card>
              </>
            ) : (
              <Card>
                <CardContent className="flex flex-col items-center justify-center h-64 text-muted-foreground">
                  <Calculator className="h-12 w-12 mb-4 opacity-50" />
                  <p>{t('calculator.prints.selectCalculation', 'Select a calculation to view details')}</p>
                  <p className="text-sm">{t('calculator.prints.orCreateNew', 'or create a new one')}</p>
                </CardContent>
              </Card>
            )}
          </div>
        </div>
      </div>

      {/* Create/Edit Dialog */}
      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>
              {editingPrint ? t('calculator.prints.editCalculation', 'Edit Calculation') : t('calculator.prints.newCalculation', 'New Print Calculation')}
            </DialogTitle>
          </DialogHeader>

          <Tabs defaultValue="basic" className="w-full">
            <TabsList className="grid w-full grid-cols-3">
              <TabsTrigger value="basic">{t('calculator.prints.basicInfo', 'Basic Info')}</TabsTrigger>
              <TabsTrigger value="costs">{t('calculator.prints.costsSettings', 'Costs & Settings')}</TabsTrigger>
              <TabsTrigger value="pricing">{t('calculator.prints.pricing', 'Pricing')}</TabsTrigger>
            </TabsList>

            <TabsContent value="basic" className="space-y-4 mt-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="col-span-2">
                  <Label htmlFor="name">{t('calculator.prints.printName', 'Print Name')} *</Label>
                  <Input
                    id="name"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder="e.g., Phone Stand v2"
                  />
                </div>

                <div className="col-span-2">
                  <Label>{t('calculator.prints.photo', 'Photo')}</Label>
                  <PrintImageUpload imageUrl={imageUrl} onImageChange={setImageUrl} />
                </div>

                <div>
                  <Label htmlFor="printer">{t('calculator.prints.printer', 'Printer')}</Label>
                  <Select value={selectedPrinterId} onValueChange={setSelectedPrinterId}>
                    <SelectTrigger>
                      <SelectValue placeholder={t('calculator.prints.selectPrinter', 'Select printer')} />
                    </SelectTrigger>
                    <SelectContent>
                      {printers.map(printer => (
                        <SelectItem key={printer.id} value={printer.id}>{printer.name}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div>
                  <Label htmlFor="printTime">{t('calculator.prints.printTimeLabel', 'Print Time (minutes or "Xh Ym")')}</Label>
                  <Input
                    id="printTime"
                    value={printTimeInput}
                    onChange={(e) => setPrintTimeInput(e.target.value)}
                    placeholder="e.g., 120 or 2h 30m"
                  />
                  <p className="text-xs text-muted-foreground mt-1">
                    {t('calculator.prints.parsed', 'Parsed')}: {formatTime(printTimeMinutes)}
                  </p>
                </div>

                <div className="col-span-2">
                  <Label>{t('calculator.prints.filamentsUsed', 'Filaments Used')}</Label>
                  <MultiFilamentSelector
                    filaments={filaments}
                    selectedFilaments={filamentUsages}
                    onChange={setFilamentUsages}
                  />
                </div>

                <div>
                  <Label htmlFor="quantity">{t('calculator.prints.quantity', 'Quantity')}</Label>
                  <Input
                    id="quantity"
                    type="number"
                    min={1}
                    value={quantity}
                    onChange={(e) => setQuantity(parseInt(e.target.value) || 1)}
                  />
                </div>

                <div>
                  <Label htmlFor="modelCost">{t('calculator.prints.modelCost', 'Model/Design Cost (€)')}</Label>
                  <Input
                    id="modelCost"
                    type="number"
                    min={0}
                    step={0.01}
                    value={modelCost}
                    onChange={(e) => setModelCost(parseFloat(e.target.value) || 0)}
                  />
                </div>
              </div>
            </TabsContent>

            <TabsContent value="costs" className="space-y-4 mt-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="electricity">{t('calculator.prints.electricitySettings', 'Electricity Settings')}</Label>
                  <Select value={selectedElectricityId} onValueChange={setSelectedElectricityId}>
                    <SelectTrigger>
                      <SelectValue placeholder={t('calculator.prints.selectSettings', 'Select settings')} />
                    </SelectTrigger>
                    <SelectContent>
                      {electricitySettings.map(setting => (
                        <SelectItem key={setting.id} value={setting.id}>
                          {setting.name} ({formatCurrency(Number(setting.price_per_kwh))}/kWh)
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div>
                  <Label htmlFor="shipping">{t('calculator.prints.shippingOption', 'Shipping Option')}</Label>
                  <Select value={selectedShippingId || 'none'} onValueChange={(v) => setSelectedShippingId(v === 'none' ? '' : v)}>
                    <SelectTrigger>
                      <SelectValue placeholder={t('calculator.prints.noShipping', 'No shipping')} />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="none">{t('calculator.prints.noShipping', 'No shipping')}</SelectItem>
                      {shippingOptions.map(option => (
                        <SelectItem key={option.id} value={option.id}>
                          {option.name} ({formatCurrency(Number(option.price))})
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div>
                  <Label htmlFor="laborTime">{t('calculator.prints.laborTime', 'Labor Time (minutes)')}</Label>
                  <Input
                    id="laborTime"
                    type="number"
                    min={0}
                    value={laborTimeMinutes}
                    onChange={(e) => setLaborTimeMinutes(parseInt(e.target.value) || 0)}
                  />
                  {laborSettings && (
                    <p className="text-xs text-muted-foreground mt-1">
                      {t('calculator.prints.rate', 'Rate')}: {formatCurrency(Number(laborSettings.hourly_rate))}/hour
                    </p>
                  )}
                </div>

                <div>
                  <Label htmlFor="wastage">{t('calculator.prints.wastage', 'Wastage %')}</Label>
                  <Input
                    id="wastage"
                    type="number"
                    min={0}
                    max={100}
                    value={wastagePercent}
                    onChange={(e) => setWastagePercent(parseFloat(e.target.value) || 0)}
                  />
                </div>

                <div>
                  <Label htmlFor="failure">{t('calculator.prints.failureRate', 'Failure Rate %')}</Label>
                  <Input
                    id="failure"
                    type="number"
                    min={0}
                    max={100}
                    value={failureRatePercent}
                    onChange={(e) => setFailureRatePercent(parseFloat(e.target.value) || 0)}
                  />
                </div>

                <div className="col-span-2">
                  <Label htmlFor="notes">{t('calculator.prints.notes', 'Notes')}</Label>
                  <Textarea
                    id="notes"
                    value={notes}
                    onChange={(e) => setNotes(e.target.value)}
                    placeholder={t('calculator.prints.notesPlaceholder', 'Any additional notes...')}
                    rows={3}
                  />
                </div>
                
                {/* Consumables and Fixed Expenses Selection */}
                <div className="col-span-2">
                  <Separator className="my-4" />
                  <ConsumableExpenseSelector
                    consumables={consumables}
                    fixedExpenses={fixedExpenses}
                    selectedConsumableIds={selectedConsumableIds}
                    selectedExpenseIds={selectedExpenseIds}
                    onConsumablesChange={setSelectedConsumableIds}
                    onExpensesChange={setSelectedExpenseIds}
                  />
                </div>
              </div>
            </TabsContent>

            <TabsContent value="pricing" className="space-y-4 mt-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="markup">{t('calculator.prints.markup', 'Markup %')}</Label>
                  <Input
                    id="markup"
                    type="number"
                    min={0}
                    value={markupPercent}
                    onChange={(e) => setMarkupPercent(parseFloat(e.target.value) || 0)}
                  />
                </div>
                <div className="flex items-end">
                  <div className="text-sm text-muted-foreground">
                    {t('calculator.prints.profitMargin', 'Profit Margin')}: {pricing.profitMarginPercent.toFixed(1)}%
                  </div>
                </div>
              </div>

              {/* Live cost breakdown */}
              <Card className="bg-muted/50">
                <CardHeader>
                  <CardTitle className="text-base">{t('calculator.prints.livePreview', 'Cost Breakdown (Live Preview)')}</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-2 gap-2 text-sm">
                    {[
                      { label: t('calculator.prints.filament', 'Filament'), value: costBreakdown.filamentCost },
                      { label: t('calculator.prints.electricity', 'Electricity'), value: costBreakdown.electricityCost },
                      { label: t('calculator.prints.depreciation', 'Depreciation'), value: costBreakdown.depreciationCost },
                      { label: t('calculator.prints.maintenance', 'Maintenance'), value: costBreakdown.maintenanceCost },
                      { label: t('calculator.prints.labor', 'Labor'), value: costBreakdown.laborCost },
                      { label: t('calculator.prints.shipping', 'Shipping'), value: costBreakdown.shippingCost },
                      { label: t('calculator.prints.consumables', 'Consumables'), value: costBreakdown.consumablesCost },
                      { label: t('calculator.prints.fixedExpenses', 'Fixed Expenses'), value: costBreakdown.fixedExpensesCost },
                      { label: t('calculator.prints.wastageLabel', 'Wastage'), value: costBreakdown.wastageCost },
                      { label: t('calculator.prints.failureBuffer', 'Failure Buffer'), value: costBreakdown.failureCost },
                    ].map((item, i) => (
                      <div key={i} className="flex justify-between">
                        <span>{item.label}:</span>
                        <span>{formatCurrency(item.value)}</span>
                      </div>
                    ))}
                  </div>

                  <Separator className="my-4" />

                  <div className="grid grid-cols-3 gap-4 text-center">
                    <div>
                      <p className="text-xs text-muted-foreground">{t('calculator.prints.costUnit', 'Cost/Unit')}</p>
                      <p className="font-bold">{formatCurrency(costBreakdown.costPerUnit)}</p>
                    </div>
                    <div>
                      <p className="text-xs text-muted-foreground">{t('calculator.prints.sellPrice', 'Sell Price')}</p>
                      <p className="font-bold text-primary">{formatCurrency(pricing.sellPrice)}</p>
                    </div>
                    <div>
                      <p className="text-xs text-muted-foreground">{t('calculator.prints.profitUnit', 'Profit/Unit')}</p>
                      <p className="font-bold text-green-500">{formatCurrency(pricing.profit)}</p>
                    </div>
                  </div>

                  {quantity > 1 && (
                    <>
                      <Separator className="my-4" />
                      <div className="text-center">
                        <p className="text-xs text-muted-foreground">{t('calculator.prints.totalFor', 'Total for')} {quantity} {t('calculator.prints.units', 'units')}</p>
                        <p className="font-bold text-lg">{formatCurrency(costBreakdown.totalCost)}</p>
                      </div>
                    </>
                  )}
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>

          <DialogFooter>
            <Button variant="outline" onClick={() => setIsDialogOpen(false)}>
              {t('calculator.common.cancel', 'Cancel')}
            </Button>
            <Button onClick={handleSavePrint} disabled={saving || !name.trim()}>
              {saving ? t('calculator.common.saving', 'Saving...') : (
                <>
                  <Save className="h-4 w-4 mr-2" />
                  {t('calculator.common.save', 'Save')}
                </>
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Publish to Shop Dialog */}
      <Dialog open={isPublishDialogOpen} onOpenChange={setIsPublishDialogOpen}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Store className="h-5 w-5" />
              Publish to Shop
            </DialogTitle>
            <DialogDescription>
              Create a product from "{selectedPrint?.name}"
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4 py-4">
            <div>
              <Label>Category</Label>
              <Select value={publishCategory} onValueChange={setPublishCategory}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="car-parts">Car Parts</SelectItem>
                  <SelectItem value="home-decor">Home Decor</SelectItem>
                  <SelectItem value="accessories">Accessories</SelectItem>
                  <SelectItem value="custom">Custom</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div>
              <Label>Description</Label>
              <Textarea 
                value={publishDescription}
                onChange={(e) => setPublishDescription(e.target.value)}
                placeholder="Product description..."
                rows={3}
              />
            </div>

            <div>
              <Label>Initial Stock</Label>
              <Input 
                type="number"
                min={1}
                value={publishStock}
                onChange={(e) => setPublishStock(parseInt(e.target.value) || 1)}
              />
            </div>

            <Separator />

            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <div>
                  <Label>Override Price</Label>
                  <p className="text-xs text-muted-foreground">
                    Calculated: {formatCurrency(Number(selectedPrint?.sell_price) || 0)}
                  </p>
                </div>
                <Switch 
                  checked={publishOverridePrice}
                  onCheckedChange={setPublishOverridePrice}
                />
              </div>

              {publishOverridePrice && (
                <div>
                  <Label>Custom Price (€)</Label>
                  <Input 
                    type="number"
                    min={0}
                    step={0.01}
                    value={publishPrice}
                    onChange={(e) => setPublishPrice(parseFloat(e.target.value) || 0)}
                  />
                </div>
              )}
            </div>

            <div className="bg-muted p-3 rounded-lg text-sm">
              <div className="flex justify-between">
                <span className="text-muted-foreground">Cost Price:</span>
                <span>{formatCurrency(Number(selectedPrint?.total_cost) || 0)}</span>
              </div>
              <div className="flex justify-between font-medium">
                <span>Final Price:</span>
                <span>{formatCurrency(publishOverridePrice ? publishPrice : Number(selectedPrint?.sell_price) || 0)}</span>
              </div>
              <div className="flex justify-between text-green-600">
                <span>Profit:</span>
                <span>{formatCurrency((publishOverridePrice ? publishPrice : Number(selectedPrint?.sell_price) || 0) - (Number(selectedPrint?.total_cost) || 0))}</span>
              </div>
            </div>
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => setIsPublishDialogOpen(false)}>
              Cancel
            </Button>
            <Button onClick={handlePublishToShop} disabled={isPublishing}>
              {isPublishing ? 'Publishing...' : (
                <>
                  <ShoppingBag className="h-4 w-4 mr-2" />
                  Publish Product
                </>
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <DeleteConfirmDialog
        open={deleteDialogOpen}
        onOpenChange={setDeleteDialogOpen}
        onConfirm={handleConfirmDelete}
        title={t('calculator.prints.deleteConfirmTitle', 'Delete Calculation')}
        description={`${t('calculator.prints.deleteConfirmMessage', 'Are you sure you want to delete')} "${deleteTargetName}"?`}
      />
    </CalculatorLayout>
  );
}