// Printer brands and models with default specifications

export const PRINTER_BRANDS = [
  'Bambu Lab',
  'Prusa',
  'Creality',
  'Anycubic',
  'Elegoo',
  'Voron',
  'Artillery',
  'QIDI',
  'Sovol',
  'Flashforge',
  'Other'
] as const;

export type PrinterBrand = typeof PRINTER_BRANDS[number];

export interface PrinterSpec {
  brand: PrinterBrand;
  model: string;
  powerWatts: number;
  depreciationMonths: number;
  depreciationHours: number;
  maintenanceCost: number;
  purchaseCost: number;
}

export const PRINTER_MODELS: Record<PrinterBrand, PrinterSpec[]> = {
  'Bambu Lab': [
    { brand: 'Bambu Lab', model: 'A1 mini', powerWatts: 150, depreciationMonths: 36, depreciationHours: 5000, maintenanceCost: 50, purchaseCost: 299 },
    { brand: 'Bambu Lab', model: 'A1', powerWatts: 200, depreciationMonths: 36, depreciationHours: 5000, maintenanceCost: 60, purchaseCost: 449 },
    { brand: 'Bambu Lab', model: 'P1S', powerWatts: 350, depreciationMonths: 48, depreciationHours: 8000, maintenanceCost: 80, purchaseCost: 699 },
    { brand: 'Bambu Lab', model: 'P1P', powerWatts: 350, depreciationMonths: 48, depreciationHours: 8000, maintenanceCost: 80, purchaseCost: 599 },
    { brand: 'Bambu Lab', model: 'X1 Carbon', powerWatts: 400, depreciationMonths: 60, depreciationHours: 10000, maintenanceCost: 100, purchaseCost: 1199 },
    { brand: 'Bambu Lab', model: 'X1E', powerWatts: 450, depreciationMonths: 60, depreciationHours: 12000, maintenanceCost: 120, purchaseCost: 1599 },
  ],
  'Prusa': [
    { brand: 'Prusa', model: 'MK4', powerWatts: 250, depreciationMonths: 48, depreciationHours: 8000, maintenanceCost: 70, purchaseCost: 799 },
    { brand: 'Prusa', model: 'MK3S+', powerWatts: 200, depreciationMonths: 48, depreciationHours: 8000, maintenanceCost: 60, purchaseCost: 649 },
    { brand: 'Prusa', model: 'MINI+', powerWatts: 120, depreciationMonths: 36, depreciationHours: 5000, maintenanceCost: 40, purchaseCost: 429 },
    { brand: 'Prusa', model: 'XL', powerWatts: 400, depreciationMonths: 60, depreciationHours: 10000, maintenanceCost: 100, purchaseCost: 1999 },
    { brand: 'Prusa', model: 'Core One', powerWatts: 350, depreciationMonths: 48, depreciationHours: 8000, maintenanceCost: 80, purchaseCost: 1099 },
  ],
  'Creality': [
    { brand: 'Creality', model: 'Ender 3 V3', powerWatts: 200, depreciationMonths: 24, depreciationHours: 3000, maintenanceCost: 40, purchaseCost: 219 },
    { brand: 'Creality', model: 'Ender 3 V3 SE', powerWatts: 180, depreciationMonths: 24, depreciationHours: 3000, maintenanceCost: 35, purchaseCost: 199 },
    { brand: 'Creality', model: 'Ender 3 S1 Pro', powerWatts: 220, depreciationMonths: 24, depreciationHours: 3000, maintenanceCost: 45, purchaseCost: 399 },
    { brand: 'Creality', model: 'K1', powerWatts: 350, depreciationMonths: 36, depreciationHours: 5000, maintenanceCost: 60, purchaseCost: 399 },
    { brand: 'Creality', model: 'K1 Max', powerWatts: 400, depreciationMonths: 36, depreciationHours: 5000, maintenanceCost: 70, purchaseCost: 699 },
    { brand: 'Creality', model: 'CR-10 SE', powerWatts: 280, depreciationMonths: 36, depreciationHours: 4000, maintenanceCost: 50, purchaseCost: 349 },
  ],
  'Anycubic': [
    { brand: 'Anycubic', model: 'Kobra 3', powerWatts: 350, depreciationMonths: 36, depreciationHours: 5000, maintenanceCost: 60, purchaseCost: 399 },
    { brand: 'Anycubic', model: 'Kobra 2 Pro', powerWatts: 300, depreciationMonths: 36, depreciationHours: 4000, maintenanceCost: 50, purchaseCost: 299 },
    { brand: 'Anycubic', model: 'Kobra 2 Plus', powerWatts: 320, depreciationMonths: 36, depreciationHours: 4000, maintenanceCost: 55, purchaseCost: 399 },
    { brand: 'Anycubic', model: 'Vyper', powerWatts: 200, depreciationMonths: 24, depreciationHours: 3000, maintenanceCost: 40, purchaseCost: 249 },
  ],
  'Elegoo': [
    { brand: 'Elegoo', model: 'Neptune 4 Pro', powerWatts: 300, depreciationMonths: 36, depreciationHours: 4000, maintenanceCost: 50, purchaseCost: 299 },
    { brand: 'Elegoo', model: 'Neptune 4', powerWatts: 250, depreciationMonths: 36, depreciationHours: 4000, maintenanceCost: 45, purchaseCost: 239 },
    { brand: 'Elegoo', model: 'Neptune 4 Plus', powerWatts: 350, depreciationMonths: 36, depreciationHours: 5000, maintenanceCost: 55, purchaseCost: 349 },
    { brand: 'Elegoo', model: 'Neptune 4 Max', powerWatts: 400, depreciationMonths: 36, depreciationHours: 5000, maintenanceCost: 60, purchaseCost: 449 },
  ],
  'Voron': [
    { brand: 'Voron', model: '0.2', powerWatts: 150, depreciationMonths: 48, depreciationHours: 8000, maintenanceCost: 60, purchaseCost: 500 },
    { brand: 'Voron', model: 'Trident', powerWatts: 400, depreciationMonths: 60, depreciationHours: 10000, maintenanceCost: 80, purchaseCost: 1200 },
    { brand: 'Voron', model: '2.4', powerWatts: 450, depreciationMonths: 60, depreciationHours: 10000, maintenanceCost: 100, purchaseCost: 1500 },
  ],
  'Artillery': [
    { brand: 'Artillery', model: 'Sidewinder X4 Pro', powerWatts: 350, depreciationMonths: 36, depreciationHours: 4000, maintenanceCost: 55, purchaseCost: 379 },
    { brand: 'Artillery', model: 'Sidewinder X3 Plus', powerWatts: 380, depreciationMonths: 36, depreciationHours: 4000, maintenanceCost: 60, purchaseCost: 449 },
  ],
  'QIDI': [
    { brand: 'QIDI', model: 'X-Plus 3', powerWatts: 350, depreciationMonths: 36, depreciationHours: 5000, maintenanceCost: 60, purchaseCost: 599 },
    { brand: 'QIDI', model: 'X-Max 3', powerWatts: 400, depreciationMonths: 48, depreciationHours: 6000, maintenanceCost: 70, purchaseCost: 799 },
    { brand: 'QIDI', model: 'Q1 Pro', powerWatts: 300, depreciationMonths: 36, depreciationHours: 5000, maintenanceCost: 55, purchaseCost: 449 },
  ],
  'Sovol': [
    { brand: 'Sovol', model: 'SV07', powerWatts: 300, depreciationMonths: 36, depreciationHours: 4000, maintenanceCost: 50, purchaseCost: 299 },
    { brand: 'Sovol', model: 'SV07 Plus', powerWatts: 350, depreciationMonths: 36, depreciationHours: 4000, maintenanceCost: 55, purchaseCost: 399 },
  ],
  'Flashforge': [
    { brand: 'Flashforge', model: 'Adventurer 5M Pro', powerWatts: 300, depreciationMonths: 36, depreciationHours: 5000, maintenanceCost: 60, purchaseCost: 499 },
    { brand: 'Flashforge', model: 'Adventurer 5M', powerWatts: 250, depreciationMonths: 36, depreciationHours: 5000, maintenanceCost: 50, purchaseCost: 399 },
  ],
  'Other': [
    { brand: 'Other', model: 'Custom Printer', powerWatts: 200, depreciationMonths: 36, depreciationHours: 5000, maintenanceCost: 50, purchaseCost: 300 },
  ],
};

export function getModelsForBrand(brand: PrinterBrand): PrinterSpec[] {
  return PRINTER_MODELS[brand] || [];
}

export function getPrinterSpec(brand: PrinterBrand, model: string): PrinterSpec | undefined {
  const models = PRINTER_MODELS[brand];
  return models?.find(m => m.model === model);
}

export function hoursToMonths(hours: number, hoursPerDay: number = 8): number {
  const daysPerMonth = 30;
  return Math.round(hours / (hoursPerDay * daysPerMonth));
}

export function monthsToHours(months: number, hoursPerDay: number = 8): number {
  const daysPerMonth = 30;
  return months * hoursPerDay * daysPerMonth;
}

export function calculateDepreciationPerHour(purchaseCost: number, depreciationHours: number): number {
  if (depreciationHours <= 0) return 0;
  return purchaseCost / depreciationHours;
}

export function calculateMaintenancePerHour(maintenanceCostPerYear: number, hoursPerYear: number = 2000): number {
  if (hoursPerYear <= 0) return 0;
  return maintenanceCostPerYear / hoursPerYear;
}
