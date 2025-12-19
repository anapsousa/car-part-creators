import { useState, useEffect, useCallback } from 'react';
import { Header } from '@/components/Header';
import { Footer } from '@/components/Footer';
import { CalculatorLayout } from '@/components/calculator/CalculatorLayout';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { Plus, Trash2, Loader2, Zap, DollarSign, Package, Truck, Settings, Save, AlertCircle } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { useNavigate } from 'react-router-dom';
import { useContent } from '@/hooks/useContent';

export default function CalcSettings() {
  const { toast } = useToast();
  const navigate = useNavigate();
  const { content } = useContent('calculator');
  const [loading, setLoading] = useState(true);
  const [savingAll, setSavingAll] = useState(false);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [hasUnsavedChanges, setHasUnsavedChanges] = useState(false);

  // Settings data
  const [electricitySettings, setElectricitySettings] = useState<any[]>([]);
  const [fixedExpenses, setFixedExpenses] = useState<any[]>([]);
  const [consumables, setConsumables] = useState<any[]>([]);
  const [shippingOptions, setShippingOptions] = useState<any[]>([]);
  const [laborSettings, setLaborSettings] = useState<any>(null);
  const [laborRateInput, setLaborRateInput] = useState<number>(10);

  // Original data for comparison
  const [originalData, setOriginalData] = useState<string>('');

  const t = (key: string, fallback: string) => content[key] || fallback;

  // Warn user before closing/refreshing page with unsaved changes
  useEffect(() => {
    const handleBeforeUnload = (e: BeforeUnloadEvent) => {
      if (hasUnsavedChanges) {
        e.preventDefault();
        e.returnValue = '';
      }
    };
    window.addEventListener('beforeunload', handleBeforeUnload);
    return () => window.removeEventListener('beforeunload', handleBeforeUnload);
  }, [hasUnsavedChanges]);

  // Check for unsaved changes
  const checkForChanges = useCallback(() => {
    const currentData = JSON.stringify({ electricitySettings, fixedExpenses, consumables, shippingOptions, laborRateInput });
    setHasUnsavedChanges(currentData !== originalData);
  }, [electricitySettings, fixedExpenses, consumables, shippingOptions, laborRateInput, originalData]);

  useEffect(() => {
    if (!loading) checkForChanges();
  }, [electricitySettings, fixedExpenses, consumables, shippingOptions, laborRateInput, checkForChanges, loading]);

  useEffect(() => {
    checkAuthAndFetch();
  }, []);

  const checkAuthAndFetch = async () => {
    const { data: { session } } = await supabase.auth.getSession();
    if (!session) {
      setIsAuthenticated(false);
      setLoading(false);
      return;
    }
    setIsAuthenticated(true);
    await fetchAllSettings();
  };

  const fetchAllSettings = async () => {
    try {
      setLoading(true);
      const [elecRes, expRes, consRes, shipRes, laborRes] = await Promise.all([
        supabase.from('calc_electricity_settings').select('*').order('name'),
        supabase.from('calc_fixed_expenses').select('*').order('name'),
        supabase.from('calc_consumables').select('*').order('name'),
        supabase.from('calc_shipping_options').select('*').order('name'),
        supabase.from('calc_labor_settings').select('*').maybeSingle(),
      ]);

      const elec = elecRes.data || [];
      const exp = expRes.data || [];
      const cons = consRes.data || [];
      const ship = shipRes.data || [];
      const labor = laborRes.data;
      const laborRate = labor?.hourly_rate || 10;

      setElectricitySettings(elec);
      setFixedExpenses(exp);
      setConsumables(cons);
      setShippingOptions(ship);
      setLaborSettings(labor);
      setLaborRateInput(laborRate);

      setOriginalData(JSON.stringify({ electricitySettings: elec, fixedExpenses: exp, consumables: cons, shippingOptions: ship, laborRateInput: laborRate }));
      setHasUnsavedChanges(false);
    } catch (error: any) {
      toast({ title: t('calculator.common.error', 'Error'), description: error.message, variant: 'destructive' });
    } finally {
      setLoading(false);
    }
  };

  const addElectricity = async () => {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return;
    const { error } = await supabase.from('calc_electricity_settings').insert({ user_id: user.id, name: 'New Electricity Config', price_per_kwh: 0.15 });
    if (error) toast({ title: t('calculator.common.error', 'Error'), description: error.message, variant: 'destructive' });
    else fetchAllSettings();
  };

  const addExpense = async () => {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return;
    const { error } = await supabase.from('calc_fixed_expenses').insert({ user_id: user.id, name: 'New Expense', monthly_amount: 0 });
    if (error) toast({ title: t('calculator.common.error', 'Error'), description: error.message, variant: 'destructive' });
    else fetchAllSettings();
  };

  const addConsumable = async () => {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return;
    const { error } = await supabase.from('calc_consumables').insert({ user_id: user.id, name: 'New Consumable', cost: 0 });
    if (error) toast({ title: t('calculator.common.error', 'Error'), description: error.message, variant: 'destructive' });
    else fetchAllSettings();
  };

  const addShipping = async () => {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return;
    const { error } = await supabase.from('calc_shipping_options').insert({ user_id: user.id, name: 'New Shipping', price: 0 });
    if (error) toast({ title: t('calculator.common.error', 'Error'), description: error.message, variant: 'destructive' });
    else fetchAllSettings();
  };

  const handleDelete = async (table: 'calc_electricity_settings' | 'calc_fixed_expenses' | 'calc_consumables' | 'calc_shipping_options', id: string) => {
    const { error } = await supabase.from(table).delete().eq('id', id);
    if (error) toast({ title: t('calculator.common.error', 'Error'), description: error.message, variant: 'destructive' });
    else fetchAllSettings();
  };

  const saveAllSettings = async () => {
    try {
      setSavingAll(true);
      const updates: Array<PromiseLike<any>> = [];

      electricitySettings.forEach((e) => {
        updates.push(supabase.from('calc_electricity_settings').update({ name: e.name, price_per_kwh: Number(e.price_per_kwh) || 0 }).eq('id', e.id));
      });
      fixedExpenses.forEach((e) => {
        updates.push(supabase.from('calc_fixed_expenses').update({ name: e.name, monthly_amount: Number(e.monthly_amount) || 0 }).eq('id', e.id));
      });
      consumables.forEach((c) => {
        updates.push(supabase.from('calc_consumables').update({ name: c.name, cost: Number(c.cost) || 0 }).eq('id', c.id));
      });
      shippingOptions.forEach((s) => {
        updates.push(supabase.from('calc_shipping_options').update({ name: s.name, price: Number(s.price) || 0 }).eq('id', s.id));
      });

      if (laborSettings) {
        updates.push(supabase.from('calc_labor_settings').update({ hourly_rate: laborRateInput }).eq('id', laborSettings.id));
      } else {
        const { data: { user } } = await supabase.auth.getUser();
        if (user) updates.push(supabase.from('calc_labor_settings').insert({ user_id: user.id, hourly_rate: laborRateInput }));
      }

      const results = await Promise.all(updates);
      const firstError = results.find((r) => r?.error)?.error;
      if (firstError) throw firstError;

      toast({ title: t('calculator.common.saved', 'Settings saved') });
      await fetchAllSettings();
    } catch (error: any) {
      toast({ title: t('calculator.common.error', 'Error'), description: error?.message || 'Failed to save', variant: 'destructive' });
    } finally {
      setSavingAll(false);
    }
  };

  if (!isAuthenticated && !loading) {
    return (
      <div className="min-h-screen flex flex-col bg-gradient-mesh">
        <Header pageTitle={t('calculator.settings.pageTitle', 'Settings')} pageSubtitle={t('calculator.settings.pageSubtitle', 'Configure your calculator settings')} />
        <main className="flex-grow container mx-auto px-4 py-8">
          <div className="text-center py-12">
            <Settings className="h-16 w-16 mx-auto mb-4 text-muted-foreground" />
            <h2 className="text-2xl font-bold mb-2">{t('calculator.settings.signInRequired', 'Sign In Required')}</h2>
            <Button onClick={() => navigate('/auth')}>{t('calculator.settings.signIn', 'Sign In')}</Button>
          </div>
        </main>
        <Footer />
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col bg-gradient-mesh">
      <Header pageTitle={t('calculator.settings.pageTitle', 'Settings')} pageSubtitle={t('calculator.settings.pageSubtitle', 'Configure your calculator settings')} />
      <main className="flex-grow container mx-auto px-4 py-8">
        <CalculatorLayout>
          {loading ? (
            <div className="flex justify-center py-12"><Loader2 className="h-8 w-8 animate-spin text-primary" /></div>
          ) : (
            <div className="space-y-4">
              <div className="flex items-center justify-between gap-4">
                {hasUnsavedChanges && (
                  <Badge variant="outline" className="text-yellow-600 border-yellow-500 bg-yellow-500/10">
                    <AlertCircle className="h-3 w-3 mr-1" />
                    {t('calculator.settings.unsavedChanges', 'Unsaved changes')}
                  </Badge>
                )}
                <div className="flex-1" />
                <Button onClick={saveAllSettings} disabled={savingAll}>
                  {savingAll ? <Loader2 className="h-4 w-4 mr-2 animate-spin" /> : <Save className="h-4 w-4 mr-2" />}
                  {t('calculator.settings.save', 'Save')}
                </Button>
              </div>

              <Tabs defaultValue="electricity" className="space-y-6">
                <TabsList className="grid grid-cols-5 w-full">
                  <TabsTrigger value="electricity"><Zap className="h-4 w-4 mr-1 hidden sm:inline" />{t('calculator.settings.electricity', 'Electricity')}</TabsTrigger>
                  <TabsTrigger value="expenses"><DollarSign className="h-4 w-4 mr-1 hidden sm:inline" />{t('calculator.settings.expenses', 'Expenses')}</TabsTrigger>
                  <TabsTrigger value="consumables"><Package className="h-4 w-4 mr-1 hidden sm:inline" />{t('calculator.settings.consumables', 'Consumables')}</TabsTrigger>
                  <TabsTrigger value="shipping"><Truck className="h-4 w-4 mr-1 hidden sm:inline" />{t('calculator.settings.shipping', 'Shipping')}</TabsTrigger>
                  <TabsTrigger value="labor">{t('calculator.settings.labor', 'Labor')}</TabsTrigger>
                </TabsList>

                <TabsContent value="electricity">
                  <Card className="bg-card/50 backdrop-blur-sm">
                    <CardHeader className="flex flex-row items-center justify-between">
                      <CardTitle>{t('calculator.settings.electricitySettings', 'Electricity Settings')}</CardTitle>
                      <Button size="sm" onClick={addElectricity}><Plus className="h-4 w-4 mr-1" />{t('calculator.settings.add', 'Add')}</Button>
                    </CardHeader>
                    <CardContent className="space-y-3">
                      {electricitySettings.map((e) => (
                        <div key={e.id} className="flex items-center gap-3 p-3 bg-background/50 rounded">
                          <Input value={e.name ?? ''} className="flex-1" onChange={(ev) => setElectricitySettings((prev) => prev.map((x) => (x.id === e.id ? { ...x, name: ev.target.value } : x)))} />
                          <Input type="number" step="0.01" value={e.price_per_kwh ?? 0} className="w-24" onChange={(ev) => setElectricitySettings((prev) => prev.map((x) => (x.id === e.id ? { ...x, price_per_kwh: parseFloat(ev.target.value) || 0 } : x)))} />
                          <span className="text-sm text-muted-foreground">{t('calculator.settings.perKwh', '€/kWh')}</span>
                          <Button variant="ghost" size="icon" className="text-destructive" onClick={() => handleDelete('calc_electricity_settings', e.id)}><Trash2 className="h-4 w-4" /></Button>
                        </div>
                      ))}
                      {electricitySettings.length === 0 && <p className="text-muted-foreground text-center py-4">{t('calculator.settings.noElectricity', 'No electricity settings yet')}</p>}
                    </CardContent>
                  </Card>
                </TabsContent>

                <TabsContent value="expenses">
                  <Card className="bg-card/50 backdrop-blur-sm">
                    <CardHeader className="flex flex-row items-center justify-between">
                      <CardTitle>{t('calculator.settings.fixedExpenses', 'Fixed Monthly Expenses')}</CardTitle>
                      <Button size="sm" onClick={addExpense}><Plus className="h-4 w-4 mr-1" />{t('calculator.settings.add', 'Add')}</Button>
                    </CardHeader>
                    <CardContent className="space-y-3">
                      {fixedExpenses.map((e) => (
                        <div key={e.id} className="flex items-center gap-3 p-3 bg-background/50 rounded">
                          <Input value={e.name ?? ''} className="flex-1" onChange={(ev) => setFixedExpenses((prev) => prev.map((x) => (x.id === e.id ? { ...x, name: ev.target.value } : x)))} />
                          <Input type="number" step="0.01" value={e.monthly_amount ?? 0} className="w-24" onChange={(ev) => setFixedExpenses((prev) => prev.map((x) => (x.id === e.id ? { ...x, monthly_amount: parseFloat(ev.target.value) || 0 } : x)))} />
                          <span className="text-sm text-muted-foreground">{t('calculator.settings.perMonth', '€/month')}</span>
                          <Button variant="ghost" size="icon" className="text-destructive" onClick={() => handleDelete('calc_fixed_expenses', e.id)}><Trash2 className="h-4 w-4" /></Button>
                        </div>
                      ))}
                      {fixedExpenses.length === 0 && <p className="text-muted-foreground text-center py-4">{t('calculator.settings.noExpenses', 'No fixed expenses yet')}</p>}
                    </CardContent>
                  </Card>
                </TabsContent>

                <TabsContent value="consumables">
                  <Card className="bg-card/50 backdrop-blur-sm">
                    <CardHeader className="flex flex-row items-center justify-between">
                      <CardTitle>{t('calculator.settings.consumablesPerPrint', 'Consumables (per print)')}</CardTitle>
                      <Button size="sm" onClick={addConsumable}><Plus className="h-4 w-4 mr-1" />{t('calculator.settings.add', 'Add')}</Button>
                    </CardHeader>
                    <CardContent className="space-y-3">
                      {consumables.map((c) => (
                        <div key={c.id} className="flex items-center gap-3 p-3 bg-background/50 rounded">
                          <Input value={c.name ?? ''} className="flex-1" onChange={(ev) => setConsumables((prev) => prev.map((x) => (x.id === c.id ? { ...x, name: ev.target.value } : x)))} />
                          <Input type="number" step="0.01" value={c.cost ?? 0} className="w-24" onChange={(ev) => setConsumables((prev) => prev.map((x) => (x.id === c.id ? { ...x, cost: parseFloat(ev.target.value) || 0 } : x)))} />
                          <span className="text-sm text-muted-foreground">{t('calculator.settings.perPrint', '€/print')}</span>
                          <Button variant="ghost" size="icon" className="text-destructive" onClick={() => handleDelete('calc_consumables', c.id)}><Trash2 className="h-4 w-4" /></Button>
                        </div>
                      ))}
                      {consumables.length === 0 && <p className="text-muted-foreground text-center py-4">{t('calculator.settings.noConsumables', 'No consumables yet')}</p>}
                    </CardContent>
                  </Card>
                </TabsContent>

                <TabsContent value="shipping">
                  <Card className="bg-card/50 backdrop-blur-sm">
                    <CardHeader className="flex flex-row items-center justify-between">
                      <CardTitle>{t('calculator.settings.shippingOptions', 'Shipping Options')}</CardTitle>
                      <Button size="sm" onClick={addShipping}><Plus className="h-4 w-4 mr-1" />{t('calculator.settings.add', 'Add')}</Button>
                    </CardHeader>
                    <CardContent className="space-y-3">
                      {shippingOptions.map((s) => (
                        <div key={s.id} className="flex items-center gap-3 p-3 bg-background/50 rounded">
                          <Input value={s.name ?? ''} className="flex-1" onChange={(ev) => setShippingOptions((prev) => prev.map((x) => (x.id === s.id ? { ...x, name: ev.target.value } : x)))} />
                          <Input type="number" step="0.01" value={s.price ?? 0} className="w-24" onChange={(ev) => setShippingOptions((prev) => prev.map((x) => (x.id === s.id ? { ...x, price: parseFloat(ev.target.value) || 0 } : x)))} />
                          <span className="text-sm text-muted-foreground">€</span>
                          <Button variant="ghost" size="icon" className="text-destructive" onClick={() => handleDelete('calc_shipping_options', s.id)}><Trash2 className="h-4 w-4" /></Button>
                        </div>
                      ))}
                      {shippingOptions.length === 0 && <p className="text-muted-foreground text-center py-4">{t('calculator.settings.noShipping', 'No shipping options yet')}</p>}
                    </CardContent>
                  </Card>
                </TabsContent>

                <TabsContent value="labor">
                  <Card className="bg-card/50 backdrop-blur-sm">
                    <CardHeader><CardTitle>{t('calculator.settings.laborSettings', 'Labor Settings')}</CardTitle></CardHeader>
                    <CardContent className="space-y-4">
                      <div>
                        <Label>{t('calculator.settings.hourlyRate', 'Hourly Rate (€)')}</Label>
                        <Input type="number" step="0.01" value={laborRateInput} onChange={(e) => setLaborRateInput(parseFloat(e.target.value) || 0)} className="mt-1 max-w-xs" />
                        <p className="text-xs text-muted-foreground mt-1">{t('calculator.settings.hourlyRateHint', 'Your hourly labor rate for time spent on prints')}</p>
                      </div>
                    </CardContent>
                  </Card>
                </TabsContent>
              </Tabs>
            </div>
          )}
        </CalculatorLayout>
      </main>
      <Footer />
    </div>
  );
}
