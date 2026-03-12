# Formula Audit Report — Layer 6A

**Date:** 2026-03-12
**Total Formula Modules:** 82
**Total Formula IDs Registered:** 84
**Total Test Suites:** 84 (82 per-formula + 1 registry-integration + 1 helpers)
**Total Tests:** 1,663 — all passing

---

## 1. Coverage Summary by Category

| Category | Modules | Tests | Avg Tests/Module | Min | Max | Risk Level |
|----------|---------|-------|-----------------|-----|-----|------------|
| Business | 11 | 171 | 15.5 | 15 | 18 | Low |
| Construction | 9 | 133 | 14.8 | 11 | 21 | Medium |
| Conversion | 1 | 110 | 110 | 110 | 110 | Low |
| Everyday | 10 | 196 | 19.6 | 12 | 52 | Low |
| Finance | 21 | 333 | 15.9 | 13 | 18 | **High** |
| Health | 13 | 201 | 15.5 | 12 | 19 | Medium |
| Math | 12 | 287 | 23.9 | 14 | 35 | Low |
| Science | 5 | 105 | 21.0 | 20 | 25 | Low |
| Registry | 1 | 105 | — | — | — | Low |

---

## 2. Per-Module Test Counts (sorted ascending)

| Tests | Module | Category | Risk |
|-------|--------|----------|------|
| 11 | paint-coverage | construction | Medium |
| 11 | flooring | construction | Medium |
| 12 | volume-material | construction | Medium |
| 12 | fence | construction | Medium |
| 12 | lean-body-mass | health | Low |
| 12 | one-rep-max | health | Low |
| 12 | board-foot | construction | Medium |
| 12 | fuel-cost | everyday | Low |
| 13 | refinance-breakeven | finance | **High** |
| 13 | final-grade | everyday | Low |
| 13 | cd-return | finance | Medium |
| 13 | roofing | construction | Medium |
| 13 | discount | everyday | Low |
| 13 | electricity-cost | everyday | Low |
| 14 | payment-calculator* | finance | Low |
| 14 | macros | health | Low |
| 14 | circle | math | Low |
| 14 | calorie-needs | health | Low |
| 14 | sales-tax | finance | Medium |
| 14 | interest-rate-solve | finance | **High** |
| 15 | heart-rate-zones | health | Low |
| 15 | break-even | business | Low |
| 15 | debt-payoff | finance | **High** |
| 15 | tax-brackets | finance | **High** |
| 15 | markup | business | Low |
| 15 | ideal-weight | health | Low |
| 15 | gross-margin | business | Low |
| 15 | amortization | finance | **High** |
| 15 | net-worth | finance | Medium |
| 15 | 401k-growth | finance | **High** |
| 15 | salary-convert | finance | Medium |
| 15 | home-affordability | finance | **High** |
| 15 | body-fat | health | Low |
| 15 | payroll | business | Medium |
| 15 | bmr | health | Low |
| 15 | savings-growth | finance | Medium |
| 15 | down-payment | finance | Medium |
| 15 | profit | business | Low |
| 15 | revenue | business | Low |
| 15 | roi | business | Low |
| 16 | timezone | everyday | Low |
| 16 | overtime | business | Medium |
| 16 | commission | business | Low |
| 16 | bmi | health | Low |
| 16 | investment-growth | finance | Medium |
| 16 | conception | health | Low |
| 16 | retirement-projection | finance | **High** |
| 16 | quadratic | math | Low |
| 16 | inflation | finance | Medium |
| 17 | pace | health | Low |
| 17 | mortgage-payment | finance | **High** |
| 17 | business-sales-tax | business | Low |
| 17 | compound-interest | finance | **High** |
| 18 | loan-payment | finance | **High** |
| 18 | logarithm | math | Low |
| 18 | triangle-solver | math | Low |
| 18 | rent-vs-buy | finance | **High** |
| 18 | employee-cost | business | Low |
| 18 | due-date | health | Low |
| 19 | grade | everyday | Low |
| 19 | pregnancy | health | Low |
| 20 | velocity | science | Low |
| 20 | pressure | science | Low |
| 20 | energy | science | Low |
| 20 | gpa | everyday | Low |
| 20 | density | science | Low |
| 20 | concrete-volume | construction | Low |
| 21 | income-tax | finance | **High** |
| 21 | percentage | math | Low |
| 21 | square-footage | construction | Low |
| 23 | central-tendency | math | Low |
| 24 | tip-calc | everyday | Low |
| 24 | ratio | math | Low |
| 25 | ohms-law | science | Low |
| 26 | standard-deviation | math | Low |
| 26 | exponents | math | Low |
| 33 | probability | math | Low |
| 33 | gcf-lcm | math | Low |
| 35 | fractions | math | Low |
| 38 | time-math | everyday | Low |
| 52 | date-diff | everyday | Low |
| 110 | unit-convert | conversion | Low |

*payment-calculator.test.ts has no corresponding formula module — appears to be a legacy/duplicate test file.

---

## 3. Rounding Pattern Analysis

### Three rounding strategies found:

**Strategy A: `parseFloat(x.toFixed(N))`**
- Used by: finance (2dp), construction (2dp), everyday/time-math (2-4dp)
- Most common pattern — 65% of modules
- Good for currency and fixed-precision outputs

**Strategy B: `Math.round(x * 10^N) / 10^N`**
- Used by: health (1dp for BMI/body-fat, 0dp for calories), everyday/tip-calc (2dp)
- ~25% of modules
- Better for whole-number outputs (calories, BMR)

**Strategy C: `parseFloat(x.toFixed(6))` or `toFixed(10)`**
- Used by: science (density, velocity, pressure, energy, ohms-law)
- ~10% of modules
- Appropriate for scientific precision

### Assessment:
The rounding variation is **intentional and domain-appropriate**:
- Currency → 2 decimal places
- Health metrics → 0-1 decimal places
- Scientific calculations → 6+ decimal places
- Percentages → 0-2 decimal places

No rounding bugs found. The inconsistency is a feature, not a bug.

---

## 4. Missing Edge-Case Patterns

Most test files cover happy paths well but have gaps in these areas:

### 4a. Invalid/Missing Input Handling
- **Gap:** Almost no tests verify behavior with `undefined`, `null`, `NaN`, or non-numeric string inputs
- **Impact:** Formula modules use `Number(x) || 0` coercion, which silently converts bad inputs to 0 — tests should verify this behavior is intentional
- **Priority:** Medium — the coercion pattern is consistent but undocumented in tests

### 4b. Boundary Value Testing
- **Gap:** Few tests at mathematical boundaries (e.g., interest rate of 0.001%, 99.99%, term of 1 month)
- **Impact:** Edge cases in iterative calculations (amortization, debt payoff) could produce unexpected results
- **Priority:** High for finance formulas

### 4c. Negative Input Guards
- **Gap:** Most formulas accept negative values without validation (e.g., negative loan amount, negative weight)
- **Impact:** Produces mathematically valid but semantically nonsensical results
- **Priority:** Medium — document as accepted behavior or add guards

### 4d. Precision Regression Tests
- **Gap:** No tests that pin exact output values to detect rounding drift
- **Impact:** A refactor could change `parseFloat(x.toFixed(2))` to `Math.round(x*100)/100` and produce subtly different results
- **Priority:** High for YMYL finance calculators

### 4e. Cross-Field Consistency
- **Gap:** No tests verify `futureValue === totalContributions + totalInterest` type invariants (except compound-interest test 14)
- **Impact:** Output fields could drift out of sync after changes
- **Priority:** Medium

---

## 5. Highest-Risk Formulas (Prioritized for Testing)

These are YMYL finance calculators where incorrect results could mislead users about money:

| Priority | Formula | Current Tests | Key Risk |
|----------|---------|--------------|----------|
| 1 | mortgage-payment | 17 | Amortization rounding drift, PMI logic |
| 2 | compound-interest | 17 | Large-number precision, compounding frequency edge cases |
| 3 | loan-payment | 18 | Zero-rate edge case, very short terms |
| 4 | amortization | 15 | Schedule balance drift, final payment adjustment |
| 5 | retirement-projection | 16 | Inflation interaction, withdrawal phase math |
| 6 | debt-payoff | 15 | Avalanche vs snowball correctness, minimum payment logic |
| 7 | tax-brackets | 15 | Bracket boundary precision, filing status combinations |
| 8 | income-tax | 21 | Deduction interactions, effective rate calculation |
| 9 | home-affordability | 15 | DTI ratio edge cases, multi-factor interaction |
| 10 | 401k-growth | 15 | Employer match logic, contribution limit handling |
| 11 | refinance-breakeven | 13 | Breakeven month calculation, closing cost amortization |
| 12 | interest-rate-solve | 14 | Newton's method convergence, no-solution cases |
| 13 | rent-vs-buy | 18 | Multi-year projection accuracy, opportunity cost |

---

## 6. Structural Findings

### 6a. Formula Module Contract (Consistent)
All 82 modules follow the same pattern:
1. TypeScript interfaces for input/output
2. JSDoc with formula + source citation
3. Main calculation function accepting `Record<string, unknown>`
4. `FORMULA_REGISTRY` export for auto-discovery

### 6b. Test File Structure (Consistent)
All test files follow this pattern:
1. Import the named calculation function
2. Numbered test cases with descriptive comments
3. Happy path → edge cases → output structure verification

### 6c. Registry Integration (Solid)
- `registry-integration.test.ts` with 105 tests verifies all 84 IDs resolve
- Spot-checks 10 key formulas for callable execution
- Guards against dropped registrations

### 6d. Shared Helpers (Good Foundation)
- `formula-test-utils.ts` provides 10 helpers
- Missing: input factories, boundary value generators, invariant checkers

---

## 7. Recommendations

### Immediate (This Layer)
1. Add precision regression tests for top 5 finance formulas — pin exact 2dp values
2. Add invalid input tests for finance formulas — verify `Number(x) || 0` coercion behavior
3. Add boundary tests: 0.001% rate, 100% rate, 1-month term, 50-year term
4. Add cross-field invariant tests: `sum === parts` for all formulas with breakdowns
5. Add shared helpers: `createFinanceInputs()`, `expectInvariant()`, `expectCurrencyPrecision()`
6. Expand thinnest construction tests (paint-coverage, flooring) with negative/zero dimension guards

### Next Layer
7. Add property-based fuzzing for math formulas (random inputs → verify properties hold)
8. Build snapshot test for each formula (pin full output object, detect any drift)
9. Create CI-enforced minimum: 15 tests per formula module
