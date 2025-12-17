import { useState, useEffect } from 'react';
import { Header } from '@/components/Header';
import { Footer } from '@/components/Footer';
import { CalculatorLayout } from '@/components/calculator/CalculatorLayout';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Plus, Trash2, Edit, Loader2, Zap, DollarSign, Package, Truck, Settings } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { useNavigate } from 'react-router-dom';

export default function CalcSettings() {
  const { toast } = useToast();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  
  // Settings data
  const [electricitySettings, setElectricitySettings] = useState<any[]>([]);
  const [fixedExpenses, setFixedExpenses] = useState<any[]>([]);
  const [consumables, setConsumables] = useState<any[]>([]);
  const [shippingOptions, setShippingOptions] = useState<any[]>([]);
  const [laborSettings, setLaborSettings] = useState<any>(null);

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
      
      setElectricitySettings(elecRes.data || []);
      setFixedExpenses(expRes.data || []);
      setConsumables(consRes.data || []);
      setShippingOptions(shipRes.data || []);
      setLaborSettings(laborRes.data);
    } catch (error: any) {
      toast({ title: 'Error', description: error.message, variant: 'destructive' });
    } finally {
      setLoading(false);
    }
  };

  const addElectricity = async () => {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return;
    
    const { error } = await supabase.from('calc_electricity_settings').insert({
      user_id: user.id,
      name: 'New Electricity Config',
      price_per_kwh: 0.15,
    });
    if (!error) fetchAllSettings();
  };

  const addExpense = async () => {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return;
    
    const { error } = await supabase.from('calc_fixed_expenses').insert({
      user_id: user.id,
      name: 'New Expense',
      monthly_amount: 0,
    });
    if (!error) fetchAllSettings();
  };

  const addConsumable = async () => {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return;
    
    const { error } = await supabase.from('calc_consumables').insert({
      user_id: user.id,
      name: 'New Consumable',
      cost: 0,
    });
    if (!error) fetchAllSettings();
  };

  const addShipping = async () => {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return;
    
    const { error } = await supabase.from('calc_shipping_options').insert({
      user_id: user.id,
      name: 'New Shipping',
      price: 0,
    });
    if (!error) fetchAllSettings();
  };

  const saveLaborSettings = async (hourlyRate: number) => {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return;
    
    if (laborSettings) {
      await supabase.from('calc_labor_settings').update({ hourly_rate: hourlyRate }).eq('id', laborSettings.id);
    } else {
      await supabase.from('calc_labor_settings').insert({ user_id: user.id, hourly_rate: hourlyRate });
    }
    fetchAllSettings();
    toast({ title: 'Labor settings saved' });
  };

  if (!isAuthenticated && !loading) {
    return (
      <div className="min-h-screen flex flex-col bg-gradient-mesh">
        <Header pageTitle="Settings" pageSubtitle="Configure your calculator settings" />
        <main className="flex-grow container mx-auto px-4 py-8">
          <div className="text-center py-12">
            <Settings className="h-16 w-16 mx-auto mb-4 text-muted-foreground" />
            <h2 className="text-2xl font-bold mb-2">Sign In Required</h2>
            <Button onClick={() => navigate('/auth')}>Sign In</Button>
          </div>
        </main>
        <Footer />
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col bg-gradient-mesh">
      <Header pageTitle="Settings" pageSubtitle="Configure your calculator settings" />
      
      <main className="flex-grow container mx-auto px-4 py-8">
        <CalculatorLayout>
          {loading ? (
            <div className="flex justify-center py-12">
              <Loader2 className="h-8 w-8 animate-spin text-primary" />
            </div>
          ) : (
            <Tabs defaultValue="electricity" className="space-y-6">
              <TabsList className="grid grid-cols-5 w-full">
                <TabsTrigger value="electricity"><Zap className="h-4 w-4 mr-1 hidden sm:inline" />Electricity</TabsTrigger>
                <TabsTrigger value="expenses"><DollarSign className="h-4 w-4 mr-1 hidden sm:inline" />Expenses</TabsTrigger>
                <TabsTrigger value="consumables"><Package className="h-4 w-4 mr-1 hidden sm:inline" />Consumables</TabsTrigger>
                <TabsTrigger value="shipping"><Truck className="h-4 w-4 mr-1 hidden sm:inline" />Shipping</TabsTrigger>
                <TabsTrigger value="labor">Labor</TabsTrigger>
              </TabsList>

              <TabsContent value="electricity">
                <Card className="bg-card/50 backdrop-blur-sm">
                  <CardHeader className="flex flex-row items-center justify-between">
                    <CardTitle>Electricity Settings</CardTitle>
                    <Button size="sm" onClick={addElectricity}><Plus className="h-4 w-4 mr-1" />Add</Button>
                  </CardHeader>
                  <CardContent className="space-y-3">
                    {electricitySettings.map(e => (
                      <div key={e.id} className="flex items-center gap-3 p-3 bg-background/50 rounded">
                        <Input defaultValue={e.name} className="flex-1" onBlur={(ev) => supabase.from('calc_electricity_settings').update({ name: ev.target.value }).eq('id', e.id)} />
                        <Input type="number" step="0.01" defaultValue={e.price_per_kwh} className="w-24" onBlur={(ev) => supabase.from('calc_electricity_settings').update({ price_per_kwh: parseFloat(ev.target.value) }).eq('id', e.id)} />
                        <span className="text-sm text-muted-foreground">€/kWh</span>
                        <Button variant="ghost" size="icon" className="text-destructive" onClick={async () => { await supabase.from('calc_electricity_settings').delete().eq('id', e.id); fetchAllSettings(); }}><Trash2 className="h-4 w-4" /></Button>
                      </div>
                    ))}
                    {electricitySettings.length === 0 && <p className="text-muted-foreground text-center py-4">No electricity settings yet</p>}
                  </CardContent>
                </Card>
              </TabsContent>

              <TabsContent value="expenses">
                <Card className="bg-card/50 backdrop-blur-sm">
                  <CardHeader className="flex flex-row items-center justify-between">
                    <CardTitle>Fixed Monthly Expenses</CardTitle>
                    <Button size="sm" onClick={addExpense}><Plus className="h-4 w-4 mr-1" />Add</Button>
                  </CardHeader>
                  <CardContent className="space-y-3">
                    {fixedExpenses.map(e => (
                      <div key={e.id} className="flex items-center gap-3 p-3 bg-background/50 rounded">
                        <Input defaultValue={e.name} className="flex-1" onBlur={(ev) => supabase.from('calc_fixed_expenses').update({ name: ev.target.value }).eq('id', e.id)} />
                        <Input type="number" step="0.01" defaultValue={e.monthly_amount} className="w-24" onBlur={(ev) => supabase.from('calc_fixed_expenses').update({ monthly_amount: parseFloat(ev.target.value) }).eq('id', e.id)} />
                        <span className="text-sm text-muted-foreground">€/month</span>
                        <Button variant="ghost" size="icon" className="text-destructive" onClick={async () => { await supabase.from('calc_fixed_expenses').delete().eq('id', e.id); fetchAllSettings(); }}><Trash2 className="h-4 w-4" /></Button>
                      </div>
                    ))}
                    {fixedExpenses.length === 0 && <p className="text-muted-foreground text-center py-4">No fixed expenses yet</p>}
                  </CardContent>
                </Card>
              </TabsContent>

              <TabsContent value="consumables">
                <Card className="bg-card/50 backdrop-blur-sm">
                  <CardHeader className="flex flex-row items-center justify-between">
                    <CardTitle>Consumables (per print)</CardTitle>
                    <Button size="sm" onClick={addConsumable}><Plus className="h-4 w-4 mr-1" />Add</Button>
                  </CardHeader>
                  <CardContent className="space-y-3">
                    {consumables.map(c => (
                      <div key={c.id} className="flex items-center gap-3 p-3 bg-background/50 rounded">
                        <Input defaultValue={c.name} className="flex-1" onBlur={(ev) => supabase.from('calc_consumables').update({ name: ev.target.value }).eq('id', c.id)} />
                        <Input type="number" step="0.01" defaultValue={c.cost} className="w-24" onBlur={(ev) => supabase.from('calc_consumables').update({ cost: parseFloat(ev.target.value) }).eq('id', c.id)} />
                        <span className="text-sm text-muted-foreground">€</span>
                        <Button variant="ghost" size="icon" className="text-destructive" onClick={async () => { await supabase.from('calc_consumables').delete().eq('id', c.id); fetchAllSettings(); }}><Trash2 className="h-4 w-4" /></Button>
                      </div>
                    ))}
                    {consumables.length === 0 && <p className="text-muted-foreground text-center py-4">No consumables yet</p>}
                  </CardContent>
                </Card>
              </TabsContent>

              <TabsContent value="shipping">
                <Card className="bg-card/50 backdrop-blur-sm">
                  <CardHeader className="flex flex-row items-center justify-between">
                    <CardTitle>Shipping Options</CardTitle>
                    <Button size="sm" onClick={addShipping}><Plus className="h-4 w-4 mr-1" />Add</Button>
                  </CardHeader>
                  <CardContent className="space-y-3">
                    {shippingOptions.map(s => (
                      <div key={s.id} className="flex items-center gap-3 p-3 bg-background/50 rounded">
                        <Input defaultValue={s.name} className="flex-1" onBlur={(ev) => supabase.from('calc_shipping_options').update({ name: ev.target.value }).eq('id', s.id)} />
                        <Input type="number" step="0.01" defaultValue={s.price} className="w-24" onBlur={(ev) => supabase.from('calc_shipping_options').update({ price: parseFloat(ev.target.value) }).eq('id', s.id)} />
                        <span className="text-sm text-muted-foreground">€</span>
                        <Button variant="ghost" size="icon" className="text-destructive" onClick={async () => { await supabase.from('calc_shipping_options').delete().eq('id', s.id); fetchAllSettings(); }}><Trash2 className="h-4 w-4" /></Button>
                      </div>
                    ))}
                    {shippingOptions.length === 0 && <p className="text-muted-foreground text-center py-4">No shipping options yet</p>}
                  </CardContent>
                </Card>
              </TabsContent>

              <TabsContent value="labor">
                <Card className="bg-card/50 backdrop-blur-sm">
                  <CardHeader>
                    <CardTitle>Labor Settings</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="flex items-center gap-3">
                      <Label>Hourly Rate (€)</Label>
                      <Input type="number" step="0.01" defaultValue={laborSettings?.hourly_rate || 10} className="w-32" id="labor-rate" />
                      <Button onClick={() => saveLaborSettings(parseFloat((document.getElementById('labor-rate') as HTMLInputElement).value) || 10)}>Save</Button>
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>
            </Tabs>
          )}
        </CalculatorLayout>
      </main>
      
      <Footer />
    </div>
  );
}
