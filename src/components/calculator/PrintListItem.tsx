import { Calculator, Clock, Trash2, Copy, Edit, Scale } from 'lucide-react';
import { Button } from '@/components/ui/button';
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
    image_url?: string | null;
  };
  printerName?: string;
  filamentName?: string;
  totalGrams?: number;
  isSelected?: boolean;
  onSelect: (id: string) => void;
  onEdit: (id: string) => void;
  onDuplicate: (id: string) => void;
  onDelete: (id: string) => void;
}

export function PrintListItem({ 
  print, 
  printerName, 
  filamentName, 
  totalGrams,
  isSelected,
  onSelect,
  onEdit, 
  onDuplicate, 
  onDelete 
}: PrintListItemProps) {
  const profitMargin = print.profit_margin_percent ?? 0;
  const isPositiveProfit = profitMargin > 0;

  return (
    <div 
      className={`
        group flex flex-col p-4 border rounded-lg cursor-pointer transition-all
        ${isSelected 
          ? 'border-primary bg-primary/5' 
          : 'border-border/50 bg-card/50 hover:border-primary/30'
        }
      `}
      onClick={() => onSelect(print.id)}
    >
      {/* Header */}
      <div className="flex items-start justify-between gap-2 mb-2">
        <div className="flex items-center gap-3 min-w-0">
          {print.image_url ? (
            <img 
              src={print.image_url} 
              alt={print.name}
              className="w-10 h-10 rounded object-cover flex-shrink-0"
            />
          ) : (
            <div className="w-10 h-10 rounded bg-primary/10 flex items-center justify-center flex-shrink-0">
              <Calculator className="h-5 w-5 text-primary" />
            </div>
          )}
          <div className="min-w-0">
            <h3 className="font-medium text-foreground truncate">{print.name}</h3>
            <p className="text-xs text-muted-foreground truncate">
              {printerName || 'No printer'} • {filamentName || 'No filament'}
            </p>
          </div>
        </div>
        
        <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
          <Button
            variant="ghost"
            size="icon"
            className="h-7 w-7"
            onClick={(e) => { e.stopPropagation(); onDuplicate(print.id); }}
            title="Duplicate"
          >
            <Copy className="h-3.5 w-3.5" />
          </Button>
          <Button
            variant="ghost"
            size="icon"
            className="h-7 w-7"
            onClick={(e) => { e.stopPropagation(); onEdit(print.id); }}
            title="Edit"
          >
            <Edit className="h-3.5 w-3.5" />
          </Button>
          <Button
            variant="ghost"
            size="icon"
            className="h-7 w-7 text-destructive hover:text-destructive"
            onClick={(e) => { e.stopPropagation(); onDelete(print.id); }}
            title="Delete"
          >
            <Trash2 className="h-3.5 w-3.5" />
          </Button>
        </div>
      </div>

      {/* Stats row */}
      <div className="flex items-center gap-3 text-xs text-muted-foreground mb-3">
        {totalGrams !== undefined && totalGrams > 0 && (
          <span className="flex items-center gap-1">
            <Scale className="h-3 w-3" />
            {totalGrams.toFixed(1)}g
          </span>
        )}
        <span className="flex items-center gap-1">
          <Clock className="h-3 w-3" />
          {formatTime(print.print_time_minutes)}
        </span>
      </div>

      {/* Cost/Price/Profit row */}
      <div className="grid grid-cols-3 gap-2 text-sm">
        <div>
          <p className="text-xs text-muted-foreground">Cost</p>
          <p className="font-medium">{formatCurrency(print.total_cost ?? 0)}</p>
        </div>
        <div>
          <p className="text-xs text-muted-foreground">Price</p>
          <p className="font-medium text-primary">{formatCurrency(print.sell_price ?? 0)}</p>
        </div>
        <div>
          <p className="text-xs text-muted-foreground">Profit</p>
          <p className={`font-medium ${isPositiveProfit ? 'text-green-500' : 'text-red-500'}`}>
            {formatCurrency(print.profit ?? 0)}
          </p>
        </div>
      </div>
    </div>
  );
}