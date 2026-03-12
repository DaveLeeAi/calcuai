# Standardized Formula Test Template

Use this template when creating tests for new calculator formulas.
Copy the structure below and adapt for your specific formula.

## Required Test Categories

Every formula test file must include tests from these categories:

### 1. Happy Path (3-5 tests)
Standard inputs with known expected outputs. Pin exact values.

### 2. Edge Cases (3-5 tests)
- Zero values for numeric inputs
- Boundary values (min/max realistic ranges)
- Special modes or flags

### 3. Output Structure (2-3 tests)
- Summary/breakdown arrays contain required labels
- Array lengths are correct
- Cross-field invariants hold (parts sum to total)

### 4. Precision Regression (1-2 tests for finance/YMYL)
- Pin exact 2dp output values for known inputs
- Detect rounding drift across refactors

### 5. Invalid Input Resilience (1-2 tests)
- Formula handles undefined/null/NaN gracefully
- Formula handles missing keys without throwing

### 6. Monotonicity / Sweep (1-2 tests where applicable)
- Verify output increases/decreases as expected when sweeping an input

---

## Template

```typescript
import { calculateMyFormula } from '@/lib/formulas/{category}/{formula-name}';
import {
  expectPositiveFiniteNumber,
  expectNonNegativeFiniteNumber,
  expectWithinTolerance,
  expectSummaryLabels,
  expectNoThrow,
  expectCurrencyPrecision,
  expectPartsEqualTotal,
  testInvalidInputs,
  testMissingInputs,
  sweepInput,
  boundaryValues,
} from '../helpers/formula-test-utils';

// ─── Baseline inputs (reused across tests) ─────────────────────────────────
const BASE_INPUTS = {
  field1: 100,
  field2: 50,
  mode: 'default',
};

describe('calculateMyFormula', () => {
  // ═══ HAPPY PATH ══════════════════════════════════════════════════════════

  it('calculates standard case correctly', () => {
    const result = calculateMyFormula(BASE_INPUTS);
    expect(result.primaryOutput).toBeCloseTo(150, 2);
  });

  it('calculates alternative case correctly', () => {
    const result = calculateMyFormula({ ...BASE_INPUTS, field1: 200 });
    expect(result.primaryOutput).toBeCloseTo(250, 2);
  });

  // ═══ EDGE CASES ══════════════════════════════════════════════════════════

  it('handles zero input gracefully', () => {
    const result = calculateMyFormula({ ...BASE_INPUTS, field1: 0 });
    expectNonNegativeFiniteNumber(result, 'primaryOutput');
  });

  it('handles boundary values', () => {
    const [below, at, above] = boundaryValues(100, 0.01);
    const resultBelow = calculateMyFormula({ ...BASE_INPUTS, field1: below });
    const resultAt = calculateMyFormula({ ...BASE_INPUTS, field1: at });
    const resultAbove = calculateMyFormula({ ...BASE_INPUTS, field1: above });
    // Assert correct behavior around the boundary
    expect(resultBelow.primaryOutput).toBeDefined();
    expect(resultAt.primaryOutput).toBeDefined();
    expect(resultAbove.primaryOutput).toBeDefined();
  });

  // ═══ OUTPUT STRUCTURE ════════════════════════════════════════════════════

  it('returns summary with required labels', () => {
    const result = calculateMyFormula(BASE_INPUTS);
    expectSummaryLabels(result.summary, ['Label 1', 'Label 2']);
  });

  it('parts sum to total', () => {
    const result = calculateMyFormula(BASE_INPUTS);
    expectPartsEqualTotal(result, ['partA', 'partB'], 'total', 0.02);
  });

  // ═══ PRECISION REGRESSION (finance/YMYL only) ═══════════════════════════

  it('pins exact output for regression detection', () => {
    const result = calculateMyFormula(BASE_INPUTS);
    // Pin to exact 2dp — any rounding change breaks this test
    expectCurrencyPrecision(result, 'primaryOutput', 150.00);
  });

  // ═══ INVALID INPUT RESILIENCE ════════════════════════════════════════════

  it('handles invalid values for field1 without throwing', () => {
    testInvalidInputs(calculateMyFormula, BASE_INPUTS, 'field1');
  });

  it('handles missing input keys without throwing', () => {
    testMissingInputs(calculateMyFormula, BASE_INPUTS, ['field1', 'field2']);
  });

  // ═══ MONOTONICITY ════════════════════════════════════════════════════════

  it('output increases as field1 increases', () => {
    const results = sweepInput(
      calculateMyFormula,
      BASE_INPUTS,
      'field1',
      [10, 50, 100, 500, 1000]
    );
    for (let i = 1; i < results.length; i++) {
      expect(results[i].result.primaryOutput as number)
        .toBeGreaterThan(results[i - 1].result.primaryOutput as number);
    }
  });
});
```

## Minimum Test Counts by Tier

| Calculator Tier | Minimum Tests | Required Categories |
|----------------|--------------|-------------------|
| Flagship (YMYL/finance) | 20+ | All 6 categories |
| Standard | 15+ | Categories 1-5 |
| Utility | 12+ | Categories 1-4 |
