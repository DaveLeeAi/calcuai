import { calculateBudget } from '@/lib/formulas/finance/budget';

describe('calculateBudget', () => {
  // ─── Test 1: 50/30/20 with $5,000 income ───
  it('calculates 50/30/20 split correctly for $5,000 income', () => {
    const result = calculateBudget({
      monthlyIncome: 5000,
      budgetMethod: '50-30-20',
    });
    expect(result.needsAmount).toBe(2500);
    expect(result.wantsAmount).toBe(1500);
    expect(result.savingsAmount).toBe(1000);
    expect(result.totalAllocated).toBe(5000);
    expect(result.unallocated).toBe(0);
  });

  // ─── Test 2: 60/20/20 with $5,000 income ───
  it('calculates 60/20/20 split correctly for $5,000 income', () => {
    const result = calculateBudget({
      monthlyIncome: 5000,
      budgetMethod: '60-20-20',
    });
    expect(result.needsAmount).toBe(3000);
    expect(result.wantsAmount).toBe(1000);
    expect(result.savingsAmount).toBe(1000);
    expect(result.totalAllocated).toBe(5000);
  });

  // ─── Test 3: 70/20/10 with $5,000 income ───
  it('calculates 70/20/10 split correctly for $5,000 income', () => {
    const result = calculateBudget({
      monthlyIncome: 5000,
      budgetMethod: '70-20-10',
    });
    expect(result.needsAmount).toBe(3500);
    expect(result.wantsAmount).toBe(1000);
    expect(result.savingsAmount).toBe(500);
    expect(result.totalAllocated).toBe(5000);
  });

  // ─── Test 4: Custom percentages (40/35/25) ───
  it('calculates custom percentages correctly (40/35/25)', () => {
    const result = calculateBudget({
      monthlyIncome: 5000,
      budgetMethod: 'custom',
      customNeeds: 40,
      customWants: 35,
      customSavings: 25,
    });
    expect(result.needsAmount).toBe(2000);
    expect(result.wantsAmount).toBe(1750);
    expect(result.savingsAmount).toBe(1250);
    expect(result.totalAllocated).toBe(5000);
    expect(result.unallocated).toBe(0);
  });

  // ─── Test 5: Zero income ───
  it('returns zero allocations for zero income', () => {
    const result = calculateBudget({
      monthlyIncome: 0,
      budgetMethod: '50-30-20',
    });
    expect(result.needsAmount).toBe(0);
    expect(result.wantsAmount).toBe(0);
    expect(result.savingsAmount).toBe(0);
    expect(result.totalAllocated).toBe(0);
  });

  // ─── Test 6: Large income ($20,000/month) ───
  it('calculates correctly for large income ($20,000)', () => {
    const result = calculateBudget({
      monthlyIncome: 20000,
      budgetMethod: '50-30-20',
    });
    expect(result.needsAmount).toBe(10000);
    expect(result.wantsAmount).toBe(6000);
    expect(result.savingsAmount).toBe(4000);
    expect(result.totalAllocated).toBe(20000);
  });

  // ─── Test 7: Small income ($1,000/month) ───
  it('calculates correctly for small income ($1,000)', () => {
    const result = calculateBudget({
      monthlyIncome: 1000,
      budgetMethod: '50-30-20',
    });
    expect(result.needsAmount).toBe(500);
    expect(result.wantsAmount).toBe(300);
    expect(result.savingsAmount).toBe(200);
  });

  // ─── Test 8: Custom percentages that sum to >100% ───
  it('still calculates when custom percentages exceed 100%', () => {
    const result = calculateBudget({
      monthlyIncome: 5000,
      budgetMethod: 'custom',
      customNeeds: 50,
      customWants: 40,
      customSavings: 30,
    });
    // 50% + 40% + 30% = 120% → $6,000 total allocated
    expect(result.needsAmount).toBe(2500);
    expect(result.wantsAmount).toBe(2000);
    expect(result.savingsAmount).toBe(1500);
    expect(result.totalAllocated).toBe(6000);
    // Unallocated is negative (over-allocated), but formula clamps to 0 via round2
    // Actually unallocated = 5000 - 6000 = -1000, which is stored as-is
    expect(result.unallocated).toBe(-1000);
  });

  // ─── Test 9: Custom percentages that sum to <100% (unallocated) ───
  it('shows unallocated amount when custom percentages sum to less than 100%', () => {
    const result = calculateBudget({
      monthlyIncome: 5000,
      budgetMethod: 'custom',
      customNeeds: 40,
      customWants: 20,
      customSavings: 10,
    });
    // 40% + 20% + 10% = 70% → $3,500 allocated, $1,500 unallocated
    expect(result.needsAmount).toBe(2000);
    expect(result.wantsAmount).toBe(1000);
    expect(result.savingsAmount).toBe(500);
    expect(result.totalAllocated).toBe(3500);
    expect(result.unallocated).toBe(1500);
  });

  // ─── Test 10: Verify budgetBreakdown pie chart array ───
  it('returns budgetBreakdown array with correct structure', () => {
    const result = calculateBudget({
      monthlyIncome: 5000,
      budgetMethod: '50-30-20',
    });
    const breakdown = result.budgetBreakdown as Array<{ name: string; value: number }>;
    expect(breakdown).toHaveLength(3); // No unallocated when percentages sum to 100
    expect(breakdown[0]).toEqual({ name: 'Needs', value: 2500 });
    expect(breakdown[1]).toEqual({ name: 'Wants', value: 1500 });
    expect(breakdown[2]).toEqual({ name: 'Savings', value: 1000 });
  });

  // ─── Test 11: Pie chart includes Unallocated when percentages < 100% ───
  it('includes Unallocated in pie chart when custom percentages sum to less than 100%', () => {
    const result = calculateBudget({
      monthlyIncome: 4000,
      budgetMethod: 'custom',
      customNeeds: 50,
      customWants: 20,
      customSavings: 10,
    });
    const breakdown = result.budgetBreakdown as Array<{ name: string; value: number }>;
    expect(breakdown).toHaveLength(4);
    const names = breakdown.map(b => b.name);
    expect(names).toContain('Unallocated');
    expect(breakdown[3].value).toBe(800); // 20% unallocated of $4,000
  });

  // ─── Test 12: Verify summary labels ───
  it('returns summary with all required labels', () => {
    const result = calculateBudget({
      monthlyIncome: 5000,
      budgetMethod: '50-30-20',
    });
    const summary = result.summary as Array<{ label: string; value: number }>;
    const labels = summary.map(s => s.label);
    expect(labels).toContain('Monthly Income');
    expect(labels).toContain('Needs (Monthly)');
    expect(labels).toContain('Wants (Monthly)');
    expect(labels).toContain('Savings (Monthly)');
    expect(labels).toContain('Needs (Annual)');
    expect(labels).toContain('Wants (Annual)');
    expect(labels).toContain('Savings (Annual)');
  });

  // ─── Test 13: Verify annual calculations ───
  it('calculates annual amounts as monthly × 12', () => {
    const result = calculateBudget({
      monthlyIncome: 5000,
      budgetMethod: '50-30-20',
    });
    expect(result.annualNeeds).toBe(2500 * 12);
    expect(result.annualWants).toBe(1500 * 12);
    expect(result.annualSavings).toBe(1000 * 12);
    expect(result.annualTotal).toBe(5000 * 12);
  });

  // ─── Test 14: Reports correct percentages back ───
  it('returns the percentages used in the calculation', () => {
    const result = calculateBudget({
      monthlyIncome: 5000,
      budgetMethod: '50-30-20',
    });
    expect(result.needsPct).toBe(50);
    expect(result.wantsPct).toBe(30);
    expect(result.savingsPct).toBe(20);
  });

  // ─── Test 15: Unknown budget method falls back to 50/30/20 ───
  it('falls back to 50/30/20 for unknown budget method', () => {
    const result = calculateBudget({
      monthlyIncome: 5000,
      budgetMethod: 'unknown-method',
    });
    expect(result.needsAmount).toBe(2500);
    expect(result.wantsAmount).toBe(1500);
    expect(result.savingsAmount).toBe(1000);
  });
});
