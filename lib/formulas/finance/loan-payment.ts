export interface LoanAmortizationRow {
  month: number;
  payment: number;
  principal: number;
  interest: number;
  extraPayment: number;
  balance: number;
}

export interface LoanOutput {
  monthlyPayment: number;
  totalPayment: number;
  totalInterest: number;
  payoffDate: string;
  summary: { label: string; value: number | string }[];
  paymentBreakdown: { name: string; value: number }[];
  amortizationSchedule: LoanAmortizationRow[];
  balanceOverTime: { month: number; balance: number; balanceWithExtra?: number }[];
}

/**
 * Standard loan payment formula (fixed-rate amortization):
 * M = P × [r(1+r)^n] / [(1+r)^n - 1]
 *
 * Where:
 *   M = monthly payment (principal + interest)
 *   P = loan principal (loan amount)
 *   r = monthly interest rate (annual rate / 12)
 *   n = total number of monthly payments
 *
 * Extra payments are applied directly to principal each month,
 * reducing the remaining balance and shortening the loan term.
 *
 * Source: Consumer Financial Protection Bureau (CFPB)
 */
export function calculateLoanPayment(inputs: Record<string, unknown>): Record<string, unknown> {
  const loanAmount = Number(inputs.loanAmount) || 0;
  const annualRate = (Number(inputs.annualRate) || 0) / 100;
  const loanTerm = Number(inputs.loanTerm) || 0; // in months
  const extraPayment = Number(inputs.extraPayment) || 0;

  if (loanAmount <= 0 || loanTerm <= 0) {
    return {
      monthlyPayment: 0,
      totalPayment: 0,
      totalInterest: 0,
      payoffDate: '0 years, 0 months',
      summary: [],
      paymentBreakdown: [
        { name: 'Principal', value: 0 },
        { name: 'Interest', value: 0 },
      ],
      amortizationSchedule: [],
      balanceOverTime: [],
    };
  }

  const monthlyRate = annualRate / 12;

  // Calculate base monthly payment (P&I)
  let monthlyPayment: number;
  if (monthlyRate === 0) {
    monthlyPayment = loanAmount / loanTerm;
  } else {
    const factor = Math.pow(1 + monthlyRate, loanTerm);
    monthlyPayment = loanAmount * (monthlyRate * factor) / (factor - 1);
  }

  // ── Standard schedule (no extra payments) ──
  const totalPaymentStandard = monthlyPayment * loanTerm;
  const totalInterestStandard = totalPaymentStandard - loanAmount;

  // ── Amortization with extra payments ──
  const schedule: LoanAmortizationRow[] = [];
  const balanceOverTime: { month: number; balance: number; balanceWithExtra?: number }[] = [];
  let balance = loanAmount;
  let totalInterestWithExtra = 0;
  let totalPaidWithExtra = 0;
  let monthsWithExtra = 0;

  // Also track standard balance for comparison chart
  let standardBalance = loanAmount;

  // Add initial data point
  if (extraPayment > 0) {
    balanceOverTime.push({ month: 0, balance: loanAmount, balanceWithExtra: loanAmount });
  } else {
    balanceOverTime.push({ month: 0, balance: loanAmount });
  }

  for (let month = 1; month <= loanTerm; month++) {
    // Standard balance tracking (for chart comparison)
    if (extraPayment > 0 && standardBalance > 0) {
      const stdInterest = standardBalance * monthlyRate;
      const stdPrincipal = monthlyPayment - stdInterest;
      standardBalance = Math.max(0, standardBalance - stdPrincipal);
    }

    // Extra payment schedule
    if (balance > 0.005) {
      monthsWithExtra++;
      const interestPayment = balance * monthlyRate;
      totalInterestWithExtra += interestPayment;
      const basePrincipal = monthlyPayment - interestPayment;
      let appliedExtra = extraPayment;
      let principalPayment = basePrincipal + appliedExtra;

      // If this is the last payment, cap it
      if (principalPayment >= balance) {
        principalPayment = balance;
        appliedExtra = Math.max(0, principalPayment - basePrincipal);
        totalPaidWithExtra += principalPayment + interestPayment;
        balance = 0;
      } else {
        totalPaidWithExtra += monthlyPayment + appliedExtra;
        balance -= principalPayment;
      }

      schedule.push({
        month,
        payment: parseFloat((balance === 0 ? principalPayment + interestPayment : monthlyPayment + appliedExtra).toFixed(2)),
        principal: parseFloat((balance === 0 ? principalPayment : basePrincipal).toFixed(2)),
        interest: parseFloat(interestPayment.toFixed(2)),
        extraPayment: parseFloat(appliedExtra.toFixed(2)),
        balance: parseFloat(balance.toFixed(2)),
      });

      // Chart data points — every month for short loans, sampled for long ones
      if (extraPayment > 0) {
        balanceOverTime.push({
          month,
          balance: parseFloat(standardBalance.toFixed(2)),
          balanceWithExtra: parseFloat(balance.toFixed(2)),
        });
      } else {
        balanceOverTime.push({
          month,
          balance: parseFloat(balance.toFixed(2)),
        });
      }
    } else if (extraPayment > 0) {
      // Loan already paid off with extra payments, but still track standard balance
      if (standardBalance > 0.005) {
        const stdInterest = standardBalance * monthlyRate;
        // Already tracked above, just add chart point
      }
      balanceOverTime.push({
        month,
        balance: parseFloat(standardBalance.toFixed(2)),
        balanceWithExtra: 0,
      });
    }
  }

  // If no extra payments, schedule runs full term
  // If extra payments, it may end early

  const hasExtraPayments = extraPayment > 0;
  const actualMonths = hasExtraPayments ? monthsWithExtra : loanTerm;
  const actualTotalInterest = hasExtraPayments ? totalInterestWithExtra : totalInterestStandard;
  const actualTotalPayment = hasExtraPayments ? totalPaidWithExtra : totalPaymentStandard;

  // Payoff date formatting
  const years = Math.floor(actualMonths / 12);
  const remainingMonths = actualMonths % 12;
  let payoffDate: string;
  if (years === 0) {
    payoffDate = `${remainingMonths} month${remainingMonths !== 1 ? 's' : ''}`;
  } else if (remainingMonths === 0) {
    payoffDate = `${years} year${years !== 1 ? 's' : ''}`;
  } else {
    payoffDate = `${years} year${years !== 1 ? 's' : ''}, ${remainingMonths} month${remainingMonths !== 1 ? 's' : ''}`;
  }

  // Summary value group
  const summary: { label: string; value: number | string }[] = [
    { label: 'Monthly Payment', value: parseFloat(monthlyPayment.toFixed(2)) },
    { label: 'Total Principal', value: parseFloat(loanAmount.toFixed(2)) },
    { label: 'Total Interest', value: parseFloat(actualTotalInterest.toFixed(2)) },
    { label: 'Total Cost', value: parseFloat(actualTotalPayment.toFixed(2)) },
  ];

  if (hasExtraPayments) {
    const monthsSaved = loanTerm - monthsWithExtra;
    const interestSaved = totalInterestStandard - totalInterestWithExtra;
    summary.push({ label: 'Months Saved', value: `${monthsSaved} months` });
    summary.push({ label: 'Interest Saved', value: parseFloat(interestSaved.toFixed(2)) });
  }

  // Payment breakdown pie chart (total over life of loan)
  const paymentBreakdown = [
    { name: 'Principal', value: parseFloat(loanAmount.toFixed(2)) },
    { name: 'Interest', value: parseFloat(actualTotalInterest.toFixed(2)) },
  ];

  // Yearly principal vs interest breakdown (for stacked bar chart)
  const totalYears = Math.ceil(schedule.length / 12);
  const yearlyBreakdown: { year: number; principal: number; interest: number }[] = [];
  for (let y = 0; y < totalYears; y++) {
    const yearRows = schedule.slice(y * 12, (y + 1) * 12);
    yearlyBreakdown.push({
      year: y + 1,
      principal: parseFloat(yearRows.reduce((s, r) => s + r.principal, 0).toFixed(2)),
      interest: parseFloat(yearRows.reduce((s, r) => s + r.interest, 0).toFixed(2)),
    });
  }

  return {
    monthlyPayment: parseFloat(monthlyPayment.toFixed(2)),
    totalPayment: parseFloat(actualTotalPayment.toFixed(2)),
    totalInterest: parseFloat(actualTotalInterest.toFixed(2)),
    payoffDate,
    summary,
    paymentBreakdown,
    amortizationSchedule: schedule,
    balanceOverTime,
    yearlyBreakdown,
  };
}

/** @formulaRegistry */
export const FORMULA_REGISTRY: Record<string, (inputs: Record<string, unknown>) => Record<string, unknown>> = {
  'loan-payment': calculateLoanPayment,
};
