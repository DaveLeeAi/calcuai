/**
 * Shopify Fee Calculator — 2026 Plan Rates
 *
 * Fee structure (annual billing, Shopify 2026):
 *   Basic:    $39/mo, 2.9% + $0.30 processing, 2.0% transaction fee (third-party only)
 *   Shopify:  $105/mo, 2.6% + $0.30 processing, 1.0% transaction fee
 *   Advanced: $399/mo, 2.4% + $0.30 processing, 0.5% transaction fee
 *   Plus:     $2,300/mo, 2.15% + $0.30 processing, 0.15% transaction fee
 *
 *   Currency conversion: 1.5% on international orders (all plans)
 *
 * Source: Shopify — Pricing Plans and Transaction Fees (2026).
 * Source: Shopify — Payments Processing Rates by Plan (2026).
 */

// ─────────────────────────────────────────────
// Plan definitions
// ─────────────────────────────────────────────

interface ShopifyPlanConfig {
  label: string;
  monthlyFee: number;
  processingRate: number;  // % of sale
  perTransactionCents: number; // fixed cents per order
  transactionFeeRate: number; // % only if third-party processor
}

const PLANS: Record<string, ShopifyPlanConfig> = {
  'basic': {
    label: 'Basic',
    monthlyFee: 39,
    processingRate: 0.029,
    perTransactionCents: 30,
    transactionFeeRate: 0.02,
  },
  'shopify': {
    label: 'Shopify',
    monthlyFee: 105,
    processingRate: 0.026,
    perTransactionCents: 30,
    transactionFeeRate: 0.01,
  },
  'advanced': {
    label: 'Advanced',
    monthlyFee: 399,
    processingRate: 0.024,
    perTransactionCents: 30,
    transactionFeeRate: 0.005,
  },
  'plus': {
    label: 'Plus',
    monthlyFee: 2300,
    processingRate: 0.0215,
    perTransactionCents: 30,
    transactionFeeRate: 0.0015,
  },
};

const CURRENCY_CONVERSION_RATE = 0.015; // 1.5% on international orders

// ─────────────────────────────────────────────
// Interfaces
// ─────────────────────────────────────────────

export interface PlanComparisonRow {
  plan: string;
  subscription: number;
  processingFees: number;
  transactionFees: number;
  totalCost: number;
  effectiveRate: number;
}

export interface ShopifyFeeOutput {
  totalMonthlyCost: number;
  effectiveFeeRate: number;
  planComparisonTable: PlanComparisonRow[];
  summary: { label: string; value: number }[];
}

// ─────────────────────────────────────────────
// Helper
// ─────────────────────────────────────────────

function calcPlanCost(
  plan: ShopifyPlanConfig,
  monthlyRevenue: number,
  avgOrderValue: number,
  useThirdParty: boolean,
  intlRevenuePct: number,
): { processingFees: number; transactionFees: number; currencyFees: number; total: number } {
  const orders = avgOrderValue > 0 ? monthlyRevenue / avgOrderValue : 0;

  // Payment processing (only if Shopify Payments — already bundled for third-party they use own processor rates)
  const processingFees = useThirdParty
    ? 0 // third-party processor charges their own rate externally
    : Math.round((monthlyRevenue * plan.processingRate + orders * (plan.perTransactionCents / 100)) * 100) / 100;

  // Transaction fee (Shopify's additional cut on third-party only)
  const transactionFees = useThirdParty
    ? Math.round(monthlyRevenue * plan.transactionFeeRate * 100) / 100
    : 0;

  // Currency conversion on international revenue
  const intlRevenue = monthlyRevenue * (intlRevenuePct / 100);
  const currencyFees = Math.round(intlRevenue * CURRENCY_CONVERSION_RATE * 100) / 100;

  const total = plan.monthlyFee + processingFees + transactionFees + currencyFees;

  return {
    processingFees: Math.round(processingFees * 100) / 100,
    transactionFees: Math.round(transactionFees * 100) / 100,
    currencyFees: Math.round(currencyFees * 100) / 100,
    total: Math.round(total * 100) / 100,
  };
}

// ─────────────────────────────────────────────
// Main function
// ─────────────────────────────────────────────

/**
 * Calculates monthly Shopify platform costs and compares all plans
 * at the entered revenue level.
 *
 * Total Cost = Subscription + Processing Fees + Transaction Fees + Currency Conversion
 * Effective Rate = Total Cost / Monthly Revenue × 100
 *
 * @param inputs - Record with shopifyPlan, monthlyRevenue, averageOrderValue, paymentMethod, internationalRevenuePct
 * @returns Record with totalMonthlyCost, effectiveFeeRate, planComparisonTable, summary
 */
export function calculateShopifyFee(inputs: Record<string, unknown>): Record<string, unknown> {
  // 1. Parse inputs
  const planKey = (inputs.shopifyPlan as string) || 'basic';
  const monthlyRevenue = Math.max(0, Number(inputs.monthlyRevenue) || 0);
  const avgOrderValue = Math.max(0.01, Number(inputs.averageOrderValue) || 1);
  const useThirdParty = (inputs.paymentMethod as string) === 'third-party';
  const intlPct = Math.min(100, Math.max(0, Number(inputs.internationalRevenuePct) || 0));

  // 2. Calculate for selected plan
  const selectedPlan = PLANS[planKey] ?? PLANS['basic'];
  const selected = calcPlanCost(selectedPlan, monthlyRevenue, avgOrderValue, useThirdParty, intlPct);
  const totalMonthlyCost = selected.total;
  const effectiveFeeRate = monthlyRevenue > 0
    ? Math.round((totalMonthlyCost / monthlyRevenue) * 10000) / 100
    : 0;

  // 3. Comparison table for all plans
  const planComparisonTable: PlanComparisonRow[] = Object.entries(PLANS).map(([key, plan]) => {
    const calc = calcPlanCost(plan, monthlyRevenue, avgOrderValue, useThirdParty, intlPct);
    return {
      plan: plan.label,
      subscription: plan.monthlyFee,
      processingFees: calc.processingFees,
      transactionFees: calc.transactionFees,
      totalCost: calc.total,
      effectiveRate: monthlyRevenue > 0 ? Math.round((calc.total / monthlyRevenue) * 10000) / 100 : 0,
    };
  });

  // 4. Summary
  const summary: { label: string; value: number }[] = [
    { label: 'Monthly Revenue', value: monthlyRevenue },
    { label: 'Subscription Fee', value: selectedPlan.monthlyFee },
    { label: 'Processing Fees', value: selected.processingFees },
    { label: 'Transaction Fees', value: selected.transactionFees },
    { label: 'Currency Conversion', value: selected.currencyFees },
    { label: 'Total Monthly Cost', value: totalMonthlyCost },
    { label: 'Effective Fee Rate', value: effectiveFeeRate },
  ];

  return { totalMonthlyCost, effectiveFeeRate, planComparisonTable, summary };
}

/** @formulaRegistry */
export const FORMULA_REGISTRY: Record<string, (inputs: Record<string, unknown>) => Record<string, unknown>> = {
  'shopify-fee': calculateShopifyFee,
};
