// Cost calculation utilities for the Price Calculator

export interface PrintCostInputs {
  // Filament costs
  filamentCosts: { gramsUsed: number; costPerGram: number }[];
  
  // Printer/Electricity
  printerPowerWatts: number;
  printTimeMinutes: number;
  electricityPricePerKwh: number;
  
  // Depreciation
  printerPurchaseCost: number;
  printerDepreciationHours: number;
  
  // Maintenance
  maintenanceCostPerYear: number;
  printingHoursPerYear: number;
  
  // Labor
  laborTimeMinutes: number;
  hourlyRate: number;
  includeLaborInCost: boolean;
  
  // Additional costs
  shippingCost: number;
  consumablesCost: number;
  fixedExpensesCost: number; // Prorated per print
  modelCost: number;
  
  // Adjustments
  wastagePercent: number;
  failureRatePercent: number;
  quantity: number;
}

export interface PrintCostBreakdown {
  filamentCost: number;
  electricityCost: number;
  depreciationCost: number;
  maintenanceCost: number;
  laborCost: number;
  shippingCost: number;
  consumablesCost: number;
  fixedExpensesCost: number;
  modelCost: number;
  wastageCost: number;
  failureCost: number;
  subtotal: number;
  totalCost: number;
  costPerUnit: number;
}

export function calculatePrintCost(inputs: PrintCostInputs): PrintCostBreakdown {
  const {
    filamentCosts,
    printerPowerWatts,
    printTimeMinutes,
    electricityPricePerKwh,
    printerPurchaseCost,
    printerDepreciationHours,
    maintenanceCostPerYear,
    printingHoursPerYear,
    laborTimeMinutes,
    hourlyRate,
    includeLaborInCost,
    shippingCost,
    consumablesCost,
    fixedExpensesCost,
    modelCost,
    wastagePercent,
    failureRatePercent,
    quantity,
  } = inputs;

  // 1. Filament cost
  const filamentCost = filamentCosts.reduce(
    (total, f) => total + (f.gramsUsed * f.costPerGram),
    0
  );

  // 2. Electricity cost
  const printTimeHours = printTimeMinutes / 60;
  const powerKw = printerPowerWatts / 1000;
  const electricityCost = powerKw * printTimeHours * electricityPricePerKwh;

  // 3. Depreciation cost
  const depreciationPerHour = printerDepreciationHours > 0
    ? printerPurchaseCost / printerDepreciationHours
    : 0;
  const depreciationCost = depreciationPerHour * printTimeHours;

  // 4. Maintenance cost
  const maintenancePerHour = printingHoursPerYear > 0
    ? maintenanceCostPerYear / printingHoursPerYear
    : 0;
  const maintenanceCost = maintenancePerHour * printTimeHours;

  // 5. Labor cost
  const laborCost = includeLaborInCost
    ? (laborTimeMinutes / 60) * hourlyRate
    : 0;

  // Calculate subtotal before wastage and failure
  const baseCost = filamentCost + electricityCost + depreciationCost + 
    maintenanceCost + laborCost + consumablesCost + 
    fixedExpensesCost + modelCost;

  // 6. Wastage cost (percentage of filament cost)
  const wastageCost = filamentCost * (wastagePercent / 100);

  // 7. Failure rate cost (percentage of base cost)
  const failureCost = baseCost * (failureRatePercent / 100);

  // Calculate subtotal (before shipping)
  const subtotal = baseCost + wastageCost + failureCost;

  // Total cost includes shipping
  const totalCost = (subtotal + shippingCost) * quantity;

  // Cost per unit
  const costPerUnit = subtotal + shippingCost;

  return {
    filamentCost,
    electricityCost,
    depreciationCost,
    maintenanceCost,
    laborCost,
    shippingCost,
    consumablesCost,
    fixedExpensesCost,
    modelCost,
    wastageCost,
    failureCost,
    subtotal,
    totalCost,
    costPerUnit,
  };
}

export interface PricingInputs {
  totalCost: number;
  markupPercent?: number;
  targetProfitMargin?: number;
  targetSellPrice?: number;
}

export interface PricingResult {
  sellPrice: number;
  sellPriceWithTax: number;
  taxAmount: number;
  taxPercent: number;
  profit: number;
  profitMarginPercent: number;
  markupPercent: number;
}

// Portuguese IVA tax rate for 3D printed items
export const IVA_TAX_PERCENT = 23;

export function calculatePricingFromMarkup(totalCost: number, markupPercent: number): PricingResult {
  const sellPrice = totalCost * (1 + markupPercent / 100);
  const taxAmount = sellPrice * (IVA_TAX_PERCENT / 100);
  const sellPriceWithTax = sellPrice + taxAmount;
  const profit = sellPrice - totalCost;
  const profitMarginPercent = totalCost > 0 ? (profit / sellPrice) * 100 : 0;

  return {
    sellPrice,
    sellPriceWithTax,
    taxAmount,
    taxPercent: IVA_TAX_PERCENT,
    profit,
    profitMarginPercent,
    markupPercent,
  };
}

export function calculatePricingFromMargin(totalCost: number, targetMarginPercent: number): PricingResult {
  // Margin = (Sell - Cost) / Sell
  // Sell = Cost / (1 - Margin)
  const marginDecimal = targetMarginPercent / 100;
  const sellPrice = marginDecimal < 1 ? totalCost / (1 - marginDecimal) : totalCost;
  const taxAmount = sellPrice * (IVA_TAX_PERCENT / 100);
  const sellPriceWithTax = sellPrice + taxAmount;
  const profit = sellPrice - totalCost;
  const markupPercent = totalCost > 0 ? (profit / totalCost) * 100 : 0;

  return {
    sellPrice,
    sellPriceWithTax,
    taxAmount,
    taxPercent: IVA_TAX_PERCENT,
    profit,
    profitMarginPercent: targetMarginPercent,
    markupPercent,
  };
}

export function calculatePricingFromSellPrice(totalCost: number, sellPrice: number): PricingResult {
  const taxAmount = sellPrice * (IVA_TAX_PERCENT / 100);
  const sellPriceWithTax = sellPrice + taxAmount;
  const profit = sellPrice - totalCost;
  const profitMarginPercent = sellPrice > 0 ? (profit / sellPrice) * 100 : 0;
  const markupPercent = totalCost > 0 ? (profit / totalCost) * 100 : 0;

  return {
    sellPrice,
    sellPriceWithTax,
    taxAmount,
    taxPercent: IVA_TAX_PERCENT,
    profit,
    profitMarginPercent,
    markupPercent,
  };
}

// Format currency for display
export function formatCurrency(amount: number, currency: string = 'EUR'): string {
  return new Intl.NumberFormat('pt-PT', {
    style: 'currency',
    currency,
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(amount);
}

// Format time in minutes to hours:minutes
export function formatTime(minutes: number): string {
  const hours = Math.floor(minutes / 60);
  const mins = minutes % 60;
  if (hours === 0) return `${mins}m`;
  if (mins === 0) return `${hours}h`;
  return `${hours}h ${mins}m`;
}

// Parse time string (e.g., "2h 30m" or "150") to minutes
export function parseTimeToMinutes(timeString: string): number {
  // If it's just a number, return it as minutes
  const numericValue = parseFloat(timeString);
  if (!isNaN(numericValue) && timeString.match(/^\d+\.?\d*$/)) {
    return Math.round(numericValue);
  }

  // Parse "Xh Ym" format
  let totalMinutes = 0;
  const hoursMatch = timeString.match(/(\d+\.?\d*)\s*h/i);
  const minutesMatch = timeString.match(/(\d+\.?\d*)\s*m/i);

  if (hoursMatch) {
    totalMinutes += parseFloat(hoursMatch[1]) * 60;
  }
  if (minutesMatch) {
    totalMinutes += parseFloat(minutesMatch[1]);
  }

  return Math.round(totalMinutes);
}
