/**
 * Product Color Schema Definition
 * ================================
 * 
 * This file defines the canonical JSON schema for product colors stored in
 * the products.colors JSONB column.
 * 
 * JSON Schema for products.colors:
 * [
 *   {
 *     "id": "string (required) - unique slug identifier, e.g., 'midnight-blue'",
 *     "name_pt": "string (required) - Portuguese display name",
 *     "name_en": "string (required) - English display name",
 *     "hex": "string (optional) - Hex color code, e.g., '#3B82F6'",
 *     "image_url": "string (optional) - URL to color swatch image",
 *     "filament_ref": "string (optional) - Reference to filament material/brand"
 *   }
 * ]
 * 
 * Migration Notes:
 * - Legacy format had { name: string, hex: string }
 * - migrateColorsToNewSchema() converts legacy format to new schema
 * - Legacy 'name' becomes both 'name_pt' and 'name_en' during migration
 */

import { z } from "zod";

/**
 * Schema for a single product color
 */
export const ProductColorSchema = z.object({
  /** Unique identifier/slug for the color (e.g., "midnight-blue") */
  id: z.string().min(1, "Color ID is required"),
  
  /** Portuguese display name (required) */
  name_pt: z.string().min(1, "Portuguese name is required"),
  
  /** English display name (required) */
  name_en: z.string().min(1, "English name is required"),
  
  /** Hex color code (optional, must be valid if provided) */
  hex: z
    .string()
    .regex(/^#([A-Fa-f0-9]{6}|[A-Fa-f0-9]{3})$/, "Invalid hex color format")
    .optional()
    .or(z.literal("")),
  
  /** URL to a color swatch image (optional) */
  image_url: z.string().url().optional().or(z.literal("")),
  
  /** Reference to filament material/brand (optional) */
  filament_ref: z.string().optional(),
});

/**
 * Schema for the array of product colors
 */
export const ProductColorsArraySchema = z.array(ProductColorSchema);

/**
 * TypeScript type for a single product color
 */
export type ProductColor = z.infer<typeof ProductColorSchema>;

/**
 * TypeScript type for the colors array
 */
export type ProductColors = z.infer<typeof ProductColorsArraySchema>;

/**
 * Legacy color format (for migration purposes)
 */
interface LegacyProductColor {
  name?: string;
  hex?: string;
}

/**
 * Generates a slug ID from a color name
 */
export function generateColorId(name: string): string {
  return name
    .toLowerCase()
    .trim()
    .replace(/\s+/g, "-")
    .replace(/[^a-z0-9-]/g, "");
}

/**
 * Migrates legacy color format to new schema
 * Legacy format: { name: string, hex: string }
 * New format: { id: string, name_pt: string, name_en: string, hex?: string, ... }
 * 
 * @param colors - Raw colors data from database (could be any format)
 * @returns Migrated colors array in new schema format
 */
export function migrateColorsToNewSchema(colors: unknown): ProductColor[] {
  // Handle null/undefined
  if (!colors) return [];
  
  // Handle non-array
  if (!Array.isArray(colors)) return [];
  
  return colors.map((color, index) => {
    // If already in new format (has id and name_pt)
    if (
      typeof color === "object" &&
      color !== null &&
      "id" in color &&
      "name_pt" in color &&
      "name_en" in color
    ) {
      return {
        id: String(color.id || `color-${index}`),
        name_pt: String(color.name_pt || ""),
        name_en: String(color.name_en || ""),
        hex: typeof color.hex === "string" ? color.hex : undefined,
        image_url: typeof color.image_url === "string" ? color.image_url : undefined,
        filament_ref: typeof color.filament_ref === "string" ? color.filament_ref : undefined,
      };
    }
    
    // Legacy format: { name: string, hex: string }
    const legacyColor = color as LegacyProductColor;
    const name = legacyColor.name || `Color ${index + 1}`;
    
    return {
      id: generateColorId(name) || `color-${index}`,
      name_pt: name,
      name_en: name,
      hex: legacyColor.hex || undefined,
      image_url: undefined,
      filament_ref: undefined,
    };
  });
}

/**
 * Validates colors array against the schema
 * @param colors - Colors array to validate
 * @returns Validation result with success status and error messages
 */
export function validateProductColors(colors: ProductColor[]): {
  success: boolean;
  errors: string[];
} {
  const result = ProductColorsArraySchema.safeParse(colors);
  
  if (result.success) {
    return { success: true, errors: [] };
  }
  
  const errors = result.error.issues.map((issue) => {
    const path = issue.path.join(".");
    return `${path}: ${issue.message}`;
  });
  
  return { success: false, errors };
}

/**
 * Preset colors with bilingual names
 */
export const PRESET_COLORS: ProductColor[] = [
  { id: "black", name_pt: "Preto", name_en: "Black", hex: "#000000" },
  { id: "white", name_pt: "Branco", name_en: "White", hex: "#FFFFFF" },
  { id: "red", name_pt: "Vermelho", name_en: "Red", hex: "#EF4444" },
  { id: "blue", name_pt: "Azul", name_en: "Blue", hex: "#3B82F6" },
  { id: "green", name_pt: "Verde", name_en: "Green", hex: "#22C55E" },
  { id: "yellow", name_pt: "Amarelo", name_en: "Yellow", hex: "#EAB308" },
  { id: "purple", name_pt: "Roxo", name_en: "Purple", hex: "#A855F7" },
  { id: "pink", name_pt: "Rosa", name_en: "Pink", hex: "#EC4899" },
  { id: "orange", name_pt: "Laranja", name_en: "Orange", hex: "#F97316" },
  { id: "gray", name_pt: "Cinza", name_en: "Gray", hex: "#6B7280" },
];

/**
 * Gets the localized color name based on current language
 */
export function getLocalizedColorName(color: ProductColor, language: string): string {
  return language === "pt" ? color.name_pt : color.name_en;
}
