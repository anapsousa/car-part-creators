import { useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useToast } from '@/hooks/use-toast';
import { ArrowLeft, ArrowRight, Loader2, Palette } from 'lucide-react';
import { FILAMENT_BRANDS, FILAMENT_MATERIALS, FILAMENT_COLORS } from '@/lib/calculator/filamentData';

interface FilamentStepProps {
  userId: string;
  onComplete: () => void;
  onBack: () => void;
  isCompleted: boolean;
}

export function FilamentStep({ userId, onComplete, onBack, isCompleted }: FilamentStepProps) {
  const { toast } = useToast();
  const [saving, setSaving] = useState(false);
  const [name, setName] = useState('');
  const [brand, setBrand] = useState('');
  const [material, setMaterial] = useState('PLA');
  const [color, setColor] = useState('');
  const [spoolWeight, setSpoolWeight] = useState('1000');
  const [spoolCost, setSpoolCost] = useState('20');

  const costPerGram = spoolWeight && spoolCost 
    ? (parseFloat(spoolCost) / parseFloat(spoolWeight)).toFixed(4)
    : '0.0000';

  const handleSave = async () => {
    if (!name.trim()) {
      toast({ title: 'Error', description: 'Please enter a filament name', variant: 'destructive' });
      return;
    }

    setSaving(true);
    try {
      const { error } = await supabase.from('calc_filaments').insert({
        user_id: userId,
        name: name.trim(),
        brand: brand || null,
        material: material || 'PLA',
        color: color || null,
        spool_weight_grams: parseFloat(spoolWeight) || 1000,
        spool_cost: parseFloat(spoolCost) || 20,
      });

      if (error) throw error;

      toast({ title: 'Filament added!', description: `${name} has been added to your inventory.` });
      onComplete();
    } catch (error) {
      console.error('Error saving filament:', error);
      toast({ title: 'Error', description: 'Failed to save filament', variant: 'destructive' });
    } finally {
      setSaving(false);
    }
  };

  if (isCompleted) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Palette className="h-5 w-5" /> Filament Already Added
          </CardTitle>
          <CardDescription>You already have filament configured. Continue to the next step.</CardDescription>
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
          <Palette className="h-5 w-5" /> Add Your First Filament
        </CardTitle>
        <CardDescription>
          Set up your filament inventory. We'll calculate cost per gram automatically.
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="space-y-2">
          <Label htmlFor="name">Filament Name *</Label>
          <Input
            id="name"
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="e.g., eSUN PLA+ Black"
          />
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label>Brand</Label>
            <Select value={brand} onValueChange={setBrand}>
              <SelectTrigger>
                <SelectValue placeholder="Select brand" />
              </SelectTrigger>
              <SelectContent>
                {FILAMENT_BRANDS.map(b => (
                  <SelectItem key={b} value={b}>{b}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div className="space-y-2">
            <Label>Material</Label>
            <Select value={material} onValueChange={setMaterial}>
              <SelectTrigger>
                <SelectValue placeholder="Select material" />
              </SelectTrigger>
              <SelectContent>
                {FILAMENT_MATERIALS.map(m => (
                  <SelectItem key={m} value={m}>{m}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>

        <div className="space-y-2">
          <Label>Color</Label>
          <Select value={color} onValueChange={setColor}>
            <SelectTrigger>
              <SelectValue placeholder="Select color" />
            </SelectTrigger>
            <SelectContent>
              {FILAMENT_COLORS.map(c => (
                <SelectItem key={c} value={c}>{c}</SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label htmlFor="weight">Spool Weight (grams)</Label>
            <Input
              id="weight"
              type="number"
              value={spoolWeight}
              onChange={(e) => setSpoolWeight(e.target.value)}
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="cost">Spool Cost (€)</Label>
            <Input
              id="cost"
              type="number"
              step="0.01"
              value={spoolCost}
              onChange={(e) => setSpoolCost(e.target.value)}
            />
          </div>
        </div>

        <div className="p-4 bg-primary/10 rounded-lg">
          <p className="text-sm text-muted-foreground">Cost per gram</p>
          <p className="text-2xl font-bold text-primary">€{costPerGram}/g</p>
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
