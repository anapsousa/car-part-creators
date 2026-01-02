import { cn } from "@/lib/utils";
import { Check } from "lucide-react";

export interface ProductColor {
  name: string;
  hex: string;
}

interface ColorSelectorProps {
  colors: ProductColor[];
  selectedColor: ProductColor | null;
  onColorSelect: (color: ProductColor) => void;
  size?: "sm" | "md" | "lg";
}

export function ColorSelector({ 
  colors, 
  selectedColor, 
  onColorSelect,
  size = "md"
}: ColorSelectorProps) {
  if (!colors || colors.length === 0) return null;

  const sizeClasses = {
    sm: "w-6 h-6",
    md: "w-8 h-8",
    lg: "w-10 h-10"
  };

  const checkSizes = {
    sm: "h-3 w-3",
    md: "h-4 w-4",
    lg: "h-5 w-5"
  };

  return (
    <div className="flex flex-wrap gap-2">
      {colors.map((color, index) => {
        const isSelected = selectedColor?.hex === color.hex;
        const isLight = isLightColor(color.hex);
        
        return (
          <button
            key={`${color.hex}-${index}`}
            type="button"
            onClick={() => onColorSelect(color)}
            className={cn(
              sizeClasses[size],
              "rounded-full border-2 transition-all duration-200 flex items-center justify-center",
              "hover:scale-110 focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2",
              isSelected 
                ? "border-primary ring-2 ring-primary ring-offset-2" 
                : "border-border hover:border-muted-foreground"
            )}
            style={{ backgroundColor: color.hex }}
            title={color.name}
            aria-label={`Select ${color.name} color`}
          >
            {isSelected && (
              <Check 
                className={cn(
                  checkSizes[size],
                  isLight ? "text-foreground" : "text-white"
                )} 
              />
            )}
          </button>
        );
      })}
    </div>
  );
}

// Helper function to determine if a color is light
function isLightColor(hex: string): boolean {
  const color = hex.replace("#", "");
  const r = parseInt(color.substring(0, 2), 16);
  const g = parseInt(color.substring(2, 4), 16);
  const b = parseInt(color.substring(4, 6), 16);
  const brightness = (r * 299 + g * 587 + b * 114) / 1000;
  return brightness > 155;
}
