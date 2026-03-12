# Layer 6C — UI/Output Upgrades for Flagship Calculators

**Date:** 2026-03-12
**Scope:** Flagship calculator result presentation, trust scaffolding, mobile UX
**Tests:** 2,047 passing (98 suites) — no regressions
**Build:** 150/150 pages generated, 0 errors

---

## What Changed

### 1. New Reusable Result Components (`components/calculator/results/`)

Three new components that enhance the results section for flagship calculators:

| Component | Purpose | Renders When |
|-----------|---------|-------------|
| **ResultHeader** | "Your Results" heading + formula source badge (e.g., "Source: CFPB") | All calculators get heading; badge shows for flagship only |
| **AssumptionsBar** | Compact inline summary of inputs used: "Based on: Home Price = $350,000 | Down Payment = $70,000 | ..." with expand/collapse for 5+ inputs | Flagship calculators only |
| **MethodologyFooter** | Formula source citation + category-specific disclaimer text | Flagship calculators only |

### 2. Enhanced SingleValue Component

The highlighted primary result now renders with:
- Gradient background card (brand-50 to brand-100)
- Larger typography (4xl mobile, 5xl desktop) with tighter tracking
- Optional `description` text below the value explaining what it means
- Subtle radial gradient overlay for depth

Non-highlighted SingleValue also supports `description` with smaller text.

### 3. Enhanced ValueGroup Component

- Cards now have visible border + hover shadow transition
- Smaller uppercase label text with wider tracking for cleaner hierarchy
- Consistent rounded-lg borders matching the design system
- Optional `description` text below the section heading

### 4. CalculatorRenderer Results Section Upgrade

- Results now separate highlighted outputs (visual priority) from remaining outputs
- Highlighted outputs render first in their own section with tighter spacing
- Flagship calculators get: ResultHeader + AssumptionsBar + outputs + MethodologyFooter
- Non-flagship calculators get: ResultHeader + outputs (no assumptions bar or footer)
- Captures input snapshot at calculation time (`calculatedInputs` state) so the assumptions bar shows what was actually computed, not current input state

### 5. Type Extension

`OutputField.description?: string` — optional field in spec JSON. Provides contextual explanation rendered below the output value.

### 6. Flagship Specs Updated (5 calculators)

| Calculator | Output | Description Added |
|-----------|--------|-------------------|
| Mortgage | `monthlyPayment` | "Estimated total monthly payment including principal, interest, property tax, and insurance (PITI)" |
| Mortgage | `loanSummary` | "Total amounts paid over the full loan term" |
| BMI | `bmi` | "Body Mass Index per WHO guidelines. A BMI between 18.5 and 24.9 is considered normal weight for adults." |
| BMI | `primeRatio` | "Ratio of your BMI to the upper normal limit (25). Values below 1.0 indicate normal weight." |
| Compound Interest | `futureValue` | "Projected total value of your investment including all contributions and compounded returns" |
| Calorie | `targetCalories` | "Recommended daily calorie intake based on your Basal Metabolic Rate, activity level, and selected goal" |
| Retirement | `retirementSavings` | "Projected total retirement savings at your target retirement age, before withdrawals begin" |

---

## Reusable UI Patterns Established

### Pattern 1: Result Hierarchy (highlight separation)
Highlighted outputs render in a visually distinct section before all other outputs. This creates a clear "hero result → supporting details" flow. Works automatically via `highlight: true` in spec.

### Pattern 2: Contextual Description
Any output can add `description` to its spec to explain what the number means. Renders below the value in appropriately-sized muted text. No code changes needed — just add the field to the spec JSON.

### Pattern 3: Assumptions Transparency
The AssumptionsBar pattern shows users exactly what inputs produced their result. It reads from the input field definitions and rendered values — fully automatic, no per-calculator configuration needed.

### Pattern 4: Source Attribution
The ResultHeader badge + MethodologyFooter combo provides two levels of attribution:
- Badge: quick "Source: [citation]" at top for at-a-glance trust
- Footer: full formula description + citation + category disclaimer at bottom

### Pattern 5: Flagship vs Standard Rendering
The `spec.priority === 'flagship'` check controls whether the enhanced scaffolding (assumptions, methodology, source badge) renders. Standard/utility calculators get the cleaner basic layout. This is a zero-config distinction — it reads from the existing `priority` field.

---

## What Should Be Standardized Next

1. **Description rollout** — Add `description` strings to the remaining 20 flagship calculator highlighted outputs. Low effort, high trust impact.

2. **Standard calculator opt-in** — Consider showing AssumptionsBar and MethodologyFooter on standard-tier calculators too (45 calculators). The components are already reusable — just change the `isFlagship` gate to `spec.priority !== 'utility'`.

3. **Dynamic interpretation** — Some calculators could generate interpretation text dynamically based on the result value (e.g., "Your BMI of 24.1 is in the Normal range" or "Your monthly payment is 28% of a $78K income"). This would require a per-calculator interpretation function — more complex but high value for decision-making.

4. **Print-friendly results** — The enhanced result cards would benefit from a `@media print` stylesheet that removes gradients and ensures clean printability.

5. **Result sharing** — The `shareable-url` feature flag exists on many flagship specs but isn't implemented yet. The assumptions bar data could power a "Share these results" feature.

---

## Files Changed

### New Files
- `components/calculator/results/ResultHeader.tsx`
- `components/calculator/results/AssumptionsBar.tsx`
- `components/calculator/results/MethodologyFooter.tsx`
- `components/calculator/results/index.ts`

### Modified Files
- `lib/types.ts` — added `description?: string` to `OutputField`
- `components/calculator/CalculatorRenderer.tsx` — integrated result components, highlight separation, calculated inputs state
- `components/calculator/outputs/SingleValue.tsx` — enhanced highlight card, description support
- `components/calculator/outputs/ValueGroup.tsx` — improved card design, description support
- `content/calculators/finance/mortgage-calculator.spec.json` — 2 descriptions added
- `content/calculators/health/bmi-calculator.spec.json` — 2 descriptions added
- `content/calculators/finance/compound-interest-calculator.spec.json` — 1 description added
- `content/calculators/health/calorie-calculator.spec.json` — 1 description added
- `content/calculators/finance/retirement-calculator.spec.json` — 1 description added
