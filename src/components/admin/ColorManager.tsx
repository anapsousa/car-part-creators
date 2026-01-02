import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Plus, X, Palette } from "lucide-react";
import { cn } from "@/lib/utils";

export interface ProductColor {
  name: string;
  hex: string;
}

interface ColorManagerProps {
  colors: ProductColor[];
  onChange: (colors: ProductColor[]) => void;
}

const PRESET_COLORS = [
  { name: "Black", hex: "#000000" },
  { name: "White", hex: "#FFFFFF" },
  { name: "Red", hex: "#EF4444" },
  { name: "Blue", hex: "#3B82F6" },
  { name: "Green", hex: "#22C55E" },
  { name: "Yellow", hex: "#EAB308" },
  { name: "Purple", hex: "#A855F7" },
  { name: "Pink", hex: "#EC4899" },
  { name: "Orange", hex: "#F97316" },
  { name: "Gray", hex: "#6B7280" },
];

export function ColorManager({ colors, onChange }: ColorManagerProps) {
  const [newColorName, setNewColorName] = useState("");
  const [newColorHex, setNewColorHex] = useState("#000000");

  const addColor = () => {
    if (!newColorName.trim() || !newColorHex) return;
    
    // Check for duplicates
    const exists = colors.some(
      c => c.hex.toLowerCase() === newColorHex.toLowerCase()
    );
    if (exists) return;

    onChange([...colors, { name: newColorName.trim(), hex: newColorHex }]);
    setNewColorName("");
    setNewColorHex("#000000");
  };

  const addPresetColor = (preset: ProductColor) => {
    const exists = colors.some(
      c => c.hex.toLowerCase() === preset.hex.toLowerCase()
    );
    if (exists) return;
    onChange([...colors, preset]);
  };

  const removeColor = (index: number) => {
    onChange(colors.filter((_, i) => i !== index));
  };

  return (
    <div className="space-y-4">
      {/* Current Colors */}
      {colors.length > 0 && (
        <div className="flex flex-wrap gap-2">
          {colors.map((color, index) => (
            <div
              key={`${color.hex}-${index}`}
              className="flex items-center gap-2 bg-muted px-3 py-1.5 rounded-full"
            >
              <div
                className="w-5 h-5 rounded-full border border-border"
                style={{ backgroundColor: color.hex }}
              />
              <span className="text-sm">{color.name}</span>
              <button
                type="button"
                onClick={() => removeColor(index)}
                className="ml-1 text-muted-foreground hover:text-destructive transition-colors"
              >
                <X className="h-3.5 w-3.5" />
              </button>
            </div>
          ))}
        </div>
      )}

      {/* Preset Colors */}
      <div>
        <Label className="text-sm text-muted-foreground mb-2 block">
          Quick Add Preset Colors
        </Label>
        <div className="flex flex-wrap gap-2">
          {PRESET_COLORS.map((preset) => {
            const isAdded = colors.some(
              c => c.hex.toLowerCase() === preset.hex.toLowerCase()
            );
            return (
              <button
                key={preset.hex}
                type="button"
                disabled={isAdded}
                onClick={() => addPresetColor(preset)}
                className={cn(
                  "w-8 h-8 rounded-full border-2 transition-all",
                  "hover:scale-110 focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2",
                  isAdded 
                    ? "opacity-30 cursor-not-allowed border-muted" 
                    : "border-border hover:border-primary"
                )}
                style={{ backgroundColor: preset.hex }}
                title={isAdded ? `${preset.name} already added` : `Add ${preset.name}`}
              />
            );
          })}
        </div>
      </div>

      {/* Custom Color Input */}
      <div className="flex gap-2 items-end">
        <div className="flex-1">
          <Label htmlFor="color-name" className="text-sm">
            Custom Color Name
          </Label>
          <Input
            id="color-name"
            value={newColorName}
            onChange={(e) => setNewColorName(e.target.value)}
            placeholder="e.g., Navy Blue"
          />
        </div>
        <div className="w-24">
          <Label htmlFor="color-hex" className="text-sm">
            Color
          </Label>
          <div className="relative">
            <Input
              id="color-hex"
              type="color"
              value={newColorHex}
              onChange={(e) => setNewColorHex(e.target.value)}
              className="h-10 p-1 cursor-pointer"
            />
          </div>
        </div>
        <Button
          type="button"
          variant="outline"
          size="icon"
          onClick={addColor}
          disabled={!newColorName.trim()}
        >
          <Plus className="h-4 w-4" />
        </Button>
      </div>
    </div>
  );
}
