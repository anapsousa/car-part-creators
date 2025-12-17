import { useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useToast } from '@/hooks/use-toast';
import { ArrowLeft, ArrowRight, Loader2, Printer } from 'lucide-react';
import { printerBrands, getModelsForBrand, getPrinterSpec } from '@/lib/calculator/printerData';

interface PrinterStepProps {
  userId: string;
  onComplete: () => void;
  onBack: () => void;
  isCompleted: boolean;
}

export function PrinterStep({ userId, onComplete, onBack, isCompleted }: PrinterStepProps) {
  const { toast } = useToast();
  const [saving, setSaving] = useState(false);
  const [brand, setBrand] = useState('');
  const [model, setModel] = useState('');
  const [name, setName] = useState('');
  const [purchaseCost, setPurchaseCost] = useState('');
  const [powerWatts, setPowerWatts] = useState('200');
  const [depreciationMonths, setDepreciationMonths] = useState('36');

  const models = brand ? getModelsForBrand(brand) : [];

  const handleBrandChange = (value: string) => {
    setBrand(value);
    setModel('');
    setName('');
  };

  const handleModelChange = (value: string) => {
    setModel(value);
    const spec = getPrinterSpec(brand, value);
    if (spec) {
      setName(`${brand} ${value}`);
      setPowerWatts(spec.powerWatts.toString());
      setDepreciationMonths(spec.depreciationMonths.toString());
    }
  };

  const handleSave = async () => {
    if (!name.trim()) {
      toast({ title: 'Error', description: 'Please enter a printer name', variant: 'destructive' });
      return;
    }

    setSaving(true);
    try {
      const { error } = await supabase.from('calc_printers').insert({
        user_id: userId,
        name: name.trim(),
        brand: brand || null,
        model: model || null,
        purchase_cost: purchaseCost ? parseFloat(purchaseCost) : null,
        power_watts: parseFloat(powerWatts) || 200,
        depreciation_months: parseInt(depreciationMonths) || 36,
      });

      if (error) throw error;

      toast({ title: 'Printer added!', description: `${name} has been added to your printers.` });
      onComplete();
    } catch (error) {
      console.error('Error saving printer:', error);
      toast({ title: 'Error', description: 'Failed to save printer', variant: 'destructive' });
    } finally {
      setSaving(false);
    }
  };

  if (isCompleted) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Printer className="h-5 w-5" /> Printer Already Added
          </CardTitle>
          <CardDescription>You already have a printer configured. Continue to the next step.</CardDescription>
        </CardHeader>
        <CardContent className="flex justify-between">
          <Button variant="outline" onClick={onBack}>
            <ArrowLeft className="mr-2 h-4 w-4" /> Back
          </Button>
          <Button onClick={onComplete}>
            Continue <ArrowRight className="ml-2 h-4 w-4" />
          </Button>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Printer className="h-5 w-5" /> Add Your First Printer
        </CardTitle>
        <CardDescription>
          Configure your 3D printer. We'll use this to calculate depreciation and power costs.
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label>Brand</Label>
            <Select value={brand} onValueChange={handleBrandChange}>
              <SelectTrigger>
                <SelectValue placeholder="Select brand" />
              </SelectTrigger>
              <SelectContent>
                {printerBrands.map(b => (
                  <SelectItem key={b} value={b}>{b}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div className="space-y-2">
            <Label>Model</Label>
            <Select value={model} onValueChange={handleModelChange} disabled={!brand}>
              <SelectTrigger>
                <SelectValue placeholder="Select model" />
              </SelectTrigger>
              <SelectContent>
                {models.map(m => (
                  <SelectItem key={m} value={m}>{m}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>

        <div className="space-y-2">
          <Label htmlFor="name">Printer Name *</Label>
          <Input
            id="name"
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="e.g., My Printer"
          />
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label htmlFor="cost">Purchase Cost (€)</Label>
            <Input
              id="cost"
              type="number"
              value={purchaseCost}
              onChange={(e) => setPurchaseCost(e.target.value)}
              placeholder="0.00"
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="power">Power (Watts)</Label>
            <Input
              id="power"
              type="number"
              value={powerWatts}
              onChange={(e) => setPowerWatts(e.target.value)}
            />
          </div>
        </div>

        <div className="space-y-2">
          <Label htmlFor="depreciation">Depreciation Period (months)</Label>
          <Input
            id="depreciation"
            type="number"
            value={depreciationMonths}
            onChange={(e) => setDepreciationMonths(e.target.value)}
          />
          <p className="text-xs text-muted-foreground">
            How long before the printer is fully depreciated
          </p>
        </div>

        <div className="flex justify-between pt-4">
          <Button variant="outline" onClick={onBack}>
            <ArrowLeft className="mr-2 h-4 w-4" /> Back
          </Button>
          <Button onClick={handleSave} disabled={saving}>
            {saving && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
            Save & Continue <ArrowRight className="ml-2 h-4 w-4" />
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}
