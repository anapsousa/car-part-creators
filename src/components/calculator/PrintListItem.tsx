import { formatDistanceToNow } from 'date-fns';
import { Calculator, Clock, Trash2, Copy, Edit } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { formatCurrency, formatTime } from '@/lib/calculator/calculations';

interface PrintListItemProps {
  print: {
    id: string;
    name: string;
    print_time_minutes: number;
    total_cost: number | null;
    sell_price: number | null;
    profit: number | null;
    profit_margin_percent: number | null;
    is_template: boolean | null;
    created_at: string;
    quantity: number | null;
  };
  onEdit: (id: string) => void;
  onDuplicate: (id: string) => void;
  onDelete: (id: string) => void;
}

export function PrintListItem({ print, onEdit, onDuplicate, onDelete }: PrintListItemProps) {
  const profitMargin = print.profit_margin_percent ?? 0;
  const isPositiveProfit = profitMargin > 0;

  return (
    <div className="group flex items-center justify-between p-4 bg-card/50 border border-border/50 rounded-lg hover:border-primary/30 transition-colors">
      <div className="flex items-center gap-4 flex-1 min-w-0">
        <div className="p-2 rounded-md bg-primary/10">
          <Calculator className="h-5 w-5 text-primary" />
        </div>
        
        <div className="min-w-0 flex-1">
          <div className="flex items-center gap-2">
            <h3 className="font-medium text-foreground truncate">{print.name}</h3>
            {print.is_template && (
              <Badge variant="secondary" className="text-xs">Template</Badge>
            )}
            {(print.quantity ?? 1) > 1 && (
              <Badge variant="outline" className="text-xs">x{print.quantity}</Badge>
            )}
          </div>
          
          <div className="flex items-center gap-3 mt-1 text-sm text-muted-foreground">
            <span className="flex items-center gap-1">
              <Clock className="h-3.5 w-3.5" />
              {formatTime(print.print_time_minutes)}
            </span>
            <span>•</span>
            <span>Cost: {formatCurrency(print.total_cost ?? 0)}</span>
            <span>•</span>
            <span>
              {formatDistanceToNow(new Date(print.created_at), { addSuffix: true })}
            </span>
          </div>
        </div>
      </div>

      <div className="flex items-center gap-4">
        <div className="text-right hidden sm:block">
          <p className="text-sm font-medium text-foreground">
            {formatCurrency(print.sell_price ?? 0)}
          </p>
          <p className={`text-xs ${isPositiveProfit ? 'text-green-500' : 'text-red-500'}`}>
            {isPositiveProfit ? '+' : ''}{profitMargin.toFixed(1)}% margin
          </p>
        </div>

        <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
          <Button
            variant="ghost"
            size="icon"
            className="h-8 w-8"
            onClick={() => onEdit(print.id)}
            title="Edit"
          >
            <Edit className="h-4 w-4" />
          </Button>
          <Button
            variant="ghost"
            size="icon"
            className="h-8 w-8"
            onClick={() => onDuplicate(print.id)}
            title="Duplicate"
          >
            <Copy className="h-4 w-4" />
          </Button>
          <Button
            variant="ghost"
            size="icon"
            className="h-8 w-8 text-destructive hover:text-destructive"
            onClick={() => onDelete(print.id)}
            title="Delete"
          >
            <Trash2 className="h-4 w-4" />
          </Button>
        </div>
      </div>
    </div>
  );
}
