/**
 * Reorder Point Calculator
 *
 * Formulas:
 *   Safety Stock = Average Daily Sales × Safety Stock Days
 *   Reorder Point = (Average Daily Sales × Lead Time) + Safety Stock
 *   Days of Supply = Current Inventory / Average Daily Sales
 *   Reorder Quantity = Average Daily Sales × Target Stock Days
 *   Reorder Value = Reorder Quantity × Unit Cost
 *
 * Source: CSCMP — Supply Chain Management Terms and Glossary (2023).
 * Source: Investopedia — Reorder Point Formula (2024).
 */

// ─────────────────────────────────────────────
// Interfaces
// ─────────────────────────────────────────────

export interface ReorderSummaryRow {
  label: string;
  value: number;
}

export interface ReorderPointOutput {
  reorderPoint: number;
  safetyStock: number;
  daysOfSupply: number;
  reorderQuantity: number;
  reorderValue: number;
  stockoutRisk: string;
  summary: ReorderSummaryRow[];
}

// ─────────────────────────────────────────────
// Main function
// ─────────────────────────────────────────────

/**
 * Calculates inventory reorder point, safety stock, days of supply,
 * and suggested reorder quantity.
 *
 * Reorder Point = (Average Daily Sales × Lead Time) + Safety Stock
 * Safety Stock = Average Daily Sales × Safety Stock Days
 * Days of Supply = Current Inventory / Average Daily Sales
 * Reorder Qty = Average Daily Sales × Target Stock Days
 *
 * @param inputs - Record with averageDailySales, leadTimeDays, safetyStockDays,
 *                 currentInventory, unitCost, targetStockDays
 * @returns Record with reorderPoint, safetyStock, daysOfSupply, reorderQuantity, reorderValue, stockoutRisk, summary
 */
export function calculateReorderPoint(inputs: Record<string, unknown>): Record<string, unknown> {
  // 1. Parse inputs
  const dailySales      = Math.max(0.01, Number(inputs.averageDailySales) || 0);
  const leadTime        = Math.max(1, Number(inputs.leadTimeDays) || 1);
  const safetyDays      = Math.max(0, Number(inputs.safetyStockDays) || 0);
  const currentInv      = Math.max(0, Number(inputs.currentInventory) || 0);
  const unitCost        = Math.max(0, Number(inputs.unitCost) || 0);
  const targetDays      = Math.max(1, Number(inputs.targetStockDays) || 60);

  // 2. Core calculations
  const safetyStock     = Math.round(dailySales * safetyDays);
  const reorderPoint    = Math.round(dailySales * leadTime + safetyStock);
  const daysOfSupply    = dailySales > 0
    ? Math.round((currentInv / dailySales) * 10) / 10
    : 0;
  const reorderQuantity = Math.round(dailySales * targetDays);
  const reorderValue    = Math.round(reorderQuantity * unitCost * 100) / 100;

  // 3. Stockout risk assessment
  let stockoutRisk: string;
  if (currentInv <= reorderPoint) {
    const daysUntilStockout = dailySales > 0 ? Math.max(0, Math.round((currentInv - safetyStock) / dailySales)) : 999;
    if (currentInv <= safetyStock) {
      stockoutRisk = '🔴 Critical — at or below safety stock. Order immediately.';
    } else {
      stockoutRisk = `🟡 Reorder Now — ${daysUntilStockout} days until safety stock breach. Place order.`;
    }
  } else {
    const daysUntilReorder = dailySales > 0 ? Math.round((currentInv - reorderPoint) / dailySales) : 999;
    stockoutRisk = `🟢 Healthy — reorder in ~${daysUntilReorder} days when stock hits ${reorderPoint} units.`;
  }

  // 4. Summary
  const summary: ReorderSummaryRow[] = [
    { label: 'Reorder Point (units)',       value: reorderPoint },
    { label: 'Safety Stock (units)',        value: safetyStock },
    { label: 'Days of Supply (current)',    value: daysOfSupply },
    { label: 'Recommended Reorder Qty',    value: reorderQuantity },
    { label: 'Reorder Order Value ($)',     value: reorderValue },
    { label: 'Current Inventory (units)',   value: currentInv },
  ];

  return {
    reorderPoint,
    safetyStock,
    daysOfSupply,
    reorderQuantity,
    reorderValue,
    stockoutRisk,
    summary,
  };
}

/** @formulaRegistry */
export const FORMULA_REGISTRY: Record<string, (inputs: Record<string, unknown>) => Record<string, unknown>> = {
  'reorder-point': calculateReorderPoint,
};
