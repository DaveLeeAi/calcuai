# Post-Calculator Content Refactor — Migration Map

## What Changed

### 1. Context-Aware Heading System (`lib/content-sections.ts`)

**Before:** Universal `DISPLAY_HEADINGS` map forced identical headings across all 97 calculators.
- Every page showed "What Your Results Mean" regardless of context
- MDX-specific headings like "What Your Payment Breakdown Means" were overwritten

**After:** `getContextualHeading()` resolves headings via priority chain:
1. Per-spec `sectionHeadings` override (highest priority)
2. Original MDX heading if calculator-specific (non-generic)
3. Category-aware default (8 category variants)
4. Universal default fallback

**Result:** Finance pages say "What Affects Your Numbers", health pages say "Common Misconceptions", construction says "What Changes Your Estimate", etc.

### 2. Heading Variation by Category

| Section | Finance | Health | Construction | Science | Math | Everyday | Business | Conversion |
|---------|---------|--------|-------------|---------|------|----------|----------|------------|
| keyFactors | What Affects Your Numbers | What Affects This Estimate | What Changes Your Estimate | Variables That Affect Results | Key Concepts | What Affects Your Result | What Drives These Numbers | Conversion Factors |
| commonMistakes | Costly Mistakes to Avoid | Common Misconceptions | Common Estimation Mistakes | *(default)* | Common Errors | *(default)* | Common Analysis Mistakes | Common Conversion Errors |
| assumptions | Assumptions Built Into This Estimate | Important Limitations | What This Doesn't Account For | Where This Model Breaks Down | Constraints & Edge Cases | *(default)* | *(default)* | Precision & Rounding Notes |
| faq | Common Questions | Common Questions | Common Questions | Common Questions | Common Questions | Common Questions | Common Questions | Common Questions |
| formula | *(default)* | How This Is Calculated | *(default)* | *(default)* | *(default)* | How It Works | *(default)* | Conversion Formulas |
| howToUse | *(default)* | *(default)* | *(default)* | *(default)* | *(default)* | Quick Start | *(default)* | *(default)* |
| methodology | *(default)* | *(default)* | *(default)* | *(default)* | *(default)* | *(default)* | *(default)* | Standards & References |

*(default)* = uses universal fallback heading

### 3. Interpretation Section Preserved

The interpretation heading (Section 6) now **keeps the original MDX heading**:
- Mortgage: "What Your Payment Breakdown Means"
- BMI: "What Your Results Mean"
- Tip: "What Your Result Shows"
- Concrete: "What This Estimate Shows"
- Ohm's Law: "Your Result Explained"

Previously, all were overwritten to "What Your Results Mean".

### 4. Enhanced Visual Hierarchy

**Spacing:** `space-y-2` → `space-y-8` between sections (4x more breathing room)

**Expanded card treatment** (7 section types, up from 4):
- `interpretation` → brand accent card (unchanged)
- `keyFactors` → emerald accent card (NEW)
- `workedExamples` → blue accent card (NEW)
- `commonMistakes` → orange accent card (NEW)
- `assumptions` → amber card, stronger on YMYL (enhanced)
- `formula` → indigo card (unchanged)
- `methodology` → gray card (unchanged)

**Section icons:** Subtle monochrome SVG icons before each heading for visual scanning.
- interpretation: checkmark circle (brand)
- keyFactors: adjustment sliders (emerald)
- howToUse: play button (blue)
- formula: code brackets (indigo)
- workedExamples: pencil (blue)
- commonMistakes: warning triangle (orange)
- assumptions: info circle (amber)
- faq: question mark circle (violet)
- methodology: book (gray)

### 5. Enhanced Collapsibility

**Standard tier (new):** howToUse and commonMistakes now collapsible (default open).
Users can collapse after reading; the "open by default" means SEO crawlers see content.

**Utility tier (enhanced):** commonMistakes and keyFactors now collapsible.
commonMistakes defaults closed on utility; keyFactors defaults open.

**Flagship:** unchanged — all sections fully expanded.

---

## Files Modified

| File | Change |
|------|--------|
| `lib/types.ts` | Added `sectionHeadings?: Partial<Record<string, string>>` to `CalculatorSpec` |
| `lib/content-sections.ts` | New heading system, enhanced detection patterns, category heading maps, section icons, improved behavior/styling |
| `components/content/ArticleContent.tsx` | New rendering with context-aware headings, section icons, `space-y-8`, expanded card treatment |
| `app/[category]/[slug]/page.tsx` | Passes `sectionHeadings` (merged from spec) to `ArticleContent` |

---

## Per-Spec Heading Override System

Any calculator can override any section heading via its `.spec.json`:

```json
{
  "sectionHeadings": {
    "keyFactors": "What Affects Your Mortgage Payment",
    "assumptions": "What This Payment Estimate Doesn't Include",
    "faq": "Mortgage FAQs"
  }
}
```

The `interpretationHeading` field (already in the type) is also respected and merged.

Priority: spec override > MDX custom heading > category default > universal default.

---

## Migration TODO

### Phase 1: High-Impact Spec Overrides (Flagship Calculators)

These 25 flagship calculators would benefit most from custom `sectionHeadings`:

**Finance (9):**
- mortgage-calculator: "What Affects Your Monthly Payment", "What This Estimate Leaves Out"
- compound-interest-calculator: "What Accelerates Your Growth", "What This Projection Assumes"
- retirement-calculator: "What Shapes Your Retirement Timeline"
- investment-calculator: "What Drives Your Returns"
- savings-calculator: "What Affects Your Savings Growth"
- home-affordability-calculator: "What Determines Your Budget"
- amortization-calculator: "What Affects Your Payoff Schedule"
- income-tax-calculator: "What Affects Your Tax Liability"
- loan-calculator: "What Affects Your Loan Cost"

**Health (5):**
- bmi-calculator: "Who Should Track BMI"
- calorie-calculator: "What Affects Your Calorie Needs"
- bmr-calculator: "What Affects Your Metabolic Rate"
- macro-calculator: "What Affects Your Macro Targets"
- body-fat-calculator: "What Affects Body Fat Estimates"

**Construction (4):**
- concrete-calculator: "What Changes Your Concrete Order"
- square-footage-calculator: "What Affects Your Measurement"
- roofing-calculator: "What Changes Your Roofing Estimate"
- paint-calculator: "What Affects Your Paint Estimate"

**Math (3):**
- percentage-calculator: use category defaults (already good)
- standard-deviation-calculator: "What Affects Spread"
- fraction-calculator: "Key Properties"

**Science (2):**
- ohms-law-calculator: already has good custom headings
- density-calculator: use category defaults

**Everyday (2):**
- tip-calculator: "Tipping Etiquette Guide"
- age-calculator: use category defaults

### Phase 2: MDX Heading Refresh (Optional)

For calculators where the MDX headings are still generic, consider updating the MDX files directly to use calculator-specific headings. The new system preserves non-generic MDX headings, so any MDX edit automatically flows through.

Example: Change `## Assumptions & Limitations` to `## What This BMI Calculator Doesn't Measure` in the BMI MDX file.

### Phase 3: Section Summary Lead-Ins (Future Enhancement)

Add a one-line summary below section headings for long sections. This would require:
- A `sectionSummaries` field in the spec (similar to `sectionHeadings`)
- ArticleSection rendering a gray italic lead-in below the H2

### Phase 4: Mini-TOC for Flagship Pages (Future Enhancement)

Add a compact table of contents above article sections on flagship pages. This creates a "jump to section" UX. Would use the contextual headings for link text.

### Phase 5: Section Grouping (Future Enhancement)

Group related sections into visual clusters:
- "Understand" group: interpretation + keyFactors
- "Learn" group: howToUse + formula + workedExamples
- "Caution" group: commonMistakes + assumptions
- "Reference" group: faq + methodology

Each group could have a subtle background or divider.

---

## Verification

- TypeScript: 0 errors in modified files
- Build: 156/156 static pages generated
- Tests: 103 suites, 2,133 tests all passing
- No MDX content was modified (pure rendering refactor)
