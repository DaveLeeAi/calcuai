/**
 * Interest Rate Calculator — Newton-Raphson Solver
 *
 * Solves for the annual interest rate given a known loan amount,
 * monthly payment, and loan term.
 *
 * The standard loan payment formula:
 *   M = P × [r(1+r)^n] / [(1+r)^n - 1]
 *
 * Cannot be algebraically solved for r, so we use Newton-Raphson iteration:
 *   r_{k+1} = r_k - f(r_k) / f'(r_k)
 *
 * Where:
 *   f(r) = P × r × (1+r)^n / [(1+r)^n - 1] - M
 *   f'(r) = derivative of f with respect to r
 *
 * Variables:
 *   P = loan principal (loan amount)
 *   M = monthly payment
 *   n = total number of monthly payments
 *   r = monthly interest rate (solved for, then annualized)
 *
 * Source: Consumer Financial Protection Bureau (CFPB);
 * Newton-Raphson method — standard numerical analysis technique
 */
export function calculateInterestRate(inputs: Record<string, unknown>): Record<string, unknown> {
  const loanAmount = Number(inputs.loanAmount) || 0;
  const monthlyPayment = Number(inputs.monthlyPayment) || 0;
  const loanTerm = Number(inputs.loanTerm) || 0; // in months

  if (loanAmount <= 0 || monthlyPayment <= 0 || loanTerm <= 0) {
    return {
      annualRate: 0,
      monthlyRate: 0,
      totalPayment: 0,
      totalInterest: 0,
      summary: [],
    };
  }

  const totalPayment = parseFloat((monthlyPayment * loanTerm).toFixed(2));
  const totalInterest = parseFloat((totalPayment - loanAmount).toFixed(2));

  // If total payments <= loan amount, interest rate is 0% or invalid
  if (totalPayment <= loanAmount) {
    return {
      annualRate: 0,
      monthlyRate: 0,
      totalPayment,
      totalInterest: 0,
      summary: [
        { label: 'Annual Interest Rate (APR)', value: '0.00%' },
        { label: 'Monthly Interest Rate', value: '0.0000%' },
        { label: 'Total Payment', value: totalPayment },
        { label: 'Total Interest', value: 0 },
      ],
    };
  }

  // Newton-Raphson iteration to solve for monthly rate
  const P = loanAmount;
  const M = monthlyPayment;
  const n = loanTerm;
  const maxIterations = 200;
  const tolerance = 1e-10;

  // Initial guess: simple approximation
  let r = (2 * (M * n - P)) / (P * n);
  if (r <= 0) r = 0.005; // fallback to 0.5% monthly

  for (let i = 0; i < maxIterations; i++) {
    const rn = Math.pow(1 + r, n);
    const f = P * r * rn / (rn - 1) - M;
    // Derivative of f with respect to r
    const dfNumerator = P * rn * ((rn - 1) - r * n * Math.pow(1 + r, n - 1)) +
                         P * r * n * Math.pow(1 + r, n - 1) * (rn - 1);
    const dfDenominator = (rn - 1) * (rn - 1);

    // Simplified derivative using quotient rule:
    // d/dr [P*r*(1+r)^n / ((1+r)^n - 1)]
    const numerator = P * rn;
    const denominator = rn - 1;
    // f = numerator * r / denominator = P * r * rn / (rn - 1)
    // f' = P * [rn + r*n*(1+r)^(n-1)] * (rn-1) - P*r*rn * n*(1+r)^(n-1)
    //     all over (rn-1)^2
    const dRn = n * Math.pow(1 + r, n - 1); // derivative of (1+r)^n
    const fPrime = (P * (rn + r * dRn) * (rn - 1) - P * r * rn * dRn) / ((rn - 1) * (rn - 1));

    if (Math.abs(fPrime) < 1e-20) break; // avoid division by zero

    const rNew = r - f / fPrime;

    if (Math.abs(rNew - r) < tolerance) {
      r = rNew;
      break;
    }

    // Prevent negative or excessively large rates
    r = Math.max(1e-12, Math.min(rNew, 10));
  }

  const annualRate = parseFloat((r * 12 * 100).toFixed(2));
  const monthlyRate = parseFloat((r * 100).toFixed(4));

  const summary: { label: string; value: number | string }[] = [
    { label: 'Annual Interest Rate (APR)', value: `${annualRate}%` },
    { label: 'Monthly Interest Rate', value: `${monthlyRate}%` },
    { label: 'Total Payment', value: totalPayment },
    { label: 'Total Interest', value: totalInterest },
    { label: 'Loan Amount', value: parseFloat(loanAmount.toFixed(2)) },
    { label: 'Monthly Payment', value: parseFloat(monthlyPayment.toFixed(2)) },
  ];

  return {
    annualRate,
    monthlyRate,
    totalPayment,
    totalInterest,
    summary,
  };
}

/** @formulaRegistry */
export const FORMULA_REGISTRY: Record<string, (inputs: Record<string, unknown>) => Record<string, unknown>> = {
  'interest-rate-solve': calculateInterestRate,
};
