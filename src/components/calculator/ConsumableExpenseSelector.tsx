import { Checkbox } from '@/components/ui/checkbox';
import { Label } from '@/components/ui/label';
import { formatCurrency } from '@/lib/calculator/calculations';
import type { Tables } from '@/integrations/supabase/types';

type Consumable = Tables<'calc_consumables'>;
type FixedExpense = Tables<'calc_fixed_expenses'>;

interface ConsumableExpenseSelectorProps {
  consumables: Consumable[];
  fixedExpenses: FixedExpense[];
  selectedConsumableIds: string[];
  selectedExpenseIds: string[];
  onConsumablesChange: (ids: string[]) => void;
  onExpensesChange: (ids: string[]) => void;
}

export function ConsumableExpenseSelector({
  consumables,
  fixedExpenses,
  selectedConsumableIds,
  selectedExpenseIds,
  onConsumablesChange,
  onExpensesChange,
}: ConsumableExpenseSelectorProps) {
  const activeConsumables = consumables.filter(c => c.is_active);
  const activeExpenses = fixedExpenses.filter(e => e.is_active);

  const handleConsumableToggle = (id: string, checked: boolean) => {
    if (checked) {
      onConsumablesChange([...selectedConsumableIds, id]);
    } else {
      onConsumablesChange(selectedConsumableIds.filter(cId => cId !== id));
    }
  };

  const handleExpenseToggle = (id: string, checked: boolean) => {
    if (checked) {
      onExpensesChange([...selectedExpenseIds, id]);
    } else {
      onExpensesChange(selectedExpenseIds.filter(eId => eId !== id));
    }
  };

  const selectedConsumablesTotal = consumables
    .filter(c => selectedConsumableIds.includes(c.id))
    .reduce((sum, c) => sum + Number(c.cost), 0);

  const selectedExpensesTotal = fixedExpenses
    .filter(e => selectedExpenseIds.includes(e.id))
    .reduce((sum, e) => sum + Number(e.monthly_amount), 0) / 100; // Prorated per print

  return (
    <div className="space-y-6">
      {/* Consumables Section */}
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <Label className="text-base font-medium">Consumables</Label>
          <span className="text-sm text-muted-foreground">
            Total: {formatCurrency(selectedConsumablesTotal)}
          </span>
        </div>
        {activeConsumables.length === 0 ? (
          <p className="text-sm text-muted-foreground">No consumables configured. Add them in Settings.</p>
        ) : (
          <div className="grid gap-2">
            {activeConsumables.map(consumable => (
              <div 
                key={consumable.id} 
                className="flex items-center justify-between p-3 rounded-lg border bg-card hover:bg-accent/50 transition-colors"
              >
                <div className="flex items-center gap-3">
                  <Checkbox
                    id={`consumable-${consumable.id}`}
                    checked={selectedConsumableIds.includes(consumable.id)}
                    onCheckedChange={(checked) => handleConsumableToggle(consumable.id, checked === true)}
                  />
                  <Label 
                    htmlFor={`consumable-${consumable.id}`}
                    className="cursor-pointer font-normal"
                  >
                    {consumable.name}
                  </Label>
                </div>
                <span className="text-sm font-medium">{formatCurrency(Number(consumable.cost))}</span>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Fixed Expenses Section */}
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <Label className="text-base font-medium">Fixed Expenses</Label>
          <span className="text-sm text-muted-foreground">
            Per print: {formatCurrency(selectedExpensesTotal)}
          </span>
        </div>
        {activeExpenses.length === 0 ? (
          <p className="text-sm text-muted-foreground">No fixed expenses configured. Add them in Settings.</p>
        ) : (
          <div className="grid gap-2">
            {activeExpenses.map(expense => (
              <div 
                key={expense.id} 
                className="flex items-center justify-between p-3 rounded-lg border bg-card hover:bg-accent/50 transition-colors"
              >
                <div className="flex items-center gap-3">
                  <Checkbox
                    id={`expense-${expense.id}`}
                    checked={selectedExpenseIds.includes(expense.id)}
                    onCheckedChange={(checked) => handleExpenseToggle(expense.id, checked === true)}
                  />
                  <Label 
                    htmlFor={`expense-${expense.id}`}
                    className="cursor-pointer font-normal"
                  >
                    {expense.name}
                  </Label>
                </div>
                <div className="text-right">
                  <span className="text-sm font-medium">{formatCurrency(Number(expense.monthly_amount))}/mo</span>
                  <p className="text-xs text-muted-foreground">≈ {formatCurrency(Number(expense.monthly_amount) / 100)}/print</p>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
