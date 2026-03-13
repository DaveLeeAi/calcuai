/**
 * Credit Card Payoff Calculator
 *
 * Calculates the time and total cost to pay off a credit card balance
 * with fixed monthly payments, including a full payoff schedule.
 *
 * Formula (months to payoff with fixed payment):
 *   n = -log(1 - B*r/P) / log(1 + r)
 *
 * Where:
 *   B = current balance (dollars)
 *   r = monthly interest rate = APR / 12 (decimal)
 *   P = fixed monthly payment (dollars)
 *   n = number of months to payoff
 *
 * When payment <= monthly interest (B * r), the balance never pays off.
 * When APR = 0%, months = ceil(B / P).
 *
 * Source: Consumer Financial Protection Bureau (CFPB) credit card payoff disclosures;
 *         Truth in Lending Act (TILA) minimum payment disclosure requirements.
 */

export interface CreditCardPayoffRow {
  month: number;
  payment: number;
  principal: number;
  interest: number;
  balance: number;
}

export function calculateCreditCardPayoff(inputs: Record<string, unknown>): Record<string, unknown> {
  const balance = Number(inputs.balance) || 0;
  const annualRate = (Number(inputs.annualRate) || 0) / 100;
  const monthlyPayment = Number(inputs.monthlyPayment) || 0;

  const monthlyRate = annualRate / 12;

  // Edge case: zero or negative balance
  if (balance <= 0) {
    return {
      monthsToPayoff: 0,
      totalPaid: 0,
      totalInterest: 0,
      summary: [],
      balanceOverTime: [],
      payoffSchedule: [],
    };
  }

  // Edge case: zero payment
  if (monthlyPayment <= 0) {
    return {
      monthsToPayoff: -1,
      totalPaid: 0,
      totalInterest: 0,
      summary: [
        { label: 'Starting Balance', value: parseFloat(balance.toFixed(2)) },
        { label: 'Monthly Payment', value: 0 },
        { label: 'APR', value: `${(annualRate * 100).toFixed(1)}%` },
        { label: 'Months to Pay Off', value: 'Never — no payment' },
        { label: 'Total Paid', value: 0 },
        { label: 'Total Interest', value: 0 },
      ],
      balanceOverTime: [],
      payoffSchedule: [],
    };
  }

  // Edge case: 0% APR
  if (annualRate === 0) {
    const months = Math.ceil(balance / monthlyPayment);
    const totalPaid = parseFloat((balance).toFixed(2));
    const schedule: CreditCardPayoffRow[] = [];
    const balanceOverTime: { month: number; balance: number }[] = [{ month: 0, balance: parseFloat(balance.toFixed(2)) }];
    let remaining = balance;

    for (let m = 1; m <= months; m++) {
      const pmt = Math.min(monthlyPayment, remaining);
      remaining = Math.max(0, remaining - pmt);
      schedule.push({
        month: m,
        payment: parseFloat(pmt.toFixed(2)),
        principal: parseFloat(pmt.toFixed(2)),
        interest: 0,
        balance: parseFloat(remaining.toFixed(2)),
      });
      balanceOverTime.push({ month: m, balance: parseFloat(remaining.toFixed(2)) });
    }

    const summary: { label: string; value: number | string }[] = [
      { label: 'Starting Balance', value: parseFloat(balance.toFixed(2)) },
      { label: 'Monthly Payment', value: parseFloat(monthlyPayment.toFixed(2)) },
      { label: 'APR', value: '0%' },
      { label: 'Months to Pay Off', value: months },
      { label: 'Total Paid', value: totalPaid },
      { label: 'Total Interest', value: 0 },
      { label: 'Interest-to-Principal Ratio', value: '0.0%' },
    ];

    return {
      monthsToPayoff: months,
      totalPaid,
      totalInterest: 0,
      summary,
      balanceOverTime,
      payoffSchedule: schedule,
    };
  }

  // Edge case: payment doesn't cover monthly interest
  const firstMonthInterest = balance * monthlyRate;
  if (monthlyPayment <= firstMonthInterest) {
    return {
      monthsToPayoff: -1,
      totalPaid: 0,
      totalInterest: 0,
      summary: [
        { label: 'Starting Balance', value: parseFloat(balance.toFixed(2)) },
        { label: 'Monthly Payment', value: parseFloat(monthlyPayment.toFixed(2)) },
        { label: 'APR', value: `${(annualRate * 100).toFixed(1)}%` },
        { label: 'Months to Pay Off', value: 'Never — payment too low' },
        { label: 'Total Paid', value: 0 },
        { label: 'Total Interest', value: 0 },
        { label: 'Monthly Interest Charge', value: parseFloat(firstMonthInterest.toFixed(2)) },
      ],
      balanceOverTime: [],
      payoffSchedule: [],
    };
  }

  // Standard iterative payoff calculation
  let remainingBalance = balance;
  let totalPaid = 0;
  let totalInterest = 0;
  let month = 0;
  const schedule: CreditCardPayoffRow[] = [];
  const balanceOverTime: { month: number; balance: number }[] = [{ month: 0, balance: parseFloat(balance.toFixed(2)) }];

  while (remainingBalance > 0.01 && month < 600) {
    month++;
    const interestCharge = remainingBalance * monthlyRate;
    const payment = Math.min(monthlyPayment, remainingBalance + interestCharge);
    const principalPaid = payment - interestCharge;
    remainingBalance = Math.max(0, remainingBalance - principalPaid);
    totalPaid += payment;
    totalInterest += interestCharge;

    schedule.push({
      month,
      payment: parseFloat(payment.toFixed(2)),
      principal: parseFloat(principalPaid.toFixed(2)),
      interest: parseFloat(interestCharge.toFixed(2)),
      balance: parseFloat(Math.max(0, remainingBalance).toFixed(2)),
    });

    balanceOverTime.push({
      month,
      balance: parseFloat(Math.max(0, remainingBalance).toFixed(2)),
    });
  }

  totalPaid = parseFloat(totalPaid.toFixed(2));
  totalInterest = parseFloat(totalInterest.toFixed(2));

  const interestToPrincipalRatio = parseFloat((totalInterest / balance * 100).toFixed(1));

  const summary: { label: string; value: number | string }[] = [
    { label: 'Starting Balance', value: parseFloat(balance.toFixed(2)) },
    { label: 'Monthly Payment', value: parseFloat(monthlyPayment.toFixed(2)) },
    { label: 'APR', value: `${(annualRate * 100).toFixed(1)}%` },
    { label: 'Months to Pay Off', value: month },
    { label: 'Total Paid', value: totalPaid },
    { label: 'Total Interest', value: totalInterest },
    { label: 'Interest-to-Principal Ratio', value: `${interestToPrincipalRatio}%` },
  ];

  return {
    monthsToPayoff: month,
    totalPaid,
    totalInterest,
    summary,
    balanceOverTime,
    payoffSchedule: schedule,
  };
}

/** @formulaRegistry */
export const FORMULA_REGISTRY: Record<string, (inputs: Record<string, unknown>) => Record<string, unknown>> = {
  'credit-card-payoff': calculateCreditCardPayoff,
};
