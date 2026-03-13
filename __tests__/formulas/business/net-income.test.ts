import { calculateNetIncome } from '@/lib/formulas/business/net-income';

describe('calculateNetIncome', () => {
  // ─── Test 1: Standard $65K single filer ───
  it('calculates net income for $65,000 single filer', () => {
    const result = calculateNetIncome({
      grossIncome: 65000,
      payFrequency: 'annual',
      filingStatus: 'single',
      federalTaxRate: 22,
      stateTaxRate: 5,
      localTaxRate: 0,
      socialSecurity: 6.2,
      medicare: 1.45,
      retirement401k: 0,
      healthInsurance: 0,
    });
    expect(result.annualGross).toBe(65000);
    expect(result.federalTax).toBe(14300); // 65K × 22%
    expect(result.stateTax).toBe(3250); // 65K × 5%
    expect(result.ssTax).toBe(4030); // 65K × 6.2%
    expect(result.medicareTax).toBe(942.5); // 65K × 1.45%
    const expectedNet = 65000 - 14300 - 3250 - 4030 - 942.5;
    expect(result.annualNet).toBe(expectedNet);
  });

  // ─── Test 2: High income ($150K) ───
  it('calculates net income for $150,000', () => {
    const result = calculateNetIncome({
      grossIncome: 150000,
      payFrequency: 'annual',
      federalTaxRate: 24,
      stateTaxRate: 6,
      localTaxRate: 0,
      socialSecurity: 6.2,
      medicare: 1.45,
      retirement401k: 0,
      healthInsurance: 0,
    });
    expect(result.annualGross).toBe(150000);
    expect(result.federalTax).toBe(36000); // 150K × 24%
    expect(result.stateTax).toBe(9000); // 150K × 6%
    expect(result.ssTax).toBe(9300); // 150K × 6.2%
    expect(result.medicareTax).toBe(2175); // 150K × 1.45%
  });

  // ─── Test 3: Low income ($30K) ───
  it('calculates net income for $30,000', () => {
    const result = calculateNetIncome({
      grossIncome: 30000,
      payFrequency: 'annual',
      federalTaxRate: 12,
      stateTaxRate: 3,
      localTaxRate: 0,
      socialSecurity: 6.2,
      medicare: 1.45,
      retirement401k: 0,
      healthInsurance: 0,
    });
    expect(result.federalTax).toBe(3600);
    expect(result.stateTax).toBe(900);
    expect(result.ssTax).toBe(1860);
    expect(result.medicareTax).toBe(435);
    expect(result.annualNet).toBe(23205);
  });

  // ─── Test 4: No state tax (0%) ───
  it('handles zero state tax', () => {
    const result = calculateNetIncome({
      grossIncome: 65000,
      payFrequency: 'annual',
      federalTaxRate: 22,
      stateTaxRate: 0,
      localTaxRate: 0,
      socialSecurity: 6.2,
      medicare: 1.45,
      retirement401k: 0,
      healthInsurance: 0,
    });
    expect(result.stateTax).toBe(0);
    expect(result.annualNet).toBe(65000 - 14300 - 0 - 4030 - 942.5);
  });

  // ─── Test 5: High state tax (13.3%) ───
  it('handles high state tax rate', () => {
    const result = calculateNetIncome({
      grossIncome: 100000,
      payFrequency: 'annual',
      federalTaxRate: 24,
      stateTaxRate: 13.3,
      localTaxRate: 0,
      socialSecurity: 6.2,
      medicare: 1.45,
      retirement401k: 0,
      healthInsurance: 0,
    });
    expect(result.stateTax).toBe(13300);
  });

  // ─── Test 6: With 401k contribution (6%) ───
  it('deducts 401k contribution correctly', () => {
    const result = calculateNetIncome({
      grossIncome: 65000,
      payFrequency: 'annual',
      federalTaxRate: 22,
      stateTaxRate: 5,
      localTaxRate: 0,
      socialSecurity: 6.2,
      medicare: 1.45,
      retirement401k: 6,
      healthInsurance: 0,
    });
    expect(result.retirement401k).toBe(3900); // 65K × 6%
    const totalDed = 14300 + 3250 + 4030 + 942.5 + 3900;
    expect(result.totalDeductions).toBe(totalDed);
    expect(result.annualNet).toBe(65000 - totalDed);
  });

  // ─── Test 7: With health insurance ($300/month) ───
  it('deducts health insurance correctly', () => {
    const result = calculateNetIncome({
      grossIncome: 65000,
      payFrequency: 'annual',
      federalTaxRate: 22,
      stateTaxRate: 5,
      localTaxRate: 0,
      socialSecurity: 6.2,
      medicare: 1.45,
      retirement401k: 0,
      healthInsurance: 300,
    });
    expect(result.healthInsuranceAnnual).toBe(3600); // 300 × 12
    const totalDed = 14300 + 3250 + 4030 + 942.5 + 3600;
    expect(result.totalDeductions).toBe(totalDed);
  });

  // ─── Test 8: Monthly input frequency ───
  it('converts monthly income to annual correctly', () => {
    const result = calculateNetIncome({
      grossIncome: 5000, // $5,000/month
      payFrequency: 'monthly',
      federalTaxRate: 22,
      stateTaxRate: 5,
      localTaxRate: 0,
      socialSecurity: 6.2,
      medicare: 1.45,
      retirement401k: 0,
      healthInsurance: 0,
    });
    expect(result.annualGross).toBe(60000); // 5K × 12
  });

  // ─── Test 9: Biweekly input frequency ───
  it('converts biweekly income to annual correctly', () => {
    const result = calculateNetIncome({
      grossIncome: 2500, // $2,500 biweekly
      payFrequency: 'biweekly',
      federalTaxRate: 22,
      stateTaxRate: 5,
      localTaxRate: 0,
      socialSecurity: 6.2,
      medicare: 1.45,
      retirement401k: 0,
      healthInsurance: 0,
    });
    expect(result.annualGross).toBe(65000); // 2500 × 26
  });

  // ─── Test 10: Zero income ───
  it('handles zero income gracefully', () => {
    const result = calculateNetIncome({
      grossIncome: 0,
      payFrequency: 'annual',
      federalTaxRate: 22,
      stateTaxRate: 5,
      localTaxRate: 0,
      socialSecurity: 6.2,
      medicare: 1.45,
      retirement401k: 0,
      healthInsurance: 0,
    });
    expect(result.annualGross).toBe(0);
    expect(result.annualNet).toBe(0);
    expect(result.totalTaxes).toBe(0);
    expect(result.effectiveTaxRate).toBe(0);
    expect(result.takeHomePercent).toBe(0);
  });

  // ─── Test 11: All deductions combined ───
  it('calculates total deductions with all deduction types', () => {
    const result = calculateNetIncome({
      grossIncome: 80000,
      payFrequency: 'annual',
      federalTaxRate: 22,
      stateTaxRate: 6,
      localTaxRate: 1,
      socialSecurity: 6.2,
      medicare: 1.45,
      retirement401k: 5,
      healthInsurance: 250,
    });
    const fedTax = 17600;
    const stateTax = 4800;
    const localTax = 800;
    const ss = 4960;
    const med = 1160;
    const r401k = 4000;
    const health = 3000;
    expect(result.federalTax).toBe(fedTax);
    expect(result.stateTax).toBe(stateTax);
    expect(result.localTax).toBe(localTax);
    expect(result.ssTax).toBe(ss);
    expect(result.medicareTax).toBe(med);
    expect(result.retirement401k).toBe(r401k);
    expect(result.healthInsuranceAnnual).toBe(health);
    expect(result.totalDeductions).toBe(fedTax + stateTax + localTax + ss + med + r401k + health);
  });

  // ─── Test 12: Effective tax rate ───
  it('calculates effective tax rate correctly', () => {
    const result = calculateNetIncome({
      grossIncome: 100000,
      payFrequency: 'annual',
      federalTaxRate: 24,
      stateTaxRate: 5,
      localTaxRate: 0,
      socialSecurity: 6.2,
      medicare: 1.45,
      retirement401k: 0,
      healthInsurance: 0,
    });
    // Total taxes = 24000 + 5000 + 6200 + 1450 = 36650
    // Effective rate = 36650 / 100000 × 100 = 36.65%
    expect(result.effectiveTaxRate).toBe(36.65);
  });

  // ─── Test 13: Take-home percentage ───
  it('calculates take-home percentage correctly', () => {
    const result = calculateNetIncome({
      grossIncome: 100000,
      payFrequency: 'annual',
      federalTaxRate: 24,
      stateTaxRate: 5,
      localTaxRate: 0,
      socialSecurity: 6.2,
      medicare: 1.45,
      retirement401k: 0,
      healthInsurance: 0,
    });
    // Net = 100000 - 36650 = 63350
    // Take-home % = 63350 / 100000 × 100 = 63.35
    expect(result.takeHomePercent).toBe(63.35);
  });

  // ─── Test 14: Local tax ───
  it('applies local tax correctly', () => {
    const result = calculateNetIncome({
      grossIncome: 80000,
      payFrequency: 'annual',
      federalTaxRate: 22,
      stateTaxRate: 5,
      localTaxRate: 3.8,
      socialSecurity: 6.2,
      medicare: 1.45,
      retirement401k: 0,
      healthInsurance: 0,
    });
    expect(result.localTax).toBe(3040); // 80K × 3.8%
  });

  // ─── Test 15: SS wage base cap ───
  it('caps Social Security at wage base ($168,600)', () => {
    const result = calculateNetIncome({
      grossIncome: 200000,
      payFrequency: 'annual',
      federalTaxRate: 32,
      stateTaxRate: 5,
      localTaxRate: 0,
      socialSecurity: 6.2,
      medicare: 1.45,
      retirement401k: 0,
      healthInsurance: 0,
    });
    // SS = min(200K, 168600) × 6.2% = 168600 × 0.062 = 10453.20
    expect(result.ssTax).toBe(10453.2);
    // Medicare has no cap: 200K × 1.45% = 2900
    expect(result.medicareTax).toBe(2900);
  });

  // ─── Test 16: Deduction breakdown structure ───
  it('returns deduction breakdown with correct structure', () => {
    const result = calculateNetIncome({
      grossIncome: 65000,
      payFrequency: 'annual',
      federalTaxRate: 22,
      stateTaxRate: 5,
      localTaxRate: 0,
      socialSecurity: 6.2,
      medicare: 1.45,
      retirement401k: 0,
      healthInsurance: 0,
    });
    const breakdown = result.deductionBreakdown as Array<{ label: string; value: number }>;
    expect(breakdown.length).toBeGreaterThanOrEqual(9);
    const labels = breakdown.map((b) => b.label);
    expect(labels).toContain('Federal Income Tax');
    expect(labels).toContain('State Income Tax');
    expect(labels).toContain('Local Income Tax');
    expect(labels).toContain('Social Security');
    expect(labels).toContain('Medicare');
    expect(labels).toContain('401(k) Contribution');
    expect(labels).toContain('Health Insurance');
    expect(labels).toContain('Total Deductions');
    expect(labels).toContain('Annual Net Income');
  });

  // ─── Test 17: Output structure validation ───
  it('returns all expected output keys', () => {
    const result = calculateNetIncome({
      grossIncome: 65000,
      payFrequency: 'annual',
      federalTaxRate: 22,
      stateTaxRate: 5,
      localTaxRate: 0,
      socialSecurity: 6.2,
      medicare: 1.45,
      retirement401k: 0,
      healthInsurance: 0,
    });
    expect(result).toHaveProperty('annualGross');
    expect(result).toHaveProperty('annualNet');
    expect(result).toHaveProperty('monthlyNet');
    expect(result).toHaveProperty('biweeklyNet');
    expect(result).toHaveProperty('weeklyNet');
    expect(result).toHaveProperty('federalTax');
    expect(result).toHaveProperty('stateTax');
    expect(result).toHaveProperty('localTax');
    expect(result).toHaveProperty('ssTax');
    expect(result).toHaveProperty('medicareTax');
    expect(result).toHaveProperty('retirement401k');
    expect(result).toHaveProperty('healthInsuranceAnnual');
    expect(result).toHaveProperty('totalTaxes');
    expect(result).toHaveProperty('totalDeductions');
    expect(result).toHaveProperty('effectiveTaxRate');
    expect(result).toHaveProperty('takeHomePercent');
    expect(result).toHaveProperty('deductionBreakdown');
  });

  // ─── Test 18: Pay period breakdowns ───
  it('calculates monthly, biweekly, and weekly net correctly', () => {
    const result = calculateNetIncome({
      grossIncome: 65000,
      payFrequency: 'annual',
      federalTaxRate: 22,
      stateTaxRate: 5,
      localTaxRate: 0,
      socialSecurity: 6.2,
      medicare: 1.45,
      retirement401k: 0,
      healthInsurance: 0,
    });
    const annualNet = result.annualNet as number;
    expect(result.monthlyNet).toBe(Math.round((annualNet / 12) * 100) / 100);
    expect(result.biweeklyNet).toBe(Math.round((annualNet / 26) * 100) / 100);
    expect(result.weeklyNet).toBe(Math.round((annualNet / 52) * 100) / 100);
  });

  // ─── Test 19: Weekly input frequency ───
  it('converts weekly income to annual correctly', () => {
    const result = calculateNetIncome({
      grossIncome: 1250, // $1,250/week
      payFrequency: 'weekly',
      federalTaxRate: 22,
      stateTaxRate: 5,
      localTaxRate: 0,
      socialSecurity: 6.2,
      medicare: 1.45,
      retirement401k: 0,
      healthInsurance: 0,
    });
    expect(result.annualGross).toBe(65000); // 1250 × 52
  });

  // ─── Test 20: High retirement contribution ───
  it('handles high retirement contribution correctly', () => {
    const result = calculateNetIncome({
      grossIncome: 100000,
      payFrequency: 'annual',
      federalTaxRate: 24,
      stateTaxRate: 5,
      localTaxRate: 0,
      socialSecurity: 6.2,
      medicare: 1.45,
      retirement401k: 15,
      healthInsurance: 0,
    });
    expect(result.retirement401k).toBe(15000); // 100K × 15%
    const expectedNet = 100000 - 24000 - 5000 - 6200 - 1450 - 15000;
    expect(result.annualNet).toBe(expectedNet);
  });
});
