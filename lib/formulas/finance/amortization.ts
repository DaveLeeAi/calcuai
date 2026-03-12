export interface AmortizationRow {
  month: number;
  payment: number;
  principal: number;
  interest: number;
  balance: number;
}

export interface YearlyBreakdownRow {
  year: number;
  principalPaid: number;
  interestPaid: number;
  balance: number;
}

/**
 * Amortization Calculator Formula (fixed-rate mortgage / loan)
 *
 * Monthly Payment:
 *   M = P × [r(1+r)^n] / [(1+r)^n - 1]
 *
 * Where:
 *   M = monthly payment (principal + interest)
 *   P = loan principal (loan amount)
 *   r = monthly interest rate (annual rate / 12)
 *   n = total number of monthly payments
 *
 * The amortization schedule breaks each payment into principal and interest
 * components, showing the remaining balance after each month. Yearly summaries
 * aggregate principal paid, interest paid, and end-of-year balance.
 *
 * Extra payments reduce principal directly, shortening the loan term and
 * reducing total interest paid.
 *
 * Source: Consumer Financial Protection Bureau (CFPB)
 */
export function calculateAmortization(inputs: Record<string, unknown>): Record<string, unknown> {
  const loanAmount = Number(inputs.loanAmount) || 0;
  const annualRate = (Number(inputs.interestRate) || 0) / 100;
  const loanTermYears = Number(inputs.loanTerm) || 30;
  const extraPayment = Number(inputs.extraPayment) || 0;

  const loanTermMonths = loanTermYears * 12;

  if (loanAmount <= 0 || loanTermMonths <= 0) {
    return {
      monthlyPayment: 0,
      totalInterest: 0,
      totalPayment: 0,
      payoffMonths: 0,
      summary: [],
      amortizationSchedule: [],
      yearlyBreakdown: [],
      balanceOverTime: [],
      interestVsPrincipal: [],
    };
  }

  const monthlyRate = annualRate / 12;

  // Calculate base monthly payment (P&I)
  let monthlyPayment: number;
  if (monthlyRate === 0) {
    monthlyPayment = loanAmount / loanTermMonths;
  } else {
    const factor = Math.pow(1 + monthlyRate, loanTermMonths);
    monthlyPayment = loanAmount * (monthlyRate * factor) / (factor - 1);
  }

  // Build full amortization schedule
  const schedule: AmortizationRow[] = [];
  const balanceOverTime: { month: number; balance: number }[] = [{ month: 0, balance: parseFloat(loanAmount.toFixed(2)) }];

  let balance = loanAmount;
  let totalInterest = 0;
  let totalPaid = 0;
  let actualMonths = 0;

  // Yearly tracking
  let yearPrincipal = 0;
  let yearInterest = 0;
  const yearlyBreakdown: YearlyBreakdownRow[] = [];

  for (let month = 1; month <= loanTermMonths; month++) {
    if (balance <= 0.005) break;

    actualMonths++;
    const interestPayment = balance * monthlyRate;
    totalInterest += interestPayment;

    let principalPayment = monthlyPayment - interestPayment + extraPayment;
    let actualPayment = monthlyPayment + extraPayment;

    // Cap at remaining balance
    if (principalPayment >= balance) {
      principalPayment = balance;
      actualPayment = principalPayment + interestPayment;
      balance = 0;
    } else {
      balance -= principalPayment;
    }

    totalPaid += actualPayment;

    schedule.push({
      month,
      payment: parseFloat(actualPayment.toFixed(2)),
      principal: parseFloat(principalPayment.toFixed(2)),
      interest: parseFloat(interestPayment.toFixed(2)),
      balance: parseFloat(balance.toFixed(2)),
    });

    balanceOverTime.push({ month, balance: parseFloat(balance.toFixed(2)) });

    // Yearly aggregation
    yearPrincipal += principalPayment;
    yearInterest += interestPayment;

    if (month % 12 === 0 || balance <= 0.005) {
      const year = Math.ceil(month / 12);
      yearlyBreakdown.push({
        year,
        principalPaid: parseFloat(yearPrincipal.toFixed(2)),
        interestPaid: parseFloat(yearInterest.toFixed(2)),
        balance: parseFloat(balance.toFixed(2)),
      });
      yearPrincipal = 0;
      yearInterest = 0;
    }

    if (balance <= 0.005) break;
  }

  // Build interest vs principal chart data (per year)
  const interestVsPrincipal = yearlyBreakdown.map((row) => ({
    year: `Year ${row.year}`,
    principal: row.principalPaid,
    interest: row.interestPaid,
  }));

  // Standard totals (no extra payments) for comparison
  const standardTotalPayment = monthlyPayment * loanTermMonths;
  const standardTotalInterest = standardTotalPayment - loanAmount;

  const summary: { label: string; value: number | string }[] = [
    { label: 'Monthly Payment (P&I)', value: parseFloat(monthlyPayment.toFixed(2)) },
    { label: 'Total Principal', value: parseFloat(loanAmount.toFixed(2)) },
    { label: 'Total Interest', value: parseFloat(totalInterest.toFixed(2)) },
    { label: 'Total Cost', value: parseFloat(totalPaid.toFixed(2)) },
    { label: 'Payoff', value: `${Math.floor(actualMonths / 12)} years, ${actualMonths % 12} months` },
  ];

  if (extraPayment > 0) {
    const interestSaved = standardTotalInterest - totalInterest;
    const monthsSaved = loanTermMonths - actualMonths;
    summary.push({ label: 'Interest Saved', value: parseFloat(interestSaved.toFixed(2)) });
    summary.push({ label: 'Months Saved', value: `${monthsSaved} months` });
  }

  return {
    monthlyPayment: parseFloat(monthlyPayment.toFixed(2)),
    totalInterest: parseFloat(totalInterest.toFixed(2)),
    totalPayment: parseFloat(totalPaid.toFixed(2)),
    payoffMonths: actualMonths,
    summary,
    amortizationSchedule: schedule,
    yearlyBreakdown,
    balanceOverTime,
    interestVsPrincipal,
  };
}

/** @formulaRegistry */
export const FORMULA_REGISTRY: Record<string, (inputs: Record<string, unknown>) => Record<string, unknown>> = {
  'amortization': calculateAmortization,
};
