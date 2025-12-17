import { useState, useEffect } from 'react';
import { Header } from '@/components/Header';
import { Footer } from '@/components/Footer';
import { CalculatorLayout } from '@/components/calculator/CalculatorLayout';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Plus, Printer, Trash2, Edit, Loader2 } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { useNavigate } from 'react-router-dom';
import { PRINTER_BRANDS, getModelsForBrand, getPrinterSpec, type PrinterBrand } from '@/lib/calculator/printerData';

interface PrinterForm {
  name: string;
  brand: string;
  model: string;
  purchase_cost: number;
  depreciation_months: number;
  depreciation_hours: number;
  maintenance_cost: number;
  power_watts: number;
  notes: string;
}

const defaultForm: PrinterForm = {
  name: '',
  brand: '',
  model: '',
  purchase_cost: 0,
  depreciation_months: 36,
  depreciation_hours: 5000,
  maintenance_cost: 50,
  power_watts: 200,
  notes: '',
};

export default function CalcPrinters() {
  const { toast } = useToast();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [printers, setPrinters] = useState<any[]>([]);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [form, setForm] = useState<PrinterForm>(defaultForm);
  const [isAuthenticated, setIsAuthenticated] = useState(false);

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
    await fetchPrinters();
  };

  const fetchPrinters = async () => {
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from('calc_printers')
        .select('*')
        .order('name');
      
      if (error) throw error;
      setPrinters(data || []);
    } catch (error: any) {
      toast({ title: 'Error', description: error.message, variant: 'destructive' });
    } finally {
      setLoading(false);
    }
  };

  const handleBrandChange = (brand: string) => {
    setForm(prev => ({ ...prev, brand, model: '' }));
  };

  const handleModelChange = (model: string) => {
    const spec = getPrinterSpec(form.brand as PrinterBrand, model);
    if (spec) {
      setForm(prev => ({
        ...prev,
        model,
        name: prev.name || `${spec.brand} ${spec.model}`,
        purchase_cost: spec.purchaseCost,
        depreciation_months: spec.depreciationMonths,
        depreciation_hours: spec.depreciationHours,
        maintenance_cost: spec.maintenanceCost,
        power_watts: spec.powerWatts,
      }));
    } else {
      setForm(prev => ({ ...prev, model }));
    }
  };

  const handleSave = async () => {
    if (!form.name.trim()) {
      toast({ title: 'Error', description: 'Please enter a printer name', variant: 'destructive' });
      return;
    }

    try {
      setSaving(true);
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('Not authenticated');

      const payload = {
        user_id: user.id,
        name: form.name,
        brand: form.brand || null,
        model: form.model || null,
        purchase_cost: form.purchase_cost,
        depreciation_months: form.depreciation_months,
        depreciation_hours: form.depreciation_hours,
        maintenance_cost: form.maintenance_cost,
        power_watts: form.power_watts,
        notes: form.notes || null,
      };

      if (editingId) {
        const { error } = await supabase
          .from('calc_printers')
          .update(payload)
          .eq('id', editingId);
        if (error) throw error;
        toast({ title: 'Printer updated' });
      } else {
        const { error } = await supabase
          .from('calc_printers')
          .insert(payload);
        if (error) throw error;
        toast({ title: 'Printer added' });
      }

      setDialogOpen(false);
      setEditingId(null);
      setForm(defaultForm);
      await fetchPrinters();
    } catch (error: any) {
      toast({ title: 'Error', description: error.message, variant: 'destructive' });
    } finally {
      setSaving(false);
    }
  };

  const handleEdit = (printer: any) => {
    setForm({
      name: printer.name,
      brand: printer.brand || '',
      model: printer.model || '',
      purchase_cost: printer.purchase_cost || 0,
      depreciation_months: printer.depreciation_months || 36,
      depreciation_hours: printer.depreciation_hours || 5000,
      maintenance_cost: printer.maintenance_cost || 50,
      power_watts: printer.power_watts || 200,
      notes: printer.notes || '',
    });
    setEditingId(printer.id);
    setDialogOpen(true);
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Are you sure you want to delete this printer?')) return;
    
    try {
      const { error } = await supabase.from('calc_printers').delete().eq('id', id);
      if (error) throw error;
      toast({ title: 'Printer deleted' });
      await fetchPrinters();
    } catch (error: any) {
      toast({ title: 'Error', description: error.message, variant: 'destructive' });
    }
  };

  const models = form.brand ? getModelsForBrand(form.brand as PrinterBrand) : [];

  if (!isAuthenticated && !loading) {
    return (
      <div className="min-h-screen flex flex-col bg-gradient-mesh">
        <Header pageTitle="Printers" pageSubtitle="Manage your 3D printers" />
        <main className="flex-grow container mx-auto px-4 py-8">
          <div className="text-center py-12">
            <Printer className="h-16 w-16 mx-auto mb-4 text-muted-foreground" />
            <h2 className="text-2xl font-bold mb-2">Sign In Required</h2>
            <p className="text-muted-foreground mb-6">Please sign in to manage your printers</p>
            <Button onClick={() => navigate('/auth')}>Sign In</Button>
          </div>
        </main>
        <Footer />
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col bg-gradient-mesh">
      <Header pageTitle="Printers" pageSubtitle="Manage your 3D printers" />
      
      <main className="flex-grow container mx-auto px-4 py-8">
        <CalculatorLayout>
          <div className="space-y-6">
            <div className="flex items-center justify-between">
              <h2 className="text-2xl font-bold">Your Printers</h2>
              <Dialog open={dialogOpen} onOpenChange={(open) => {
                setDialogOpen(open);
                if (!open) {
                  setEditingId(null);
                  setForm(defaultForm);
                }
              }}>
                <DialogTrigger asChild>
                  <Button>
                    <Plus className="h-4 w-4 mr-2" />
                    Add Printer
                  </Button>
                </DialogTrigger>
                <DialogContent className="max-w-lg max-h-[90vh] overflow-y-auto">
                  <DialogHeader>
                    <DialogTitle>{editingId ? 'Edit Printer' : 'Add New Printer'}</DialogTitle>
                  </DialogHeader>
                  
                  <div className="space-y-4 py-4">
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <Label>Brand</Label>
                        <Select value={form.brand} onValueChange={handleBrandChange}>
                          <SelectTrigger>
                            <SelectValue placeholder="Select brand" />
                          </SelectTrigger>
                          <SelectContent>
                            {PRINTER_BRANDS.map(brand => (
                              <SelectItem key={brand} value={brand}>{brand}</SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>
                      
                      <div>
                        <Label>Model</Label>
                        <Select value={form.model} onValueChange={handleModelChange} disabled={!form.brand}>
                          <SelectTrigger>
                            <SelectValue placeholder="Select model" />
                          </SelectTrigger>
                          <SelectContent>
                            {models.map(m => (
                              <SelectItem key={m.model} value={m.model}>{m.model}</SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>
                    </div>

                    <div>
                      <Label>Printer Name</Label>
                      <Input
                        value={form.name}
                        onChange={(e) => setForm(prev => ({ ...prev, name: e.target.value }))}
                        placeholder="e.g., My Bambu Lab P1S"
                      />
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <Label>Purchase Cost (€)</Label>
                        <Input
                          type="number"
                          value={form.purchase_cost}
                          onChange={(e) => setForm(prev => ({ ...prev, purchase_cost: parseFloat(e.target.value) || 0 }))}
                        />
                      </div>
                      <div>
                        <Label>Power (Watts)</Label>
                        <Input
                          type="number"
                          value={form.power_watts}
                          onChange={(e) => setForm(prev => ({ ...prev, power_watts: parseFloat(e.target.value) || 0 }))}
                        />
                      </div>
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <Label>Depreciation (months)</Label>
                        <Input
                          type="number"
                          value={form.depreciation_months}
                          onChange={(e) => setForm(prev => ({ ...prev, depreciation_months: parseInt(e.target.value) || 36 }))}
                        />
                      </div>
                      <div>
                        <Label>Depreciation (hours)</Label>
                        <Input
                          type="number"
                          value={form.depreciation_hours}
                          onChange={(e) => setForm(prev => ({ ...prev, depreciation_hours: parseInt(e.target.value) || 5000 }))}
                        />
                      </div>
                    </div>

                    <div>
                      <Label>Maintenance Cost / Year (€)</Label>
                      <Input
                        type="number"
                        value={form.maintenance_cost}
                        onChange={(e) => setForm(prev => ({ ...prev, maintenance_cost: parseFloat(e.target.value) || 0 }))}
                      />
                    </div>

                    <div>
                      <Label>Notes</Label>
                      <Textarea
                        value={form.notes}
                        onChange={(e) => setForm(prev => ({ ...prev, notes: e.target.value }))}
                        placeholder="Optional notes..."
                      />
                    </div>

                    <Button onClick={handleSave} disabled={saving} className="w-full">
                      {saving && <Loader2 className="h-4 w-4 mr-2 animate-spin" />}
                      {editingId ? 'Update Printer' : 'Add Printer'}
                    </Button>
                  </div>
                </DialogContent>
              </Dialog>
            </div>

            {loading ? (
              <div className="flex justify-center py-12">
                <Loader2 className="h-8 w-8 animate-spin text-primary" />
              </div>
            ) : printers.length === 0 ? (
              <Card className="bg-card/50 backdrop-blur-sm border-border/50">
                <CardContent className="py-12 text-center">
                  <Printer className="h-12 w-12 mx-auto mb-4 text-muted-foreground" />
                  <h3 className="text-lg font-semibold mb-2">No printers yet</h3>
                  <p className="text-muted-foreground mb-4">Add your first 3D printer to get started</p>
                  <Button onClick={() => setDialogOpen(true)}>
                    <Plus className="h-4 w-4 mr-2" />
                    Add Printer
                  </Button>
                </CardContent>
              </Card>
            ) : (
              <div className="grid gap-4">
                {printers.map((printer) => (
                  <Card key={printer.id} className="bg-card/50 backdrop-blur-sm border-border/50">
                    <CardContent className="p-4">
                      <div className="flex items-start justify-between">
                        <div className="flex items-center gap-4">
                          <div className="p-3 rounded-lg bg-primary/10">
                            <Printer className="h-6 w-6 text-primary" />
                          </div>
                          <div>
                            <h3 className="font-semibold">{printer.name}</h3>
                            <p className="text-sm text-muted-foreground">
                              {printer.brand} {printer.model}
                            </p>
                            <div className="flex gap-4 mt-2 text-sm text-muted-foreground">
                              <span>€{printer.purchase_cost}</span>
                              <span>{printer.power_watts}W</span>
                              <span>{printer.depreciation_hours}h life</span>
                            </div>
                          </div>
                        </div>
                        <div className="flex gap-2">
                          <Button variant="ghost" size="icon" onClick={() => handleEdit(printer)}>
                            <Edit className="h-4 w-4" />
                          </Button>
                          <Button variant="ghost" size="icon" className="text-destructive" onClick={() => handleDelete(printer.id)}>
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            )}
          </div>
        </CalculatorLayout>
      </main>
      
      <Footer />
    </div>
  );
}
