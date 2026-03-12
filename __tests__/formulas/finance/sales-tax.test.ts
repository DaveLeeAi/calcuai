import {
  calculateSalesTax,
  getStateTaxData,
  getAllStateTaxData,
} from '@/lib/formulas/finance/sales-tax';

describe('calculateSalesTax', () => {
  // ─── Add Tax Mode (Net → Gross) ─────────────────────

  it('calculates $100 at 7% → $107.00 total', () => {
    const result = calculateSalesTax({
      purchasePrice: 100,
      taxRate: 7,
      calculationMode: 'add-tax',
    });
    expect(result.taxAmount).toBe(7.0);
    expect(result.totalPrice).toBe(107.0);
    expect(result.effectivePrice).toBe(100);
  });

  it('calculates $89.99 at 9.61% (Tennessee) → $98.64 total', () => {
    const result = calculateSalesTax({
      purchasePrice: 89.99,
      taxRate: 9.61,
      calculationMode: 'add-tax',
    });
    expect(result.taxAmount).toBe(8.65);
    expect(result.totalPrice).toBe(98.64);
  });

  it('calculates $500 at 8.25% Texas combined → $541.25', () => {
    const result = calculateSalesTax({
      purchasePrice: 500,
      taxRate: 8.25,
      calculationMode: 'add-tax',
    });
    expect(result.taxAmount).toBe(41.25);
    expect(result.totalPrice).toBe(541.25);
  });

  // ─── Extract Tax Mode (Gross → Net) ─────────────────

  it('extracts tax from $107.99 at 8.99% (California) → $99.08 net', () => {
    const result = calculateSalesTax({
      purchasePrice: 107.99,
      taxRate: 8.99,
      calculationMode: 'extract-tax',
    });
    expect(result.effectivePrice).toBe(99.08);
    expect(result.taxAmount).toBe(8.91);
    expect(result.totalPrice).toBe(107.99);
  });

  it('extracts tax from $53000 at 6% → $50000 net', () => {
    const result = calculateSalesTax({
      purchasePrice: 53000,
      taxRate: 6,
      calculationMode: 'extract-tax',
    });
    expect(result.effectivePrice).toBeCloseTo(50000, 0);
    expect(result.taxAmount).toBeCloseTo(3000, 0);
  });

  // ─── Find Rate Mode ─────────────────────────────────

  it('finds rate: $49.99 to $53.50 → 7.02%', () => {
    const result = calculateSalesTax({
      netPrice: 49.99,
      grossPrice: 53.50,
      calculationMode: 'find-rate',
    });
    expect(result.calculatedRate).toBe(7.02);
    expect(result.taxAmount).toBe(3.51);
  });

  it('finds rate: $100 to $110 → 10.00%', () => {
    const result = calculateSalesTax({
      netPrice: 100,
      grossPrice: 110,
      calculationMode: 'find-rate',
    });
    expect(result.calculatedRate).toBe(10.0);
    expect(result.taxAmount).toBe(10.0);
  });

  // ─── State Lookup via Formula ───────────────────────

  it('uses Louisiana combined rate (10.11%) when state selected', () => {
    const result = calculateSalesTax({
      purchasePrice: 100,
      stateCode: 'LA',
      calculationMode: 'add-tax',
    });
    expect(result.taxAmount).toBe(10.11);
    expect(result.totalPrice).toBe(110.11);
    expect((result.stateInfo as { combinedRate: number }).combinedRate).toBe(10.11);
  });

  it('uses Oregon (0%) when state selected → no tax', () => {
    const result = calculateSalesTax({
      purchasePrice: 250,
      stateCode: 'OR',
      calculationMode: 'add-tax',
    });
    expect(result.taxAmount).toBe(0);
    expect(result.totalPrice).toBe(250);
  });

  // ─── Edge Cases ─────────────────────────────────────

  it('returns zeros for zero purchase price', () => {
    const result = calculateSalesTax({
      purchasePrice: 0,
      taxRate: 8.25,
      calculationMode: 'add-tax',
    });
    expect(result.taxAmount).toBe(0);
    expect(result.totalPrice).toBe(0);
    expect(result.effectivePrice).toBe(0);
  });

  it('handles 0% tax rate → gross equals net', () => {
    const result = calculateSalesTax({
      purchasePrice: 199.99,
      taxRate: 0,
      calculationMode: 'add-tax',
    });
    expect(result.taxAmount).toBe(0);
    expect(result.totalPrice).toBe(199.99);
  });

  it('handles negative purchase price gracefully', () => {
    const result = calculateSalesTax({
      purchasePrice: -50,
      taxRate: 8,
      calculationMode: 'add-tax',
    });
    expect(result.taxAmount).toBe(0);
    expect(result.totalPrice).toBe(0);
  });

  it('handles 100% tax rate correctly', () => {
    const result = calculateSalesTax({
      purchasePrice: 100,
      taxRate: 100,
      calculationMode: 'add-tax',
    });
    expect(result.taxAmount).toBe(100);
    expect(result.totalPrice).toBe(200);
  });

  it('defaults to add-tax mode when mode is not specified', () => {
    const result = calculateSalesTax({
      purchasePrice: 100,
      taxRate: 10,
    });
    expect(result.taxAmount).toBe(10);
    expect(result.totalPrice).toBe(110);
  });

  it('find-rate returns zeros when gross <= net', () => {
    const result = calculateSalesTax({
      netPrice: 100,
      grossPrice: 50,
      calculationMode: 'find-rate',
    });
    expect(result.calculatedRate).toBe(0);
    expect(result.taxAmount).toBe(0);
  });

  it('round-trips: add tax then extract yields original price', () => {
    const addResult = calculateSalesTax({
      purchasePrice: 299.99,
      taxRate: 9.5,
      calculationMode: 'add-tax',
    });
    const total = addResult.totalPrice as number;
    const extractResult = calculateSalesTax({
      purchasePrice: total,
      taxRate: 9.5,
      calculationMode: 'extract-tax',
    });
    expect(extractResult.effectivePrice).toBeCloseTo(299.99, 1);
  });

  it('returns summary with at least 4 items', () => {
    const result = calculateSalesTax({
      purchasePrice: 100,
      taxRate: 8.25,
      calculationMode: 'add-tax',
    });
    const summary = result.summary as Array<{ label: string; value: number | string }>;
    expect(summary.length).toBeGreaterThanOrEqual(4);
    expect(summary[0].label).toBe('Pre-Tax Price');
  });
});

// ─── State Lookup Functions ─────────────────────────────

describe('getStateTaxData', () => {
  it('returns Louisiana with combinedRate 10.11', () => {
    const la = getStateTaxData('LA');
    expect(la).not.toBeNull();
    expect(la!.combinedRate).toBe(10.11);
    expect(la!.stateTaxRate).toBe(4.45);
    expect(la!.avgLocalTaxRate).toBe(5.66);
  });

  it('returns Oregon with combinedRate 0.0', () => {
    const or = getStateTaxData('OR');
    expect(or).not.toBeNull();
    expect(or!.combinedRate).toBe(0.0);
    expect(or!.stateTaxRate).toBe(0.0);
  });

  it('returns Alabama with changedFrom2025 = true', () => {
    const al = getStateTaxData('AL');
    expect(al).not.toBeNull();
    expect(al!.changedFrom2025).toBe(true);
    expect(al!.changeNote).toContain('grocery');
  });

  it('returns DC with valid data', () => {
    const dc = getStateTaxData('DC');
    expect(dc).not.toBeNull();
    expect(dc!.stateName).toBe('District of Columbia');
    expect(dc!.combinedRate).toBe(6.0);
  });

  it('returns null for invalid state code', () => {
    expect(getStateTaxData('XX')).toBeNull();
    expect(getStateTaxData('')).toBeNull();
  });

  it('is case-insensitive', () => {
    const ny1 = getStateTaxData('ny');
    const ny2 = getStateTaxData('NY');
    expect(ny1).not.toBeNull();
    expect(ny2).not.toBeNull();
    expect(ny1!.combinedRate).toBe(ny2!.combinedRate);
  });

  it('all no-tax states have stateTaxRate = 0', () => {
    const noTaxStates = ['AK', 'DE', 'MT', 'NH', 'OR'];
    for (const code of noTaxStates) {
      const state = getStateTaxData(code);
      expect(state).not.toBeNull();
      expect(state!.stateTaxRate).toBe(0);
    }
  });

  it('Louisiana is the highest combined rate', () => {
    const allStates = getAllStateTaxData();
    const maxRate = Math.max(...allStates.map((s) => s.combinedRate));
    expect(maxRate).toBe(10.11);
    const highest = allStates.find((s) => s.combinedRate === maxRate);
    expect(highest!.stateCode).toBe('LA');
  });
});

describe('getAllStateTaxData', () => {
  it('returns 51 records (50 states + DC)', () => {
    const all = getAllStateTaxData();
    expect(all).toHaveLength(51);
  });

  it('every record has required fields', () => {
    const all = getAllStateTaxData();
    for (const state of all) {
      expect(state.stateCode).toBeDefined();
      expect(state.stateName).toBeDefined();
      expect(state.fips).toBeDefined();
      expect(typeof state.stateTaxRate).toBe('number');
      expect(typeof state.avgLocalTaxRate).toBe('number');
      expect(typeof state.combinedRate).toBe('number');
      expect(typeof state.changedFrom2025).toBe('boolean');
    }
  });

  it('combinedRate equals stateTaxRate + avgLocalTaxRate for all states', () => {
    const all = getAllStateTaxData();
    for (const state of all) {
      const expected = parseFloat(
        (state.stateTaxRate + state.avgLocalTaxRate).toFixed(2)
      );
      // Allow tolerance for floating point (e.g., MN 6.875 + 0.64 = 7.515)
      expect(state.combinedRate).toBeCloseTo(expected, 1);
    }
  });
});
