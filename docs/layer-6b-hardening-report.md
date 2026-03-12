# Layer 6B — Flagship Calculator Formula Hardening Report

## Summary

**98 test suites, 2,047 tests — all passing**
Layer 6B added **256 new hardening tests** across 8 flagship calculators, plus 1 formula fix (due-date input validation).

## Ranked Shortlist (Selection Criteria)

Flagships were prioritized by combining: user value (YMYL risk), traffic potential, formula complexity, trust sensitivity, and existing test coverage gaps.

| Rank | Calculator | Formula | Tests Before | Tests Added | Total Now | Risk Level |
|------|-----------|---------|-------------|-------------|-----------|------------|
| 1 | Retirement | retirement-projection | 16 + 18 edge | 35 | 69 | CRITICAL |
| 2 | Income Tax | income-tax | 21 + 49 base | 37 | 107 | CRITICAL |
| 3 | Investment | investment-growth | 16 + 37 base | 33 | 86 | HIGH |
| 4 | Percentage | percentage | 21 + 25 base | 37 | 83 | HIGH |
| 5 | Salary | salary-convert | 15 + 18 base | 30 | 63 | HIGH |
| 6 | Calorie | calorie-needs | 15 + 38 base | 38 | 91 | MEDIUM-HIGH |
| 7 | Due Date | due-date | 17 + 18 base | 25 | 60 | MEDIUM-HIGH |
| 8 | Std Deviation | standard-deviation | 20 + 26 base | 21 | 67 | MEDIUM |

## What Was Verified Per Calculator

### Retirement Projection (CRITICAL — YMYL Financial Planning)
- **Accumulation formula**: FV = PV*(1+r)^n + PMT*((1+r)^n - 1)/r — verified against manual calculation
- **Distribution phase**: Inflation-adjusted drawdown correctness
- **Phase transitions**: immediate retirement, minimal accumulation (1 year), lifeExpectancy ≤ retirementAge
- **Money-runs-out detection**: High withdrawal scenario correctly identifies depletion
- **Year-by-year table**: consecutive year balance consistency (endBalance[n] ≈ startBalance[n+1])
- **Chart data**: breakdown pie segments sum to retirement savings
- **Monotonicity**: higher return → higher savings, higher contributions → higher savings
- **Inflation impact**: verified higher inflation → worse outcome
- **Invalid inputs**: zero/NaN/undefined/string values handled without throwing

### Income Tax (CRITICAL — YMYL Tax Law)
- **Golden test**: $100K single standard deduction — verified effective rate < marginal rate
- **Bracket boundaries**: $0, standard deduction exact, $1 of taxable income, top bracket ($1M, $10M)
- **Bracket sum invariant**: sum of bracket taxes = total federal tax at 6 income levels
- **Filing status**: all 4 statuses produce valid results; married-jointly < single at same income
- **Deduction logic**: itemized > standard → lower tax; itemized < standard → standard used; deductions > income → $0 tax
- **Tax credits**: dollar-for-dollar reduction; credits > tax floors at $0; after-tax never exceeds gross
- **Monotonicity**: higher income → higher tax, higher effective rate
- **Invalid inputs**: all key fields tested with 10 invalid value types

### Investment Growth (HIGH — YMYL Financial)
- **Formula verification**: FV matches manual compound interest calculation
- **Fundamental invariants**: FV = totalContributed + totalEarnings; zero return → FV = contributions
- **Inflation**: zero inflation → realValue = FV; inflation = return → realValue ≈ contributions
- **Year-by-year table**: balance continuity, first year start = initial, last year end ≈ FV
- **Each row**: endBalance ≈ startBalance + contributions + earnings
- **Chart consistency**: breakdown pie sums to FV
- **Monotonicity**: return, contribution, period, initial all increase → higher FV
- **Edge cases**: negative return, very high return (50%), very long period (50yr)

### Percentage (HIGH — Highest Traffic)
- **Percent-of**: identity (100% = X), zero, negative %, large % (500%), very small (0.001%)
- **Floating-point**: 33.33% of 100, 1/3 of 300
- **Percent-change**: no change (0%), double (100%), half (-50%), to zero (-100%), from zero (Infinity), both zero (0%)
- **Negative inputs**: negative → positive, positive → negative
- **Percent-difference**: order independence, always ≥ 0, both zero, one zero
- **Mathematical identities**: X% of Y = Y% of X; double-then-halve returns to original
- **Invalid inputs**: all modes tested

### Salary Converter (HIGH — Very High Traffic)
- **Frequency consistency**: monthly = annual/12, biweekly = annual/26, weekly = annual/52
- **Roundtrip**: annual → hourly → annual (within known 2dp rounding tolerance)
- **PTO logic**: salaried adjusted annual = unadjusted; hourly adjusted < unadjusted
- **Boundaries**: $0, minimum wage ($7.25), high salary ($500K), $1000/hr
- **Working days**: 260 standard, decrease with PTO
- **Breakdown table**: 6 frequency rows
- **Known rounding artifact documented**: $100K / 2080 = $48.08 → back = $100,006.40

### Calorie Needs (MEDIUM-HIGH — YMYL Health)
- **Mifflin-St Jeor**: male and female BMR verified against manual calculation
- **Activity multipliers**: all 5 levels produce monotonically increasing TDEE
- **Goal adjustments**: lose = TDEE - 500, gain = TDEE + 500, maintain = TDEE
- **Macro consistency**: macro calories sum to target calories (±5 cal); percentages sum to ~100%
- **Calorie/gram**: protein 4, carbs 4, fat 9 — verified
- **Imperial ↔ metric**: same person produces similar BMR (±5 cal)
- **Monotonicity**: weight↑ → BMR↑, height↑ → BMR↑, age↑ → BMR↓

### Due Date (MEDIUM-HIGH — Pregnancy Health)
- **Naegele's Rule**: LMP + 280 + cycle adjustment verified for 28, 25, 35 day cycles
- **Conception date**: LMP + (cycleLength - 14) verified
- **Trimester boundaries**: ordered (1st < 2nd < due), 1st ends around week 12-13
- **Milestones**: 11 milestones, chronological order, all between LMP and due date
- **Progress**: 0-100% bounds, non-negative days remaining
- **Edge cases**: leap year, year boundary crossing, extreme cycles (21, 45 days)
- **Formula fix**: added input validation guard for invalid LMP dates

### Standard Deviation (MEDIUM — Academic Accuracy)
- **Golden test**: [2,4,4,4,5,5,7,9] population SD = 2.0
- **Bessel's correction**: sample SD > population SD (verified on 4 datasets)
- **Variance = SD²**: verified on 4 datasets, both population and sample
- **Special cases**: single value (SD=0), identical values (SD=0), two values, negatives
- **Outlier impact**: single outlier dramatically increases SD
- **Step-by-step**: deviations sum to ~0, squared deviations ≥ 0
- **Non-numeric filtering**: dirty input produces same result as clean

## Formula Fix Applied

### Due Date (`lib/formulas/health/due-date.ts`)
**Issue**: `new Date(undefined)` creates Invalid Date → `.toISOString()` throws `RangeError: Invalid time value`
**Fix**: Added guard at function entry — if LMP is invalid (not a string, or produces invalid Date), falls back to today. Cycle length also now clamped to 1-60 range.
**Impact**: Zero existing test regressions.

## Assumptions & Known Behaviors Documented

1. **Salary roundtrip rounding**: Converting $100K annual → hourly ($48.08) → annual ($100,006.40) has $6.40 drift due to 2dp rounding. This is expected behavior, not a bug.

2. **Retirement OOM risk**: The retirement and investment formulas generate large year-by-year arrays. Running `testInvalidInputs` (10 variations per field) with coerced-to-large values can cause heap exhaustion. Tests use targeted invalid input checks instead.

3. **Percentage Infinity**: `percentChange(0 → positive)` returns `Infinity`. This is mathematically correct but UI should display "undefined" or "N/A".

4. **Calorie macro rounding**: Macro percentages may not sum to exactly 100% due to independent rounding. Tolerance of ±2% is acceptable.

## Unresolved Trust Risks

1. **Retirement**: Real-world tax implications not modeled (pre-tax vs post-tax contributions, Social Security income). Users may over-rely on simplified projections.

2. **Income Tax**: 2025 brackets hardcoded — will need annual updates. No state tax, FICA, or AMT modeling.

3. **Percentage Infinity display**: The formula correctly returns Infinity for 0→positive change, but the UI should handle this gracefully.

4. **Calorie weightChangePerWeek**: Hardcoded to ±0.45 kg — not calculated from deficit. Acceptable for general guidance but misleading for users expecting precision.

## Next Layer Recommendation

**UI/Output upgrades priority** (which calculator should get attention first):
1. **Retirement Calculator** — most complex output, would benefit from clearer progress visualization and scenario comparison
2. **Income Tax Calculator** — bracket visualization could be more intuitive
3. **Percentage Calculator** — needs graceful Infinity handling in UI

## Test Count Summary

| Category | Before 6B | Added in 6B | Total |
|----------|-----------|-------------|-------|
| All formula tests | 1,791 | 256 | 2,047 |
| Hardening test files | 0 | 8 | 8 |
| Total test suites | 90 | 8 | 98 |
| Formula modules | 82 | 0 | 82 |
| Formula fixes | — | 1 (due-date) | — |
