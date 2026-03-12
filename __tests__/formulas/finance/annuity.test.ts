import { calculateAnnuity } from '@/lib/formulas/finance/annuity';

describe('calculateAnnuity', () => {
  // ─── Test 1: PV to Payment — $100,000 annuity at 5% for 20 years, monthly ───
  it('calculates payment from PV correctly (ordinary annuity)', () => {
    const result = calculateAnnuity({
      mode: 'pv-to-payment',
      timing: 'ordinary',
      presentValue: 100000,
      annualRate: 5,
      years: 20,
      paymentsPerYear: '12',
    });
    // PMT = 100000 × [0.004167 / (1 - (1.004167)^-240)] ≈ $659.96
    const payment = result.payment as number;
    expect(payment).toBeCloseTo(659.96, 0);
  });

  // ─── Test 2: PV to Payment — zero interest rate ───
  it('handles zero interest rate for PV to payment', () => {
    const result = calculateAnnuity({
      mode: 'pv-to-payment',
      timing: 'ordinary',
      presentValue: 60000,
      annualRate: 0,
      years: 5,
      paymentsPerYear: '12',
    });
    // $60,000 / 60 payments = $1,000
    expect(result.payment).toBe(1000);
  });

  // ─── Test 3: FV to Payment — save $500,000 in 30 years at 7% ───
  it('calculates payment from FV correctly (savings goal)', () => {
    const result = calculateAnnuity({
      mode: 'fv-to-payment',
      timing: 'ordinary',
      futureValue: 500000,
      annualRate: 7,
      years: 30,
      paymentsPerYear: '12',
    });
    // PMT = 500000 × [0.005833 / ((1.005833)^360 - 1)] ≈ $409.83
    const payment = result.payment as number;
    expect(payment).toBeCloseTo(409.83, 0);
  });

  // ─── Test 4: Payment to PV — $1,000/month at 6% for 10 years ───
  it('calculates PV from payment correctly', () => {
    const result = calculateAnnuity({
      mode: 'payment-to-pv',
      timing: 'ordinary',
      paymentAmount: 1000,
      annualRate: 6,
      years: 10,
      paymentsPerYear: '12',
    });
    // PV = 1000 × [(1-(1.005)^-120)/0.005] ≈ $90,073.45
    const pv = result.presentValue as number;
    expect(pv).toBeCloseTo(90073, -1);
  });

  // ─── Test 5: Payment to FV — $500/month at 7% for 30 years ───
  it('calculates FV from payment correctly', () => {
    const result = calculateAnnuity({
      mode: 'payment-to-fv',
      timing: 'ordinary',
      paymentAmount: 500,
      annualRate: 7,
      years: 30,
      paymentsPerYear: '12',
    });
    // FV = 500 × [((1.005833)^360 - 1)/0.005833] ≈ $609,986
    const fv = result.futureValue as number;
    expect(fv).toBeGreaterThan(609000);
    expect(fv).toBeLessThan(611000);
  });

  // ─── Test 6: Annuity Due — payments at start of period ───
  it('calculates annuity due payment from PV correctly', () => {
    const result = calculateAnnuity({
      mode: 'pv-to-payment',
      timing: 'due',
      presentValue: 100000,
      annualRate: 5,
      years: 20,
      paymentsPerYear: '12',
    });
    // Annuity due payment < ordinary annuity payment (same PV)
    const ordinaryResult = calculateAnnuity({
      mode: 'pv-to-payment',
      timing: 'ordinary',
      presentValue: 100000,
      annualRate: 5,
      years: 20,
      paymentsPerYear: '12',
    });
    const duePayment = result.payment as number;
    const ordPayment = ordinaryResult.payment as number;
    expect(duePayment).toBeLessThan(ordPayment);
    // Due payment = ordinary payment / (1+r)
    expect(duePayment).toBeCloseTo(ordPayment / 1.004167, 0);
  });

  // ─── Test 7: Annuity Due — PV from payment ───
  it('calculates annuity due PV correctly (higher than ordinary)', () => {
    const resultDue = calculateAnnuity({
      mode: 'payment-to-pv',
      timing: 'due',
      paymentAmount: 1000,
      annualRate: 6,
      years: 10,
      paymentsPerYear: '12',
    });
    const resultOrd = calculateAnnuity({
      mode: 'payment-to-pv',
      timing: 'ordinary',
      paymentAmount: 1000,
      annualRate: 6,
      years: 10,
      paymentsPerYear: '12',
    });
    const pvDue = resultDue.presentValue as number;
    const pvOrd = resultOrd.presentValue as number;
    // Annuity due PV > ordinary annuity PV (same payment)
    expect(pvDue).toBeGreaterThan(pvOrd);
  });

  // ─── Test 8: Annual payments ───
  it('calculates with annual payment frequency', () => {
    const result = calculateAnnuity({
      mode: 'pv-to-payment',
      timing: 'ordinary',
      presentValue: 50000,
      annualRate: 4,
      years: 10,
      paymentsPerYear: '1',
    });
    // PMT = 50000 × [0.04 / (1-(1.04)^-10)] ≈ $6,164.55
    const payment = result.payment as number;
    expect(payment).toBeCloseTo(6164.55, 0);
  });

  // ─── Test 9: Zero time period ───
  it('handles zero time period gracefully', () => {
    const result = calculateAnnuity({
      mode: 'pv-to-payment',
      timing: 'ordinary',
      presentValue: 50000,
      annualRate: 5,
      years: 0,
      paymentsPerYear: '12',
    });
    expect(result.payment).toBe(0);
    expect(result.totalPayments).toBe(0);
  });

  // ─── Test 10: Total interest for PV-to-payment ───
  it('calculates total interest correctly for loan-style annuity', () => {
    const result = calculateAnnuity({
      mode: 'pv-to-payment',
      timing: 'ordinary',
      presentValue: 100000,
      annualRate: 5,
      years: 20,
      paymentsPerYear: '12',
    });
    const totalPayments = result.totalPayments as number;
    const totalInterest = result.totalInterest as number;
    // Total interest = total payments - PV
    expect(totalInterest).toBeCloseTo(totalPayments - 100000, 0);
    expect(totalInterest).toBeGreaterThan(0);
  });

  // ─── Test 11: Total interest for FV-to-payment (savings) ───
  it('calculates total interest correctly for savings-style annuity', () => {
    const result = calculateAnnuity({
      mode: 'fv-to-payment',
      timing: 'ordinary',
      futureValue: 500000,
      annualRate: 7,
      years: 30,
      paymentsPerYear: '12',
    });
    const totalPayments = result.totalPayments as number;
    const totalInterest = result.totalInterest as number;
    // Interest = FV - total contributions
    expect(totalInterest).toBeCloseTo(500000 - totalPayments, 0);
    expect(totalInterest).toBeGreaterThan(0);
  });

  // ─── Test 12: Summary labels ───
  it('returns summary with all required labels', () => {
    const result = calculateAnnuity({
      mode: 'pv-to-payment',
      timing: 'ordinary',
      presentValue: 100000,
      annualRate: 5,
      years: 20,
      paymentsPerYear: '12',
    });
    const summary = result.summary as Array<{ label: string }>;
    const labels = summary.map(s => s.label);
    expect(labels).toContain('Payment Amount');
    expect(labels).toContain('Present Value');
    expect(labels).toContain('Future Value');
    expect(labels).toContain('Total Payments');
    expect(labels).toContain('Total Interest');
    expect(labels).toContain('Annuity Type');
  });

  // ─── Test 13: Breakdown entries for loan-style ───
  it('returns breakdown with principal and interest for PV mode', () => {
    const result = calculateAnnuity({
      mode: 'pv-to-payment',
      timing: 'ordinary',
      presentValue: 100000,
      annualRate: 5,
      years: 20,
      paymentsPerYear: '12',
    });
    const breakdown = result.breakdown as Array<{ name: string; value: number }>;
    const names = breakdown.map(b => b.name);
    expect(names).toContain('Principal');
    expect(names).toContain('Interest');
  });

  // ─── Test 14: Breakdown entries for savings-style ───
  it('returns breakdown with contributions and interest for FV mode', () => {
    const result = calculateAnnuity({
      mode: 'payment-to-fv',
      timing: 'ordinary',
      paymentAmount: 500,
      annualRate: 7,
      years: 30,
      paymentsPerYear: '12',
    });
    const breakdown = result.breakdown as Array<{ name: string; value: number }>;
    const names = breakdown.map(b => b.name);
    expect(names).toContain('Contributions');
    expect(names).toContain('Interest Earned');
  });

  // ─── Test 15: Balance over time for declining balance (PV mode) ───
  it('generates declining balance over time for PV-to-payment', () => {
    const result = calculateAnnuity({
      mode: 'pv-to-payment',
      timing: 'ordinary',
      presentValue: 100000,
      annualRate: 5,
      years: 20,
      paymentsPerYear: '12',
    });
    const balanceData = result.balanceOverTime as Array<{ year: number; balance: number }>;
    expect(balanceData).toHaveLength(21); // year 0 through 20
    expect(balanceData[0].balance).toBe(100000);
    expect(balanceData[20].balance).toBeCloseTo(0, 0);
    // Should be declining
    expect(balanceData[10].balance).toBeLessThan(balanceData[0].balance);
  });

  // ─── Test 16: Balance over time for growing balance (FV mode) ───
  it('generates growing balance over time for payment-to-FV', () => {
    const result = calculateAnnuity({
      mode: 'payment-to-fv',
      timing: 'ordinary',
      paymentAmount: 500,
      annualRate: 7,
      years: 10,
      paymentsPerYear: '12',
    });
    const balanceData = result.balanceOverTime as Array<{ year: number; balance: number }>;
    expect(balanceData).toHaveLength(11);
    expect(balanceData[0].balance).toBe(0);
    // Should be growing
    for (let i = 1; i < balanceData.length; i++) {
      expect(balanceData[i].balance).toBeGreaterThan(balanceData[i - 1].balance);
    }
  });

  // ─── Test 17: High interest rate ───
  it('handles high interest rates', () => {
    const result = calculateAnnuity({
      mode: 'pv-to-payment',
      timing: 'ordinary',
      presentValue: 50000,
      annualRate: 18,
      years: 5,
      paymentsPerYear: '12',
    });
    const payment = result.payment as number;
    // $50k at 18% for 5 years monthly ≈ $1,269.64
    expect(payment).toBeCloseTo(1269.64, 0);
  });

  // ─── Test 18: FV to payment with zero rate ───
  it('handles zero rate for FV to payment', () => {
    const result = calculateAnnuity({
      mode: 'fv-to-payment',
      timing: 'ordinary',
      futureValue: 120000,
      annualRate: 0,
      years: 10,
      paymentsPerYear: '12',
    });
    // $120,000 / 120 = $1,000
    expect(result.payment).toBe(1000);
  });
});
