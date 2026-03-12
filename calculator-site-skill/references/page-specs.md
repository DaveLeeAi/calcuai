# Page Specs Reference

This file defines the data schemas and rendering specs for every page type that ISN'T a calculator page (which is covered in calculator-spec-schema.md and content-template.md).

---

## Category Definition JSON Schema

Each of the 8 categories has a definition file in `/content/categories/{category}.json`.

```typescript
interface CategoryDefinition {
  id: string;                    // e.g., "finance"
  name: string;                  // e.g., "Financial Calculators"
  slug: string;                  // e.g., "finance"
  description: string;           // 2-3 sentence description for hub page intro
  icon: string;                  // Path to SVG icon in /public/icons/
  metaTitle: string;             // Title tag for category hub page
  metaDescription: string;       // Meta description for category hub page
  subcategories: SubcategoryDefinition[];
  featuredCalculators: string[]; // IDs of top 8-10 calcs to feature on hub
}

interface SubcategoryDefinition {
  id: string;                    // e.g., "mortgage"
  name: string;                  // e.g., "Mortgage & Home"
  slug: string;                  // e.g., "mortgage"
  description: string;           // 1-2 sentence description
  calculators: string[];         // IDs of all calculators in this subcategory
}
```

### Example: finance.json

```json
{
  "id": "finance",
  "name": "Financial Calculators",
  "slug": "finance",
  "description": "Free financial calculators for mortgages, loans, investments, retirement planning, taxes, and savings. Make smarter money decisions with accurate, easy-to-use tools.",
  "icon": "/icons/finance.svg",
  "metaTitle": "Financial Calculators — Free Online Tools",
  "metaDescription": "Calculate mortgage payments, compound interest, loan terms, retirement savings, and more. Free financial calculators with no signup required.",
  "subcategories": [
    {
      "id": "mortgage",
      "name": "Mortgage & Home",
      "slug": "mortgage",
      "description": "Calculate mortgage payments, refinance savings, home affordability, and down payment timelines.",
      "calculators": [
        "mortgage-calculator",
        "amortization-calculator",
        "refinance-calculator",
        "home-affordability-calculator",
        "down-payment-calculator"
      ]
    },
    {
      "id": "loans",
      "name": "Loans & Debt",
      "slug": "loans",
      "description": "Calculate loan payments, interest rates, and debt payoff strategies.",
      "calculators": [
        "loan-calculator",
        "payment-calculator",
        "interest-rate-calculator",
        "debt-payoff-calculator"
      ]
    },
    {
      "id": "investment",
      "name": "Investment & Savings",
      "slug": "investment",
      "description": "Project compound interest growth, investment returns, and savings goals.",
      "calculators": [
        "compound-interest-calculator",
        "investment-calculator",
        "savings-calculator",
        "cd-calculator",
        "net-worth-calculator",
        "inflation-calculator"
      ]
    },
    {
      "id": "retirement",
      "name": "Retirement",
      "slug": "retirement",
      "description": "Plan for retirement with 401k projections and savings calculators.",
      "calculators": [
        "retirement-calculator",
        "401k-calculator"
      ]
    },
    {
      "id": "tax",
      "name": "Tax",
      "slug": "tax",
      "description": "Estimate income taxes, understand tax brackets, and calculate sales tax.",
      "calculators": [
        "income-tax-calculator",
        "sales-tax-calculator",
        "tax-bracket-calculator",
        "salary-calculator"
      ]
    }
  ],
  "featuredCalculators": [
    "mortgage-calculator",
    "compound-interest-calculator",
    "loan-calculator",
    "investment-calculator",
    "retirement-calculator",
    "income-tax-calculator",
    "salary-calculator",
    "savings-calculator"
  ]
}
```

---

## Homepage Spec

**Route:** `app/page.tsx`

### Sections (top to bottom)
1. **Hero:** Brand name + tagline ("Free Online Calculators") + SearchBar component
2. **Category Grid:** 8 CategoryCard components in a responsive grid (2 cols mobile, 4 cols desktop). Each card shows: icon, category name, description (truncated), count of calculators, top 5 calculator links.
3. **Popular Calculators:** Top 15 calculators across all categories as a link list with one-line descriptions. Order: Mortgage, BMI, Percentage, Age, Compound Interest, Calorie, Loan, GPA, Tip, Date, Fraction, Concrete, Margin, Salary, Standard Deviation.
4. **Footer:** Full category link list + About + Glossary + Sitemap + Disclaimer

### Schema
- Organization (from layout.tsx)
- WebSite + SearchAction

### Data Loading
- Read all 8 category JSONs for the category grid
- Popular calculators list is hardcoded in the page (or pulled from a config)
- Search index loaded client-side

---

## Category Hub Page Spec

**Route:** `app/[category]/page.tsx`

### Data Loading
- `generateStaticParams()` returns all 8 category slugs
- Load category JSON from `/content/categories/{category}.json`
- Load all calculator specs in this category for listing

### Sections
1. **Breadcrumb:** Home > {Category Name}
2. **H1:** `{category.name}` (e.g., "Financial Calculators")
3. **Intro:** `{category.description}` — the 2-3 sentence description from category JSON. PLUS an additional 200-300 words of original hub content stored in `/content/categories/{category}-hub.mdx`. This MDX answers: What problems do these calculators solve? Who are they for? How should someone choose which calculator to use?
4. **Subcategory Cards:** Grid of subcategory sections. Each shows: subcategory name, description, list of calculator links with one-line descriptions. Only subcategories with 4+ calculators get their own cards with "See all →" links to the subcategory hub. Smaller subcategories are listed inline.
5. **Featured Calculators:** The `featuredCalculators` list displayed prominently.
6. **Full Calculator A-Z:** Complete alphabetical list of all calculators in this category.
7. **Related Categories:** Links to 2-3 other categories (manually defined or by affinity).

### Schema
- BreadcrumbList
- WebPage

---

## Subcategory Hub Page Spec

**Route:** `app/[category]/[slug]/page.tsx` (when slug matches a subcategory with 4+ calculators)

### Threshold Rule
Only render this page if the subcategory has 4 or more calculators. Otherwise, return 404 (these calculators are listed on the parent category hub instead).

### Sections
1. **Breadcrumb:** Home > {Category} > {Subcategory Name}
2. **H1:** `{subcategory.name}` (e.g., "Mortgage Calculators")
3. **Intro:** `{subcategory.description}` + 100-150 words of additional context from `/content/categories/{category}-{subcategory}-hub.mdx`
4. **Calculator Listing:** All calculators in this subcategory with descriptions and direct links.
5. **Related Subcategories:** Links to sibling subcategories in the same parent category.
6. **Up-link:** "← Back to {Category Name} Calculators"

### Schema
- BreadcrumbList
- WebPage

---

## Glossary Index Page Spec

**Route:** `app/glossary/page.tsx`

### Sections
1. **H1:** "Calculator Glossary"
2. **Intro:** 2-3 sentences: "Definitions of common terms used across our calculators."
3. **A-Z Listing:** All glossary terms grouped by first letter, linked to their term pages.

### Data Loading
- Read all MDX files in `/content/glossary/`
- Extract frontmatter (title, related calculators)

---

## Glossary Term Page Spec

**Route:** `app/glossary/[term]/page.tsx`

### Threshold Rule
Only create a glossary term page if the term is referenced by 3+ different calculator pages. Check by scanning all spec files' MDX content for the term.

### MDX Structure
```mdx
---
title: "Amortization"
relatedCalculators: ["mortgage-calculator", "amortization-calculator", "loan-calculator"]
---

## What Is Amortization?

[200-300 words defining the term, explaining its relevance, giving context for when someone would encounter this concept.]

## Related Calculators

[Auto-generated from frontmatter relatedCalculators list]
```

### Schema
- BreadcrumbList (Home > Glossary > Term)
- WebPage

---

## Methodology Page Spec

**Route:** `app/methodology/[topic]/page.tsx`

### When to Create
Only for calculators with complex or non-obvious formulas where a deep-dive adds genuine value. Examples: compound interest derivation, tax bracket progressive calculation, BMI formula history and limitations.

### MDX Structure
```mdx
---
title: "How Compound Interest Works"
relatedCalculators: ["compound-interest-calculator", "investment-calculator", "401k-calculator"]
---

## The Compound Interest Formula

[Formula in KaTeX]
[Full derivation or step-by-step explanation]
[800-1500 words total]

## Assumptions and Limitations

[When does this formula apply? When doesn't it?]

## Sources

[Citations — Investopedia, CFA Institute, academic sources]

## Related Calculators

[Auto-generated from frontmatter]
```

### Schema
- BreadcrumbList (Home > Methodology > Topic)
- WebPage

---

## Disclaimer Templates

These are the exact disclaimer texts. Used by the DisclaimerBlock component based on `spec.disclaimer` value.

### Calculator Page Content Sections (from Content Framework)

In addition to the calculator widget and auto-generated sections, every calculator page renders these MDX content sections:

**Required on ALL tiers:** BLUF Intro, Interpretation Section (heading varies by category — see `lib/interpretation-headings.ts`), How to Use, The Formula, Worked Example(s), Sources & Methodology

**Required on Flagship + Standard:** Key Factors, Assumptions & Limitations, FAQ (when genuine)

**Required on Flagship only:** Common Mistakes, Comparison Table

See `references/content-template.md` for the full section blueprint and writing rules.

### finance
"This calculator provides estimates for informational purposes only and does not constitute financial advice. Results are based on the information you provide and standard formulas. Your actual results may vary based on additional factors. Consult a qualified financial advisor before making financial decisions."

### health
"This calculator provides general estimates based on widely used formulas and is not a substitute for professional medical advice, diagnosis, or treatment. Always consult a qualified healthcare provider for personalized guidance regarding your health."

### construction
"This calculator provides material estimates based on standard calculations. Actual requirements may vary based on site conditions, material waste, local building codes, and installation methods. Always consult a licensed contractor for project-specific estimates."

### general
"This calculator provides estimates for informational purposes only. Results are based on the information you provide and may vary based on specific circumstances. Use these results as a starting point, not a definitive answer."

---

## About Page Spec

**Route:** `app/about/page.tsx`

### Sections
1. **H1:** "About [Brand Name]"
2. **Mission:** 2-3 paragraphs about providing free, accurate, useful calculators.
3. **Quality Standards:** Brief description of how calculators are built, tested, and verified.
4. **Contact:** Email for corrections, feedback, and partnership inquiries.
5. **Editorial Policy:** How content is created, reviewed, and maintained.

### Schema
- WebPage
- Organization (from layout)

---

## Search Results Page Spec

**Route:** `app/search/page.tsx`

### Implementation
- Client-side search using Fuse.js
- Index built from all calculator specs (title, description, category, primaryKeyword)
- Query from URL param: `/search?q={query}`
- Results show: calculator title, category badge, one-line description, link

### SEO
- `<meta name="robots" content="noindex, follow">`
- No canonical tag
- No schema markup

---

## HTML Sitemap Page Spec

**Route:** `app/sitemap/page.tsx`

### Sections
1. **H1:** "Sitemap"
2. **Categories:** Each category as an H2 with all calculators listed below as links
3. **Other Pages:** Glossary, About, Methodology pages

### SEO
- Indexed (this is a crawl-helper page)
- WebPage schema
