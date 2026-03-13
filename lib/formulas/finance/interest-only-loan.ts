/**
 * Interest-Only Loan Calculator
 *
 * During interest-only (IO) period:
 *   IO Payment = Principal × (AnnualRate / 12 / 100)
 *
 * After IO period, fully amortizing payment for remaining term:
 *   M = P × [r(1+r)^n] / [(1+r)^n - 1]
 *   where r = monthly rate, n = remaining months after IO period
 *
 * Comparison with standard fully-amortizing loan over the same total term.
 *
 * Source: CFPB — Interest-Only Mortgage Payments and Payment-Option ARMs;
 *         Freddie Mac — Loan Product Descriptions
 */

function round2(n: number): number {
  return Math.round(n * 100) / 100;
}

/**
 * Standard amortizing monthly payment formula.
 * M = P × [r(1+r)^n] / [(1+r)^n - 1]
 */
function amortizingPayment(principal: number, monthlyRate: number, months: number): number {
  if (monthlyRate === 0) return principal / months;
  if (months <= 0) return 0;
  const factor = Math.pow(1 + monthlyRate, months);
  return principal * (monthlyRate * factor) / (factor - 1);
}

/**
 * Calculate total interest paid on a fully amortizing loan.
 */
function totalInterestAmortizing(principal: number, monthlyRate: number, months: number): number {
  if (months <= 0 || principal <= 0) return 0;
  const payment = amortizingPayment(principal, monthlyRate, months);
  return payment * months - principal;
}

export function calculateInterestOnlyLoan(inputs: Record<string, unknown>): Record<string, unknown> {
  const loanAmount = Math.max(0, Number(inputs.loanAmount) || 0);
  const annualRate = Number(inputs.annualInterestRate) || 0;
  const totalTermYears = Math.max(1, Number(inputs.totalTermYears) || 30);
  const interestOnlyYears = Math.max(0, Number(inputs.interestOnlyYears) || 10);

  const monthlyRate = annualRate / 100 / 12;
  const totalMonths = totalTermYears * 12;
  const ioMonths = interestOnlyYears * 12;
  const amortizingMonths = totalMonths - ioMonths;

  // Edge case: IO period >= total term (no amortizing period)
  if (amortizingMonths <= 0) {
    const ioPayment = round2(loanAmount * monthlyRate);
    const totalInterestIO = round2(ioPayment * totalMonths);
    // Standard comparison: fully amortizing over totalMonths
    const standardPayment = round2(amortizingPayment(loanAmount, monthlyRate, totalMonths));
    const totalInterestStandard = round2(totalInterestAmortizing(loanAmount, monthlyRate, totalMonths));

    return {
      interestOnlyPayment: ioPayment,
      fullyAmortizingPayment: 0,
      standardPayment,
      paymentIncrease: 0,
      paymentIncreasePercent: 0,
      totalInterest: totalInterestIO,
      totalInterestStandard,
      interestDifference: round2(Math.max(0, totalInterestIO - totalInterestStandard)),
      totalCostIO: round2(totalInterestIO + loanAmount),
      totalCostStandard: round2(totalInterestStandard + loanAmount),
      ioMonths,
      amortizingMonths: 0,
      costBreakdown: {
        interestDuringIOPeriod: totalInterestIO,
        interestDuringAmortizingPeriod: 0,
        principalRepaid: 0,
        balloonBalance: loanAmount,
      },
    };
  }

  // Edge case: zero loan amount
  if (loanAmount <= 0) {
    return {
      interestOnlyPayment: 0,
      fullyAmortizingPayment: 0,
      standardPayment: 0,
      paymentIncrease: 0,
      paymentIncreasePercent: 0,
      totalInterest: 0,
      totalInterestStandard: 0,
      interestDifference: 0,
      totalCostIO: 0,
      totalCostStandard: 0,
      ioMonths,
      amortizingMonths,
      costBreakdown: {
        interestDuringIOPeriod: 0,
        interestDuringAmortizingPeriod: 0,
        principalRepaid: 0,
        balloonBalance: 0,
      },
    };
  }

  // ──── Interest-Only Period ────
  const ioPayment = round2(loanAmount * monthlyRate);
  const totalInterestIOPeriod = round2(ioPayment * ioMonths);

  // ──── Amortizing Period ────
  // After IO period, the full principal must be repaid over remaining months
  const amortizingPaymentAmount = round2(amortizingPayment(loanAmount, monthlyRate, amortizingMonths));
  const totalPaidAmortizing = round2(amortizingPaymentAmount * amortizingMonths);
  const totalInterestAmortizingPeriod = round2(totalPaidAmortizing - loanAmount);

  // ──── Total Interest (IO Loan) ────
  const totalInterest = round2(totalInterestIOPeriod + totalInterestAmortizingPeriod);

  // ──── Standard Fully Amortizing Comparison ────
  const standardPayment = round2(amortizingPayment(loanAmount, monthlyRate, totalMonths));
  const totalInterestStandard = round2(totalInterestAmortizing(loanAmount, monthlyRate, totalMonths));

  // ──── Payment Jump ────
  const paymentIncrease = round2(amortizingPaymentAmount - ioPayment);
  const paymentIncreasePercent = ioPayment > 0
    ? round2((paymentIncrease / ioPayment) * 100)
    : 0;

  // ──── Interest Difference ────
  const interestDifference = round2(Math.max(0, totalInterest - totalInterestStandard));

  return {
    interestOnlyPayment: ioPayment,
    fullyAmortizingPayment: amortizingPaymentAmount,
    standardPayment,
    paymentIncrease,
    paymentIncreasePercent,
    totalInterest,
    totalInterestStandard,
    interestDifference,
    totalCostIO: round2(totalInterest + loanAmount),
    totalCostStandard: round2(totalInterestStandard + loanAmount),
    ioMonths,
    amortizingMonths,
    costBreakdown: {
      interestDuringIOPeriod: totalInterestIOPeriod,
      interestDuringAmortizingPeriod: totalInterestAmortizingPeriod,
      principalRepaid: loanAmount,
      balloonBalance: 0,
    },
  };
}

/** @formulaRegistry */
export const FORMULA_REGISTRY: Record<string, (inputs: Record<string, unknown>) => Record<string, unknown>> = {
  'interest-only-loan': calculateInterestOnlyLoan,
};
