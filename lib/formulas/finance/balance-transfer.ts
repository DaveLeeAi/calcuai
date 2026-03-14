/**
 * Balance Transfer Calculator
 *
 * Compares the total cost of keeping a credit card balance at the current APR
 * versus transferring it to a card with a promotional 0% (or low) APR period,
 * including the balance transfer fee.
 *
 * Current card payoff: iterative month-by-month at currentAPR with fixed payment.
 * Transfer payoff: promo period at promoAPR, then post-promo at postPromoAPR,
 *   with the transfer fee added to the balance upfront.
 *
 * Key formula (monthly interest):
 *   interest_i = balance_i × (APR / 12)
 *   principal_i = payment - interest_i
 *   balance_{i+1} = balance_i - principal_i
 *
 * Source: Consumer Financial Protection Bureau (CFPB) — credit card balance
 *         transfer disclosures and Truth in Lending Act (TILA) requirements.
 */

/**
 * Simulate month-by-month payoff at a given annual rate with fixed payment.
 * Returns { months, totalInterest, totalPaid } or -1 months if never pays off.
 * Caps at maxMonths to prevent infinite loops.
 */
function simulatePayoff(
  startBalance: number,
  annualRate: number,
  monthlyPayment: number,
  maxMonths: number = 360
): { months: number; totalInterest: number; totalPaid: number } {
  if (startBalance <= 0) {
    return { months: 0, totalInterest: 0, totalPaid: 0 };
  }
  if (monthlyPayment <= 0) {
    return { months: -1, totalInterest: 0, totalPaid: 0 };
  }

  const monthlyRate = annualRate / 100 / 12;

  // Check if payment covers monthly interest (non-zero rate)
  if (monthlyRate > 0 && monthlyPayment <= startBalance * monthlyRate) {
    return { months: -1, totalInterest: 0, totalPaid: 0 };
  }

  let balance = startBalance;
  let totalInterest = 0;
  let totalPaid = 0;
  let months = 0;

  while (balance > 0.01 && months < maxMonths) {
    months++;
    const interest = balance * monthlyRate;
    const payment = Math.min(monthlyPayment, balance + interest);
    const principal = payment - interest;
    balance = Math.max(0, balance - principal);
    totalInterest += interest;
    totalPaid += payment;
  }

  if (balance > 0.01) {
    return { months: -1, totalInterest: 0, totalPaid: 0 };
  }

  return {
    months,
    totalInterest: parseFloat(totalInterest.toFixed(2)),
    totalPaid: parseFloat(totalPaid.toFixed(2)),
  };
}

/**
 * Simulate a two-phase payoff: promo period at promoAPR, then post-promo at postPromoAPR.
 * Returns details about both phases and total cost.
 */
function simulateTransferPayoff(
  startBalance: number,
  promoAPR: number,
  promoMonths: number,
  postPromoAPR: number,
  monthlyPayment: number,
  maxMonths: number = 360
): {
  months: number;
  totalInterest: number;
  totalPaid: number;
  paidDuringPromo: number;
  remainingAfterPromo: number;
  promoInterest: number;
  postPromoInterest: number;
} {
  if (startBalance <= 0) {
    return {
      months: 0,
      totalInterest: 0,
      totalPaid: 0,
      paidDuringPromo: 0,
      remainingAfterPromo: 0,
      promoInterest: 0,
      postPromoInterest: 0,
    };
  }
  if (monthlyPayment <= 0) {
    return {
      months: -1,
      totalInterest: 0,
      totalPaid: 0,
      paidDuringPromo: 0,
      remainingAfterPromo: startBalance,
      promoInterest: 0,
      postPromoInterest: 0,
    };
  }

  const promoMonthlyRate = promoAPR / 100 / 12;
  let balance = startBalance;
  let totalInterest = 0;
  let promoInterest = 0;
  let totalPaid = 0;
  let months = 0;

  // Phase 1: Promo period
  const effectivePromoMonths = Math.max(0, Math.floor(promoMonths));
  for (let i = 0; i < effectivePromoMonths && balance > 0.01; i++) {
    months++;
    const interest = balance * promoMonthlyRate;
    const payment = Math.min(monthlyPayment, balance + interest);
    const principal = payment - interest;
    balance = Math.max(0, balance - principal);
    totalInterest += interest;
    promoInterest += interest;
    totalPaid += payment;
  }

  const paidDuringPromo = parseFloat((startBalance - balance).toFixed(2));
  const remainingAfterPromo = parseFloat(balance.toFixed(2));

  // Phase 2: Post-promo period
  if (balance > 0.01) {
    const postMonthlyRate = postPromoAPR / 100 / 12;

    // Check if payment covers post-promo interest
    if (postMonthlyRate > 0 && monthlyPayment <= balance * postMonthlyRate) {
      return {
        months: -1,
        totalInterest: 0,
        totalPaid: 0,
        paidDuringPromo,
        remainingAfterPromo,
        promoInterest: parseFloat(promoInterest.toFixed(2)),
        postPromoInterest: 0,
      };
    }

    let postPromoInterest = 0;
    while (balance > 0.01 && months < maxMonths) {
      months++;
      const interest = balance * postMonthlyRate;
      const payment = Math.min(monthlyPayment, balance + interest);
      const principal = payment - interest;
      balance = Math.max(0, balance - principal);
      totalInterest += interest;
      postPromoInterest += interest;
      totalPaid += payment;
    }

    if (balance > 0.01) {
      return {
        months: -1,
        totalInterest: 0,
        totalPaid: 0,
        paidDuringPromo,
        remainingAfterPromo,
        promoInterest: parseFloat(promoInterest.toFixed(2)),
        postPromoInterest: 0,
      };
    }

    return {
      months,
      totalInterest: parseFloat(totalInterest.toFixed(2)),
      totalPaid: parseFloat(totalPaid.toFixed(2)),
      paidDuringPromo,
      remainingAfterPromo,
      promoInterest: parseFloat(promoInterest.toFixed(2)),
      postPromoInterest: parseFloat(postPromoInterest.toFixed(2)),
    };
  }

  return {
    months,
    totalInterest: parseFloat(totalInterest.toFixed(2)),
    totalPaid: parseFloat(totalPaid.toFixed(2)),
    paidDuringPromo,
    remainingAfterPromo: 0,
    promoInterest: parseFloat(promoInterest.toFixed(2)),
    postPromoInterest: 0,
  };
}

export function calculateBalanceTransfer(inputs: Record<string, unknown>): Record<string, unknown> {
  const currentBalance = Number(inputs.currentBalance) || 0;
  const currentAPR = Number(inputs.currentAPR) || 0;
  const currentMonthlyPayment = Number(inputs.currentMonthlyPayment) || 0;
  const transferFeePercent = Number(inputs.transferFee) || 0;
  const promoAPR = Number(inputs.promoAPR) || 0;
  const promoMonths = Number(inputs.promoMonths) || 0;
  const postPromoAPR = Number(inputs.postPromoAPR) || 0;

  // Edge case: zero balance
  if (currentBalance <= 0) {
    return {
      transferFeeCost: 0,
      totalTransferred: 0,
      monthsToPayoff_current: 0,
      totalInterest_current: 0,
      totalCost_current: 0,
      monthsToPayoff_transfer: 0,
      totalInterest_transfer: 0,
      totalCost_transfer: 0,
      netSavings: 0,
      monthlySavings_promo: 0,
      breakEvenMonths: 0,
      paidDuringPromo: 0,
      remainingAfterPromo: 0,
      comparisonSummary: [
        { label: 'Current Card Total Cost', value: 0 },
        { label: 'Balance Transfer Total Cost', value: 0 },
        { label: 'Net Savings', value: 0 },
        { label: 'Transfer Fee', value: 0 },
      ],
    };
  }

  // Transfer fee calculation
  const transferFeeCost = parseFloat((currentBalance * (transferFeePercent / 100)).toFixed(2));
  const totalTransferred = parseFloat((currentBalance + transferFeeCost).toFixed(2));

  // Current card payoff simulation
  const currentResult = simulatePayoff(currentBalance, currentAPR, currentMonthlyPayment);
  const monthsToPayoff_current = currentResult.months;
  const totalInterest_current = currentResult.months === -1 ? 0 : currentResult.totalInterest;
  const totalCost_current = currentResult.months === -1
    ? 0
    : parseFloat((currentBalance + totalInterest_current).toFixed(2));

  // Transfer payoff simulation (starting from totalTransferred = balance + fee)
  const transferResult = simulateTransferPayoff(
    totalTransferred,
    promoAPR,
    promoMonths,
    postPromoAPR,
    currentMonthlyPayment
  );
  const monthsToPayoff_transfer = transferResult.months;
  const totalInterest_transfer = transferResult.months === -1 ? 0 : transferResult.totalInterest;
  const totalCost_transfer = transferResult.months === -1
    ? 0
    : parseFloat((totalTransferred + totalInterest_transfer).toFixed(2));

  // Net savings (positive = transfer is cheaper)
  let netSavings = 0;
  if (currentResult.months !== -1 && transferResult.months !== -1) {
    netSavings = parseFloat((totalCost_current - totalCost_transfer).toFixed(2));
  } else if (currentResult.months === -1 && transferResult.months !== -1) {
    // Current never pays off but transfer does — savings are effectively infinite, show transfer cost
    netSavings = parseFloat(totalCost_transfer.toFixed(2));
  }

  // Monthly savings during promo period (rough estimate: current monthly interest vs promo monthly interest)
  const currentMonthlyInterest = currentBalance * (currentAPR / 100 / 12);
  const promoMonthlyInterest = totalTransferred * (promoAPR / 100 / 12);
  const monthlySavings_promo = parseFloat((currentMonthlyInterest - promoMonthlyInterest).toFixed(2));

  // Break-even months: how many months until cumulative interest savings exceed the transfer fee
  let breakEvenMonths = 0;
  if (transferFeeCost > 0 && currentAPR > promoAPR) {
    const monthlySavingsRate = currentMonthlyInterest - promoMonthlyInterest;
    if (monthlySavingsRate > 0) {
      breakEvenMonths = Math.ceil(transferFeeCost / monthlySavingsRate);
    }
  }

  // Comparison summary value-group
  const comparisonSummary: { label: string; value: number | string }[] = [
    { label: 'Current Card Total Cost', value: totalCost_current },
    { label: 'Balance Transfer Total Cost', value: totalCost_transfer },
    { label: 'Net Savings', value: netSavings },
    { label: 'Transfer Fee', value: transferFeeCost },
  ];

  // Cost comparison chart — {name, value}[] for pie chart rendering
  const costComparisonChart = [
    { name: 'Current Card Total', value: totalCost_current },
    { name: 'Balance Transfer Total', value: totalCost_transfer },
  ].filter(item => item.value > 0);

  return {
    transferFeeCost,
    totalTransferred,
    monthsToPayoff_current,
    totalInterest_current,
    totalCost_current,
    monthsToPayoff_transfer,
    totalInterest_transfer,
    totalCost_transfer,
    netSavings,
    monthlySavings_promo,
    breakEvenMonths,
    paidDuringPromo: transferResult.paidDuringPromo,
    remainingAfterPromo: transferResult.remainingAfterPromo,
    comparisonSummary,
    costComparisonChart,
  };
}

/** @formulaRegistry */
export const FORMULA_REGISTRY: Record<string, (inputs: Record<string, unknown>) => Record<string, unknown>> = {
  'balance-transfer': calculateBalanceTransfer,
};
