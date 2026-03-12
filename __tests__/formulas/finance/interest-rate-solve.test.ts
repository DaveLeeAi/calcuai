import { calculateInterestRate } from '@/lib/formulas/finance/interest-rate-solve';

describe('calculateInterestRate', () => {
  // ─── Test 1: Standard personal loan rate ───
  it('solves for ~7.42% APR on $25,000 / $500/mo / 60 months', () => {
    const result = calculateInterestRate({
      loanAmount: 25000,
      monthlyPayment: 500,
      loanTerm: 60,
    });
    // $500 × 60 = $30,000 total; $5,000 interest on $25,000 → ~7.4% APR
    expect(result.annualRate).toBeCloseTo(7.42, 0);
  });

  // ─── Test 2: Known 5% auto loan ───
  it('solves for 5% APR on $32,000 / $603.64/mo / 60 months', () => {
    const result = calculateInterestRate({
      loanAmount: 32000,
      monthlyPayment: 603.64,
      loanTerm: 60,
    });
    expect(result.annualRate).toBeCloseTo(5.0, 0);
  });

  // ─── Test 3: Known 6.5% mortgage ───
  it('solves for 6.5% on $300,000 / $1,896.20/mo / 360 months', () => {
    const result = calculateInterestRate({
      loanAmount: 300000,
      monthlyPayment: 1896.20,
      loanTerm: 360,
    });
    expect(result.annualRate).toBeCloseTo(6.5, 0);
  });

  // ─── Test 4: High rate (credit card level) ───
  it('solves for ~24% APR on $5,000 / $213.05/mo / 32 months', () => {
    // At 24% APR (2% monthly): $5,000 loan, $213.05/mo for 32 months
    const result = calculateInterestRate({
      loanAmount: 5000,
      monthlyPayment: 213.05,
      loanTerm: 32,
    });
    expect(result.annualRate).toBeCloseTo(24, 0);
  });

  // ─── Test 5: Zero interest (total payment equals loan) ───
  it('returns 0% when total payments equal loan amount', () => {
    const result = calculateInterestRate({
      loanAmount: 12000,
      monthlyPayment: 1000,
      loanTerm: 12,
    });
    expect(result.annualRate).toBe(0);
  });

  // ─── Test 6: Total interest calculated correctly ───
  it('calculates correct total interest', () => {
    const result = calculateInterestRate({
      loanAmount: 25000,
      monthlyPayment: 500,
      loanTerm: 60,
    });
    expect(result.totalPayment).toBe(30000);
    expect(result.totalInterest).toBe(5000);
  });

  // ─── Test 7: Monthly rate is annual / 12 ───
  it('monthly rate is approximately annual rate / 12', () => {
    const result = calculateInterestRate({
      loanAmount: 25000,
      monthlyPayment: 500,
      loanTerm: 60,
    });
    const annualRate = result.annualRate as number;
    const monthlyRate = result.monthlyRate as number;
    expect(monthlyRate).toBeCloseTo(annualRate / 12, 1);
  });

  // ─── Test 8: Zero loan amount returns zeros ───
  it('returns zeros for zero loan amount', () => {
    const result = calculateInterestRate({
      loanAmount: 0,
      monthlyPayment: 500,
      loanTerm: 60,
    });
    expect(result.annualRate).toBe(0);
    expect(result.monthlyRate).toBe(0);
    expect(result.totalPayment).toBe(0);
  });

  // ─── Test 9: Zero payment returns zeros ───
  it('returns zeros for zero monthly payment', () => {
    const result = calculateInterestRate({
      loanAmount: 25000,
      monthlyPayment: 0,
      loanTerm: 60,
    });
    expect(result.annualRate).toBe(0);
  });

  // ─── Test 10: Zero term returns zeros ───
  it('returns zeros for zero loan term', () => {
    const result = calculateInterestRate({
      loanAmount: 25000,
      monthlyPayment: 500,
      loanTerm: 0,
    });
    expect(result.annualRate).toBe(0);
  });

  // ─── Test 11: Large mortgage rate ───
  it('solves rate on large $500,000 loan with known 4% rate', () => {
    // $500,000 at 4% for 360 months → $2,387.08
    const result = calculateInterestRate({
      loanAmount: 500000,
      monthlyPayment: 2387.08,
      loanTerm: 360,
    });
    expect(result.annualRate).toBeCloseTo(4.0, 0);
  });

  // ─── Test 12: Short-term loan ───
  it('solves rate on short-term $10,000 / $452.27/mo / 24 months (8%)', () => {
    const result = calculateInterestRate({
      loanAmount: 10000,
      monthlyPayment: 452.27,
      loanTerm: 24,
    });
    expect(result.annualRate).toBeCloseTo(8.0, 0);
  });

  // ─── Test 13: Summary has correct entries ───
  it('returns summary with rate info', () => {
    const result = calculateInterestRate({
      loanAmount: 25000,
      monthlyPayment: 500,
      loanTerm: 60,
    });
    const summary = result.summary as Array<{ label: string; value: number | string }>;
    expect(summary.length).toBeGreaterThanOrEqual(4);
    const aprEntry = summary.find(s => s.label === 'Annual Interest Rate (APR)');
    expect(aprEntry).toBeDefined();
  });

  // ─── Test 14: Low rate (near zero) ───
  it('solves for low rate when total payment is slightly above principal', () => {
    // $10,000 paid at $170/mo for 60 months = $10,200 total → very low rate
    const result = calculateInterestRate({
      loanAmount: 10000,
      monthlyPayment: 170,
      loanTerm: 60,
    });
    expect(result.annualRate).toBeCloseTo(0.75, 0);
    expect(Number(result.annualRate)).toBeGreaterThan(0);
  });
});
