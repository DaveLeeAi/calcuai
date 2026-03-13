# CalcuAI

A spec-driven calculator authority site built for dual-ranking on Google Search **and** AI model citation (ChatGPT, Perplexity, Gemini, Google AI Overview). **178 calculators** across 8 categories, each defined by a JSON spec + MDX content file + pure TypeScript formula module, rendered by a shared component system.

**183 test suites · 4,215 passing tests · 167 formula modules · 34 glossary terms · 9 methodology pages**

## Tech Stack

- **Framework:** Next.js 14 (App Router)
- **Language:** TypeScript (strict mode)
- **Styling:** Tailwind CSS
- **Content:** JSON spec files + MDX via next-mdx-remote
- **Math:** KaTeX for formula rendering
- **Charts:** Recharts for visualizations
- **Search:** Fuse.js (client-side)
- **Testing:** Jest + ts-jest (4,215 tests across 183 suites)
- **Hosting:** Vercel

## Calculators

178 specs across 8 categories:

| Category | Count | Examples |
|----------|-------|---------|
| **Finance** | 55 | Mortgage, Compound Interest, 401(k), Rental Property, HELOC, Debt Snowball/Avalanche, Self-Employment Tax, Home Insurance, Estimated Tax, Balance Transfer, Mortgage Points, Property Tax |
| **Construction** | 33 | Concrete (Slab, Footing, Block), Roofing (Shingles, Metal), Asphalt, Driveway Cost, HVAC Size, Wire Size, Pool Volume, Paver, Brick, Siding, Carpet, Deck, Insulation, Retaining Wall |
| **Math** | 22 | Percentage, Fraction, Quadratic Formula, Standard Deviation, Probability, Permutation/Combination, Z-Score, Sample Size |
| **Business** | 16 | ROI, Break-Even, Profit, Payroll, Hourly-to-Salary, Net Income, PTO Payout, Raise, Commission |
| **Health** | 16 | TDEE, BMI, BMR, Calorie, Body Fat, Macro, Due Date, Ovulation, Water Intake, Heart Rate Zones |
| **Everyday** | 16 | Tip, Discount, Gas Mileage, Solar Panel, Fuel Cost, Electricity Cost, Age, Date, GPA |
| **Conversion** | 8 | Length, Weight, Temperature, Volume, Area, Data Storage, Square Meter, Speed |
| **Science** | 12 | Ohm's Law, Density, Velocity, Pressure, Energy, Force, Acceleration, Momentum, Work, Power, Frequency, Wave Speed |

### Calculator Tiers

Each calculator has a tier determining content depth:

- **Flagship (~27)** -- 2,000-3,000 words. All 17 article sections. Comparison tables, 2-3 worked examples, 3-5 FAQs.
- **Standard (~90)** -- 1,000-1,800 words. Core sections + key factors + assumptions + FAQ.
- **Utility (~51)** -- 600-1,000 words. Core sections only.

## Project Structure

```
app/                          Next.js pages (App Router)
components/
  calculator/                 CalculatorRenderer, inputs/, outputs/, features/
  layout/                     Navbar, Footer, Breadcrumbs
  seo/                        JsonLd, MetaTags
  content/                    RelatedCalculators, FAQ, FormulaBlock, Disclaimer
  ui/                         Button, Card, SearchBar
content/
  calculators/{category}/     .spec.json + .mdx per calculator
  categories/                 8 category definition JSONs
lib/
  formulas/{category}/        167 pure TypeScript formula modules
  types.ts                    All TypeScript interfaces
  content-loader.ts           Build-time spec + MDX loader
  search-index.ts             Fuse.js index builder
scripts/                      CLI tools (generate, validate, audit, score)
__tests__/formulas/           183 test files, 4,215 unit tests
```

## Getting Started

```bash
# Install dependencies
npm install

# Start dev server
npm run dev

# Production build
npm run build
```

## Scripts

```bash
npm run dev              # Local development server
npm run build            # Production build (auto-generates formula registry)
npm run test             # Run all tests
npm run test:formulas    # Run formula unit tests only
npm run validate         # Content quality gate checks (all 6 gates)
npm run check-dupes      # Check for keyword/intent duplicates
npm run audit-links      # Check for orphan pages and broken links
npm run score            # Score all calculator specs
npm run qa               # Run all validation (validate + dupes + links + tests + score)
npm run generate         # Scaffold a new calculator (interactive CLI)
npm run generate:registry # Rebuild the formula auto-discovery registry
```

## How It Works

### Spec-Driven Architecture

Every calculator is defined by three files:

1. **Spec** (`content/calculators/{category}/{slug}.spec.json`) -- Metadata, input fields, output fields, SEO config, related calculators, tier, schema settings.
2. **Content** (`content/calculators/{category}/{slug}.mdx`) -- Article body with BLUF intro, formula explanation, worked examples, FAQs, and sources.
3. **Formula** (`lib/formulas/{category}/{name}.ts`) -- Pure TypeScript function. No side effects. Takes typed inputs, returns typed outputs. Registered in the auto-generated formula registry.

The shared `CalculatorRenderer` component reads the spec, wires up the formula, and renders the appropriate input/output components. No per-calculator React code needed.

### Content Framework

Articles are optimized for both traditional SEO and AI model citation through 7 structural rules:

- **BLUF intro** -- First paragraph gives the direct answer with a specific number
- **Formula section** -- KaTeX rendering + every variable defined + source citation
- **Worked examples** -- Step-by-step with real numbers, ending with practical interpretation
- **FAQ answers** -- First sentence is the direct answer, self-contained and citable
- **Sources section** -- Every calculator cites at least one authoritative source
- **Schema markup** -- JSON-LD (Organization, WebPage, FAQPage, Speakable, BreadcrumbList)
- **Citable statements** -- Precise facts with specific numbers throughout

### Quality Gates

All 6 must pass before deploy:

1. **Calculator Works** -- 10+ unit tests pass including edge cases
2. **Content Exists** -- All tier-required sections present, word count meets target
3. **Content Is Original** -- No copy-pasted content between calculators
4. **No Keyword Conflict** -- Primary keyword unique across all specs
5. **Not Too Thin** -- Genuine informational value beyond the widget
6. **Content Citability** -- BLUF has specific number, formula has source citation

## Adding a Calculator

```bash
# Interactive scaffold
npm run generate

# This creates:
#   content/calculators/{category}/{slug}.spec.json
#   content/calculators/{category}/{slug}.mdx
#   lib/formulas/{category}/{slug}.ts
#   __tests__/formulas/{category}/{slug}.test.ts
```

Then fill in the spec fields, write the formula logic, add 10+ tests, and write the MDX article following the content template for the calculator's tier.

## Testing

```bash
# All tests
npm test

# Formula tests only (fast)
npm run test:formulas

# Single formula
npx jest --testPathPattern=mortgage
```

Formula modules are pure functions with no dependencies, making them fast to test. Each formula has 10-20+ test cases covering standard inputs, edge cases, boundary values, and error conditions.

## License

All rights reserved.
