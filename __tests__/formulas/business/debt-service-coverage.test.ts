import { calculateDebtServiceCoverage } from '@/lib/formulas/business/debt-service-coverage';

describe('calculateDebtServiceCoverage', () => {
  // ─── Test 1: Basic DSCR with defaults ───
  it('calculates DSCR with default-like values', () => {
    const result = calculateDebtServiceCoverage({
      netOperatingIncome: 120000,
      annualDebtService: 80000,
      requiredDSCR: 1.25,
    });
    // DSCR = 120000 / 80000 = 1.5
    expect(result.dscr).toBe(1.5);
  });

  // ─── Test 2: Excess cash flow ───
  it('calculates excess cash flow correctly', () => {
    const result = calculateDebtServiceCoverage({
      netOperatingIncome: 120000,
      annualDebtService: 80000,
      requiredDSCR: 1.25,
    });
    // Excess = 120000 - 80000 = 40000
    expect(result.excessCashFlow).toBe(40000);
  });

  // ─── Test 3: Maximum loan payment ───
  it('calculates max loan payment at required DSCR', () => {
    const result = calculateDebtServiceCoverage({
      netOperatingIncome: 120000,
      annualDebtService: 80000,
      requiredDSCR: 1.25,
    });
    // Max Payment = 120000 / 1.25 = 96000
    expect(result.maxLoanPayment).toBe(96000);
  });

  // ─── Test 4: Qualifies when DSCR >= required ───
  it('returns Qualifies when DSCR meets requirement', () => {
    const result = calculateDebtServiceCoverage({
      netOperatingIncome: 150000,
      annualDebtService: 100000,
      requiredDSCR: 1.25,
    });
    // DSCR = 1.5 >= 1.25
    expect(result.qualificationStatus).toBe('Qualifies');
  });

  // ─── Test 5: Borderline when 1.0 <= DSCR < required ───
  it('returns Borderline when DSCR is between 1.0 and required', () => {
    const result = calculateDebtServiceCoverage({
      netOperatingIncome: 110000,
      annualDebtService: 100000,
      requiredDSCR: 1.25,
    });
    // DSCR = 1.1, which is >= 1.0 but < 1.25
    expect(result.qualificationStatus).toBe('Borderline');
  });

  // ─── Test 6: Does Not Qualify when DSCR < 1.0 ───
  it('returns Does Not Qualify when DSCR < 1.0', () => {
    const result = calculateDebtServiceCoverage({
      netOperatingIncome: 70000,
      annualDebtService: 100000,
      requiredDSCR: 1.25,
    });
    // DSCR = 0.7
    expect(result.qualificationStatus).toBe('Does Not Qualify');
  });

  // ─── Test 7: Exactly at required DSCR ───
  it('qualifies when DSCR exactly equals required', () => {
    const result = calculateDebtServiceCoverage({
      netOperatingIncome: 125000,
      annualDebtService: 100000,
      requiredDSCR: 1.25,
    });
    // DSCR = 1.25 = required
    expect(result.dscr).toBe(1.25);
    expect(result.qualificationStatus).toBe('Qualifies');
  });

  // ─── Test 8: Exactly 1.0 DSCR is Borderline ───
  it('returns Borderline when DSCR is exactly 1.0', () => {
    const result = calculateDebtServiceCoverage({
      netOperatingIncome: 100000,
      annualDebtService: 100000,
      requiredDSCR: 1.25,
    });
    expect(result.dscr).toBe(1);
    expect(result.qualificationStatus).toBe('Borderline');
  });

  // ─── Test 9: Zero debt service ───
  it('returns 0 DSCR when debt service is zero', () => {
    const result = calculateDebtServiceCoverage({
      netOperatingIncome: 120000,
      annualDebtService: 0,
      requiredDSCR: 1.25,
    });
    expect(result.dscr).toBe(0);
  });

  // ─── Test 10: Negative excess cash flow ───
  it('returns negative excess cash flow when debt exceeds NOI', () => {
    const result = calculateDebtServiceCoverage({
      netOperatingIncome: 80000,
      annualDebtService: 120000,
      requiredDSCR: 1.25,
    });
    // Excess = 80000 - 120000 = -40000
    expect(result.excessCashFlow).toBe(-40000);
  });

  // ─── Test 11: Missing inputs default to zero ───
  it('defaults missing inputs to safe values', () => {
    const result = calculateDebtServiceCoverage({});
    expect(result.dscr).toBe(0);
    expect(result.excessCashFlow).toBe(0);
    expect(result.maxLoanPayment).toBe(0);
  });

  // ─── Test 12: String input coercion ───
  it('coerces string inputs to numbers', () => {
    const result = calculateDebtServiceCoverage({
      netOperatingIncome: '150000',
      annualDebtService: '100000',
      requiredDSCR: '1.25',
    });
    expect(result.dscr).toBe(1.5);
    expect(result.excessCashFlow).toBe(50000);
  });

  // ─── Test 13: High DSCR ───
  it('calculates high DSCR correctly', () => {
    const result = calculateDebtServiceCoverage({
      netOperatingIncome: 500000,
      annualDebtService: 100000,
      requiredDSCR: 1.25,
    });
    // DSCR = 5.0
    expect(result.dscr).toBe(5);
    expect(result.qualificationStatus).toBe('Qualifies');
  });

  // ─── Test 14: Required DSCR clamped to min 1.0 ───
  it('clamps required DSCR minimum to 1.0', () => {
    const result = calculateDebtServiceCoverage({
      netOperatingIncome: 100000,
      annualDebtService: 80000,
      requiredDSCR: 0.5,
    });
    // Required clamped to 1.0, Max = 100000 / 1.0 = 100000
    expect(result.maxLoanPayment).toBe(100000);
  });

  // ─── Test 15: Required DSCR clamped to max 3.0 ───
  it('clamps required DSCR maximum to 3.0', () => {
    const result = calculateDebtServiceCoverage({
      netOperatingIncome: 300000,
      annualDebtService: 100000,
      requiredDSCR: 5.0,
    });
    // Required clamped to 3.0, Max = 300000 / 3.0 = 100000
    expect(result.maxLoanPayment).toBe(100000);
  });

  // ─── Test 16: Fractional DSCR rounding ───
  it('rounds DSCR to 2 decimal places', () => {
    const result = calculateDebtServiceCoverage({
      netOperatingIncome: 100000,
      annualDebtService: 70000,
      requiredDSCR: 1.25,
    });
    // DSCR = 100000 / 70000 = 1.42857... → 1.43
    expect(result.dscr).toBe(1.43);
  });

  // ─── Test 17: Negative NOI ───
  it('handles negative net operating income', () => {
    const result = calculateDebtServiceCoverage({
      netOperatingIncome: -50000,
      annualDebtService: 80000,
      requiredDSCR: 1.25,
    });
    // DSCR = -50000 / 80000 = -0.625 → -0.62 (rounds toward zero)
    expect(result.dscr).toBe(-0.62);
    expect(result.qualificationStatus).toBe('Does Not Qualify');
  });

  // ─── Test 18: Max loan payment rounding ───
  it('rounds max loan payment to 2 decimal places', () => {
    const result = calculateDebtServiceCoverage({
      netOperatingIncome: 100000,
      annualDebtService: 50000,
      requiredDSCR: 1.3,
    });
    // Required clamped to 1.3, Max = 100000 / 1.3 = 76923.076... → 76923.08
    expect(result.maxLoanPayment).toBe(76923.08);
  });

  // ─── Test 19: Summary contains expected labels ───
  it('returns summary with expected labels', () => {
    const result = calculateDebtServiceCoverage({
      netOperatingIncome: 120000,
      annualDebtService: 80000,
      requiredDSCR: 1.25,
    });
    const summary = result.summary as { label: string; value: number | string }[];
    const labels = summary.map((s) => s.label);
    expect(labels).toContain('DSCR');
    expect(labels).toContain('Required DSCR');
    expect(labels).toContain('Excess Cash Flow');
    expect(labels).toContain('Max Affordable Debt Service');
    expect(labels).toContain('Net Operating Income');
    expect(labels).toContain('Annual Debt Service');
    expect(labels).toContain('Qualification');
  });

  // ─── Test 20: All output fields present ───
  it('returns all expected output fields', () => {
    const result = calculateDebtServiceCoverage({
      netOperatingIncome: 120000,
      annualDebtService: 80000,
      requiredDSCR: 1.25,
    });
    expect(result).toHaveProperty('dscr');
    expect(result).toHaveProperty('excessCashFlow');
    expect(result).toHaveProperty('maxLoanPayment');
    expect(result).toHaveProperty('qualificationStatus');
    expect(result).toHaveProperty('summary');
  });

  // ─── Test 21: Small NOI barely qualifies ───
  it('borderline qualification with small excess', () => {
    const result = calculateDebtServiceCoverage({
      netOperatingIncome: 101000,
      annualDebtService: 100000,
      requiredDSCR: 1.0,
    });
    // DSCR = 1.01 >= required 1.0
    expect(result.dscr).toBe(1.01);
    expect(result.qualificationStatus).toBe('Qualifies');
  });

  // ─── Test 22: Large commercial loan scenario ───
  it('handles large commercial property values', () => {
    const result = calculateDebtServiceCoverage({
      netOperatingIncome: 2500000,
      annualDebtService: 1800000,
      requiredDSCR: 1.2,
    });
    // DSCR = 2500000 / 1800000 = 1.388... → 1.39
    expect(result.dscr).toBe(1.39);
    expect(result.qualificationStatus).toBe('Qualifies');
    expect(result.excessCashFlow).toBe(700000);
  });

  // ─── Test 23: Negative debt service coerced to zero ───
  it('coerces negative debt service to zero', () => {
    const result = calculateDebtServiceCoverage({
      netOperatingIncome: 100000,
      annualDebtService: -50000,
      requiredDSCR: 1.25,
    });
    // Debt service forced to 0, DSCR = 0
    expect(result.dscr).toBe(0);
  });

  // ─── Test 24: Required DSCR of 1.5 (conservative lender) ───
  it('handles conservative lender DSCR of 1.5', () => {
    const result = calculateDebtServiceCoverage({
      netOperatingIncome: 180000,
      annualDebtService: 120000,
      requiredDSCR: 1.5,
    });
    // DSCR = 1.5 = required → Qualifies
    // Max = 180000 / 1.5 = 120000
    expect(result.dscr).toBe(1.5);
    expect(result.qualificationStatus).toBe('Qualifies');
    expect(result.maxLoanPayment).toBe(120000);
  });
});
