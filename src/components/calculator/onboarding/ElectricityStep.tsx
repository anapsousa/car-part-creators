import { useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useToast } from '@/hooks/use-toast';
import { ArrowLeft, ArrowRight, Loader2, Zap } from 'lucide-react';

interface ElectricityStepProps {
  userId: string;
  onComplete: () => void;
  onBack: () => void;
  isCompleted: boolean;
}

export function ElectricityStep({ userId, onComplete, onBack, isCompleted }: ElectricityStepProps) {
  const { toast } = useToast();
  const [saving, setSaving] = useState(false);
  const [name, setName] = useState('Default');
  const [pricePerKwh, setPricePerKwh] = useState('0.15');
  const [contractedPower, setContractedPower] = useState('3.45');

  const handleSave = async () => {
    if (!name.trim()) {
      toast({ title: 'Error', description: 'Please enter a configuration name', variant: 'destructive' });
      return;
    }

    setSaving(true);
    try {
      const { error } = await supabase.from('calc_electricity_settings').insert({
        user_id: userId,
        name: name.trim(),
        price_per_kwh: parseFloat(pricePerKwh) || 0.15,
        contracted_power_kva: parseFloat(contractedPower) || 3.45,
        is_default: true,
      });

      if (error) throw error;

      toast({ title: 'Settings saved!', description: 'Electricity settings have been configured.' });
      onComplete();
    } catch (error) {
      console.error('Error saving electricity settings:', error);
      toast({ title: 'Error', description: 'Failed to save settings', variant: 'destructive' });
    } finally {
      setSaving(false);
    }
  };

  if (isCompleted) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Zap className="h-5 w-5" /> Electricity Already Configured
          </CardTitle>
          <CardDescription>You already have electricity settings. Continue to finish setup.</CardDescription>
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
          <Zap className="h-5 w-5" /> Configure Electricity Costs
        </CardTitle>
        <CardDescription>
          Set your electricity rate to accurately calculate power costs for printing.
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="space-y-2">
          <Label htmlFor="name">Configuration Name</Label>
          <Input
            id="name"
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="e.g., Home, Office"
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="kwh">Price per kWh (€)</Label>
          <Input
            id="kwh"
            type="number"
            step="0.01"
            value={pricePerKwh}
            onChange={(e) => setPricePerKwh(e.target.value)}
          />
          <p className="text-xs text-muted-foreground">
            Check your electricity bill for the exact rate. Average in Portugal: €0.15/kWh
          </p>
        </div>

        <div className="space-y-2">
          <Label htmlFor="power">Contracted Power (kVA)</Label>
          <Input
            id="power"
            type="number"
            step="0.01"
            value={contractedPower}
            onChange={(e) => setContractedPower(e.target.value)}
          />
          <p className="text-xs text-muted-foreground">
            Optional: Your contracted power capacity
          </p>
        </div>

        <div className="p-4 bg-primary/10 rounded-lg">
          <p className="text-sm text-muted-foreground">Example: 10-hour print at 200W</p>
          <p className="text-xl font-bold text-primary">
            €{((200 * 10 / 1000) * parseFloat(pricePerKwh || '0')).toFixed(2)} electricity cost
          </p>
        </div>

        <div className="flex justify-between pt-4">
          <Button variant="outline" onClick={onBack}>
            <ArrowLeft className="mr-2 h-4 w-4" /> Back
          </Button>
          <Button onClick={handleSave} disabled={saving}>
            {saving && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
            Save & Finish <ArrowRight className="ml-2 h-4 w-4" />
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}
