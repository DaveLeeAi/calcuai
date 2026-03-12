/**
 * Tip Calculator with Bill Splitting
 *
 * Formulas:
 *   Tip = Bill Amount × (Tip Percentage / 100)
 *   Total = Bill Amount + Tip
 *   Per Person = Total / Number of People
 *
 * When roundUp is enabled:
 *   Total = Math.ceil(Bill Amount + Tip)
 *   Tip = Total (rounded) − Bill Amount
 *
 * Source: Emily Post Institute etiquette guidelines (2024).
 * Standard U.S. tipping range: 15–20% of pre-tax bill.
 */

// ═══════════════════════════════════════════════════════
// Interfaces
// ═══════════════════════════════════════════════════════

export interface TipCalcInput {
  billAmount: number;
  tipPercentage: number;
  numberOfPeople: number;
  roundUp: boolean;
}

export interface TipBreakdownRow {
  percentage: number;
  tipAmount: number;
  total: number;
  perPerson: number;
}

export interface TipCalcOutput {
  tipAmount: number;
  totalAmount: number;
  perPersonAmount: number;
  tipBreakdown: TipBreakdownRow[];
  summary: { label: string; value: number }[];
}

// ═══════════════════════════════════════════════════════
// Helper: calculate tip for a single percentage
// ═══════════════════════════════════════════════════════

/**
 * Computes tip, total, and per-person amounts for a given bill and tip percentage.
 * Rounds monetary values to 2 decimal places.
 */
function computeTipRow(
  billAmount: number,
  tipPct: number,
  numberOfPeople: number,
  roundUp: boolean
): { tipAmount: number; total: number; perPerson: number } {
  let tipAmount = billAmount * (tipPct / 100);
  tipAmount = Math.round(tipAmount * 100) / 100;

  let total = billAmount + tipAmount;

  if (roundUp) {
    total = Math.ceil(total);
    tipAmount = Math.round((total - billAmount) * 100) / 100;
  }

  total = Math.round(total * 100) / 100;
  const perPerson = Math.round((total / numberOfPeople) * 100) / 100;

  return { tipAmount, total, perPerson };
}

// ═══════════════════════════════════════════════════════
// Main function: Tip Calculator
// ═══════════════════════════════════════════════════════

/**
 * Calculates tip amount, total bill, per-person share, and a comparison
 * table across standard tip percentages (15%, 18%, 20%, 25%).
 *
 * Tip = Bill Amount × (Tip Percentage / 100)
 * Total = Bill Amount + Tip
 * Per Person = Total / Number of People
 *
 * @param inputs - Record with billAmount, tipPercentage, numberOfPeople, roundUp
 * @returns Record with tipAmount, totalAmount, perPersonAmount, tipBreakdown, summary
 */
export function calculateTip(inputs: Record<string, unknown>): Record<string, unknown> {
  // 1. Parse inputs with defaults
  const billAmount = Math.max(0, Number(inputs.billAmount) || 0);
  const tipPercentage = Math.max(0, Math.min(100, Number(inputs.tipPercentage) || 0));
  const numberOfPeople = Math.max(1, Math.round(Number(inputs.numberOfPeople) || 1));
  const roundUp = Boolean(inputs.roundUp);

  // 2. Calculate primary tip, total, perPerson
  const primary = computeTipRow(billAmount, tipPercentage, numberOfPeople, roundUp);

  // 3. Build tip breakdown comparison table
  const standardPercentages = [15, 18, 20, 25];
  const breakdownPercentages = new Set(standardPercentages);
  breakdownPercentages.add(tipPercentage);

  // Sort percentages ascending
  const sortedPercentages = Array.from(breakdownPercentages).sort((a, b) => a - b);

  const tipBreakdown: TipBreakdownRow[] = sortedPercentages.map((pct) => {
    const row = computeTipRow(billAmount, pct, numberOfPeople, roundUp);
    return {
      percentage: pct,
      tipAmount: row.tipAmount,
      total: row.total,
      perPerson: row.perPerson,
    };
  });

  // 4. Calculate effective tip percentage (accounts for rounding)
  const effectiveTipPct =
    billAmount > 0
      ? Math.round((primary.tipAmount / billAmount) * 10000) / 100
      : 0;

  // 5. Build summary value group
  const summary: { label: string; value: number }[] = [
    { label: 'Bill Amount', value: billAmount },
    { label: 'Tip Amount', value: primary.tipAmount },
    { label: 'Total', value: primary.total },
    { label: 'Per Person', value: primary.perPerson },
    { label: 'Effective Tip %', value: effectiveTipPct },
  ];

  // 6. Return all outputs
  return {
    tipAmount: primary.tipAmount,
    totalAmount: primary.total,
    perPersonAmount: primary.perPerson,
    tipBreakdown,
    summary,
  };
}

/** @formulaRegistry */
export const FORMULA_REGISTRY: Record<string, (inputs: Record<string, unknown>) => Record<string, unknown>> = {
  'tip-calc': calculateTip,
};
