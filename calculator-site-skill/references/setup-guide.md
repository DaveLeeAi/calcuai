# Setup & Execution Guide

This file contains the exact dependencies, configurations, and step-by-step Claude Code task prompts for building the project from scratch.

---

## Package Dependencies

### package.json

```json
{
  "name": "calculator-authority-site",
  "version": "1.0.0",
  "private": true,
  "scripts": {
    "dev": "next dev",
    "build": "next build",
    "start": "next start",
    "lint": "next lint",
    "validate": "npx ts-node scripts/validate-content.ts",
    "check-dupes": "npx ts-node scripts/check-duplicates.ts",
    "audit-links": "npx ts-node scripts/audit-links.ts",
    "qa": "npm run validate && npm run check-dupes && npm run audit-links && npm run test:formulas",
    "generate": "npx ts-node scripts/generate-calculator.ts",
    "test": "jest",
    "test:formulas": "jest --testPathPattern=formulas"
  },
  "dependencies": {
    "next": "^14.2.0",
    "react": "^18.3.0",
    "react-dom": "^18.3.0",
    "next-mdx-remote": "^5.0.0",
    "recharts": "^2.12.0",
    "katex": "^0.16.0",
    "fuse.js": "^7.0.0",
    "gray-matter": "^4.0.3",
    "clsx": "^2.1.0"
  },
  "devDependencies": {
    "typescript": "^5.4.0",
    "@types/node": "^20.0.0",
    "@types/react": "^18.3.0",
    "@types/react-dom": "^18.3.0",
    "@types/katex": "^0.16.0",
    "tailwindcss": "^3.4.0",
    "postcss": "^8.4.0",
    "autoprefixer": "^10.4.0",
    "eslint": "^8.0.0",
    "eslint-config-next": "^14.2.0",
    "jest": "^29.7.0",
    "ts-jest": "^29.1.0",
    "@jest/globals": "^29.7.0",
    "@testing-library/react": "^14.0.0",
    "@testing-library/jest-dom": "^6.0.0",
    "ts-node": "^10.9.0",
    "glob": "^10.0.0"
  }
}
```

---

## next.config.js

```javascript
/** @type {import('next').NextConfig} */
const nextConfig = {
  // Trailing slash: OFF (no trailing slashes on URLs)
  trailingSlash: false,

  // Image optimization
  images: {
    formats: ['image/avif', 'image/webp'],
  },

  // Headers for security + caching
  async headers() {
    return [
      {
        source: '/(.*)',
        headers: [
          { key: 'X-Frame-Options', value: 'DENY' },
          { key: 'X-Content-Type-Options', value: 'nosniff' },
          { key: 'Referrer-Policy', value: 'origin-when-cross-origin' },
        ],
      },
    ];
  },

  // Redirects: force lowercase URLs
  async redirects() {
    return [
      {
        source: '/:path((?:[A-Z]).*)',
        destination: '/:path',
        permanent: true,
      },
    ];
  },
};

module.exports = nextConfig;
```

---

## tsconfig.json Additions

```json
{
  "compilerOptions": {
    "strict": true,
    "baseUrl": ".",
    "paths": {
      "@/*": ["./*"],
      "@/components/*": ["components/*"],
      "@/lib/*": ["lib/*"],
      "@/content/*": ["content/*"]
    }
  }
}
```

---

## tailwind.config.ts

```typescript
import type { Config } from 'tailwindcss';

const config: Config = {
  content: [
    './app/**/*.{js,ts,jsx,tsx,mdx}',
    './components/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      colors: {
        brand: {
          50: '#EDF4FA',
          100: '#D5E8F4',
          200: '#A8D0E8',
          300: '#6BB1D6',
          400: '#3A93C2',
          500: '#1A6FA0',  // Primary brand
          600: '#0D3B5E',  // Dark brand
          700: '#0A2E49',
          800: '#071F33',
          900: '#04121E',
        },
        accent: {
          500: '#2ECC71',  // Success / positive results
          600: '#27AE60',
        },
        warn: {
          500: '#F39C12',  // Warnings
          600: '#E67E22',
        },
        danger: {
          500: '#E74C3C',  // Errors
          600: '#C0392B',
        },
      },
      fontFamily: {
        sans: ['Inter', 'system-ui', 'sans-serif'],
        display: ['Inter', 'system-ui', 'sans-serif'],
        mono: ['JetBrains Mono', 'Consolas', 'monospace'],
      },
      maxWidth: {
        'calculator': '720px',
        'content': '960px',
        'page': '1200px',
      },
    },
  },
  plugins: [],
};

export default config;
```

---

## Jest Configuration

```javascript
// jest.config.js
module.exports = {
  preset: 'ts-jest',
  testEnvironment: 'node',
  roots: ['<rootDir>/__tests__'],
  moduleNameMapper: {
    '^@/(.*)$': '<rootDir>/$1',
  },
  testMatch: ['**/*.test.ts'],
};
```

---

## Scripts Specifications

### scripts/generate-calculator.ts

**Purpose:** Scaffold a new calculator with spec, MDX, and formula stubs.

**Usage:**
```bash
npx ts-node scripts/generate-calculator.ts \
  --slug mortgage-calculator \
  --title "Mortgage Calculator" \
  --category finance \
  --subcategory mortgage \
  --formula mortgage-payment \
  --priority flagship \
  --monetization ads+affiliate
```

**What it creates:**
1. `content/calculators/{category}/{slug}.spec.json` — Full spec skeleton with all v2 fields, placeholder values
2. `content/calculators/{category}/{slug}.mdx` — MDX file with section stubs (## How to Use, ## Formula, ## Example, etc.)
3. `lib/formulas/{category}/{formula}.ts` — Formula module stub with typed interface and TODO implementation
4. `__tests__/formulas/{category}/{formula}.test.ts` — Test file stub with import and first describe block

**What it checks before creating:**
- Slug does not already exist in any spec file
- Category is one of the 8 valid categories
- Formula module doesn't already exist (if it does, skip creation — it's a shared formula)

**What it updates:**
- Adds the calculator ID to the correct subcategory in `content/categories/{category}.json`

### scripts/validate-content.ts

**Purpose:** Build-time quality gate checks. Run with `npm run validate`.

**Checks performed (in order):**

1. **Spec completeness:** Every .spec.json has all required fields (non-null, non-empty)
2. **MDX existence:** Every spec has a matching .mdx file
3. **Word count:** MDX content meets minimum for page type (flagship: 700, standard: 450)
4. **Required sections:** MDX contains all required H2 sections (How to Use, Formula, Example)
5. **Placeholder detection:** No `[TODO]`, `Lorem ipsum`, `Content here`, `TBD` in MDX
6. **Meta uniqueness:** No two specs share the same metaTitle or metaDescription
7. **Related calculators:** Each spec has 4-6 relatedCalculators, all pointing to existing spec IDs
8. **Formula module exists:** The formula ID in each spec maps to an actual file in lib/formulas/
9. **Test file exists:** Each formula module has a matching test file
10. **Category registration:** Each calculator ID appears in its category JSON

**Output:** List of errors (blocking) and warnings (non-blocking). Exit code 1 if any errors.

### scripts/check-duplicates.ts

**Purpose:** Detect keyword and intent conflicts. Run with `npm run check-dupes`.

**Checks performed:**
1. **Primary keyword uniqueness:** No two specs share the same `primaryKeyword`
2. **Title similarity:** Flag specs with Jaccard similarity > 50% on metaTitle words
3. **Input overlap:** Flag spec pairs where > 70% of input field IDs match (merge candidates)
4. **Duplication risk verification:** Specs listed in each other's `duplicationRisk` arrays must have different `primaryKeyword` values

**Output:** List of conflicts. Exit code 1 if any primary keyword duplicates found.

### scripts/audit-links.ts

**Purpose:** Find orphan pages and broken internal links. Run with `npm run audit-links`.

**Checks performed:**
1. **Orphan detection:** Every calculator spec ID must appear in at least 3 places: (a) its category JSON, (b) at least 2 other specs' relatedCalculators arrays
2. **Link validity:** Every ID in every relatedCalculators array maps to an existing spec
3. **Category coverage:** Every spec's `category` and `subcategory` values match a real category/subcategory in the category JSONs
4. **Bidirectional linking check:** If calc A lists calc B as related, check if B links back (warning if not, not blocking)

**Output:** Orphans, broken links, unregistered calculators. Exit code 1 if orphans or broken links found.

---

## Milestone 1: Step-by-Step Task Prompts

These are the exact prompts to give Claude Code, in order. Complete each before moving to the next.

### Task 1: Project Init
```
Read calculator-site-skill/references/architecture.md and calculator-site-skill/references/setup-guide.md.

Initialize a Next.js 14 project with App Router, TypeScript strict mode, Tailwind CSS, and ESLint. Use the exact package.json dependencies, next.config.js, tailwind.config.ts, tsconfig.json, and jest.config.js from the setup guide.

Create the full folder structure from architecture.md (all directories, even empty ones with .gitkeep files).

Verify: `npm run dev` starts without errors.
```

### Task 2: TypeScript Interfaces
```
Read calculator-site-skill/references/calculator-spec-schema.md.

Create the TypeScript interfaces for: CalculatorSpec, InputField, OutputField, TabDefinition, CategoryDefinition, SubcategoryDefinition. Put them in lib/types.ts.

Include all v2 operational fields. Export all interfaces.

Verify: `npx tsc --noEmit` passes.
```

### Task 3: Category JSONs
```
Read calculator-site-skill/references/page-specs.md for the category JSON schema.
Read calculator-site-skill/references/calculator-inventory.md for all calculator IDs and their categories/subcategories.

Create all 8 category definition JSON files in content/categories/ (finance.json, health.json, math.json, construction.json, science.json, everyday.json, business.json, conversion.json).

Each file must include all subcategories and list all calculator IDs from the inventory. Set featuredCalculators for each category (the flagship calcs in that category).

Verify: All 8 files are valid JSON and all 94 calculator IDs appear exactly once across all category files.
```

### Task 4: Input Components
```
Read calculator-site-skill/references/component-patterns.md (Input Components section).

Build all 9 input components in components/calculator/inputs/:
NumberInput, CurrencyInput, PercentageInput, DatePicker, SelectInput, ToggleInput, RangeInput, RadioInput, UnitPairInput.

All must follow the InputComponentProps interface. All must be accessible (labels, ARIA), responsive (mobile-first), and styled with Tailwind using the brand color tokens from tailwind.config.ts.

Verify: Create a test page at app/test/page.tsx that renders one of each input type with sample props.
```

### Task 5: Output Components
```
Read calculator-site-skill/references/component-patterns.md (Output Components section).

Build all 8 output components in components/calculator/outputs/:
SingleValue, ValueGroup, DataTable, PieChart, LineChart, BarChart, GaugeIndicator, ComparisonView.

Charts use Recharts. GaugeIndicator is custom SVG/CSS. All styled with Tailwind.

Verify: Extend the test page to render each output type with sample data.
```

### Task 6: CalculatorRenderer
```
Read calculator-site-skill/references/component-patterns.md (CalculatorRenderer section).
Read calculator-site-skill/references/calculator-spec-schema.md.

Build the CalculatorRenderer component in components/calculator/CalculatorRenderer.tsx.
It reads a CalculatorSpec, renders the appropriate input components, a Calculate button, and output components. It handles state, validation, and formula execution.

Also build the TabSwitcher component for calculators with tabs.

Build lib/formulas/index.ts as a formula registry that maps formula ID strings to formula functions.

Verify: Import a hardcoded test spec and render the CalculatorRenderer with it.
```

### Task 7: Mortgage Calculator (Full Pipeline Test)
```
Read calculator-site-skill/references/calculator-spec-schema.md (example spec + formula pattern).
Read calculator-site-skill/references/content-template.md.

Build the complete Mortgage Calculator:
1. lib/formulas/finance/mortgage-payment.ts — full implementation with types
2. __tests__/formulas/finance/mortgage-payment.test.ts — 10+ test cases
3. content/calculators/finance/mortgage-calculator.spec.json — full spec with all fields
4. content/calculators/finance/mortgage-calculator.mdx — all 10 required sections with real content

Register the formula in lib/formulas/index.ts.

Verify: `npm run test:formulas` passes. The spec JSON is valid. The MDX has all required sections.
```

### Task 8: Calculator Page Template
```
Read calculator-site-skill/references/content-template.md.
Read calculator-site-skill/references/seo-rules.md.
Read calculator-site-skill/references/page-specs.md (disclaimer templates).

Build app/[category]/[slug]/page.tsx — the calculator page template.

It must:
1. Load the spec JSON and MDX at build time
2. Render breadcrumbs, H1, intro (from MDX), CalculatorRenderer, MDX content sections, RelatedCalculators, DisclaimerBlock
3. Generate metadata (title, description, canonical, OpenGraph)
4. Render JSON-LD schema (BreadcrumbList, WebPage, FAQPage if applicable)
5. Implement generateStaticParams to pre-render all calculator pages

Build the supporting content components: RelatedCalculators, FAQSection, FormulaBlock, DisclaimerBlock.
Build the Breadcrumbs component.
Build lib/content-loader.ts for loading specs and MDX.

Verify: Navigate to /finance/mortgage-calculator and see the full page with working calculator, content, breadcrumbs, and schema.
```

### Task 9: Category Hub + Subcategory Hub
```
Read calculator-site-skill/references/page-specs.md (Category Hub and Subcategory Hub specs).

Build app/[category]/page.tsx — the category hub page.
Build the routing logic in app/[category]/[slug]/page.tsx to distinguish between calculator pages and subcategory hubs.

Verify: /finance shows the finance category hub. /finance/mortgage shows the mortgage subcategory hub (has 5 calcs, meets threshold).
```

### Task 10: Navigation + Homepage + Search + SEO
```
Read calculator-site-skill/references/page-specs.md (Homepage, Search, Sitemap specs).
Read calculator-site-skill/references/seo-rules.md.

Build: Navbar, Footer, Homepage, Search page (Fuse.js), HTML Sitemap page, About page.
Build: app/sitemap.ts (XML sitemap), app/robots.ts (robots.txt).
Build: Organization + WebSite schema in layout.tsx.

Verify: Homepage renders with category grid. Search works. Sitemap.xml is valid. Schema validates in Google Rich Results Test.
```

### Task 11: Scaffold + Validation Scripts
```
Read calculator-site-skill/references/setup-guide.md (Scripts Specifications section).

Build all 4 scripts:
1. scripts/generate-calculator.ts
2. scripts/validate-content.ts
3. scripts/check-duplicates.ts
4. scripts/audit-links.ts

Verify: `npm run qa` runs against the single mortgage calculator and passes all checks.
```

### MILESTONE 1 CHECKPOINT
```
Verify all of the following:
- /finance/mortgage-calculator renders with working calculator, all content sections, breadcrumbs, schema
- /finance renders category hub with calculator listings
- /finance/mortgage renders subcategory hub
- Homepage renders with category grid and search
- `npm run qa` passes
- `npm run test:formulas` passes
- Schema validates in Google Rich Results Test (check output HTML)
- Mobile layout is usable

If all pass → Milestone 1 complete. Proceed to Milestone 2 (Flagship 25).
```
