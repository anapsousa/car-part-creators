import { useState } from "react";
import { useTranslation } from "react-i18next";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Plus, X, AlertCircle, ChevronDown, ChevronUp } from "lucide-react";
import { cn } from "@/lib/utils";
import { 
  ProductColor, 
  PRESET_COLORS, 
  generateColorId,
  validateProductColors,
  getLocalizedColorName 
} from "@/lib/productColors";
import { ColorImageUpload } from "./ColorImageUpload";
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible";

interface ColorManagerProps {
  colors: ProductColor[];
  onChange: (colors: ProductColor[]) => void;
}

export function ColorManager({ colors, onChange }: ColorManagerProps) {
  const { t, i18n } = useTranslation();
  const currentLang = i18n.language;
  
  const [newColorNamePt, setNewColorNamePt] = useState("");
  const [newColorNameEn, setNewColorNameEn] = useState("");
  const [newColorHex, setNewColorHex] = useState("#000000");
  const [validationErrors, setValidationErrors] = useState<string[]>([]);
  const [expandedColorId, setExpandedColorId] = useState<string | null>(null);

  const addColor = () => {
    // Validate required fields
    if (!newColorNamePt.trim() || !newColorNameEn.trim()) {
      setValidationErrors([t("admin.colors.validation.namesRequired")]);
      return;
    }

    const id = generateColorId(newColorNameEn);
    
    // Check for duplicate IDs
    if (colors.some(c => c.id === id)) {
      setValidationErrors([t("admin.colors.validation.duplicateColor")]);
      return;
    }

    const newColor: ProductColor = {
      id,
      name_pt: newColorNamePt.trim(),
      name_en: newColorNameEn.trim(),
      hex: newColorHex || undefined,
    };

    const newColors = [...colors, newColor];
    const validation = validateProductColors(newColors);
    
    if (!validation.success) {
      setValidationErrors(validation.errors);
      return;
    }

    onChange(newColors);
    setNewColorNamePt("");
    setNewColorNameEn("");
    setNewColorHex("#000000");
    setValidationErrors([]);
  };

  const addPresetColor = (preset: ProductColor) => {
    // Check for duplicate IDs
    if (colors.some(c => c.id === preset.id)) {
      return;
    }
    
    onChange([...colors, { ...preset }]);
  };

  const removeColor = (index: number) => {
    onChange(colors.filter((_, i) => i !== index));
  };

  const updateColorImage = (index: number, imageUrl: string | undefined) => {
    const updatedColors = [...colors];
    updatedColors[index] = {
      ...updatedColors[index],
      image_url: imageUrl,
    };
    onChange(updatedColors);
  };

  const toggleExpanded = (colorId: string) => {
    setExpandedColorId(expandedColorId === colorId ? null : colorId);
  };

  return (
    <div className="space-y-4">
      {/* Validation Errors */}
      {validationErrors.length > 0 && (
        <div className="flex items-start gap-2 p-3 bg-destructive/10 border border-destructive/20 rounded-md">
          <AlertCircle className="h-4 w-4 text-destructive mt-0.5" />
          <div className="text-sm text-destructive">
            {validationErrors.map((error, i) => (
              <p key={i}>{error}</p>
            ))}
          </div>
        </div>
      )}

      {/* Current Colors with Image Upload */}
      {colors.length > 0 && (
        <div className="space-y-2">
          <Label className="text-sm text-muted-foreground">
            {t("admin.colors.addedColors")}
          </Label>
          <div className="space-y-2">
            {colors.map((color, index) => (
              <Collapsible 
                key={`${color.id}-${index}`}
                open={expandedColorId === color.id}
                onOpenChange={() => toggleExpanded(color.id)}
              >
                <div className="flex items-center gap-3 p-2 bg-muted rounded-lg">
                  {/* Color swatch or image */}
                  <div 
                    className="w-8 h-8 rounded-full border border-border flex-shrink-0 overflow-hidden"
                    style={{ backgroundColor: color.hex || '#ccc' }}
                  >
                    {color.image_url && (
                      <img 
                        src={color.image_url} 
                        alt={getLocalizedColorName(color, currentLang)}
                        className="w-full h-full object-cover"
                      />
                    )}
                  </div>

                  {/* Color info */}
                  <div className="flex-1 min-w-0">
                    <span className="text-sm font-medium truncate block">
                      {getLocalizedColorName(color, currentLang)}
                    </span>
                    <span className="text-xs text-muted-foreground">
                      {color.id}
                      {color.image_url && (
                        <span className="ml-2 text-primary">
                          • {t("admin.colors.hasImage")}
                        </span>
                      )}
                    </span>
                  </div>

                  {/* Expand/collapse button */}
                  <CollapsibleTrigger asChild>
                    <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
                      {expandedColorId === color.id ? (
                        <ChevronUp className="h-4 w-4" />
                      ) : (
                        <ChevronDown className="h-4 w-4" />
                      )}
                    </Button>
                  </CollapsibleTrigger>

                  {/* Remove button */}
                  <button
                    type="button"
                    onClick={() => removeColor(index)}
                    className="text-muted-foreground hover:text-destructive transition-colors"
                  >
                    <X className="h-4 w-4" />
                  </button>
                </div>

                {/* Expanded content with image upload */}
                <CollapsibleContent>
                  <div className="mt-2 ml-11 p-3 bg-background border rounded-lg">
                    <div className="flex items-center gap-4">
                      <div>
                        <Label className="text-xs text-muted-foreground mb-2 block">
                          {t("admin.colors.image.label")}
                        </Label>
                        <ColorImageUpload
                          imageUrl={color.image_url}
                          onChange={(url) => updateColorImage(index, url)}
                          colorName={getLocalizedColorName(color, currentLang)}
                          hexColor={color.hex}
                          size="md"
                        />
                      </div>
                      <div className="flex-1 text-sm text-muted-foreground">
                        <p>{t("admin.colors.image.description")}</p>
                      </div>
                    </div>
                  </div>
                </CollapsibleContent>
              </Collapsible>
            ))}
          </div>
        </div>
      )}

      {/* Preset Colors */}
      <div>
        <Label className="text-sm text-muted-foreground mb-2 block">
          {t("admin.colors.quickAdd")}
        </Label>
        <div className="flex flex-wrap gap-2">
          {PRESET_COLORS.map((preset) => {
            const isAdded = colors.some(c => c.id === preset.id);
            return (
              <button
                key={preset.id}
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
                title={isAdded 
                  ? t("admin.colors.alreadyAdded", { name: getLocalizedColorName(preset, currentLang) })
                  : t("admin.colors.addColor", { name: getLocalizedColorName(preset, currentLang) })
                }
              />
            );
          })}
        </div>
      </div>

      {/* Custom Color Input */}
      <div className="space-y-3 border-t pt-4">
        <Label className="text-sm font-medium">
          {t("admin.colors.customColor")}
        </Label>
        
        <div className="grid grid-cols-2 gap-3">
          <div>
            <Label htmlFor="color-name-pt" className="text-xs text-muted-foreground">
              {t("admin.colors.namePt")} *
            </Label>
            <Input
              id="color-name-pt"
              value={newColorNamePt}
              onChange={(e) => setNewColorNamePt(e.target.value)}
              placeholder={t("admin.colors.namePtPlaceholder")}
            />
          </div>
          <div>
            <Label htmlFor="color-name-en" className="text-xs text-muted-foreground">
              {t("admin.colors.nameEn")} *
            </Label>
            <Input
              id="color-name-en"
              value={newColorNameEn}
              onChange={(e) => setNewColorNameEn(e.target.value)}
              placeholder={t("admin.colors.nameEnPlaceholder")}
            />
          </div>
        </div>

        <div className="flex gap-2 items-end">
          <div className="w-24">
            <Label htmlFor="color-hex" className="text-xs text-muted-foreground">
              {t("admin.colors.hexColor")}
            </Label>
            <Input
              id="color-hex"
              type="color"
              value={newColorHex}
              onChange={(e) => setNewColorHex(e.target.value)}
              className="h-10 p-1 cursor-pointer"
            />
          </div>
          <Button
            type="button"
            variant="outline"
            onClick={addColor}
            disabled={!newColorNamePt.trim() || !newColorNameEn.trim()}
            className="flex items-center gap-2"
          >
            <Plus className="h-4 w-4" />
            {t("admin.colors.addButton")}
          </Button>
        </div>
      </div>
    </div>
  );
}

// Re-export ProductColor type for backward compatibility
export type { ProductColor } from "@/lib/productColors";
