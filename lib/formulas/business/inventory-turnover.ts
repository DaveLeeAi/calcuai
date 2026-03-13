/**
 * Inventory Turnover Calculator
 *
 * Formulas:
 *   Average Inventory = (Beginning Inventory + Ending Inventory) / 2
 *   Inventory Turnover Ratio = COGS / Average Inventory
 *   Days Sales of Inventory (DSI) = 365 / Inventory Turnover Ratio
 *   Inventory Turns per Month = Turnover Ratio / 12
 *
 * Source: Financial Accounting Standards Board (FASB) ASC 330 — Inventory.
 */

// ═══════════════════════════════════════════════════════
// Main function
// ═══════════════════════════════════════════════════════

/**
 * Calculates inventory turnover ratio, DSI, average inventory, and monthly turns.
 *
 * Turnover = COGS / Average Inventory
 * DSI = 365 / Turnover Ratio
 *
 * @param inputs - Record with cogs, beginningInventory, endingInventory
 * @returns Record with turnoverRatio, averageInventory, daysSalesOfInventory, inventoryTurnsPerMonth, summary
 */
export function calculateInventoryTurnover(
  inputs: Record<string, unknown>
): Record<string, unknown> {
  // 1. Parse inputs
  const cogs = Math.max(0, Number(inputs.cogs) || 0);
  const beginningInventory = Math.max(0, Number(inputs.beginningInventory) || 0);
  const endingInventory = Math.max(0, Number(inputs.endingInventory) || 0);

  // 2. Average inventory
  const averageInventory = Math.round(((beginningInventory + endingInventory) / 2) * 100) / 100;

  // 3. Turnover ratio
  const turnoverRatio = averageInventory > 0
    ? Math.round((cogs / averageInventory) * 100) / 100
    : 0;

  // 4. Days Sales of Inventory
  const daysSalesOfInventory = turnoverRatio > 0
    ? Math.round((365 / turnoverRatio) * 10) / 10
    : 0;

  // 5. Turns per month
  const inventoryTurnsPerMonth = Math.round((turnoverRatio / 12) * 100) / 100;

  // 6. Summary
  const summary: { label: string; value: number | string }[] = [
    { label: 'Cost of Goods Sold', value: cogs },
    { label: 'Beginning Inventory', value: beginningInventory },
    { label: 'Ending Inventory', value: endingInventory },
    { label: 'Average Inventory', value: averageInventory },
    { label: 'Turnover Ratio', value: `${turnoverRatio}x` },
    { label: 'Days Sales of Inventory', value: `${daysSalesOfInventory} days` },
    { label: 'Turns per Month', value: `${inventoryTurnsPerMonth}x` },
  ];

  return {
    turnoverRatio,
    averageInventory,
    daysSalesOfInventory,
    inventoryTurnsPerMonth,
    summary,
  };
}

/** @formulaRegistry */
export const FORMULA_REGISTRY: Record<
  string,
  (inputs: Record<string, unknown>) => Record<string, unknown>
> = {
  'inventory-turnover': calculateInventoryTurnover,
};
