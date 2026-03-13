/**
 * Debt Avalanche Calculator — Highest Interest Rate First
 *
 * Iterates monthly: applies minimum payment to all debts, then applies extra
 * payment to the HIGHEST INTEREST RATE first. When a debt is paid off, its
 * minimum payment rolls into the extra payment pool for the next highest rate.
 *
 * Also runs the snowball method on the same inputs for comparison.
 *
 * Source: Harvard Business Review — The Mathematics of Debt Repayment;
 *         Experian Debt Payoff Analysis
 */

interface DebtInput {
  name: string;
  balance: number;
  rate: number;       // annual rate as decimal (already divided by 100)
  minPayment: number;
}

interface PayoffOrderRow {
  debtName: string;
  payoffMonth: number;
  interestPaid: number;
}

function parseDebts(inputs: Record<string, unknown>): DebtInput[] {
  const debts: DebtInput[] = [];
  for (let i = 1; i <= 5; i++) {
    const balance = Number(inputs[`debt${i}Balance`]) || 0;
    if (balance > 0) {
      debts.push({
        name: String(inputs[`debt${i}Name`] || `Debt ${i}`),
        balance,
        rate: (Number(inputs[`debt${i}Rate`]) || 0) / 100,
        minPayment: Number(inputs[`debt${i}MinPayment`]) || 0,
      });
    }
  }
  return debts;
}

function runPayoff(
  debtsInput: DebtInput[],
  extraMonthly: number,
  strategy: 'avalanche' | 'snowball'
): {
  totalMonths: number;
  totalInterestPaid: number;
  totalPaid: number;
  payoffOrder: PayoffOrderRow[];
} {
  const debts = debtsInput.map(d => ({
    ...d,
    interestAccumulated: 0,
    paidOff: false,
    payoffMonth: 0,
  }));

  const payoffOrder: PayoffOrderRow[] = [];
  const totalPrincipal = debts.reduce((sum, d) => sum + d.balance, 0);

  let month = 0;
  const maxMonths = 600; // 50-year cap

  while (debts.some(d => !d.paidOff) && month < maxMonths) {
    month++;

    // Step 1: Accrue interest on all active debts
    for (const d of debts) {
      if (!d.paidOff) {
        const monthlyInterest = d.balance * (d.rate / 12);
        d.balance += monthlyInterest;
        d.interestAccumulated += monthlyInterest;
      }
    }

    // Step 2: Apply minimum payments to all active debts
    let freedUpPayment = 0;
    for (const d of debts) {
      if (!d.paidOff) {
        const payment = Math.min(d.minPayment, d.balance);
        d.balance -= payment;
        if (d.balance <= 0.005) {
          freedUpPayment += d.minPayment - payment;
          d.balance = 0;
          d.paidOff = true;
          d.payoffMonth = month;
          payoffOrder.push({
            debtName: d.name,
            payoffMonth: month,
            interestPaid: parseFloat(d.interestAccumulated.toFixed(2)),
          });
        }
      }
    }

    // Step 3: Sort active debts by strategy to determine target
    const activeDebts = debts.filter(d => !d.paidOff);
    if (activeDebts.length === 0) break;

    if (strategy === 'avalanche') {
      activeDebts.sort((a, b) => b.rate - a.rate || a.balance - b.balance);
    } else {
      activeDebts.sort((a, b) => a.balance - b.balance || b.rate - a.rate);
    }

    // Step 4: Apply extra payment + freed-up minimums to targets
    let extraPool = extraMonthly + freedUpPayment;

    for (const candidate of activeDebts) {
      if (extraPool <= 0) break;
      const payment = Math.min(extraPool, candidate.balance);
      candidate.balance -= payment;
      extraPool -= payment;
      if (candidate.balance <= 0.005) {
        candidate.balance = 0;
        candidate.paidOff = true;
        candidate.payoffMonth = month;
        payoffOrder.push({
          debtName: candidate.name,
          payoffMonth: month,
          interestPaid: parseFloat(candidate.interestAccumulated.toFixed(2)),
        });
        extraPool += candidate.minPayment;
      }
    }
  }

  const totalInterestPaid = debts.reduce((sum, d) => sum + d.interestAccumulated, 0);

  // Deduplicate payoff order
  const uniquePayoffOrder: PayoffOrderRow[] = [];
  const seen = new Set<string>();
  for (const row of payoffOrder) {
    if (!seen.has(row.debtName)) {
      seen.add(row.debtName);
      uniquePayoffOrder.push(row);
    }
  }

  return {
    totalMonths: month,
    totalInterestPaid: parseFloat(totalInterestPaid.toFixed(2)),
    totalPaid: parseFloat((totalPrincipal + totalInterestPaid).toFixed(2)),
    payoffOrder: uniquePayoffOrder,
  };
}

export function calculateDebtAvalanche(inputs: Record<string, unknown>): Record<string, unknown> {
  const debts = parseDebts(inputs);
  const extraPayment = Number(inputs.extraPayment) || 0;

  if (debts.length === 0) {
    return {
      totalDebt: 0,
      totalMinPayment: 0,
      monthsToPayoff: 0,
      yearsToPayoff: 0,
      totalInterestPaid: 0,
      totalPaid: 0,
      interestSaved: 0,
      timeSaved: 0,
      payoffOrder: [],
      debtSummary: [],
      summary: [],
    };
  }

  const totalDebt = debts.reduce((sum, d) => sum + d.balance, 0);
  const totalMinPayment = debts.reduce((sum, d) => sum + d.minPayment, 0);

  // Run avalanche with extra payment
  const avalanche = runPayoff(debts, extraPayment, 'avalanche');

  // Run minimum-only for comparison (avalanche order, no extra)
  const minimumOnly = runPayoff(parseDebts(inputs), 0, 'avalanche');

  // Run snowball for cross-method comparison
  const snowball = runPayoff(parseDebts(inputs), extraPayment, 'snowball');

  const interestSaved = parseFloat((minimumOnly.totalInterestPaid - avalanche.totalInterestPaid).toFixed(2));
  const timeSaved = minimumOnly.totalMonths - avalanche.totalMonths;

  const vsSnowballInterestSaved = parseFloat((snowball.totalInterestPaid - avalanche.totalInterestPaid).toFixed(2));
  const vsSnowballTimeDifference = snowball.totalMonths - avalanche.totalMonths;

  // Payoff order as value-group
  const payoffOrder: { label: string; value: number | string }[] = avalanche.payoffOrder.map((row, idx) => ({
    label: `${ordinal(idx + 1)}: ${row.debtName}`,
    value: `Month ${row.payoffMonth} ($${row.interestPaid.toLocaleString()} interest)`,
  }));

  // Debt summary as value-group
  const debtSummary: { label: string; value: number | string }[] = avalanche.payoffOrder.map(row => ({
    label: row.debtName,
    value: `Paid off in ${row.payoffMonth} months`,
  }));

  // Full summary
  const summary: { label: string; value: number | string }[] = [
    { label: 'Total Debt', value: parseFloat(totalDebt.toFixed(2)) },
    { label: 'Total Minimum Payments', value: parseFloat(totalMinPayment.toFixed(2)) },
    { label: 'Extra Monthly Payment', value: extraPayment },
    { label: 'Total Monthly Payment', value: parseFloat((totalMinPayment + extraPayment).toFixed(2)) },
    { label: 'Months to Payoff (Avalanche)', value: avalanche.totalMonths },
    { label: 'Total Interest Paid', value: avalanche.totalInterestPaid },
    { label: 'Interest Saved vs. Minimums Only', value: interestSaved },
    { label: 'Time Saved vs. Minimums Only', value: `${timeSaved} months` },
    { label: 'Months Without Extra Payment', value: minimumOnly.totalMonths },
    { label: 'Snowball Method Would Take', value: `${snowball.totalMonths} months` },
    { label: 'Interest Saved vs. Snowball', value: vsSnowballInterestSaved },
  ];

  return {
    totalDebt: parseFloat(totalDebt.toFixed(2)),
    totalMinPayment: parseFloat(totalMinPayment.toFixed(2)),
    monthsToPayoff: avalanche.totalMonths,
    yearsToPayoff: parseFloat((avalanche.totalMonths / 12).toFixed(1)),
    totalInterestPaid: avalanche.totalInterestPaid,
    totalPaid: avalanche.totalPaid,
    interestSaved,
    timeSaved,
    payoffOrder,
    debtSummary,
    summary,
    snowballMonths: snowball.totalMonths,
    snowballInterestPaid: snowball.totalInterestPaid,
    vsSnowballInterestSaved,
    vsSnowballTimeDifference,
  };
}

function ordinal(n: number): string {
  const s = ['th', 'st', 'nd', 'rd'];
  const v = n % 100;
  return n + (s[(v - 20) % 10] || s[v] || s[0]);
}

/** @formulaRegistry */
export const FORMULA_REGISTRY: Record<string, (inputs: Record<string, unknown>) => Record<string, unknown>> = {
  'debt-avalanche': calculateDebtAvalanche,
};
