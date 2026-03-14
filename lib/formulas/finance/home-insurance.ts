/**
 * Home Insurance Calculator — Estimate Annual Homeowners Insurance Premium
 *
 * Formulas:
 *   Base Premium = (Home Value / 1,000) × State Rate per $1,000
 *   Deductible Adjustment = multiplier by deductible tier
 *   Coverage Adjustment = multiplier by coverage type (HO-1, HO-3, HO-5)
 *   Claims Adjustment = multiplier by claims history (0, 1, 2+)
 *   Credit Adjustment = multiplier by credit score tier
 *   Annual Premium = Base Premium × Deductible Adj × Coverage Adj × Claims Adj × Credit Adj
 *   Monthly Premium = Annual Premium / 12
 *   Daily Premium = Annual Premium / 365
 *   Personal Property Coverage = Home Value × 0.50 (standard 50% of dwelling)
 *   Liability Coverage = $100,000 (standard)
 *   Medical Payments = $5,000 (standard)
 *
 * Source: NAIC — Homeowners Insurance Report; Insurance Information Institute (III);
 *         Bankrate — Average Homeowners Insurance Rates by State (2025).
 */

// ═══════════════════════════════════════════════════════
// Constants — Average Rates per $1,000 of Coverage (2025)
// ═══════════════════════════════════════════════════════

const STATE_RATES: Record<string, number> = {
  TX: 5.50,
  FL: 8.00,
  OK: 6.00,
  KS: 5.80,
  CO: 4.50,
  LA: 7.50,
  MN: 3.50,
  CT: 3.80,
  NE: 5.00,
  other: 3.50, // national average
};

const DEDUCTIBLE_MULTIPLIERS: Record<string, number> = {
  '500': 1.15,
  '1000': 1.00,
  '2000': 0.87,
  '2500': 0.82,
  '5000': 0.72,
};

const COVERAGE_MULTIPLIERS: Record<string, number> = {
  basic: 0.80,    // HO-1
  standard: 1.00, // HO-3
  premium: 1.30,  // HO-5
};

const CLAIMS_MULTIPLIERS: Record<string, number> = {
  '0': 1.00,
  '1': 1.20,
  '2+': 1.45,
};

const CREDIT_MULTIPLIERS: Record<string, number> = {
  excellent: 0.85,
  good: 1.00,
  fair: 1.15,
  poor: 1.35,
};

const STANDARD_LIABILITY = 100000;
const STANDARD_MEDICAL_PAYMENTS = 5000;
const PERSONAL_PROPERTY_RATIO = 0.50;

// ═══════════════════════════════════════════════════════
// Helpers
// ═══════════════════════════════════════════════════════

function round2(n: number): number {
  return Math.round(n * 100) / 100;
}

// ═══════════════════════════════════════════════════════
// Main function: Home Insurance Calculator
// ═══════════════════════════════════════════════════════

/**
 * Estimates annual homeowners insurance premium based on home value,
 * state, deductible, coverage type, claims history, and credit score.
 *
 * Annual Premium = (homeValue / 1000 × stateRate) × deductibleAdj × coverageAdj × claimsAdj × creditAdj
 *
 * @param inputs - Record with homeValue, state, deductible, coverageType, claimsHistory, creditScore
 * @returns Record with annualPremium, monthlyPremium, dailyPremium, coverage details, and breakdowns
 */
export function calculateHomeInsurance(inputs: Record<string, unknown>): Record<string, unknown> {
  // 1. Parse inputs with safe defaults
  const homeValue = Math.max(0, Number(inputs.homeValue) || 0);
  const state = String(inputs.state || 'other');
  const deductible = String(inputs.deductible || '1000');
  const coverageType = String(inputs.coverageType || 'standard');
  const claimsHistory = String(inputs.claimsHistory || '0');
  const creditScore = String(inputs.creditScore || 'good');

  // 2. Look up rate and multipliers
  const baseRate = STATE_RATES[state] ?? STATE_RATES.other;
  const deductibleMult = DEDUCTIBLE_MULTIPLIERS[deductible] ?? 1.00;
  const coverageMult = COVERAGE_MULTIPLIERS[coverageType] ?? 1.00;
  const claimsMult = CLAIMS_MULTIPLIERS[claimsHistory] ?? 1.00;
  const creditMult = CREDIT_MULTIPLIERS[creditScore] ?? 1.00;

  // 3. Calculate base premium
  const basePremium = round2((homeValue / 1000) * baseRate);

  // 4. Apply each adjustment in sequence
  const afterDeductible = round2(basePremium * deductibleMult);
  const afterCoverage = round2(afterDeductible * coverageMult);
  const afterClaims = round2(afterCoverage * claimsMult);
  const annualPremium = round2(afterClaims * creditMult);

  // 5. Monthly and daily
  const monthlyPremium = round2(annualPremium / 12);
  const dailyPremium = round2(annualPremium / 365);

  // 6. Coverage estimates
  const dwellingCoverage = homeValue;
  const personalProperty = round2(homeValue * PERSONAL_PROPERTY_RATIO);
  const liabilityCoverage = STANDARD_LIABILITY;
  const medicalPayments = STANDARD_MEDICAL_PAYMENTS;

  // 7. Cost breakdown value group
  const costBreakdown: { label: string; value: number }[] = [
    { label: 'Base Premium', value: basePremium },
    { label: 'Deductible Adj', value: round2(afterDeductible - basePremium) },
    { label: 'Coverage Type Adj', value: round2(afterCoverage - afterDeductible) },
    { label: 'Claims Adj', value: round2(afterClaims - afterCoverage) },
    { label: 'Credit Adj', value: round2(annualPremium - afterClaims) },
    { label: 'Annual Premium', value: annualPremium },
  ];

  // 8. Coverage summary value group
  const coverageSummary: { label: string; value: number }[] = [
    { label: 'Dwelling Coverage', value: dwellingCoverage },
    { label: 'Personal Property', value: personalProperty },
    { label: 'Liability Coverage', value: liabilityCoverage },
    { label: 'Medical Payments', value: medicalPayments },
  ];

  // Coverage breakdown chart — {name, value}[] for pie chart rendering
  const coverageBreakdownChart = [
    { name: 'Dwelling Coverage', value: dwellingCoverage },
    { name: 'Personal Property', value: personalProperty },
    { name: 'Liability Coverage', value: liabilityCoverage },
    { name: 'Medical Payments', value: medicalPayments },
  ].filter(item => item.value > 0);

  return {
    annualPremium,
    monthlyPremium,
    dailyPremium,
    dwellingCoverage,
    personalProperty,
    liabilityCoverage,
    medicalPayments,
    baseRate,
    costBreakdown,
    coverageSummary,
    coverageBreakdownChart,
  };
}

/** @formulaRegistry */
export const FORMULA_REGISTRY: Record<string, (inputs: Record<string, unknown>) => Record<string, unknown>> = {
  'home-insurance': calculateHomeInsurance,
};
