/**
 * Down Payment Calculator
 *
 * Calculates:
 *   1. Required down payment = Home Price x Down Payment %
 *   2. Amount still needed = Required - Current Savings
 *   3. Months to goal using future value of annuity solved for n:
 *      n = ln((FV * r / PMT) + 1) / ln(1 + r)
 *      where FV = amountNeeded - currentSavings*(1+r)^n (iterative)
 *   4. PMI estimate if down payment < 20%
 *
 * Savings growth projection:
 *   FV = PV(1 + r)^n + PMT * [((1 + r)^n - 1) / r]
 *
 * Source: Consumer Financial Protection Bureau (CFPB) / HUD
 */

export function calculateDownPayment(inputs: Record<string, unknown>): Record<string, unknown> {
  const homePrice = Number(inputs.homePrice) || 0;
  const downPaymentPercent = (Number(inputs.downPaymentPercent) || 0) / 100;
  const currentSavings = Number(inputs.currentSavings) || 0;
  const monthlySavings = Number(inputs.monthlySavings) || 0;
  const savingsRate = (Number(inputs.savingsRate) || 0) / 100;

  if (homePrice <= 0) {
    return {
      downPaymentAmount: 0,
      amountStillNeeded: 0,
      monthsToGoal: 0,
      estimatedDate: 'N/A',
      pmiImpact: 0,
      summary: [],
      savingsProjection: [],
    };
  }

  const downPaymentAmount = parseFloat((homePrice * downPaymentPercent).toFixed(2));
  const amountStillNeeded = parseFloat(Math.max(0, downPaymentAmount - currentSavings).toFixed(2));

  // Monthly interest rate for savings account
  const monthlyRate = savingsRate / 12;

  // Calculate months to goal
  let monthsToGoal = 0;
  if (amountStillNeeded <= 0) {
    monthsToGoal = 0;
  } else if (monthlySavings <= 0 && monthlyRate <= 0) {
    monthsToGoal = -1; // unreachable
  } else if (monthlySavings <= 0 && monthlyRate > 0) {
    // Only interest growth, no contributions: PV * (1+r)^n = target
    // n = ln(target / PV) / ln(1 + r)
    if (currentSavings > 0) {
      monthsToGoal = Math.ceil(Math.log(downPaymentAmount / currentSavings) / Math.log(1 + monthlyRate));
    } else {
      monthsToGoal = -1; // unreachable with no savings and no contributions
    }
  } else if (monthlyRate === 0) {
    // No interest — simple division
    monthsToGoal = Math.ceil(amountStillNeeded / monthlySavings);
  } else {
    // Iterative approach: simulate month by month
    let balance = currentSavings;
    let months = 0;
    const maxMonths = 1200; // 100-year cap
    while (balance < downPaymentAmount && months < maxMonths) {
      months++;
      balance = balance * (1 + monthlyRate) + monthlySavings;
    }
    monthsToGoal = months >= maxMonths ? -1 : months;
  }

  // Estimated date
  let estimatedDate: string;
  if (monthsToGoal === 0) {
    estimatedDate = 'Goal already reached';
  } else if (monthsToGoal === -1) {
    estimatedDate = 'Not reachable with current savings rate';
  } else {
    const now = new Date();
    const targetDate = new Date(now.getFullYear(), now.getMonth() + monthsToGoal, 1);
    const monthNames = ['January', 'February', 'March', 'April', 'May', 'June',
      'July', 'August', 'September', 'October', 'November', 'December'];
    estimatedDate = `${monthNames[targetDate.getMonth()]} ${targetDate.getFullYear()}`;
  }

  // PMI impact: if down payment < 20%, estimate annual PMI at 0.5-1% of loan amount
  let pmiImpact = 0;
  if (downPaymentPercent < 0.20 && homePrice > 0) {
    const loanAmount = homePrice - downPaymentAmount;
    // Average PMI rate ~0.7% annually
    pmiImpact = parseFloat((loanAmount * 0.007 / 12).toFixed(2));
  }

  // Build savings projection chart data
  const savingsProjection: { month: number; balance: number; target: number }[] = [];
  const projectionMonths = monthsToGoal > 0 ? Math.min(monthsToGoal + 12, 600) : 120;
  let balance = currentSavings;
  savingsProjection.push({
    month: 0,
    balance: parseFloat(balance.toFixed(2)),
    target: downPaymentAmount,
  });

  for (let m = 1; m <= projectionMonths; m++) {
    if (monthlyRate > 0) {
      balance = balance * (1 + monthlyRate) + monthlySavings;
    } else {
      balance = balance + monthlySavings;
    }
    // Sample every month for short projections, every 3 months for longer ones
    if (projectionMonths <= 60 || m % 3 === 0 || m === projectionMonths || m === monthsToGoal) {
      savingsProjection.push({
        month: m,
        balance: parseFloat(balance.toFixed(2)),
        target: downPaymentAmount,
      });
    }
  }

  // Summary
  const loanAmount = homePrice - downPaymentAmount;
  const summary: { label: string; value: number | string; format?: string }[] = [
    { label: 'Home Price', value: parseFloat(homePrice.toFixed(2)), format: 'currency' },
    { label: 'Down Payment Required', value: downPaymentAmount, format: 'currency' },
    { label: 'Down Payment Percentage', value: `${(downPaymentPercent * 100).toFixed(1)}%` },
    { label: 'Current Savings', value: parseFloat(currentSavings.toFixed(2)), format: 'currency' },
    { label: 'Amount Still Needed', value: amountStillNeeded, format: 'currency' },
    { label: 'Loan Amount', value: parseFloat(loanAmount.toFixed(2)), format: 'currency' },
  ];

  if (monthsToGoal > 0) {
    summary.push({ label: 'Months to Goal', value: monthsToGoal });
    summary.push({ label: 'Estimated Date', value: estimatedDate });
  }

  if (pmiImpact > 0) {
    summary.push({ label: 'Estimated Monthly PMI', value: pmiImpact, format: 'currency' });
  }

  return {
    downPaymentAmount,
    amountStillNeeded,
    monthsToGoal: monthsToGoal === -1 ? 0 : monthsToGoal,
    estimatedDate,
    pmiImpact,
    summary,
    savingsProjection,
  };
}

/** @formulaRegistry */
export const FORMULA_REGISTRY: Record<string, (inputs: Record<string, unknown>) => Record<string, unknown>> = {
  'down-payment': calculateDownPayment,
};
