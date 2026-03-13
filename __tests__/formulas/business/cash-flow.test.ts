import { calculateCashFlow } from '@/lib/formulas/business/cash-flow';

describe('calculateCashFlow', () => {
  // ─── Test 1: Basic operating cash flow ───
  it('calculates operating cash flow with default-like values', () => {
    const result = calculateCashFlow({
      revenue: 500000,
      netIncome: 75000,
      depreciation: 15000,
      workingCapitalChange: -5000,
      capitalExpenditures: 25000,
      financingActivities: 0,
      beginningCash: 50000,
    });
    // OCF = 75000 + 15000 - (-5000) = 95000
    expect(result.operatingCashFlow).toBe(95000);
  });

  // ─── Test 2: Free cash flow ───
  it('calculates free cash flow correctly', () => {
    const result = calculateCashFlow({
      revenue: 500000,
      netIncome: 75000,
      depreciation: 15000,
      workingCapitalChange: -5000,
      capitalExpenditures: 25000,
      financingActivities: 0,
      beginningCash: 50000,
    });
    // FCF = 95000 - 25000 = 70000
    expect(result.freeCashFlow).toBe(70000);
  });

  // ─── Test 3: Cash flow margin ───
  it('calculates cash flow margin as percentage', () => {
    const result = calculateCashFlow({
      revenue: 500000,
      netIncome: 75000,
      depreciation: 15000,
      workingCapitalChange: -5000,
      capitalExpenditures: 25000,
      financingActivities: 0,
      beginningCash: 50000,
    });
    // Margin = (95000 / 500000) x 100 = 19%
    expect(result.cashFlowMargin).toBe(19);
  });

  // ─── Test 4: Net cash position ───
  it('calculates net cash position correctly', () => {
    const result = calculateCashFlow({
      revenue: 500000,
      netIncome: 75000,
      depreciation: 15000,
      workingCapitalChange: -5000,
      capitalExpenditures: 25000,
      financingActivities: 0,
      beginningCash: 50000,
    });
    // Net Cash = 50000 + 95000 - 25000 + 0 = 120000
    expect(result.netCashPosition).toBe(120000);
  });

  // ─── Test 5: Positive working capital change reduces OCF ───
  it('subtracts positive working capital change from OCF', () => {
    const result = calculateCashFlow({
      revenue: 200000,
      netIncome: 40000,
      depreciation: 10000,
      workingCapitalChange: 8000,
      capitalExpenditures: 5000,
      financingActivities: 0,
      beginningCash: 20000,
    });
    // OCF = 40000 + 10000 - 8000 = 42000
    expect(result.operatingCashFlow).toBe(42000);
  });

  // ─── Test 6: Financing activities affect net cash position ───
  it('includes financing activities in net cash position', () => {
    const result = calculateCashFlow({
      revenue: 300000,
      netIncome: 50000,
      depreciation: 10000,
      workingCapitalChange: 0,
      capitalExpenditures: 20000,
      financingActivities: -15000,
      beginningCash: 40000,
    });
    // OCF = 50000 + 10000 - 0 = 60000
    // Net Cash = 40000 + 60000 - 20000 + (-15000) = 65000
    expect(result.netCashPosition).toBe(65000);
  });

  // ─── Test 7: Zero revenue gives zero margin ───
  it('returns 0 cash flow margin when revenue is zero', () => {
    const result = calculateCashFlow({
      revenue: 0,
      netIncome: 10000,
      depreciation: 5000,
      workingCapitalChange: 0,
      capitalExpenditures: 0,
      financingActivities: 0,
      beginningCash: 0,
    });
    expect(result.cashFlowMargin).toBe(0);
  });

  // ─── Test 8: Negative net income ───
  it('handles negative net income (net loss)', () => {
    const result = calculateCashFlow({
      revenue: 100000,
      netIncome: -20000,
      depreciation: 10000,
      workingCapitalChange: 0,
      capitalExpenditures: 5000,
      financingActivities: 0,
      beginningCash: 30000,
    });
    // OCF = -20000 + 10000 - 0 = -10000
    expect(result.operatingCashFlow).toBe(-10000);
    // FCF = -10000 - 5000 = -15000
    expect(result.freeCashFlow).toBe(-15000);
  });

  // ─── Test 9: All zeros ───
  it('handles all zero inputs', () => {
    const result = calculateCashFlow({
      revenue: 0,
      netIncome: 0,
      depreciation: 0,
      workingCapitalChange: 0,
      capitalExpenditures: 0,
      financingActivities: 0,
      beginningCash: 0,
    });
    expect(result.operatingCashFlow).toBe(0);
    expect(result.freeCashFlow).toBe(0);
    expect(result.cashFlowMargin).toBe(0);
    expect(result.netCashPosition).toBe(0);
  });

  // ─── Test 10: Missing inputs default to zero ───
  it('defaults missing inputs to safe values', () => {
    const result = calculateCashFlow({});
    expect(result.operatingCashFlow).toBe(0);
    expect(result.freeCashFlow).toBe(0);
    expect(result.cashFlowMargin).toBe(0);
    expect(result.netCashPosition).toBe(0);
  });

  // ─── Test 11: String input coercion ───
  it('coerces string inputs to numbers', () => {
    const result = calculateCashFlow({
      revenue: '200000',
      netIncome: '30000',
      depreciation: '5000',
      workingCapitalChange: '2000',
      capitalExpenditures: '10000',
      financingActivities: '0',
      beginningCash: '25000',
    });
    // OCF = 30000 + 5000 - 2000 = 33000
    expect(result.operatingCashFlow).toBe(33000);
    // FCF = 33000 - 10000 = 23000
    expect(result.freeCashFlow).toBe(23000);
  });

  // ─── Test 12: Large values ───
  it('handles large revenue values', () => {
    const result = calculateCashFlow({
      revenue: 10000000,
      netIncome: 1500000,
      depreciation: 300000,
      workingCapitalChange: -100000,
      capitalExpenditures: 500000,
      financingActivities: -200000,
      beginningCash: 2000000,
    });
    // OCF = 1500000 + 300000 - (-100000) = 1900000
    expect(result.operatingCashFlow).toBe(1900000);
    // FCF = 1900000 - 500000 = 1400000
    expect(result.freeCashFlow).toBe(1400000);
    // Net Cash = 2000000 + 1900000 - 500000 + (-200000) = 3200000
    expect(result.netCashPosition).toBe(3200000);
  });

  // ─── Test 13: Negative cash flow margin ───
  it('calculates negative cash flow margin correctly', () => {
    const result = calculateCashFlow({
      revenue: 100000,
      netIncome: -30000,
      depreciation: 5000,
      workingCapitalChange: 0,
      capitalExpenditures: 0,
      financingActivities: 0,
      beginningCash: 0,
    });
    // OCF = -30000 + 5000 = -25000
    // Margin = (-25000 / 100000) x 100 = -25%
    expect(result.cashFlowMargin).toBe(-25);
  });

  // ─── Test 14: Negative working capital change (cash inflow) ───
  it('treats negative working capital change as cash inflow', () => {
    const result = calculateCashFlow({
      revenue: 500000,
      netIncome: 50000,
      depreciation: 10000,
      workingCapitalChange: -20000,
      capitalExpenditures: 0,
      financingActivities: 0,
      beginningCash: 0,
    });
    // OCF = 50000 + 10000 - (-20000) = 80000
    expect(result.operatingCashFlow).toBe(80000);
  });

  // ─── Test 15: High capex exceeds OCF ───
  it('produces negative free cash flow when capex exceeds OCF', () => {
    const result = calculateCashFlow({
      revenue: 300000,
      netIncome: 20000,
      depreciation: 5000,
      workingCapitalChange: 0,
      capitalExpenditures: 50000,
      financingActivities: 0,
      beginningCash: 100000,
    });
    // OCF = 20000 + 5000 = 25000
    // FCF = 25000 - 50000 = -25000
    expect(result.freeCashFlow).toBe(-25000);
  });

  // ─── Test 16: Negative revenue coerced to zero ───
  it('coerces negative revenue to zero', () => {
    const result = calculateCashFlow({
      revenue: -100000,
      netIncome: 10000,
      depreciation: 5000,
      workingCapitalChange: 0,
      capitalExpenditures: 0,
      financingActivities: 0,
      beginningCash: 0,
    });
    // Revenue forced to 0, so margin = 0
    expect(result.cashFlowMargin).toBe(0);
    // OCF still calculates from net income
    expect(result.operatingCashFlow).toBe(15000);
  });

  // ─── Test 17: Positive financing (debt proceeds) ───
  it('adds positive financing activities to net cash', () => {
    const result = calculateCashFlow({
      revenue: 200000,
      netIncome: 30000,
      depreciation: 5000,
      workingCapitalChange: 0,
      capitalExpenditures: 10000,
      financingActivities: 50000,
      beginningCash: 10000,
    });
    // OCF = 30000 + 5000 = 35000
    // Net Cash = 10000 + 35000 - 10000 + 50000 = 85000
    expect(result.netCashPosition).toBe(85000);
  });

  // ─── Test 18: Fractional values round to 2 decimals ───
  it('rounds fractional results to 2 decimal places', () => {
    const result = calculateCashFlow({
      revenue: 300000,
      netIncome: 33333,
      depreciation: 6667,
      workingCapitalChange: 0,
      capitalExpenditures: 11111,
      financingActivities: 0,
      beginningCash: 0,
    });
    // OCF = 33333 + 6667 = 40000
    // FCF = 40000 - 11111 = 28889
    // Margin = 40000/300000 * 100 = 13.333...
    expect(result.cashFlowMargin).toBe(13.33);
  });

  // ─── Test 19: Summary contains expected labels ───
  it('returns summary with expected labels', () => {
    const result = calculateCashFlow({
      revenue: 500000,
      netIncome: 75000,
      depreciation: 15000,
      workingCapitalChange: 0,
      capitalExpenditures: 25000,
      financingActivities: 0,
      beginningCash: 50000,
    });
    const summary = result.summary as { label: string; value: number | string }[];
    const labels = summary.map((s) => s.label);
    expect(labels).toContain('Operating Cash Flow');
    expect(labels).toContain('Free Cash Flow');
    expect(labels).toContain('Cash Flow Margin');
    expect(labels).toContain('Net Cash Position');
    expect(labels).toContain('Beginning Cash');
    expect(labels).toContain('Capital Expenditures');
  });

  // ─── Test 20: All output fields present ───
  it('returns all expected output fields', () => {
    const result = calculateCashFlow({
      revenue: 500000,
      netIncome: 75000,
      depreciation: 15000,
      workingCapitalChange: 0,
      capitalExpenditures: 25000,
      financingActivities: 0,
      beginningCash: 50000,
    });
    expect(result).toHaveProperty('operatingCashFlow');
    expect(result).toHaveProperty('freeCashFlow');
    expect(result).toHaveProperty('cashFlowMargin');
    expect(result).toHaveProperty('netCashPosition');
    expect(result).toHaveProperty('summary');
  });

  // ─── Test 21: Zero depreciation ───
  it('handles zero depreciation', () => {
    const result = calculateCashFlow({
      revenue: 200000,
      netIncome: 40000,
      depreciation: 0,
      workingCapitalChange: 0,
      capitalExpenditures: 10000,
      financingActivities: 0,
      beginningCash: 0,
    });
    // OCF = 40000 + 0 - 0 = 40000
    expect(result.operatingCashFlow).toBe(40000);
  });

  // ─── Test 22: Heavy cash burn scenario ───
  it('shows negative net cash position in cash burn scenario', () => {
    const result = calculateCashFlow({
      revenue: 50000,
      netIncome: -80000,
      depreciation: 5000,
      workingCapitalChange: 10000,
      capitalExpenditures: 20000,
      financingActivities: -5000,
      beginningCash: 30000,
    });
    // OCF = -80000 + 5000 - 10000 = -85000
    expect(result.operatingCashFlow).toBe(-85000);
    // FCF = -85000 - 20000 = -105000
    expect(result.freeCashFlow).toBe(-105000);
    // Net Cash = 30000 + (-85000) - 20000 + (-5000) = -80000
    expect(result.netCashPosition).toBe(-80000);
  });

  // ─── Test 23: Negative capex coerced to zero ───
  it('coerces negative capital expenditures to zero', () => {
    const result = calculateCashFlow({
      revenue: 100000,
      netIncome: 20000,
      depreciation: 5000,
      workingCapitalChange: 0,
      capitalExpenditures: -10000,
      financingActivities: 0,
      beginningCash: 0,
    });
    // CapEx forced to 0
    // OCF = 20000 + 5000 = 25000
    // FCF = 25000 - 0 = 25000
    expect(result.freeCashFlow).toBe(25000);
  });

  // ─── Test 24: Cash flow margin precision ───
  it('calculates margin with decimal precision', () => {
    const result = calculateCashFlow({
      revenue: 750000,
      netIncome: 100000,
      depreciation: 20000,
      workingCapitalChange: 5000,
      capitalExpenditures: 0,
      financingActivities: 0,
      beginningCash: 0,
    });
    // OCF = 100000 + 20000 - 5000 = 115000
    // Margin = (115000 / 750000) x 100 = 15.333...
    expect(result.cashFlowMargin).toBe(15.33);
  });
});
