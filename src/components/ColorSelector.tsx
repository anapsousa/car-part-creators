import { cn } from "@/lib/utils";
import { useTranslation } from "react-i18next";
import { Check } from "lucide-react";
import { 
  ProductColor, 
  migrateColorsToNewSchema,
  getLocalizedColorName 
} from "@/lib/productColors";

interface ColorSelectorProps {
  /** Raw colors from database - will be migrated to new schema if needed */
  colors: unknown;
  /** Currently selected color ID */
  selectedColorId: string | null;
  /** Callback when a color is selected */
  onSelect: (color: ProductColor) => void;
  /** Size variant */
  size?: "sm" | "md" | "lg";
}

/**
 * ColorSelector component for product detail page
 * Displays available colors as clickable swatches
 * Handles migration from legacy color format automatically
 * Supports color images when available
 */
export function ColorSelector({ 
  colors: rawColors, 
  selectedColorId, 
  onSelect,
  size = "md" 
}: ColorSelectorProps) {
  const { i18n, t } = useTranslation();
  const currentLang = i18n.language;
  
  // Migrate colors to new schema if needed
  const colors = migrateColorsToNewSchema(rawColors);
  
  if (colors.length === 0) {
    return null;
  }

  const sizeClasses = {
    sm: "w-6 h-6",
    md: "w-8 h-8",
    lg: "w-10 h-10",
  };

  const checkSizes = {
    sm: "h-3 w-3",
    md: "h-4 w-4",
    lg: "h-5 w-5",
  };

  return (
    <div className="space-y-2">
      <label className="text-sm font-medium text-foreground">
        {t("product.selectColor")}
        {selectedColorId && (
          <span className="ml-2 text-muted-foreground font-normal">
            {getLocalizedColorName(
              colors.find(c => c.id === selectedColorId) || colors[0],
              currentLang
            )}
          </span>
        )}
      </label>
      
      <div className="flex flex-wrap gap-2">
        {colors.map((color) => {
          const isSelected = selectedColorId === color.id;
          const hasImage = !!color.image_url;
          const hasHex = !!color.hex;
          const isLight = hasHex ? isLightColor(color.hex!) : false;
          
          return (
            <button
              key={color.id}
              type="button"
              onClick={() => onSelect(color)}
              className={cn(
                sizeClasses[size],
                "rounded-full border-2 transition-all duration-200 relative overflow-hidden",
                "hover:scale-110 focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2",
                "flex items-center justify-center",
                isSelected
                  ? "border-primary ring-2 ring-primary ring-offset-2"
                  : "border-border hover:border-primary/50"
              )}
              style={hasHex && !hasImage ? { backgroundColor: color.hex } : undefined}
              title={getLocalizedColorName(color, currentLang)}
              aria-label={t("product.selectColorLabel", { 
                color: getLocalizedColorName(color, currentLang) 
              })}
            >
              {/* Show image swatch if available */}
              {hasImage && (
                <img
                  src={color.image_url}
                  alt={getLocalizedColorName(color, currentLang)}
                  className="w-full h-full object-cover absolute inset-0"
                />
              )}
              
              {/* Show text initial if no hex or image */}
              {!hasHex && !hasImage && (
                <span className="text-xs font-medium bg-muted rounded-full w-full h-full flex items-center justify-center">
                  {color.name_en.charAt(0).toUpperCase()}
                </span>
              )}
              
              {/* Selected checkmark */}
              {isSelected && (
                <Check 
                  className={cn(
                    checkSizes[size],
                    "relative z-10",
                    hasImage 
                      ? "text-white drop-shadow-md" 
                      : isLight 
                        ? "text-foreground" 
                        : "text-white"
                  )}
                />
              )}
            </button>
          );
        })}
      </div>
      
      {/* Filament reference if available */}
      {selectedColorId && (
        <FilamentReference 
          color={colors.find(c => c.id === selectedColorId)} 
        />
      )}
    </div>
  );
}

/**
 * Displays filament reference for a color if available
 */
function FilamentReference({ color }: { color?: ProductColor }) {
  const { t } = useTranslation();
  
  if (!color?.filament_ref) {
    return null;
  }
  
  return (
    <p className="text-xs text-muted-foreground">
      {t("product.filamentRef")}: {color.filament_ref}
    </p>
  );
}

/**
 * Determines if a hex color is light (for contrast purposes)
 */
function isLightColor(hex: string): boolean {
  // Remove # if present
  const cleanHex = hex.replace("#", "");
  
  // Handle short hex codes
  const fullHex = cleanHex.length === 3 
    ? cleanHex.split('').map(c => c + c).join('')
    : cleanHex;
  
  // Parse RGB values
  const r = parseInt(fullHex.substring(0, 2), 16);
  const g = parseInt(fullHex.substring(2, 4), 16);
  const b = parseInt(fullHex.substring(4, 6), 16);
  
  // Calculate relative luminance
  const luminance = (0.299 * r + 0.587 * g + 0.114 * b) / 255;
  
  return luminance > 0.5;
}

// Re-export ProductColor type for convenience
export type { ProductColor } from "@/lib/productColors";
