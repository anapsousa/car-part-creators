import { useState, useEffect, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { CalculatorLayout } from '@/components/calculator/CalculatorLayout';
import { MultiFilamentSelector } from '@/components/calculator/MultiFilamentSelector';
import { PrintListItem } from '@/components/calculator/PrintListItem';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Separator } from '@/components/ui/separator';
import { Badge } from '@/components/ui/badge';
import { Plus, Calculator, Save, Trash2, Copy, Package } from 'lucide-react';
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

  // Form state
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingPrint, setEditingPrint] = useState<Print | null>(null);
  const [selectedPrintId, setSelectedPrintId] = useState<string | null>(null);

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
        printsRes,
        printersRes,
        filamentsRes,
        electricityRes,
        shippingRes,
        laborRes,
        consumablesRes,
        expensesRes,
        printFilamentsRes
      ] = await Promise.all([
        supabase.from('calc_prints').select('*').eq('user_id', userId).order('created_at', { ascending: false }),
        supabase.from('calc_printers').select('*').eq('user_id', userId).eq('is_active', true),
        supabase.from('calc_filaments').select('*').eq('user_id', userId).eq('is_active', true),
        supabase.from('calc_electricity_settings').select('*').eq('user_id', userId),
        supabase.from('calc_shipping_options').select('*').eq('user_id', userId).eq('is_active', true),
        supabase.from('calc_labor_settings').select('*').eq('user_id', userId).single(),
        supabase.from('calc_consumables').select('*').eq('user_id', userId).eq('is_active', true),
        supabase.from('calc_fixed_expenses').select('*').eq('user_id', userId).eq('is_active', true),
        supabase.from('calc_print_filaments').select('*')
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
    } catch (error) {
      console.error('Error loading data:', error);
      toast({ title: 'Error loading data', variant: 'destructive' });
    } finally {
      setLoading(false);
    }
  };

  // Calculate costs
  const selectedPrinter = useMemo(() => 
    printers.find(p => p.id === selectedPrinterId), 
    [printers, selectedPrinterId]
  );

  const selectedElectricity = useMemo(() => 
    electricitySettings.find(e => e.id === selectedElectricityId),
    [electricitySettings, selectedElectricityId]
  );

  const selectedShipping = useMemo(() =>
    shippingOptions.find(s => s.id === selectedShippingId),
    [shippingOptions, selectedShippingId]
  );

  const totalConsumablesCost = useMemo(() =>
    consumables.reduce((sum, c) => sum + Number(c.cost), 0),
    [consumables]
  );

  const totalFixedExpensesCost = useMemo(() => {
    // Prorate monthly expenses per print (assuming 100 prints/month as baseline)
    const monthlyTotal = fixedExpenses.reduce((sum, e) => sum + Number(e.monthly_amount), 0);
    return monthlyTotal / 100; // Simple proration
  }, [fixedExpenses]);

  const printTimeMinutes = useMemo(() => 
    parseTimeToMinutes(printTimeInput), 
    [printTimeInput]
  );

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
      printingHoursPerYear: 1000, // Estimate
      laborTimeMinutes,
      hourlyRate: Number(laborSettings?.hourly_rate) || 10,
      includeLaborInCost: laborSettings?.include_in_cost ?? true,
      shippingCost: Number(selectedShipping?.price) || 0,
      consumablesCost: totalConsumablesCost,
      fixedExpensesCost: totalFixedExpensesCost,
      modelCost,
      wastagePercent,
      failureRatePercent,
      quantity,
    });
  }, [
    filamentCosts, selectedPrinter, printTimeMinutes, selectedElectricity,
    laborTimeMinutes, laborSettings, selectedShipping, totalConsumablesCost,
    totalFixedExpensesCost, modelCost, wastagePercent, failureRatePercent, quantity
  ]);

  const pricing: PricingResult = useMemo(() => 
    calculatePricingFromMarkup(costBreakdown.costPerUnit, markupPercent),
    [costBreakdown.costPerUnit, markupPercent]
  );

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
    setEditingPrint(null);
  };

  // Open dialog for new print
  const handleNewPrint = () => {
    resetForm();
    setIsDialogOpen(true);
  };

  // Load print for editing
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

    // Load filament usages for this print
    const usages = printFilaments
      .filter(pf => pf.print_id === print.id)
      .map(pf => {
        const filament = filaments.find(f => f.id === pf.filament_id);
        const costPerGram = filament 
          ? Number(filament.spool_cost) / Number(filament.spool_weight_grams)
          : 0;
        return {
          filamentId: pf.filament_id,
          filamentName: filament?.name || '',
          gramsUsed: Number(pf.grams_used),
          costPerGram,
        };
      });
    setFilamentUsages(usages);

    setIsDialogOpen(true);
  };

  // Save print
  const handleSavePrint = async () => {
    if (!user || !name.trim()) {
      toast({ title: 'Please enter a name', variant: 'destructive' });
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
        // Calculated costs
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
        // Update existing
        const { error } = await supabase
          .from('calc_prints')
          .update(printData)
          .eq('id', editingPrint.id);
        if (error) throw error;
        printId = editingPrint.id;
      } else {
        // Create new
        const { data, error } = await supabase
          .from('calc_prints')
          .insert(printData)
          .select()
          .single();
        if (error) throw error;
        printId = data.id;
      }

      // Update filament usages
      // Delete existing
      await supabase.from('calc_print_filaments').delete().eq('print_id', printId);
      
      // Insert new
      if (filamentUsages.length > 0) {
        const filamentData = filamentUsages.map(fu => ({
          print_id: printId,
          filament_id: fu.filamentId,
          grams_used: fu.gramsUsed,
        }));
        await supabase.from('calc_print_filaments').insert(filamentData);
      }

      toast({ title: editingPrint ? 'Print updated' : 'Print saved' });
      setIsDialogOpen(false);
      resetForm();
      await loadAllData(user.id);
    } catch (error) {
      console.error('Error saving print:', error);
      toast({ title: 'Error saving print', variant: 'destructive' });
    } finally {
      setSaving(false);
    }
  };

  // Delete print
  const handleDeletePrint = async (printId: string) => {
    if (!user) return;
    
    try {
      await supabase.from('calc_print_filaments').delete().eq('print_id', printId);
      await supabase.from('calc_prints').delete().eq('id', printId);
      toast({ title: 'Print deleted' });
      await loadAllData(user.id);
    } catch (error) {
      console.error('Error deleting print:', error);
      toast({ title: 'Error deleting print', variant: 'destructive' });
    }
  };

  // Duplicate print
  const handleDuplicatePrint = async (print: Print) => {
    await handleEditPrint(print);
    setEditingPrint(null);
    setName(`${print.name} (copy)`);
  };

  // Selected print details
  const selectedPrint = prints.find(p => p.id === selectedPrintId);
  const selectedPrintFilaments = printFilaments.filter(pf => pf.print_id === selectedPrintId);

  if (loading) {
    return (
      <CalculatorLayout>
        <div className="flex items-center justify-center h-64">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
        </div>
      </CalculatorLayout>
    );
  }

  // Check if user has required data
  const hasRequiredData = printers.length > 0 && filaments.length > 0;

  return (
    <CalculatorLayout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold">Print Calculations</h1>
            <p className="text-muted-foreground">Calculate costs and profits for your 3D prints</p>
          </div>
          <Button onClick={handleNewPrint} disabled={!hasRequiredData}>
            <Plus className="h-4 w-4 mr-2" />
            New Calculation
          </Button>
        </div>

        {/* Warning if missing data */}
        {!hasRequiredData && (
          <Card className="border-yellow-500/50 bg-yellow-500/10">
            <CardContent className="pt-6">
              <p className="text-sm">
                Before creating print calculations, you need to add at least one{' '}
                {printers.length === 0 && <span className="font-medium">printer</span>}
                {printers.length === 0 && filaments.length === 0 && ' and '}
                {filaments.length === 0 && <span className="font-medium">filament</span>}.
              </p>
              <div className="flex gap-2 mt-4">
                {printers.length === 0 && (
                  <Button variant="outline" size="sm" onClick={() => navigate('/calculator/printers')}>
                    Add Printer
                  </Button>
                )}
                {filaments.length === 0 && (
                  <Button variant="outline" size="sm" onClick={() => navigate('/calculator/filaments')}>
                    Add Filament
                  </Button>
                )}
              </div>
            </CardContent>
          </Card>
        )}

        {/* Main content */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Prints list */}
          <div className="lg:col-span-1">
            <Card>
              <CardHeader>
                <CardTitle className="text-lg flex items-center gap-2">
                  <Package className="h-5 w-5" />
                  Saved Calculations
                </CardTitle>
              </CardHeader>
              <CardContent>
                {prints.length === 0 ? (
                  <p className="text-sm text-muted-foreground text-center py-8">
                    No calculations yet. Create your first one!
                  </p>
                ) : (
                  <div className="space-y-2">
                    {prints.map(print => (
                      <PrintListItem
                        key={print.id}
                        print={print}
                        onEdit={(id) => {
                          const p = prints.find(pr => pr.id === id);
                          if (p) handleEditPrint(p);
                        }}
                        onDelete={(id) => handleDeletePrint(id)}
                        onDuplicate={(id) => {
                          const p = prints.find(pr => pr.id === id);
                          if (p) handleDuplicatePrint(p);
                        }}
                      />
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          </div>

          {/* Print details */}
          <div className="lg:col-span-2">
            {selectedPrint ? (
              <Card>
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <CardTitle>{selectedPrint.name}</CardTitle>
                    <Badge variant="secondary">
                      Qty: {selectedPrint.quantity}
                    </Badge>
                  </div>
                </CardHeader>
                <CardContent className="space-y-6">
                  {/* Cost breakdown */}
                  <div>
                    <h3 className="font-medium mb-3">Cost Breakdown</h3>
                    <div className="grid grid-cols-2 gap-2 text-sm">
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">Filament:</span>
                        <span>{formatCurrency(Number(selectedPrint.filament_cost) || 0)}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">Electricity:</span>
                        <span>{formatCurrency(Number(selectedPrint.electricity_cost) || 0)}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">Depreciation:</span>
                        <span>{formatCurrency(Number(selectedPrint.depreciation_cost) || 0)}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">Labor:</span>
                        <span>{formatCurrency(Number(selectedPrint.labor_cost) || 0)}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">Shipping:</span>
                        <span>{formatCurrency(Number(selectedPrint.shipping_cost) || 0)}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">Consumables:</span>
                        <span>{formatCurrency(Number(selectedPrint.consumables_cost) || 0)}</span>
                      </div>
                    </div>
                  </div>

                  <Separator />

                  {/* Summary */}
                  <div className="grid grid-cols-3 gap-4">
                    <div className="text-center p-4 bg-muted rounded-lg">
                      <p className="text-sm text-muted-foreground">Total Cost</p>
                      <p className="text-xl font-bold">{formatCurrency(Number(selectedPrint.total_cost) || 0)}</p>
                    </div>
                    <div className="text-center p-4 bg-primary/10 rounded-lg">
                      <p className="text-sm text-muted-foreground">Sell Price</p>
                      <p className="text-xl font-bold text-primary">{formatCurrency(Number(selectedPrint.sell_price) || 0)}</p>
                    </div>
                    <div className="text-center p-4 bg-green-500/10 rounded-lg">
                      <p className="text-sm text-muted-foreground">Profit</p>
                      <p className="text-xl font-bold text-green-500">{formatCurrency(Number(selectedPrint.profit) || 0)}</p>
                    </div>
                  </div>

                  {/* Actions */}
                  <div className="flex gap-2">
                    <Button variant="outline" onClick={() => handleEditPrint(selectedPrint)}>
                      Edit
                    </Button>
                    <Button variant="outline" onClick={() => handleDuplicatePrint(selectedPrint)}>
                      <Copy className="h-4 w-4 mr-2" />
                      Duplicate
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ) : (
              <Card>
                <CardContent className="flex flex-col items-center justify-center h-64 text-muted-foreground">
                  <Calculator className="h-12 w-12 mb-4 opacity-50" />
                  <p>Select a calculation to view details</p>
                  <p className="text-sm">or create a new one</p>
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
              {editingPrint ? 'Edit Calculation' : 'New Print Calculation'}
            </DialogTitle>
          </DialogHeader>

          <Tabs defaultValue="basic" className="w-full">
            <TabsList className="grid w-full grid-cols-3">
              <TabsTrigger value="basic">Basic Info</TabsTrigger>
              <TabsTrigger value="costs">Costs & Settings</TabsTrigger>
              <TabsTrigger value="pricing">Pricing</TabsTrigger>
            </TabsList>

            <TabsContent value="basic" className="space-y-4 mt-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="col-span-2">
                  <Label htmlFor="name">Print Name *</Label>
                  <Input
                    id="name"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder="e.g., Phone Stand v2"
                  />
                </div>

                <div>
                  <Label htmlFor="printer">Printer</Label>
                  <Select value={selectedPrinterId} onValueChange={setSelectedPrinterId}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select printer" />
                    </SelectTrigger>
                    <SelectContent>
                      {printers.map(printer => (
                        <SelectItem key={printer.id} value={printer.id}>
                          {printer.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div>
                  <Label htmlFor="printTime">Print Time (minutes or "Xh Ym")</Label>
                  <Input
                    id="printTime"
                    value={printTimeInput}
                    onChange={(e) => setPrintTimeInput(e.target.value)}
                    placeholder="e.g., 120 or 2h 30m"
                  />
                  <p className="text-xs text-muted-foreground mt-1">
                    Parsed: {formatTime(printTimeMinutes)}
                  </p>
                </div>

                <div className="col-span-2">
                  <Label>Filaments Used</Label>
                  <MultiFilamentSelector
                    filaments={filaments}
                    selectedFilaments={filamentUsages}
                    onChange={setFilamentUsages}
                  />
                </div>

                <div>
                  <Label htmlFor="quantity">Quantity</Label>
                  <Input
                    id="quantity"
                    type="number"
                    min={1}
                    value={quantity}
                    onChange={(e) => setQuantity(parseInt(e.target.value) || 1)}
                  />
                </div>

                <div>
                  <Label htmlFor="modelCost">Model/Design Cost (€)</Label>
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
                  <Label htmlFor="electricity">Electricity Settings</Label>
                  <Select value={selectedElectricityId} onValueChange={setSelectedElectricityId}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select settings" />
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
                  <Label htmlFor="shipping">Shipping Option</Label>
                  <Select value={selectedShippingId} onValueChange={setSelectedShippingId}>
                    <SelectTrigger>
                      <SelectValue placeholder="No shipping" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="">No shipping</SelectItem>
                      {shippingOptions.map(option => (
                        <SelectItem key={option.id} value={option.id}>
                          {option.name} ({formatCurrency(Number(option.price))})
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div>
                  <Label htmlFor="laborTime">Labor Time (minutes)</Label>
                  <Input
                    id="laborTime"
                    type="number"
                    min={0}
                    value={laborTimeMinutes}
                    onChange={(e) => setLaborTimeMinutes(parseInt(e.target.value) || 0)}
                  />
                  {laborSettings && (
                    <p className="text-xs text-muted-foreground mt-1">
                      Rate: {formatCurrency(Number(laborSettings.hourly_rate))}/hour
                    </p>
                  )}
                </div>

                <div>
                  <Label htmlFor="wastage">Wastage %</Label>
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
                  <Label htmlFor="failure">Failure Rate %</Label>
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
                  <Label htmlFor="notes">Notes</Label>
                  <Textarea
                    id="notes"
                    value={notes}
                    onChange={(e) => setNotes(e.target.value)}
                    placeholder="Any additional notes..."
                    rows={3}
                  />
                </div>
              </div>
            </TabsContent>

            <TabsContent value="pricing" className="space-y-4 mt-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="markup">Markup %</Label>
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
                    Profit Margin: {pricing.profitMarginPercent.toFixed(1)}%
                  </div>
                </div>
              </div>

              {/* Live cost breakdown */}
              <Card className="bg-muted/50">
                <CardHeader>
                  <CardTitle className="text-base">Cost Breakdown (Live Preview)</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-2 gap-2 text-sm">
                    <div className="flex justify-between">
                      <span>Filament:</span>
                      <span>{formatCurrency(costBreakdown.filamentCost)}</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Electricity:</span>
                      <span>{formatCurrency(costBreakdown.electricityCost)}</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Depreciation:</span>
                      <span>{formatCurrency(costBreakdown.depreciationCost)}</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Maintenance:</span>
                      <span>{formatCurrency(costBreakdown.maintenanceCost)}</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Labor:</span>
                      <span>{formatCurrency(costBreakdown.laborCost)}</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Shipping:</span>
                      <span>{formatCurrency(costBreakdown.shippingCost)}</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Consumables:</span>
                      <span>{formatCurrency(costBreakdown.consumablesCost)}</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Fixed Expenses:</span>
                      <span>{formatCurrency(costBreakdown.fixedExpensesCost)}</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Wastage:</span>
                      <span>{formatCurrency(costBreakdown.wastageCost)}</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Failure Buffer:</span>
                      <span>{formatCurrency(costBreakdown.failureCost)}</span>
                    </div>
                  </div>

                  <Separator className="my-4" />

                  <div className="grid grid-cols-3 gap-4 text-center">
                    <div>
                      <p className="text-xs text-muted-foreground">Cost/Unit</p>
                      <p className="font-bold">{formatCurrency(costBreakdown.costPerUnit)}</p>
                    </div>
                    <div>
                      <p className="text-xs text-muted-foreground">Sell Price</p>
                      <p className="font-bold text-primary">{formatCurrency(pricing.sellPrice)}</p>
                    </div>
                    <div>
                      <p className="text-xs text-muted-foreground">Profit/Unit</p>
                      <p className="font-bold text-green-500">{formatCurrency(pricing.profit)}</p>
                    </div>
                  </div>

                  {quantity > 1 && (
                    <>
                      <Separator className="my-4" />
                      <div className="text-center">
                        <p className="text-xs text-muted-foreground">Total for {quantity} units</p>
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
              Cancel
            </Button>
            <Button onClick={handleSavePrint} disabled={saving || !name.trim()}>
              {saving ? 'Saving...' : (
                <>
                  <Save className="h-4 w-4 mr-2" />
                  {editingPrint ? 'Update' : 'Save'}
                </>
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </CalculatorLayout>
  );
}
