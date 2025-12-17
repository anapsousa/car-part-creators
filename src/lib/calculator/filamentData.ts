// Filament materials, brands, and presets

export const FILAMENT_MATERIALS = [
  'PLA',
  'PLA+',
  'PETG',
  'ABS',
  'ASA',
  'TPU',
  'Nylon',
  'PC',
  'HIPS',
  'PVA',
  'Wood PLA',
  'Carbon Fiber',
  'Silk PLA',
  'Marble PLA',
  'Glow-in-dark',
  'Other'
] as const;

export type FilamentMaterial = typeof FILAMENT_MATERIALS[number];

export const FILAMENT_BRANDS = [
  'Bambu Lab',
  'Prusament',
  'eSUN',
  'Polymaker',
  'Hatchbox',
  'Overture',
  'Sunlu',
  'Eryone',
  'Elegoo',
  'Creality',
  'Amazon Basics',
  '3D Fuel',
  'ColorFabb',
  'Fillamentum',
  'Other'
] as const;

export type FilamentBrand = typeof FILAMENT_BRANDS[number];

export const FILAMENT_COLORS = [
  'Black',
  'White',
  'Gray',
  'Silver',
  'Red',
  'Blue',
  'Green',
  'Yellow',
  'Orange',
  'Purple',
  'Pink',
  'Brown',
  'Gold',
  'Transparent',
  'Natural',
  'Multi-color',
  'Other'
] as const;

export type FilamentColor = typeof FILAMENT_COLORS[number];

// Material densities in g/cm³
export const MATERIAL_DENSITIES: Record<FilamentMaterial, number> = {
  'PLA': 1.24,
  'PLA+': 1.24,
  'PETG': 1.27,
  'ABS': 1.04,
  'ASA': 1.07,
  'TPU': 1.21,
  'Nylon': 1.14,
  'PC': 1.20,
  'HIPS': 1.04,
  'PVA': 1.23,
  'Wood PLA': 1.15,
  'Carbon Fiber': 1.30,
  'Silk PLA': 1.24,
  'Marble PLA': 1.24,
  'Glow-in-dark': 1.25,
  'Other': 1.24,
};

export interface FilamentPreset {
  brand: FilamentBrand;
  material: FilamentMaterial;
  name: string;
  spoolWeightGrams: number;
  spoolCost: number;
  density: number;
}

// Example presets for common filaments
export const FILAMENT_PRESETS: FilamentPreset[] = [
  // Bambu Lab
  { brand: 'Bambu Lab', material: 'PLA', name: 'PLA Basic', spoolWeightGrams: 1000, spoolCost: 24.99, density: 1.24 },
  { brand: 'Bambu Lab', material: 'PLA+', name: 'PLA Matte', spoolWeightGrams: 1000, spoolCost: 29.99, density: 1.24 },
  { brand: 'Bambu Lab', material: 'PETG', name: 'PETG Basic', spoolWeightGrams: 1000, spoolCost: 29.99, density: 1.27 },
  { brand: 'Bambu Lab', material: 'ABS', name: 'ABS', spoolWeightGrams: 1000, spoolCost: 29.99, density: 1.04 },
  { brand: 'Bambu Lab', material: 'TPU', name: 'TPU 95A', spoolWeightGrams: 500, spoolCost: 34.99, density: 1.21 },
  
  // Prusament
  { brand: 'Prusament', material: 'PLA', name: 'PLA', spoolWeightGrams: 1000, spoolCost: 32.99, density: 1.24 },
  { brand: 'Prusament', material: 'PETG', name: 'PETG', spoolWeightGrams: 1000, spoolCost: 32.99, density: 1.27 },
  { brand: 'Prusament', material: 'ASA', name: 'ASA', spoolWeightGrams: 850, spoolCost: 36.99, density: 1.07 },
  
  // eSUN
  { brand: 'eSUN', material: 'PLA+', name: 'PLA+', spoolWeightGrams: 1000, spoolCost: 19.99, density: 1.24 },
  { brand: 'eSUN', material: 'PETG', name: 'PETG', spoolWeightGrams: 1000, spoolCost: 21.99, density: 1.27 },
  { brand: 'eSUN', material: 'ABS', name: 'ABS+', spoolWeightGrams: 1000, spoolCost: 21.99, density: 1.04 },
  { brand: 'eSUN', material: 'TPU', name: 'TPU 95A', spoolWeightGrams: 1000, spoolCost: 29.99, density: 1.21 },
  
  // Polymaker
  { brand: 'Polymaker', material: 'PLA', name: 'PolyTerra PLA', spoolWeightGrams: 1000, spoolCost: 19.99, density: 1.24 },
  { brand: 'Polymaker', material: 'PLA', name: 'PolyLite PLA', spoolWeightGrams: 1000, spoolCost: 23.99, density: 1.24 },
  { brand: 'Polymaker', material: 'PETG', name: 'PolyLite PETG', spoolWeightGrams: 1000, spoolCost: 24.99, density: 1.27 },
  
  // Hatchbox
  { brand: 'Hatchbox', material: 'PLA', name: 'PLA', spoolWeightGrams: 1000, spoolCost: 22.99, density: 1.24 },
  { brand: 'Hatchbox', material: 'PETG', name: 'PETG', spoolWeightGrams: 1000, spoolCost: 24.99, density: 1.27 },
  { brand: 'Hatchbox', material: 'ABS', name: 'ABS', spoolWeightGrams: 1000, spoolCost: 22.99, density: 1.04 },
  
  // Overture
  { brand: 'Overture', material: 'PLA', name: 'PLA', spoolWeightGrams: 1000, spoolCost: 17.99, density: 1.24 },
  { brand: 'Overture', material: 'PETG', name: 'PETG', spoolWeightGrams: 1000, spoolCost: 18.99, density: 1.27 },
  { brand: 'Overture', material: 'TPU', name: 'TPU', spoolWeightGrams: 1000, spoolCost: 25.99, density: 1.21 },
  
  // Sunlu
  { brand: 'Sunlu', material: 'PLA', name: 'PLA', spoolWeightGrams: 1000, spoolCost: 15.99, density: 1.24 },
  { brand: 'Sunlu', material: 'PLA+', name: 'PLA+', spoolWeightGrams: 1000, spoolCost: 17.99, density: 1.24 },
  { brand: 'Sunlu', material: 'Silk PLA', name: 'Silk PLA', spoolWeightGrams: 1000, spoolCost: 19.99, density: 1.24 },
  
  // Generic/Other
  { brand: 'Other', material: 'PLA', name: 'Generic PLA', spoolWeightGrams: 1000, spoolCost: 18.00, density: 1.24 },
  { brand: 'Other', material: 'PETG', name: 'Generic PETG', spoolWeightGrams: 1000, spoolCost: 20.00, density: 1.27 },
  { brand: 'Other', material: 'ABS', name: 'Generic ABS', spoolWeightGrams: 1000, spoolCost: 18.00, density: 1.04 },
];

export function getFilamentPresetsForBrand(brand: FilamentBrand): FilamentPreset[] {
  return FILAMENT_PRESETS.filter(f => f.brand === brand);
}

export function getFilamentPreset(brand: FilamentBrand, material: FilamentMaterial): FilamentPreset | undefined {
  return FILAMENT_PRESETS.find(f => f.brand === brand && f.material === material);
}

export function getMaterialDensity(material: FilamentMaterial): number {
  return MATERIAL_DENSITIES[material] || 1.24;
}

export function calculateCostPerGram(spoolCost: number, spoolWeightGrams: number): number {
  if (spoolWeightGrams <= 0) return 0;
  return spoolCost / spoolWeightGrams;
}

export function calculateFilamentCost(gramsUsed: number, costPerGram: number): number {
  return gramsUsed * costPerGram;
}
