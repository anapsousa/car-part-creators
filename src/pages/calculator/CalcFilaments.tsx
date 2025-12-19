import { useState, useEffect } from 'react';
import { Header } from '@/components/Header';
import { Footer } from '@/components/Footer';
import { CalculatorLayout } from '@/components/calculator/CalculatorLayout';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Plus, Palette, Trash2, Edit, Loader2 } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { useNavigate } from 'react-router-dom';
import { FILAMENT_BRANDS, FILAMENT_MATERIALS, FILAMENT_COLORS, getMaterialDensity, calculateCostPerGram } from '@/lib/calculator/filamentData';
import { useContent } from '@/hooks/useContent';

interface FilamentForm {
  name: string;
  brand: string;
  material: string;
  color: string;
  spool_weight_grams: number;
  spool_cost: number;
  density: number;
  notes: string;
}

const defaultForm: FilamentForm = {
  name: '',
  brand: '',
  material: 'PLA',
  color: '',
  spool_weight_grams: 1000,
  spool_cost: 20,
  density: 1.24,
  notes: '',
};

export default function CalcFilaments() {
  const { toast } = useToast();
  const navigate = useNavigate();
  const { content } = useContent('calculator');
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [filaments, setFilaments] = useState<any[]>([]);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [form, setForm] = useState<FilamentForm>(defaultForm);
  const [isAuthenticated, setIsAuthenticated] = useState(false);

  const t = (key: string, fallback: string) => content[key] || fallback;

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
    await fetchFilaments();
  };

  const fetchFilaments = async () => {
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from('calc_filaments')
        .select('*')
        .order('name');
      
      if (error) throw error;
      setFilaments(data || []);
    } catch (error: any) {
      toast({ title: t('calculator.common.error', 'Error'), description: error.message, variant: 'destructive' });
    } finally {
      setLoading(false);
    }
  };

  const handleMaterialChange = (material: string) => {
    const density = getMaterialDensity(material as any);
    setForm(prev => ({ ...prev, material, density }));
  };

  const handleSave = async () => {
    if (!form.name.trim()) {
      toast({ title: t('calculator.common.error', 'Error'), description: t('calculator.filaments.enterName', 'Please enter a filament name'), variant: 'destructive' });
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
        material: form.material,
        color: form.color || null,
        spool_weight_grams: form.spool_weight_grams,
        spool_cost: form.spool_cost,
        density: form.density,
        notes: form.notes || null,
      };

      if (editingId) {
        const { error } = await supabase
          .from('calc_filaments')
          .update(payload)
          .eq('id', editingId);
        if (error) throw error;
        toast({ title: t('calculator.common.updated', 'Filament updated') });
      } else {
        const { error } = await supabase
          .from('calc_filaments')
          .insert(payload);
        if (error) throw error;
        toast({ title: t('calculator.common.saved', 'Filament added') });
      }

      setDialogOpen(false);
      setEditingId(null);
      setForm(defaultForm);
      await fetchFilaments();
    } catch (error: any) {
      toast({ title: t('calculator.common.error', 'Error'), description: error.message, variant: 'destructive' });
    } finally {
      setSaving(false);
    }
  };

  const handleEdit = (filament: any) => {
    setForm({
      name: filament.name,
      brand: filament.brand || '',
      material: filament.material || 'PLA',
      color: filament.color || '',
      spool_weight_grams: filament.spool_weight_grams || 1000,
      spool_cost: filament.spool_cost || 20,
      density: filament.density || 1.24,
      notes: filament.notes || '',
    });
    setEditingId(filament.id);
    setDialogOpen(true);
  };

  const handleDelete = async (id: string) => {
    if (!confirm(t('calculator.common.confirmDelete', 'Are you sure you want to delete this?'))) return;
    
    try {
      const { error } = await supabase.from('calc_filaments').delete().eq('id', id);
      if (error) throw error;
      toast({ title: t('calculator.common.deleted', 'Filament deleted') });
      await fetchFilaments();
    } catch (error: any) {
      toast({ title: t('calculator.common.error', 'Error'), description: error.message, variant: 'destructive' });
    }
  };

  const costPerGram = calculateCostPerGram(form.spool_cost, form.spool_weight_grams);

  if (!isAuthenticated && !loading) {
    return (
      <div className="min-h-screen flex flex-col bg-gradient-mesh">
        <Header pageTitle={t('calculator.filaments.pageTitle', 'Filaments')} pageSubtitle={t('calculator.filaments.pageSubtitle', 'Manage your filament inventory')} />
        <main className="flex-grow container mx-auto px-4 py-8">
          <div className="text-center py-12">
            <Palette className="h-16 w-16 mx-auto mb-4 text-muted-foreground" />
            <h2 className="text-2xl font-bold mb-2">{t('calculator.filaments.signInRequired', 'Sign In Required')}</h2>
            <p className="text-muted-foreground mb-6">{t('calculator.filaments.signInMessage', 'Please sign in to manage your filaments')}</p>
            <Button onClick={() => navigate('/auth')}>{t('calculator.filaments.signIn', 'Sign In')}</Button>
          </div>
        </main>
        <Footer />
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col bg-gradient-mesh">
      <Header pageTitle={t('calculator.filaments.pageTitle', 'Filaments')} pageSubtitle={t('calculator.filaments.pageSubtitle', 'Manage your filament inventory')} />
      
      <main className="flex-grow container mx-auto px-4 py-8">
        <CalculatorLayout>
          <div className="space-y-6">
            <div className="flex items-center justify-between">
              <h2 className="text-2xl font-bold">{t('calculator.filaments.yourFilaments', 'Your Filaments')}</h2>
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
                    {t('calculator.filaments.addFilament', 'Add Filament')}
                  </Button>
                </DialogTrigger>
                <DialogContent className="max-w-lg max-h-[90vh] overflow-y-auto">
                  <DialogHeader>
                    <DialogTitle>{editingId ? t('calculator.filaments.editFilament', 'Edit Filament') : t('calculator.filaments.addNewFilament', 'Add New Filament')}</DialogTitle>
                  </DialogHeader>
                  
                  <div className="space-y-4 py-4">
                    <div>
                      <Label>{t('calculator.filaments.filamentName', 'Filament Name')}</Label>
                      <Input
                        value={form.name}
                        onChange={(e) => setForm(prev => ({ ...prev, name: e.target.value }))}
                        placeholder="e.g., eSUN PLA+ Black"
                      />
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <Label>{t('calculator.filaments.brand', 'Brand')}</Label>
                        <Select value={form.brand} onValueChange={(v) => setForm(prev => ({ ...prev, brand: v }))}>
                          <SelectTrigger>
                            <SelectValue placeholder={t('calculator.filaments.selectBrand', 'Select brand')} />
                          </SelectTrigger>
                          <SelectContent>
                            {FILAMENT_BRANDS.map(brand => (
                              <SelectItem key={brand} value={brand}>{brand}</SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>
                      
                      <div>
                        <Label>{t('calculator.filaments.material', 'Material')}</Label>
                        <Select value={form.material} onValueChange={handleMaterialChange}>
                          <SelectTrigger>
                            <SelectValue placeholder={t('calculator.filaments.selectMaterial', 'Select material')} />
                          </SelectTrigger>
                          <SelectContent>
                            {FILAMENT_MATERIALS.map(mat => (
                              <SelectItem key={mat} value={mat}>{mat}</SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>
                    </div>

                    <div>
                      <Label>{t('calculator.filaments.color', 'Color')}</Label>
                      <Select value={form.color} onValueChange={(v) => setForm(prev => ({ ...prev, color: v }))}>
                        <SelectTrigger>
                          <SelectValue placeholder={t('calculator.filaments.selectColor', 'Select color')} />
                        </SelectTrigger>
                        <SelectContent>
                          {FILAMENT_COLORS.map(color => (
                            <SelectItem key={color} value={color}>{color}</SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <Label>{t('calculator.filaments.spoolWeight', 'Spool Weight (g)')}</Label>
                        <Input
                          type="number"
                          value={form.spool_weight_grams}
                          onChange={(e) => setForm(prev => ({ ...prev, spool_weight_grams: parseFloat(e.target.value) || 0 }))}
                        />
                      </div>
                      <div>
                        <Label>{t('calculator.filaments.spoolCost', 'Spool Cost (€)')}</Label>
                        <Input
                          type="number"
                          step="0.01"
                          value={form.spool_cost}
                          onChange={(e) => setForm(prev => ({ ...prev, spool_cost: parseFloat(e.target.value) || 0 }))}
                        />
                      </div>
                    </div>

                    <div className="p-3 bg-primary/5 rounded-md">
                      <p className="text-sm">
                        {t('calculator.filaments.costPerGram', 'Cost per gram')}: <span className="font-semibold">€{costPerGram.toFixed(4)}</span>
                      </p>
                    </div>

                    <div>
                      <Label>{t('calculator.filaments.density', 'Density (g/cm³)')}</Label>
                      <Input
                        type="number"
                        step="0.01"
                        value={form.density}
                        onChange={(e) => setForm(prev => ({ ...prev, density: parseFloat(e.target.value) || 1.24 }))}
                      />
                    </div>

                    <div>
                      <Label>{t('calculator.filaments.notes', 'Notes')}</Label>
                      <Textarea
                        value={form.notes}
                        onChange={(e) => setForm(prev => ({ ...prev, notes: e.target.value }))}
                        placeholder={t('calculator.common.optionalNotes', 'Optional notes...')}
                      />
                    </div>

                    <Button onClick={handleSave} disabled={saving} className="w-full">
                      {saving && <Loader2 className="h-4 w-4 mr-2 animate-spin" />}
                      {editingId ? t('calculator.filaments.updateFilament', 'Update Filament') : t('calculator.filaments.addFilament', 'Add Filament')}
                    </Button>
                  </div>
                </DialogContent>
              </Dialog>
            </div>

            {loading ? (
              <div className="flex justify-center py-12">
                <Loader2 className="h-8 w-8 animate-spin text-primary" />
              </div>
            ) : filaments.length === 0 ? (
              <Card className="bg-card/50 backdrop-blur-sm border-border/50">
                <CardContent className="py-12 text-center">
                  <Palette className="h-12 w-12 mx-auto mb-4 text-muted-foreground" />
                  <h3 className="text-lg font-semibold mb-2">{t('calculator.filaments.noFilaments', 'No filaments yet')}</h3>
                  <p className="text-muted-foreground mb-4">{t('calculator.filaments.addFirstMessage', 'Add your first filament to start calculating costs')}</p>
                  <Button onClick={() => setDialogOpen(true)}>
                    <Plus className="h-4 w-4 mr-2" />
                    {t('calculator.filaments.addFilament', 'Add Filament')}
                  </Button>
                </CardContent>
              </Card>
            ) : (
              <div className="grid gap-4 md:grid-cols-2">
                {filaments.map((filament) => {
                  const cpg = calculateCostPerGram(filament.spool_cost, filament.spool_weight_grams);
                  return (
                    <Card key={filament.id} className="bg-card/50 backdrop-blur-sm border-border/50">
                      <CardContent className="p-4">
                        <div className="flex items-start justify-between">
                          <div className="flex items-center gap-4">
                            <div className="p-3 rounded-lg bg-secondary/10">
                              <Palette className="h-6 w-6 text-secondary" />
                            </div>
                            <div>
                              <h3 className="font-semibold">{filament.name}</h3>
                              <p className="text-sm text-muted-foreground">
                                {filament.brand} • {filament.material} {filament.color && `• ${filament.color}`}
                              </p>
                              <div className="flex gap-4 mt-2 text-sm text-muted-foreground">
                                <span>€{filament.spool_cost}/{filament.spool_weight_grams}g</span>
                                <span className="text-primary font-medium">€{cpg.toFixed(4)}/g</span>
                              </div>
                            </div>
                          </div>
                          <div className="flex gap-2">
                            <Button variant="ghost" size="icon" onClick={() => handleEdit(filament)}>
                              <Edit className="h-4 w-4" />
                            </Button>
                            <Button variant="ghost" size="icon" className="text-destructive" onClick={() => handleDelete(filament.id)}>
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  );
                })}
              </div>
            )}
          </div>
        </CalculatorLayout>
      </main>
      
      <Footer />
    </div>
  );
}
