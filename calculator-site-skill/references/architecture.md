# Architecture Reference

## Stack

| Layer | Technology |
|-------|-----------|
| Framework | Next.js 14 (App Router) |
| Content | JSON spec files + MDX via next-mdx-remote |
| Styling | Tailwind CSS |
| Calculator Engine | TypeScript modules in /lib/formulas/ |
| Charting | Recharts |
| Math Display | KaTeX |
| Search | Fuse.js (client-side) |
| Hosting | Vercel |
| Analytics | Vercel Analytics + Plausible |

## Project Structure

```
/
├── app/
│   ├── layout.tsx                  # Global layout: nav, footer, Organization schema
│   ├── page.tsx                    # Homepage
│   ├── [category]/
│   │   ├── page.tsx                # Category hub (dynamic from category JSON)
│   │   └── [slug]/
│   │       └── page.tsx            # Calculator page OR subcategory hub
│   ├── methodology/[topic]/page.tsx
│   ├── glossary/
│   │   ├── page.tsx                # Glossary A-Z index
│   │   └── [term]/page.tsx
│   ├── search/page.tsx
│   ├── about/page.tsx
│   └── sitemap/page.tsx            # HTML sitemap
├── components/
│   ├── calculator/
│   │   ├── CalculatorRenderer.tsx  # Main: reads spec, renders inputs + outputs
│   │   ├── inputs/
│   │   │   ├── NumberInput.tsx
│   │   │   ├── CurrencyInput.tsx
│   │   │   ├── PercentageInput.tsx
│   │   │   ├── DatePicker.tsx
│   │   │   ├── SelectInput.tsx
│   │   │   ├── ToggleInput.tsx
│   │   │   ├── RangeInput.tsx
│   │   │   ├── RadioInput.tsx
│   │   │   └── UnitPairInput.tsx
│   │   ├── outputs/
│   │   │   ├── SingleValue.tsx
│   │   │   ├── ValueGroup.tsx
│   │   │   ├── DataTable.tsx
│   │   │   ├── PieChart.tsx
│   │   │   ├── LineChart.tsx
│   │   │   ├── BarChart.tsx
│   │   │   ├── GaugeIndicator.tsx
│   │   │   └── ComparisonView.tsx
│   │   └── features/
│   │       ├── CompareScenarios.tsx
│   │       ├── ShareUrl.tsx
│   │       ├── PrintResults.tsx
│   │       └── TabSwitcher.tsx     # For calculators with tab/mode variants
│   ├── layout/
│   │   ├── Navbar.tsx
│   │   ├── Footer.tsx
│   │   ├── Breadcrumbs.tsx
│   │   └── Sidebar.tsx
│   ├── seo/
│   │   ├── JsonLd.tsx              # Renders JSON-LD schema blocks
│   │   └── MetaTags.tsx
│   ├── content/
│   │   ├── RelatedCalculators.tsx
│   │   ├── FAQSection.tsx
│   │   ├── FormulaBlock.tsx        # KaTeX-rendered formula display
│   │   ├── DisclaimerBlock.tsx
│   │   └── ExampleCalculation.tsx
│   └── ui/
│       ├── Button.tsx
│       ├── Card.tsx
│       ├── SearchBar.tsx
│       └── CategoryCard.tsx
├── content/
│   ├── calculators/
│   │   ├── finance/
│   │   │   ├── mortgage-calculator.spec.json
│   │   │   └── mortgage-calculator.mdx
│   │   ├── health/
│   │   ├── math/
│   │   ├── construction/
│   │   ├── science/
│   │   ├── everyday/
│   │   ├── business/
│   │   └── conversion/
│   ├── categories/
│   │   ├── finance.json
│   │   ├── health.json
│   │   ├── math.json
│   │   ├── construction.json
│   │   ├── science.json
│   │   ├── everyday.json
│   │   ├── business.json
│   │   └── conversion.json
│   ├── glossary/
│   │   └── {term}.mdx
│   └── methodology/
│       └── {topic}.mdx
├── lib/
│   ├── formulas/
│   │   ├── finance/
│   │   │   ├── mortgage-payment.ts
│   │   │   ├── compound-interest.ts
│   │   │   └── index.ts
│   │   ├── health/
│   │   ├── math/
│   │   ├── construction/
│   │   ├── science/
│   │   ├── everyday/
│   │   ├── business/
│   │   └── index.ts                # Formula registry: maps formula ID → function
│   ├── units/
│   │   ├── length.ts
│   │   ├── weight.ts
│   │   ├── temperature.ts
│   │   └── index.ts
│   ├── validation/
│   │   └── index.ts                # Shared input validation utilities
│   ├── content-loader.ts           # Load spec JSON + MDX at build time
│   └── search-index.ts             # Build Fuse.js index from all specs
├── scripts/
│   ├── generate-calculator.ts      # CLI scaffold for new calculators
│   ├── validate-content.ts         # Build-time quality gate checks
│   ├── check-duplicates.ts         # Keyword/intent overlap detection
│   └── audit-links.ts              # Internal link orphan detection
├── __tests__/
│   ├── formulas/                   # Formula unit tests (organized by category)
│   └── integration/                # Page rendering tests
├── public/
│   ├── icons/                      # Category SVG icons
│   └── og/                         # OpenGraph images
├── tailwind.config.ts
├── next.config.js
├── tsconfig.json
└── package.json
```

## Routing Logic

The `[category]/[slug]` route must handle two cases:
1. **Calculator page**: If `slug` matches a calculator spec file in that category
2. **Subcategory hub**: If `slug` matches a subcategory slug in the category definition

Resolution order:
1. Check if `/content/calculators/{category}/{slug}.spec.json` exists → render calculator page
2. Check if `slug` is a subcategory in `/content/categories/{category}.json` with 4+ calculators → render subcategory hub
3. Otherwise → 404

## Build-Time Data Loading

All content is loaded at build time via `generateStaticParams()`:
- Calculator pages: Read all `.spec.json` files, generate pages for each
- Category hubs: Read all category JSON files
- Subcategory hubs: Read category JSONs, filter subcategories with 4+ calculators
- Homepage: Read all specs to build popular calculators list
- Search: Build Fuse.js index from all spec titles + descriptions

## Deployment

- Platform: Vercel
- Build: `next build` (SSG by default, ISR for pages that need updates)
- Environment: No environment variables needed for core content (no database)
- Preview: Every PR gets a preview deployment
- Production: Main branch auto-deploys

## NPM Scripts

```json
{
  "scripts": {
    "dev": "next dev",
    "build": "next build",
    "start": "next start",
    "validate": "ts-node scripts/validate-content.ts",
    "check-dupes": "ts-node scripts/check-duplicates.ts",
    "audit-links": "ts-node scripts/audit-links.ts",
    "qa": "npm run validate && npm run check-dupes && npm run audit-links",
    "generate": "ts-node scripts/generate-calculator.ts",
    "test": "jest",
    "test:formulas": "jest --testPathPattern=formulas"
  }
}
```
