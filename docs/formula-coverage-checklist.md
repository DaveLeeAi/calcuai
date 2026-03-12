# Formula Coverage Checklist — Layer 6A

**Last Updated:** 2026-03-12
**Status Key:** STRONG = 15+ tests with edge cases | OK = 11-14 tests | NEEDS WORK = gaps identified

---

## Business (11 modules)

| Slug | Formula Module | Tests | Edge Cases | Status | Notes |
|------|---------------|-------|------------|--------|-------|
| break-even-calculator | business/break-even.ts | 15 | Zero costs, zero price | OK | Add negative margin test |
| business-sales-tax-calculator | business/business-sales-tax.ts | 17 | Multiple rates | STRONG | |
| commission-calculator | business/commission.ts | 16 | Zero sales, tiered rates | STRONG | |
| employee-cost-calculator | business/employee-cost.ts | 18 | Partial benefits | STRONG | |
| gross-margin-calculator | business/gross-margin.ts | 15 | Zero revenue | OK | |
| markup-calculator | business/markup.ts | 15 | Zero cost | OK | |
| overtime-calculator | business/overtime.ts | 16 | Zero hours, holiday | STRONG | |
| payroll-calculator | business/payroll.ts | 15 | Multi-state | OK | Add boundary deduction tests |
| profit-calculator | business/profit.ts | 15 | Break-even, loss | OK | |
| revenue-calculator | business/revenue.ts | 15 | Zero units | OK | |
| roi-calculator | business/roi.ts | 15 | Negative ROI | OK | |

## Construction (9 modules)

| Slug | Formula Module | Tests | Edge Cases | Status | Notes |
|------|---------------|-------|------------|--------|-------|
| board-foot-calculator | construction/board-foot.ts | 12 | Small dims, metric | OK | **Add zero/negative dim tests** |
| concrete-calculator | construction/concrete-volume.ts | 20 | Multiple shapes | STRONG | |
| drywall-calculator | construction/drywall.ts | 12 | Openings exceed wall | OK | **Add zero-room test** |
| fence-calculator | construction/fence.ts | 12 | Gate deductions | OK | **Add zero-length test** |
| flooring-calculator | construction/flooring.ts | 11 | Zero waste, metric | OK | **Add negative dims, zero rooms** |
| paint-calculator | construction/paint-coverage.ts | 11 | Openings > wall area | OK | **Add zero dims, negative** |
| roofing-calculator | construction/roofing.ts | 13 | Steep pitch, valleys | OK | |
| square-footage-calculator | construction/square-footage.ts | 21 | Multiple shapes | STRONG | |
| volume-material-calculator | construction/volume-material.ts | 12 | Different materials | OK | |

## Conversion (1 module)

| Slug | Formula Module | Tests | Edge Cases | Status | Notes |
|------|---------------|-------|------------|--------|-------|
| unit-converter | conversion/unit-convert.ts | 110 | All unit categories | STRONG | Comprehensive |

## Everyday (10 modules → 11 IDs)

| Slug | Formula Module | Tests | Edge Cases | Status | Notes |
|------|---------------|-------|------------|--------|-------|
| age-calculator | everyday/date-diff.ts | 52 | Leap year, timezone | STRONG | |
| discount-calculator | everyday/discount.ts | 13 | 100% discount, stacking | OK | |
| electricity-cost-calculator | everyday/electricity-cost.ts | 13 | Zero usage | OK | |
| final-grade-calculator | everyday/final-grade.ts | 13 | Perfect/zero scores | OK | |
| fuel-cost-calculator | everyday/fuel-cost.ts | 12 | Zero distance | OK | |
| gpa-calculator | everyday/gpa.ts | 20 | Mixed grades, honors | STRONG | |
| grade-calculator | everyday/grade.ts | 19 | Boundaries (90/80/70) | STRONG | |
| hours-calculator | everyday/time-math.ts | 38 | Negative time, overflow | STRONG | |
| time-calculator | everyday/time-math.ts | (shared) | (shared) | STRONG | Same module as hours |
| timezone-calculator | everyday/timezone.ts | 16 | Crossing dateline | STRONG | |
| tip-calculator | everyday/tip-calc.ts | 24 | Zero bill, large party | STRONG | |

## Finance (21 modules) — HIGHEST PRIORITY

| Slug | Formula Module | Tests | Edge Cases | Status | Notes |
|------|---------------|-------|------------|--------|-------|
| 401k-calculator | finance/401k-growth.ts | 15 | Employer match, limits | OK | **Add boundary/precision tests** |
| amortization-calculator | finance/amortization.ts | 15 | Final payment adjust | OK | **Add precision regression** |
| cd-calculator | finance/cd-return.ts | 13 | Penalty, early withdraw | OK | |
| compound-interest-calculator | finance/compound-interest.ts | 17 | Zero rate, large numbers | STRONG | **Add precision pins** |
| debt-payoff-calculator | finance/debt-payoff.ts | 15 | Avalanche/snowball | OK | **Add min payment edge** |
| down-payment-calculator | finance/down-payment.ts | 15 | 0%, 100% down | OK | |
| home-affordability-calculator | finance/home-affordability.ts | 15 | DTI boundaries | OK | **Add multi-factor edge** |
| income-tax-calculator | finance/income-tax.ts | 21 | Multiple brackets | STRONG | |
| inflation-calculator | finance/inflation.ts | 16 | Zero inflation | STRONG | |
| interest-rate-calculator | finance/interest-rate-solve.ts | 14 | No convergence | OK | **Add convergence edge** |
| investment-growth-calculator | finance/investment-growth.ts | 16 | Negative returns | STRONG | |
| loan-payment-calculator | finance/loan-payment.ts | 18 | Zero rate, short term | STRONG | **Add precision pins** |
| mortgage-calculator | finance/mortgage-payment.ts | 17 | PMI, zero rate | STRONG | **Add precision regression** |
| net-worth-calculator | finance/net-worth.ts | 15 | Negative net worth | OK | |
| refinance-calculator | finance/refinance-breakeven.ts | 13 | Never breaks even | OK | **Add boundary tests** |
| rent-vs-buy-calculator | finance/rent-vs-buy.ts | 18 | Long projection | STRONG | |
| retirement-calculator | finance/retirement-projection.ts | 16 | Early retire, inflation | STRONG | **Add precision pins** |
| salary-calculator | finance/salary-convert.ts | 15 | Hourly/weekly/monthly | OK | |
| sales-tax-calculator | finance/sales-tax.ts | 14 | Exempt, multi-rate | OK | |
| savings-goal-calculator | finance/savings-growth.ts | 15 | Zero rate | OK | |
| tax-bracket-calculator | finance/tax-brackets.ts | 15 | Bracket boundaries | OK | **Add exact boundary** |

## Health (13 modules)

| Slug | Formula Module | Tests | Edge Cases | Status | Notes |
|------|---------------|-------|------------|--------|-------|
| bmi-calculator | health/bmi.ts | 16 | Boundary categories | STRONG | |
| bmr-calculator | health/bmr.ts | 15 | Multiple formulas | OK | |
| body-fat-calculator | health/body-fat.ts | 15 | Low/high BF% | OK | **Add extreme values** |
| calorie-calculator | health/calorie-needs.ts | 14 | All activity levels | OK | |
| conception-calculator | health/conception.ts | 16 | Irregular cycles | STRONG | |
| due-date-calculator | health/due-date.ts | 18 | Leap year, trimester | STRONG | |
| heart-rate-zone-calculator | health/heart-rate-zones.ts | 15 | Age extremes | OK | |
| ideal-weight-calculator | health/ideal-weight.ts | 15 | Short/tall extremes | OK | **Add unit conversion** |
| lean-body-mass-calculator | health/lean-body-mass.ts | 12 | Multiple formulas | OK | |
| macro-calculator | health/macros.ts | 14 | Goal types | OK | |
| one-rep-max-calculator | health/one-rep-max.ts | 12 | Multiple formulas | OK | |
| pace-calculator | health/pace.ts | 17 | Unit conversions | STRONG | |
| pregnancy-calculator | health/pregnancy.ts | 19 | Full timeline | STRONG | |

## Math (12 modules)

| Slug | Formula Module | Tests | Edge Cases | Status | Notes |
|------|---------------|-------|------------|--------|-------|
| average-calculator | math/central-tendency.ts | 23 | Empty arrays, single | STRONG | |
| circle-calculator | math/circle.ts | 14 | Zero radius | OK | |
| exponent-calculator | math/exponents.ts | 26 | Negative, fractional | STRONG | |
| fraction-calculator | math/fractions.ts | 35 | Zero denom, improper | STRONG | |
| gcf-lcm-calculator | math/gcf-lcm.ts | 33 | Coprime, powers | STRONG | |
| logarithm-calculator | math/logarithm.ts | 18 | Base 1, negative | STRONG | |
| percentage-calculator | math/percentage.ts | 21 | Zero division, modes | STRONG | |
| probability-calculator | math/probability.ts | 33 | Impossible events | STRONG | |
| quadratic-calculator | math/quadratic.ts | 16 | No real roots | STRONG | |
| ratio-calculator | math/ratio.ts | 24 | Zero, simplification | STRONG | |
| standard-deviation-calculator | math/standard-deviation.ts | 26 | Single value, uniform | STRONG | |
| triangle-calculator | math/triangle-solver.ts | 18 | Degenerate, obtuse | STRONG | |

## Science (5 modules)

| Slug | Formula Module | Tests | Edge Cases | Status | Notes |
|------|---------------|-------|------------|--------|-------|
| density-calculator | science/density.ts | 20 | Unit conversions | STRONG | |
| energy-calculator | science/energy.ts | 20 | All solve-for modes | STRONG | |
| ohms-law-calculator | science/ohms-law.ts | 25 | Zero values, modes | STRONG | |
| pressure-calculator | science/pressure.ts | 20 | Unit conversions | STRONG | |
| velocity-calculator | science/velocity.ts | 20 | Unit conversions | STRONG | |

---

## Summary

| Status | Count | % |
|--------|-------|---|
| STRONG | 47 | 57% |
| OK | 35 | 43% |
| NEEDS WORK | 0 | 0% |

### Highest-Value Test Additions (This Layer)
1. Finance precision regression tests (mortgage, compound-interest, loan, amortization, retirement)
2. Finance boundary tests (rate extremes, term extremes, zero inputs)
3. Construction zero/negative dimension guards (paint, flooring, fence, board-foot, drywall)
4. Health extreme value tests (body-fat, ideal-weight, BMR at extremes)
5. Cross-field invariant tests for all formulas with breakdown/summary arrays
