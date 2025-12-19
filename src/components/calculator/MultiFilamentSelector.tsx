import { Plus, Trash2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { calculateCostPerGram } from '@/lib/calculator/filamentData';
import { useContent } from '@/hooks/useContent';

export interface FilamentSelection {
  filamentId: string;
  filamentName: string;
  gramsUsed: number;
  costPerGram: number;
}

interface Filament {
  id: string;
  name: string;
  material: string;
  color: string | null;
  spool_cost: number;
  spool_weight_grams: number;
}

interface MultiFilamentSelectorProps {
  filaments: Filament[];
  selectedFilaments: FilamentSelection[];
  onChange: (selections: FilamentSelection[]) => void;
}

export function MultiFilamentSelector({
  filaments,
  selectedFilaments,
  onChange,
}: MultiFilamentSelectorProps) {
  const { content } = useContent('calculator');
  const t = (key: string, fallback: string) => content[key] || fallback;

  const addFilament = () => {
    if (filaments.length === 0) return;
    
    const firstFilament = filaments[0];
    const costPerGram = calculateCostPerGram(
      Number(firstFilament.spool_cost),
      Number(firstFilament.spool_weight_grams)
    );
    
    onChange([
      ...selectedFilaments,
      {
        filamentId: firstFilament.id,
        filamentName: firstFilament.name,
        gramsUsed: 0,
        costPerGram,
      },
    ]);
  };

  const updateFilament = (index: number, filamentId: string) => {
    const filament = filaments.find(f => f.id === filamentId);
    if (!filament) return;

    const costPerGram = calculateCostPerGram(
      Number(filament.spool_cost),
      Number(filament.spool_weight_grams)
    );

    const updated = [...selectedFilaments];
    updated[index] = {
      ...updated[index],
      filamentId,
      filamentName: filament.name,
      costPerGram,
    };
    onChange(updated);
  };

  const updateGrams = (index: number, grams: number) => {
    const updated = [...selectedFilaments];
    updated[index] = {
      ...updated[index],
      gramsUsed: grams,
    };
    onChange(updated);
  };

  const removeFilament = (index: number) => {
    onChange(selectedFilaments.filter((_, i) => i !== index));
  };

  const totalFilamentCost = selectedFilaments.reduce(
    (sum, f) => sum + f.gramsUsed * f.costPerGram,
    0
  );

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <Label className="text-sm font-medium">{t('calculator.multiFilament.title', 'Filaments Used')}</Label>
        <Button
          type="button"
          variant="outline"
          size="sm"
          onClick={addFilament}
          disabled={filaments.length === 0}
        >
          <Plus className="h-4 w-4 mr-1" />
          {t('calculator.multiFilament.addFilament', 'Add Filament')}
        </Button>
      </div>

      {selectedFilaments.length === 0 ? (
        <p className="text-sm text-muted-foreground text-center py-4 border border-dashed rounded-md">
          {t('calculator.multiFilament.noFilaments', 'No filaments selected. Click "Add Filament" to begin.')}
        </p>
      ) : (
        <div className="space-y-3">
          {selectedFilaments.map((selection, index) => (
            <div
              key={index}
              className="flex items-end gap-3 p-3 bg-background/50 border rounded-md"
            >
              <div className="flex-1">
                <Label className="text-xs text-muted-foreground">{t('calculator.multiFilament.filament', 'Filament')}</Label>
                <Select
                  value={selection.filamentId}
                  onValueChange={(value) => updateFilament(index, value)}
                >
                  <SelectTrigger className="mt-1">
                    <SelectValue placeholder={t('calculator.multiFilament.selectFilament', 'Select filament')} />
                  </SelectTrigger>
                  <SelectContent>
                    {filaments.map((f) => (
                      <SelectItem key={f.id} value={f.id}>
                        {f.name} ({f.material}{f.color ? ` - ${f.color}` : ''})
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="w-28">
                <Label className="text-xs text-muted-foreground">{t('calculator.multiFilament.grams', 'Grams')}</Label>
                <Input
                  type="number"
                  min="0"
                  step="0.1"
                  value={selection.gramsUsed || ''}
                  onChange={(e) => updateGrams(index, parseFloat(e.target.value) || 0)}
                  className="mt-1"
                  placeholder="0"
                />
              </div>

              <div className="w-24 text-right">
                <Label className="text-xs text-muted-foreground">{t('calculator.multiFilament.cost', 'Cost')}</Label>
                <p className="text-sm font-medium mt-2">
                  €{(selection.gramsUsed * selection.costPerGram).toFixed(2)}
                </p>
              </div>

              <Button
                type="button"
                variant="ghost"
                size="icon"
                className="text-destructive hover:text-destructive"
                onClick={() => removeFilament(index)}
              >
                <Trash2 className="h-4 w-4" />
              </Button>
            </div>
          ))}

          <div className="flex justify-end pt-2 border-t">
            <p className="text-sm">
              {t('calculator.multiFilament.totalCost', 'Total Filament Cost')}:{' '}
              <span className="font-semibold text-primary">
                €{totalFilamentCost.toFixed(2)}
              </span>
            </p>
          </div>
        </div>
      )}
    </div>
  );
}
