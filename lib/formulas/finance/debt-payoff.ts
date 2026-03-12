/**
 * Debt Payoff Calculator — Snowball vs Avalanche Method
 *
 * Iterates monthly: applies minimum payment to all debts, then applies extra
 * payment to the target debt (avalanche = highest rate first; snowball = lowest
 * balance first). When a debt is paid off, its minimum rolls into the extra
 * payment pool for the next target.
 *
 * Source: Consumer Financial Protection Bureau (CFPB) debt management guidelines
 */

interface DebtInput {
  name: string;
  balance: number;
  rate: number;     // annual rate as decimal (already divided by 100)
  minPayment: number;
}

interface DebtTimelinePoint {
  month: number;
  [debtName: string]: number;
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
  payoffOrder: PayoffOrderRow[];
  timeline: DebtTimelinePoint[];
} {
  // Deep clone debts so we don't mutate originals
  const debts = debtsInput.map(d => ({
    ...d,
    interestAccumulated: 0,
    paidOff: false,
    payoffMonth: 0,
  }));

  const timeline: DebtTimelinePoint[] = [];
  const payoffOrder: PayoffOrderRow[] = [];

  // Record initial balances
  const initialPoint: DebtTimelinePoint = { month: 0 };
  for (const d of debts) {
    initialPoint[d.name] = parseFloat(d.balance.toFixed(2));
  }
  timeline.push(initialPoint);

  let month = 0;
  const maxMonths = 600; // 50-year cap to prevent infinite loops

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

    // Step 3: Find target debt for extra payment
    const activeDebts = debts.filter(d => !d.paidOff);
    if (activeDebts.length === 0) {
      // Record final point
      const point: DebtTimelinePoint = { month };
      for (const d of debts) {
        point[d.name] = 0;
      }
      timeline.push(point);
      break;
    }

    // Sort active debts by strategy to determine target
    let target: typeof activeDebts[0];
    if (strategy === 'avalanche') {
      // Highest rate first
      activeDebts.sort((a, b) => b.rate - a.rate || a.balance - b.balance);
    } else {
      // Lowest balance first
      activeDebts.sort((a, b) => a.balance - b.balance || b.rate - a.rate);
    }
    target = activeDebts[0];

    // Step 4: Apply extra payment + freed-up minimums to target
    let extraPool = extraMonthly + freedUpPayment;

    // Apply to target, overflow to next target if it pays off
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
        // Roll this debt's minimum into extra pool for subsequent iterations
        extraPool += candidate.minPayment;
      }
    }

    // Record timeline point
    const point: DebtTimelinePoint = { month };
    for (const d of debts) {
      point[d.name] = parseFloat(d.balance.toFixed(2));
    }
    timeline.push(point);
  }

  const totalInterestPaid = debts.reduce((sum, d) => sum + d.interestAccumulated, 0);
  // Deduplicate payoff order (a debt could appear twice if paid off in both min and extra phases)
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
    payoffOrder: uniquePayoffOrder,
    timeline,
  };
}

export function calculateDebtPayoff(inputs: Record<string, unknown>): Record<string, unknown> {
  const debts = parseDebts(inputs);
  const extraMonthlyPayment = Number(inputs.extraMonthlyPayment) || 0;
  const strategy = String(inputs.strategy || 'avalanche') as 'avalanche' | 'snowball';

  if (debts.length === 0) {
    return {
      totalMonths: 0,
      totalInterestPaid: 0,
      payoffDate: 'No debts entered',
      interestSaved: 0,
      summary: [],
      debtPayoffTimeline: [],
      payoffOrder: [],
    };
  }

  // Run with chosen strategy + extra payment
  const result = runPayoff(debts, extraMonthlyPayment, strategy);

  // Run minimum-only scenario for comparison (interestSaved calculation)
  const minimumOnly = runPayoff(parseDebts(inputs), 0, strategy);

  const interestSaved = parseFloat((minimumOnly.totalInterestPaid - result.totalInterestPaid).toFixed(2));

  // Format payoff date
  const years = Math.floor(result.totalMonths / 12);
  const remainingMonths = result.totalMonths % 12;
  let payoffDate: string;
  if (result.totalMonths === 0) {
    payoffDate = 'Already paid off';
  } else if (years === 0) {
    payoffDate = `${remainingMonths} month${remainingMonths !== 1 ? 's' : ''}`;
  } else if (remainingMonths === 0) {
    payoffDate = `${years} year${years !== 1 ? 's' : ''}`;
  } else {
    payoffDate = `${years} year${years !== 1 ? 's' : ''}, ${remainingMonths} month${remainingMonths !== 1 ? 's' : ''}`;
  }

  const totalBalance = debts.reduce((sum, d) => sum + d.balance, 0);

  // Summary value group
  const summary: { label: string; value: number | string }[] = [
    { label: 'Total Debt', value: parseFloat(totalBalance.toFixed(2)) },
    { label: 'Strategy', value: strategy === 'avalanche' ? 'Avalanche (highest rate first)' : 'Snowball (lowest balance first)' },
    { label: 'Extra Monthly Payment', value: parseFloat(extraMonthlyPayment.toFixed(2)) },
    { label: 'Total Months to Payoff', value: result.totalMonths },
    { label: 'Total Interest Paid', value: parseFloat(result.totalInterestPaid.toFixed(2)) },
    { label: 'Interest Saved vs. Minimums Only', value: interestSaved },
    { label: 'Months Without Extra', value: minimumOnly.totalMonths },
  ];

  return {
    totalMonths: result.totalMonths,
    totalInterestPaid: result.totalInterestPaid,
    payoffDate,
    interestSaved,
    summary,
    debtPayoffTimeline: result.timeline,
    payoffOrder: result.payoffOrder,
  };
}

/** @formulaRegistry */
export const FORMULA_REGISTRY: Record<string, (inputs: Record<string, unknown>) => Record<string, unknown>> = {
  'debt-payoff': calculateDebtPayoff,
};
