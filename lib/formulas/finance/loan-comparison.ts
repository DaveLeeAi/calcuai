/**
 * Loan Comparison Calculator
 *
 * Compares two loan scenarios side by side using the standard amortization formula:
 * M = P × [r(1+r)^n] / [(1+r)^n - 1]
 *
 * For each loan, calculates monthly payment, total interest, total cost,
 * then derives the difference (savings) between the two options.
 *
 * Source: Standard amortization formula (Actuarial Standards Board)
 */

function calcLoan(principal: number, annualRate: number, termMonths: number) {
  const monthlyRate = annualRate / 12;

  let monthlyPayment: number;
  if (monthlyRate === 0) {
    monthlyPayment = principal / termMonths;
  } else {
    const factor = Math.pow(1 + monthlyRate, termMonths);
    monthlyPayment = principal * (monthlyRate * factor) / (factor - 1);
  }

  const totalPayment = monthlyPayment * termMonths;
  const totalInterest = totalPayment - principal;

  // Build yearly balance schedule
  const balanceByYear: number[] = [];
  let balance = principal;
  const totalYears = Math.ceil(termMonths / 12);

  for (let year = 1; year <= totalYears; year++) {
    const monthsThisYear = Math.min(12, termMonths - (year - 1) * 12);
    for (let m = 0; m < monthsThisYear; m++) {
      const interestPayment = balance * monthlyRate;
      const principalPayment = monthlyPayment - interestPayment;
      balance = Math.max(0, balance - principalPayment);
    }
    balanceByYear.push(parseFloat(balance.toFixed(2)));
  }

  return {
    monthlyPayment: parseFloat(monthlyPayment.toFixed(2)),
    totalPayment: parseFloat(totalPayment.toFixed(2)),
    totalInterest: parseFloat(totalInterest.toFixed(2)),
    balanceByYear,
  };
}

export function calculateLoanComparison(inputs: Record<string, unknown>): Record<string, unknown> {
  const loanAmount = Number(inputs.loanAmount) || 0;
  const rateA = (Number(inputs.rateA) || 0) / 100;
  const termA = Number(inputs.termA) || 0;
  const rateB = (Number(inputs.rateB) || 0) / 100;
  const termB = Number(inputs.termB) || 0;

  if (loanAmount <= 0) {
    return {
      paymentA: 0,
      paymentB: 0,
      totalInterestA: 0,
      totalInterestB: 0,
      totalPaymentA: 0,
      totalPaymentB: 0,
      monthlySavings: 0,
      totalSavings: 0,
      cheaperLoan: 'N/A',
      summary: [],
      comparison: [],
      balanceComparison: [],
    };
  }

  if (termA <= 0 || termB <= 0) {
    return {
      paymentA: 0,
      paymentB: 0,
      totalInterestA: 0,
      totalInterestB: 0,
      totalPaymentA: 0,
      totalPaymentB: 0,
      monthlySavings: 0,
      totalSavings: 0,
      cheaperLoan: 'N/A',
      summary: [],
      comparison: [],
      balanceComparison: [],
    };
  }

  const loanA = calcLoan(loanAmount, rateA, termA);
  const loanB = calcLoan(loanAmount, rateB, termB);

  const monthlySavings = parseFloat(Math.abs(loanA.monthlyPayment - loanB.monthlyPayment).toFixed(2));
  const totalSavings = parseFloat(Math.abs(loanA.totalInterest - loanB.totalInterest).toFixed(2));

  let cheaperLoan: string;
  if (loanA.totalPayment < loanB.totalPayment) {
    cheaperLoan = 'Loan A';
  } else if (loanB.totalPayment < loanA.totalPayment) {
    cheaperLoan = 'Loan B';
  } else {
    cheaperLoan = 'Equal';
  }

  // Build balance comparison chart data (yearly)
  const maxYears = Math.max(
    Math.ceil(termA / 12),
    Math.ceil(termB / 12)
  );

  const balanceComparison: { year: number; loanA: number; loanB: number }[] = [
    { year: 0, loanA: loanAmount, loanB: loanAmount },
  ];

  for (let y = 1; y <= maxYears; y++) {
    const balA = y <= loanA.balanceByYear.length ? loanA.balanceByYear[y - 1] : 0;
    const balB = y <= loanB.balanceByYear.length ? loanB.balanceByYear[y - 1] : 0;
    balanceComparison.push({ year: y, loanA: balA, loanB: balB });
  }

  // Summary value group
  const summary: { label: string; value: number | string }[] = [
    { label: 'Loan Amount', value: parseFloat(loanAmount.toFixed(2)) },
    { label: 'Loan A Rate', value: `${(rateA * 100).toFixed(2)}%` },
    { label: 'Loan A Term', value: `${termA} months` },
    { label: 'Loan A Payment', value: loanA.monthlyPayment },
    { label: 'Loan A Total Interest', value: loanA.totalInterest },
    { label: 'Loan A Total Cost', value: loanA.totalPayment },
    { label: 'Loan B Rate', value: `${(rateB * 100).toFixed(2)}%` },
    { label: 'Loan B Term', value: `${termB} months` },
    { label: 'Loan B Payment', value: loanB.monthlyPayment },
    { label: 'Loan B Total Interest', value: loanB.totalInterest },
    { label: 'Loan B Total Cost', value: loanB.totalPayment },
    { label: 'Monthly Payment Difference', value: monthlySavings },
    { label: 'Total Interest Saved', value: totalSavings },
    { label: 'Lower Total Cost', value: cheaperLoan },
  ];

  // Comparison value group (for side-by-side rendering)
  const comparison: { label: string; value: number | string }[] = [
    { label: 'Loan A Monthly Payment', value: loanA.monthlyPayment },
    { label: 'Loan B Monthly Payment', value: loanB.monthlyPayment },
    { label: 'Loan A Total Interest', value: loanA.totalInterest },
    { label: 'Loan B Total Interest', value: loanB.totalInterest },
    { label: 'Loan A Total Cost', value: loanA.totalPayment },
    { label: 'Loan B Total Cost', value: loanB.totalPayment },
  ];

  return {
    paymentA: loanA.monthlyPayment,
    paymentB: loanB.monthlyPayment,
    totalInterestA: loanA.totalInterest,
    totalInterestB: loanB.totalInterest,
    totalPaymentA: loanA.totalPayment,
    totalPaymentB: loanB.totalPayment,
    monthlySavings,
    totalSavings,
    cheaperLoan,
    summary,
    comparison,
    balanceComparison,
  };
}

/** @formulaRegistry */
export const FORMULA_REGISTRY: Record<string, (inputs: Record<string, unknown>) => Record<string, unknown>> = {
  'loan-comparison': calculateLoanComparison,
};
