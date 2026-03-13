/**
 * Mortgage Prepayment Calculator
 *
 * Month-by-month amortization simulation with extra principal payments.
 *
 * Each month:
 *   Interest = Balance × (AnnualRate / 12)
 *   Principal = MonthlyPayment - Interest
 *   Balance -= Principal + ExtraMonthly
 *   At months 12, 24, 36, ... : Balance -= ExtraYearly
 *   At month 1: Balance -= LumpSum
 *
 * Outputs:
 *   interestSaved = TotalInterestOriginal - TotalInterestNew
 *   timeSaved in years and months
 *   payoffDate from today + newPayoffMonths
 *
 * Source: CFPB — Mortgage Prepayment Guide;
 *         Federal Reserve — Understanding Amortization;
 *         Freddie Mac — Monthly Payment Calculator Methodology
 */

function round2(n: number): number {
  return Math.round(n * 100) / 100;
}

function formatDuration(months: number): string {
  if (months <= 0) return '0 months';
  const years = Math.floor(months / 12);
  const remainingMonths = months % 12;
  if (years === 0) return `${remainingMonths} month${remainingMonths !== 1 ? 's' : ''}`;
  if (remainingMonths === 0) return `${years} year${years !== 1 ? 's' : ''}`;
  return `${years} year${years !== 1 ? 's' : ''} ${remainingMonths} month${remainingMonths !== 1 ? 's' : ''}`;
}

interface SimulationResult {
  totalInterest: number;
  totalPaid: number;
  months: number;
}

function simulateAmortization(
  balance: number,
  monthlyRate: number,
  monthlyPayment: number,
  extraMonthly: number,
  extraYearly: number,
  lumpSum: number,
  maxMonths: number,
): SimulationResult {
  let currentBalance = balance;
  let totalInterest = 0;
  let totalPaid = 0;
  let months = 0;

  // Apply lump sum at month 0 (immediately)
  if (lumpSum > 0) {
    currentBalance = Math.max(0, currentBalance - lumpSum);
    totalPaid += lumpSum;
  }

  if (currentBalance <= 0) {
    return { totalInterest: round2(totalInterest), totalPaid: round2(totalPaid), months: 0 };
  }

  for (let m = 1; m <= maxMonths; m++) {
    if (currentBalance <= 0) break;

    const interestPayment = currentBalance * monthlyRate;
    const principalFromPayment = monthlyPayment - interestPayment;

    // If payment doesn't cover interest, negative amortization guard
    if (principalFromPayment <= 0 && extraMonthly <= 0) {
      // Negative amortization — cap at maxMonths to prevent infinite loop
      totalInterest += interestPayment;
      totalPaid += monthlyPayment;
      currentBalance += (interestPayment - monthlyPayment); // balance grows
      months = m;
      continue;
    }

    totalInterest += interestPayment;

    // Calculate total payment this month
    const totalMonthlyPayment = monthlyPayment + extraMonthly;

    if (totalMonthlyPayment >= currentBalance + interestPayment) {
      // Final payment — pay off remaining balance
      totalPaid += currentBalance + interestPayment;
      currentBalance = 0;
      months = m;
      break;
    }

    totalPaid += totalMonthlyPayment;
    currentBalance -= (totalMonthlyPayment - interestPayment);

    // Apply yearly extra payment at every 12th month
    if (extraYearly > 0 && m % 12 === 0 && currentBalance > 0) {
      if (extraYearly >= currentBalance) {
        totalPaid += currentBalance;
        currentBalance = 0;
        months = m;
        break;
      }
      currentBalance -= extraYearly;
      totalPaid += extraYearly;
    }

    currentBalance = Math.max(0, currentBalance);
    months = m;

    if (currentBalance <= 0) break;
  }

  return {
    totalInterest: round2(totalInterest),
    totalPaid: round2(totalPaid),
    months,
  };
}

export function calculateMortgagePrepayment(inputs: Record<string, unknown>): Record<string, unknown> {
  const loanBalance = Math.max(0, Number(inputs.loanBalance) || 0);
  const annualRate = (Number(inputs.interestRate) || 0) / 100;
  const remainingYears = Math.max(0, Number(inputs.remainingYears) || 0);
  const monthlyPayment = Math.max(0, Number(inputs.monthlyPayment) || 0);
  const extraMonthly = Math.max(0, Number(inputs.extraMonthly) || 0);
  const extraYearly = Math.max(0, Number(inputs.extraYearly) || 0);
  const lumpSum = Math.max(0, Number(inputs.lumpSum) || 0);

  const monthlyRate = annualRate / 12;
  const maxMonths = 360; // 30-year cap to prevent infinite loops
  const originalMaxMonths = remainingYears * 12;

  // Handle edge cases
  if (loanBalance <= 0 || monthlyPayment <= 0) {
    return {
      interestSaved: 0,
      newPayoffYears: '0 months',
      originalPayoffYears: '0 months',
      timeSaved: '0 months',
      totalInterestOriginal: 0,
      totalInterestNew: 0,
      totalPaidOriginal: 0,
      totalPaidNew: 0,
      payoffDate: 'N/A',
    };
  }

  // Simulate original (no extra payments)
  const original = simulateAmortization(
    loanBalance,
    monthlyRate,
    monthlyPayment,
    0, // no extra monthly
    0, // no extra yearly
    0, // no lump sum
    Math.max(maxMonths, originalMaxMonths),
  );

  // Simulate with extra payments
  const withExtra = simulateAmortization(
    loanBalance,
    monthlyRate,
    monthlyPayment,
    extraMonthly,
    extraYearly,
    lumpSum,
    Math.max(maxMonths, originalMaxMonths),
  );

  const interestSaved = round2(Math.max(0, original.totalInterest - withExtra.totalInterest));
  const monthsSaved = Math.max(0, original.months - withExtra.months);

  // Calculate payoff date from today
  const now = new Date();
  const payoffDate = new Date(now.getFullYear(), now.getMonth() + withExtra.months, now.getDate());
  const payoffDateStr = payoffDate.toLocaleDateString('en-US', {
    month: 'long',
    year: 'numeric',
  });

  return {
    interestSaved,
    newPayoffYears: formatDuration(withExtra.months),
    originalPayoffYears: formatDuration(original.months),
    timeSaved: formatDuration(monthsSaved),
    totalInterestOriginal: original.totalInterest,
    totalInterestNew: withExtra.totalInterest,
    totalPaidOriginal: original.totalPaid,
    totalPaidNew: withExtra.totalPaid,
    payoffDate: payoffDateStr,
  };
}

/** @formulaRegistry */
export const FORMULA_REGISTRY: Record<string, (inputs: Record<string, unknown>) => Record<string, unknown>> = {
  'mortgage-prepayment': calculateMortgagePrepayment,
};
