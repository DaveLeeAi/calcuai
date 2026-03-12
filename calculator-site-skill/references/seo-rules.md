# SEO Rules Reference

## Title Tags

| Page Type | Format | Example |
|-----------|--------|---------|
| Calculator page | {Title} — Free Online Calculator \| {Brand} | Mortgage Calculator — Free Online Calculator \| CalcHub |
| Category hub | {Category} Calculators — Free Online Tools \| {Brand} | Financial Calculators — Free Online Tools \| CalcHub |
| Subcategory hub | {Subcategory} Calculators — {Category} Tools \| {Brand} | Mortgage Calculators — Financial Tools \| CalcHub |
| Glossary term | {Term}: Definition & Calculators \| {Brand} | Amortization: Definition & Calculators \| CalcHub |
| Methodology | How {Formula} Works — {Brand} | How Compound Interest Works — CalcHub |

**Rules:**
- Max 60 characters. Drop brand name if it pushes over.
- Never include "Best", "Top", "#1", "2026", or superlatives.
- Never duplicate a title tag across any two pages.

## Meta Descriptions

**Format:** [Action verb] your [outcome] with our free [calculator name]. [Benefit]. No signup required.

**Rules:**
- 120-155 characters. Every page unique.
- Never start with "This calculator..." or "Use our..."
- Include primary keyword naturally.
- End with a benefit or "No signup required."

## Heading Hierarchy

```
H1: Calculator Name (one per page, auto-generated from spec title)
  H2: How to Use This Calculator
  H2: How [Calculator Name] Works (formula section)
  H2: Example Calculation
  H2: Frequently Asked Questions (optional)
    H3: Question 1
    H3: Question 2
  H2: Assumptions (optional)
  H2: Tips (optional)
```

**Rules:**
- One H1 per page. Always.
- Never skip heading levels (no H1 → H3).
- Calculator results area uses styled divs, NOT heading tags.
- Related Calculators section uses H2.

## Schema Markup (JSON-LD)

### Organization — site-wide (layout.tsx)
```json
{
  "@context": "https://schema.org",
  "@type": "Organization",
  "name": "[Brand Name]",
  "url": "https://[domain].com",
  "logo": "https://[domain].com/logo.png"
}
```

### WebSite + SearchAction — homepage only
```json
{
  "@context": "https://schema.org",
  "@type": "WebSite",
  "name": "[Brand Name]",
  "url": "https://[domain].com",
  "potentialAction": {
    "@type": "SearchAction",
    "target": "https://[domain].com/search?q={search_term_string}",
    "query-input": "required name=search_term_string"
  }
}
```

### BreadcrumbList — every page except homepage
```json
{
  "@context": "https://schema.org",
  "@type": "BreadcrumbList",
  "itemListElement": [
    { "@type": "ListItem", "position": 1, "name": "Home", "item": "https://[domain].com" },
    { "@type": "ListItem", "position": 2, "name": "Finance", "item": "https://[domain].com/finance" },
    { "@type": "ListItem", "position": 3, "name": "Mortgage Calculator" }
  ]
}
```
Auto-generated from page hierarchy. Never manual.

### WebPage — every page
```json
{
  "@context": "https://schema.org",
  "@type": "WebPage",
  "name": "[Page Title]",
  "description": "[Meta Description]",
  "dateModified": "[spec.lastContentUpdate]"
}
```

### FAQPage — ONLY pages with visible FAQ
```json
{
  "@context": "https://schema.org",
  "@type": "FAQPage",
  "mainEntity": [
    {
      "@type": "Question",
      "name": "[Question text]",
      "acceptedAnswer": {
        "@type": "Answer",
        "text": "[Answer text]"
      }
    }
  ]
}
```
**CRITICAL:** Only generate FAQPage schema when `spec.hasFAQ === true` AND the MDX file contains an actual FAQ section with content. Never fabricate.

### DO NOT USE
- SoftwareApplication — Google does not reliably support this for web calculators
- HowTo — Risk of rich result volatility. Revisit after 6 months of data.
- Product — Calculators are not products.
- Review — No reviews exist.

### Speakable Schema (Flagship pages only)
Add Speakable schema to flagship calculator pages targeting the most citable sections:
```json
{
  "@context": "https://schema.org",
  "@type": "WebPage",
  "speakable": {
    "@type": "SpeakableSpecification",
    "cssSelector": [".bluf-intro", ".formula-section", ".faq-section"]
  }
}
```
Use selectors from `spec.speakableSelectors`.

## AI Citation Optimization (GEO / LLMO / AEO / RAG)

These rules ensure content gets cited by ChatGPT, Perplexity, Gemini, and Google AI Overviews:

1. **BLUF intro with specific numbers** — First paragraph must contain a concrete fact or number.
2. **Formula sections with source citations** — Always cite the authoritative source for every formula.
3. **Self-contained FAQ answers** — Each FAQ answer quotable without context. First sentence = direct answer.
4. **Citable statements** — Precise claims with numbers: "At 7% with monthly compounding, $10,000 grows to $19,671.51 in 10 years."
5. **Sources & Methodology section** — Required on every calculator page. This is what RAG systems check for authority.
6. **Clean heading hierarchy** — RAG systems parse by H2. Consistent hierarchy = better extraction.
7. **No JavaScript-only content** — All text in initial HTML (Next.js SSG handles this).

## Internal Linking

### Related Calculators Selection
For each calculator, select 4-6 related calculators in this priority order:
1. **Same subcategory** (minimum 2): Most contextually relevant
2. **Same category, different subcategory** (minimum 1): Broader but related
3. **Cross-category with shared user intent** (maximum 2): Only when genuine

### Linking Rules
- Glossary terms are auto-linked on first occurrence per page only
- Never link the same calculator more than once on a page
- Every calculator must be linked TO by at least 3 other pages
- Run link orphan check at build time — no orphan pages allowed
- Category hubs link to all calculators in that category
- Subcategory hubs link to all calculators in that subcategory
- Footer links to all 8 categories

### Breadcrumbs
Format: Home > Category > [Subcategory if applicable] > Calculator Name
- Always visible at top of page
- Linked (except current page)
- Matches BreadcrumbList schema exactly

## Sitemap

### XML Sitemap (auto-generated by Next.js)
- `/sitemap.xml` — index sitemap pointing to sub-sitemaps
- Split at 1,000 URLs: `sitemap-calculators.xml`, `sitemap-hubs.xml`, `sitemap-glossary.xml`
- `lastmod` from spec.lastContentUpdate
- `changefreq`: calculators = monthly, hubs = weekly, homepage = daily
- `priority`: homepage = 1.0, category hubs = 0.8, calculators = 0.7, glossary = 0.5

### Robots.txt
```
User-agent: *
Allow: /
Disallow: /search
Disallow: /api/

Sitemap: https://[domain].com/sitemap.xml
```

## Indexing Rules

| Page Type | Index | Canonical |
|-----------|-------|-----------|
| Calculator pages | Yes | Self-referencing |
| Category hubs | Yes | Self-referencing |
| Subcategory hubs | Yes | Self-referencing |
| Methodology pages | Yes | Self-referencing |
| Glossary pages | Yes | Self-referencing |
| Homepage | Yes | Self-referencing |
| Search results | **Noindex, follow** | None |
| Print views | **Noindex, nofollow** | Parent calculator |

## Canonicalization
- Every page has a self-referencing `<link rel="canonical">` tag
- No trailing slashes (enforce via Next.js middleware)
- All URLs lowercase (enforce via middleware redirect)
- www vs non-www: pick one, 301 redirect the other
- HTTP → HTTPS redirect at Vercel level
