import { calculateEmployeeCost } from '@/lib/formulas/business/employee-cost';

describe('calculateEmployeeCost', () => {
  // ─── Test 1: Basic $60k employee total cost ───
  it('calculates total annual cost for a $60k employee', () => {
    const result = calculateEmployeeCost({
      annualSalary: 60000,
      healthInsurance: 7500,
      retirementMatch: 4,
      paidTimeOffDays: 15,
      otherBenefits: 2000,
      stateUnemploymentRate: 3,
      stateUnemploymentWageBase: 10000,
    });
    // SS = 60000 * 0.062 = $3,720
    // Medicare = 60000 * 0.0145 = $870
    // FUTA = 7000 * 0.006 = $42
    // SUTA = 10000 * 0.03 = $300
    // Employer taxes = 3720 + 870 + 42 + 300 = $4,932
    // 401k match = 60000 * 0.04 = $2,400
    // PTO cost = (60000 / 260) * 15 = 230.769... * 15 = $3,461.54
    // Benefits = 7500 + 2400 + 3461.54 + 2000 = $15,361.54
    // Total = 60000 + 4932 + 15361.54 = $80,293.54
    expect(result.totalAnnualCost).toBe(80293.54);
  });

  // ─── Test 2: Cost multiplier calculation ───
  it('calculates cost multiplier correctly', () => {
    const result = calculateEmployeeCost({
      annualSalary: 60000,
      healthInsurance: 7500,
      retirementMatch: 4,
      paidTimeOffDays: 15,
      otherBenefits: 2000,
      stateUnemploymentRate: 3,
      stateUnemploymentWageBase: 10000,
    });
    // Total ~$80,293.54 / 60000 = 1.34 (rounded to 2 decimals)
    expect(result.costMultiplier).toBe(1.34);
  });

  // ─── Test 3: Social Security at cap ($168,600 salary) ───
  it('caps Social Security at wage base of $168,600', () => {
    const result = calculateEmployeeCost({
      annualSalary: 200000,
      healthInsurance: 0,
      retirementMatch: 0,
      paidTimeOffDays: 0,
      otherBenefits: 0,
      stateUnemploymentRate: 0,
      stateUnemploymentWageBase: 0,
    });
    // SS = min(200000, 168600) * 0.062 = 168600 * 0.062 = $10,453.20
    expect(result.socialSecurity).toBe(10453.2);
  });

  // ─── Test 4: Social Security below cap ───
  it('calculates Social Security below the cap correctly', () => {
    const result = calculateEmployeeCost({
      annualSalary: 50000,
      healthInsurance: 0,
      retirementMatch: 0,
      paidTimeOffDays: 0,
      otherBenefits: 0,
      stateUnemploymentRate: 0,
      stateUnemploymentWageBase: 0,
    });
    // SS = 50000 * 0.062 = $3,100
    expect(result.socialSecurity).toBe(3100);
  });

  // ─── Test 5: Medicare calculation ───
  it('calculates Medicare tax correctly (no cap)', () => {
    const result = calculateEmployeeCost({
      annualSalary: 200000,
      healthInsurance: 0,
      retirementMatch: 0,
      paidTimeOffDays: 0,
      otherBenefits: 0,
      stateUnemploymentRate: 0,
      stateUnemploymentWageBase: 0,
    });
    // Medicare = 200000 * 0.0145 = $2,900
    expect(result.medicare).toBe(2900);
  });

  // ─── Test 6: FUTA calculation ───
  it('calculates FUTA tax correctly', () => {
    const result = calculateEmployeeCost({
      annualSalary: 60000,
      healthInsurance: 0,
      retirementMatch: 0,
      paidTimeOffDays: 0,
      otherBenefits: 0,
      stateUnemploymentRate: 0,
      stateUnemploymentWageBase: 0,
    });
    // FUTA = min(60000, 7000) * 0.006 = 7000 * 0.006 = $42
    expect(result.futa).toBe(42);
  });

  // ─── Test 7: SUTA calculation ───
  it('calculates SUTA tax correctly', () => {
    const result = calculateEmployeeCost({
      annualSalary: 60000,
      healthInsurance: 0,
      retirementMatch: 0,
      paidTimeOffDays: 0,
      otherBenefits: 0,
      stateUnemploymentRate: 3,
      stateUnemploymentWageBase: 10000,
    });
    // SUTA = min(60000, 10000) * 0.03 = 10000 * 0.03 = $300
    expect(result.suta).toBe(300);
  });

  // ─── Test 8: Retirement match ───
  it('calculates retirement match amount correctly', () => {
    const result = calculateEmployeeCost({
      annualSalary: 80000,
      healthInsurance: 0,
      retirementMatch: 6,
      paidTimeOffDays: 0,
      otherBenefits: 0,
      stateUnemploymentRate: 0,
      stateUnemploymentWageBase: 0,
    });
    // Match = 80000 * 0.06 = $4,800
    expect(result.retirementMatchAmount).toBe(4800);
  });

  // ─── Test 9: PTO cost ───
  it('calculates PTO cost correctly', () => {
    const result = calculateEmployeeCost({
      annualSalary: 52000,
      healthInsurance: 0,
      retirementMatch: 0,
      paidTimeOffDays: 20,
      otherBenefits: 0,
      stateUnemploymentRate: 0,
      stateUnemploymentWageBase: 0,
    });
    // Daily rate = 52000 / 260 = $200
    // PTO cost = 200 * 20 = $4,000
    expect(result.ptoCost).toBe(4000);
  });

  // ─── Test 10: Monthly cost ───
  it('calculates monthly cost correctly', () => {
    const result = calculateEmployeeCost({
      annualSalary: 60000,
      healthInsurance: 7500,
      retirementMatch: 4,
      paidTimeOffDays: 15,
      otherBenefits: 2000,
      stateUnemploymentRate: 3,
      stateUnemploymentWageBase: 10000,
    });
    // Monthly = totalAnnualCost / 12
    const total = result.totalAnnualCost as number;
    expect(result.monthlyCost).toBe(Math.round((total / 12) * 100) / 100);
  });

  // ─── Test 11: Hourly cost (2,080 hours) ───
  it('calculates hourly cost based on 2,080 hours per year', () => {
    const result = calculateEmployeeCost({
      annualSalary: 60000,
      healthInsurance: 7500,
      retirementMatch: 4,
      paidTimeOffDays: 15,
      otherBenefits: 2000,
      stateUnemploymentRate: 3,
      stateUnemploymentWageBase: 10000,
    });
    const total = result.totalAnnualCost as number;
    expect(result.hourlyCost).toBe(Math.round((total / 2080) * 100) / 100);
  });

  // ─── Test 12: Zero salary ───
  it('handles zero salary gracefully', () => {
    const result = calculateEmployeeCost({
      annualSalary: 0,
      healthInsurance: 5000,
      retirementMatch: 4,
      paidTimeOffDays: 10,
      otherBenefits: 1000,
      stateUnemploymentRate: 3,
      stateUnemploymentWageBase: 10000,
    });
    expect(result.socialSecurity).toBe(0);
    expect(result.medicare).toBe(0);
    expect(result.futa).toBe(0);
    expect(result.suta).toBe(0);
    expect(result.retirementMatchAmount).toBe(0);
    expect(result.ptoCost).toBe(0);
    expect(result.costMultiplier).toBe(0);
    // Total should be just health + other = $6,000
    expect(result.totalAnnualCost).toBe(6000);
  });

  // ─── Test 13: No benefits (all zeros except salary) ───
  it('calculates correctly with no benefits', () => {
    const result = calculateEmployeeCost({
      annualSalary: 50000,
      healthInsurance: 0,
      retirementMatch: 0,
      paidTimeOffDays: 0,
      otherBenefits: 0,
      stateUnemploymentRate: 0,
      stateUnemploymentWageBase: 0,
    });
    // Only employer taxes: SS + Medicare + FUTA
    // SS = 50000 * 0.062 = $3,100
    // Medicare = 50000 * 0.0145 = $725
    // FUTA = 7000 * 0.006 = $42
    // Total = 50000 + 3100 + 725 + 42 = $53,867
    expect(result.totalAnnualCost).toBe(53867);
    expect(result.totalBenefits).toBe(0);
  });

  // ─── Test 14: Cost breakdown pie chart has all slices ───
  it('returns cost breakdown with salary, benefits, and taxes slices', () => {
    const result = calculateEmployeeCost({
      annualSalary: 60000,
      healthInsurance: 7500,
      retirementMatch: 4,
      paidTimeOffDays: 15,
      otherBenefits: 2000,
      stateUnemploymentRate: 3,
      stateUnemploymentWageBase: 10000,
    });
    const breakdown = result.costBreakdown as { label: string; value: number }[];
    expect(breakdown).toHaveLength(3);
    const labels = breakdown.map((s) => s.label);
    expect(labels).toContain('Base Salary');
    expect(labels).toContain('Benefits');
    expect(labels).toContain('Employer Taxes');
  });

  // ─── Test 15: Cost detail table has all line items ───
  it('returns cost detail table with all 9 line items', () => {
    const result = calculateEmployeeCost({
      annualSalary: 60000,
      healthInsurance: 7500,
      retirementMatch: 4,
      paidTimeOffDays: 15,
      otherBenefits: 2000,
      stateUnemploymentRate: 3,
      stateUnemploymentWageBase: 10000,
    });
    const table = result.costDetailTable as { item: string; annualCost: number; percentOfTotal: number }[];
    expect(table).toHaveLength(9);
    const items = table.map((r) => r.item);
    expect(items).toContain('Base Salary');
    expect(items).toContain('Social Security (6.2%)');
    expect(items).toContain('Medicare (1.45%)');
    expect(items).toContain('FUTA');
    expect(items).toContain('SUTA');
    expect(items).toContain('Health Insurance');
    expect(items).toContain('Retirement Match');
    expect(items).toContain('PTO Cost');
    expect(items).toContain('Other Benefits');
    // Percentages should sum to ~100%
    const totalPct = table.reduce((sum, r) => sum + r.percentOfTotal, 0);
    expect(totalPct).toBeCloseTo(100, 0);
  });

  // ─── Test 16: Summary value group has all labels ───
  it('returns summary with expected labels', () => {
    const result = calculateEmployeeCost({
      annualSalary: 60000,
      healthInsurance: 7500,
      retirementMatch: 4,
      paidTimeOffDays: 15,
      otherBenefits: 2000,
      stateUnemploymentRate: 3,
      stateUnemploymentWageBase: 10000,
    });
    const summary = result.summary as { label: string; value: number }[];
    const labels = summary.map((s) => s.label);
    expect(labels).toContain('Total Annual Cost');
    expect(labels).toContain('Cost Multiplier');
    expect(labels).toContain('Employer Taxes');
    expect(labels).toContain('Total Benefits');
    expect(labels).toContain('Monthly Cost');
    expect(labels).toContain('Hourly Cost');
  });

  // ─── Test 17: Default/missing inputs ───
  it('uses defaults for missing inputs', () => {
    const result = calculateEmployeeCost({});
    expect(result.totalAnnualCost).toBe(0);
    expect(result.costMultiplier).toBe(0);
    expect(result.employerTaxes).toBe(0);
    expect(result.totalBenefits).toBe(0);
  });

  // ─── Test 18: High salary ($120k) with SS cap effect ───
  it('shows SS cap effect on high salary employee', () => {
    const result = calculateEmployeeCost({
      annualSalary: 120000,
      healthInsurance: 7500,
      retirementMatch: 4,
      paidTimeOffDays: 15,
      otherBenefits: 2000,
      stateUnemploymentRate: 3,
      stateUnemploymentWageBase: 10000,
    });
    // SS = 120000 * 0.062 = $7,440 (below cap, so full amount)
    expect(result.socialSecurity).toBe(7440);
    // Medicare = 120000 * 0.0145 = $1,740
    expect(result.medicare).toBe(1740);
    // Cost multiplier should be lower than $60k because taxes+benefits
    // are a smaller portion of a higher salary
    const multiplier = result.costMultiplier as number;
    expect(multiplier).toBeGreaterThan(1);
    expect(multiplier).toBeLessThan(1.5);
  });
});
