# Calculator Acceptance Standard

> **Purpose:** Single source of truth for what makes a CalcAuthority calculator page production-ready.
> Every calculator must pass this standard before publishing. No exceptions.

---

## 1. Tier Definitions & Requirements

Every calculator is classified into one of three tiers. The tier determines word count targets, required sections, and content depth.

### Tier Matrix

| Requirement | Flagship | Standard | Utility |
|---|---|---|---|
| **Word count target** | 3,000–4,000 | 1,800–2,500 | 800–1,200 |
| **Word count minimum** | 2,500 | 1,400 | 600 |
| **Required sections** | All 17 | 14 of 17 | 9 of 17 |
| **FAQ items** | 3–5 (mandatory) | 2–3 (if genuine questions exist) | None |
| **Worked examples** | 2–3 with interpretation | 1–2 with interpretation | 1 minimal |
| **Citable statements** | 5+ with specific numbers | 3+ with specific numbers | 1–2 |
| **Related calculators** | 6 contextual links | 4–5 contextual links | 3–4 contextual links |
| **Speakable schema** | Required | Optional | Not required |
| **Data sources section** | Full methodology if data-dependent | Full methodology if data-dependent | Brief "How This Is Calculated" |

### Required Sections by Tier

Sections marked ✅ are required. Sections marked ○ are recommended but optional.

| # | Section | Flagship | Standard | Utility |
|---|---|---|---|---|
| 1 | BLUF Intro | ✅ | ✅ | ✅ |
| 2 | Calculator Widget | ✅ | ✅ | ✅ |
| 3 | What Your Results Mean | ✅ | ✅ | ✅ |
| 4 | Formula / How It Works | ✅ | ✅ | ✅ |
| 5 | Worked Example(s) | ✅ | ✅ | ✅ |
| 6 | Key Concepts Explained | ✅ | ✅ | ○ |
| 7 | When to Use This Calculator | ✅ | ✅ | ○ |
| 8 | Common Mistakes to Avoid | ✅ | ✅ | ○ |
| 9 | Practical Applications | ✅ | ○ | ○ |
| 10 | Comparison / Context Table | ✅ | ○ | ○ |
| 11 | Pro Tips / Advanced Usage | ✅ | ○ | ○ |
| 12 | Limitations & Assumptions | ✅ | ✅ | ✅ |
| 13 | Related Calculators | ✅ | ✅ | ✅ |
| 14 | FAQ | ✅ | ✅ (if genuine) | ○ |
| 15 | Methodology & Sources OR How This Is Calculated | ✅ | ✅ | ✅ |
| 16 | Meta / SEO Block | ✅ | ✅ | ✅ |
| 17 | Schema Markup | ✅ | ✅ | ✅ |

### Section Word Count Guidelines

| Section | Target Range | Hard Max |
|---|---|---|
| BLUF Intro | 40–80 words | 100 |
| What Your Results Mean | 80–120 words | 150 |
| Formula / How It Works | 100–200 words | 300 |
| Each Worked Example | 100–180 words | 250 |
| Key Concepts Explained | 150–300 words | 400 |
| Common Mistakes | 100–200 words | 250 |
| Practical Applications | 100–250 words | 350 |
| Limitations & Assumptions | 60–120 words | 150 |
| Each FAQ Answer | 40–80 words | 120 |
| Methodology & Sources | 80–200 words | 300 |
| How This Is Calculated | 40–80 words | 100 |

---

## 2. Content Quality Rules

### 2.1 BLUF Intro

The opening paragraph uses Bottom Line Up Front structure. It tells the reader exactly what this calculator does and gives them a reason to use it right now.

**Requirements:**
- 40–80 words, one paragraph
- Must contain at least one specific number or statistic
- First sentence states what the calculator does
- Second or third sentence provides a concrete hook (stat, savings figure, common mistake)
- Must NOT start with "Welcome to," "In today's world," "Are you looking for," "Whether you're," or any throat-clearing phrase
- Must NOT be a generic description — it must be specific to this calculator's domain

**Pass example:**
> "Calculate your monthly mortgage payment including principal, interest, taxes, and insurance. The average American spends 28% of gross income on housing — this calculator shows whether your target home fits the 28/36 rule before you commit."

**Fail example:**
> "Welcome to our mortgage calculator! In today's complex financial landscape, understanding your mortgage payment is more important than ever. This tool helps you calculate various aspects of your home loan."

### 2.2 What Your Results Mean

This section interprets the user's output. It does NOT describe what the calculator does — the BLUF intro already did that.

**Requirements:**
- 80–120 words maximum
- Interpret, don't describe (say what the number means, not what the calculator computed)
- Must include at least one internal link to a related calculator
- Use concrete thresholds or ranges ("Under 28%: comfortable," "28–36%: stretched," "Over 36%: risky")
- Must NOT be a wall of text — use short paragraphs or a brief interpretive table
- Must NOT repeat the intro

### 2.3 Formula Section

**Requirements:**
- All formulas rendered in KaTeX (never plain text math)
- Every variable defined immediately after the formula block
- If `requiresSources: true` in the spec → cite the data source for the formula (name, year, what it provides)
- If `requiresSources: false` → no citation needed; the formula is mathematical identity
- Show the formula in its standard form, not a programming representation

### 2.4 Worked Examples

**Requirements:**
- Use real-world realistic numbers (not round thousands or obvious placeholders)
- Show step-by-step substitution into the formula
- End with a practical interpretation sentence ("This means you'd pay $1,247/month, which is 31% of your gross income — within the recommended range.")
- Flagship: 2–3 examples covering different scenarios (e.g., low/mid/high)
- Standard: 1–2 examples
- Utility: 1 example minimum

### 2.5 FAQ

**Requirements:**
- H3 headings for each question — NEVER `<details>`/`<summary>` elements
- First sentence of each answer is a direct, standalone answer to the question
- Each answer is self-contained (a reader should understand it without reading the rest of the page)
- Questions must be genuine search queries, not restatements of page content
- Only add FAQ if `hasFAQ: true` in the spec AND there are real questions to answer
- Flagship: 3–5 FAQ items
- Standard: 2–3 FAQ items (only if genuine questions exist)
- Utility: FAQ not required

### 2.6 Citable Statements

Every page must contain authoritative, specific claims that AI search engines and featured snippets can extract.

**Requirements:**
- Flagship: 5+ citable statements
- Standard: 3+ citable statements
- Utility: 1–2 citable statements
- Each must contain a specific number, percentage, threshold, or named standard
- Must be factually accurate and attributable to a real source when data-dependent
- Distribute throughout the article, not clustered in one section

**Pass example:**
> "The IRS considers a home office deduction valid when the space is used regularly and exclusively for business — the standard deduction for 2024 is $5 per square foot, up to 300 square feet ($1,500 maximum)."

**Fail example:**
> "Many people find this calculator helpful for their financial planning needs."

---

## 3. Technical Requirements

### 3.1 Spec File (JSON)

All required fields must be populated with real values:

| Field | Required | Notes |
|---|---|---|
| `id` | ✅ | Unique slug, kebab-case |
| `title` | ✅ | Human-readable title |
| `description` | ✅ | 120–155 chars, action verb start |
| `category` | ✅ | Must match one of the 8 defined categories |
| `tier` | ✅ | `flagship`, `standard`, or `utility` |
| `formulaCitation` | ✅ | Source name or `null` if pure math |
| `articleWordTarget` | ✅ | Must match tier targets from Section 1 |
| `speakableSelectors` | ✅ for flagship | Array of CSS selectors for speakable schema |
| `requiresSources` | ✅ | `true` if data-dependent, `false` if formula-only |
| `hasFAQ` | ✅ | `true` only if real FAQ content exists on page |
| `relatedCalculators` | ✅ | Array of 4–6 calculator IDs |
| `status` | ✅ | `draft`, `review`, or `published` |
| `qualityScore` | ✅ | Integer 0–100, must be ≥ 60 to publish |

### 3.2 Formula Module

- TypeScript with typed inputs and outputs (interfaces or type aliases)
- Pure function — no side effects, no API calls, no DOM access
- JSDoc comment block including the formula in plain text
- Handles edge cases gracefully (division by zero returns `null` or `Infinity` with a flag, not a crash)
- Exported as named export

### 3.3 Tests

- Minimum 10 test cases per formula module
- Must include: typical inputs, boundary values (zero, negative, very large), edge cases (division by zero, empty inputs)
- At least 2 tests verify output against a known authoritative result (textbook, government table, etc.)
- All tests passing — zero failures

### 3.4 Related Calculators

- 4–6 contextual links per page (flagship: 6, standard: 4–5, utility: 3–4)
- Links must be semantically related (same category or complementary use case)
- Each link must use the calculator's actual title, not generic anchor text
- Must link to published or review-status calculators only

### 3.5 No Placeholder Content

Zero tolerance for:
- `[TODO]`, `[TBD]`, `[PLACEHOLDER]`, `[INSERT]`
- Lorem ipsum or filler text
- Empty sections with only a heading
- Commented-out draft content visible in the rendered page
- Generic stock phrases that could apply to any calculator

---

## 4. SEO Requirements

### 4.1 Meta Tags

| Element | Requirement |
|---|---|
| **Title** | Max 60 characters. Format: `{Calculator Title} — Free Online Calculator` |
| **Description** | 120–155 characters. Starts with an action verb. Unique per page. Contains primary keyword. |
| **Canonical** | Self-referencing canonical URL. Must match the deployed URL exactly. |
| **Robots** | `index, follow` for published pages. `noindex` for draft/review. |

### 4.2 Schema Markup

**Always required:**
- `BreadcrumbList` — Home → Category → Calculator
- `WebPage` — with `name`, `description`, `datePublished`, `dateModified`

**Conditional:**
- `FAQPage` — ONLY if `hasFAQ: true` AND visible FAQ content exists on the rendered page. Never add FAQ schema without corresponding visible FAQ section.
- `SpeakableSpecification` — Required for flagship tier. Must reference actual content selectors via `speakableSelectors` in the spec.

### 4.3 URL Structure

- Pattern: `/calculators/{category}/{slug}`
- All lowercase, kebab-case
- No trailing slashes
- Must match the `id` field in the spec

### 4.4 Headings

- One H1 per page (the calculator title)
- Logical H2 → H3 hierarchy, no skipped levels
- H2 for main sections, H3 for subsections and FAQ questions
- No H4+ unless genuinely needed for deep nesting

### 4.5 Internal Linking

- Every page links to 4–6 related calculators (via Related Calculators section)
- "What Your Results Mean" section must contain at least 1 internal link
- Body content should contain 2–4 additional contextual internal links where natural
- Anchor text must be descriptive (never "click here" or "this calculator")

---

## 5. Conditional Sources Logic

The `requiresSources` field in the spec determines which ending section to use.

### If `requiresSources: true` (Data-Dependent Pages)

Use the heading: **## Methodology & Sources**

Content must include:
- Named source (e.g., "Bureau of Labor Statistics Consumer Price Index")
- Year or date range the data covers
- What specifically the source provides to this calculator
- If multiple sources: list each with the above details
- Link to the source if publicly accessible

**Pass:**
> "Tax brackets and standard deduction amounts from the IRS Revenue Procedure 2024-40 (tax year 2024). FICA rates from the Social Security Administration's 2024 fact sheet. State tax data from the Tax Foundation's 2024 state tax tables."

**Fail:**
> "Sources: IRS, SSA, Tax Foundation" (no specifics, no years, no explanation of what each provides)

### If `requiresSources: false` (Formula-Only Pages)

Use the heading: **## How This Is Calculated**

Content must be:
- 2–4 sentences explaining the mathematical basis
- No citations needed — the formula is a mathematical identity or universally known
- Do NOT invent citations for basic math (never cite Archimedes for π, never cite Euclid for area formulas)
- Do NOT use the "Methodology & Sources" heading

**Pass:**
> "This calculator uses the standard compound interest formula A = P(1 + r/n)^(nt), where compounding frequency and time determine the growth curve. The formula is a mathematical identity — no external data sources are required."

**Fail:**
> "## Methodology & Sources\n\nThe circle area formula (A = πr²) was first derived by Archimedes of Syracuse in approximately 250 BCE (Source: Archimedes, On the Measurement of the Circle, c. 250 BCE)."

---

## 6. Anti-Patterns

These are explicit prohibitions. Any occurrence is an automatic rejection.

### Content Anti-Patterns

1. **Wall of text in "What Your Results Mean."** This section must not exceed 150 words. If it reads like a second introduction, it fails.
2. **`<details>`/`<summary>` for FAQ.** Always use H3 headings. Accordion elements break FAQ schema and are inaccessible to crawlers.
3. **Citing ancient mathematicians for basic formulas.** Never cite Archimedes for circle math, Pythagoras for the Pythagorean theorem, or Euler for compound interest in a sources section. These are mathematical identities, not data.
4. **Standalone pages for what should be a tab or mode.** If two calculators share 80%+ of their logic and differ only by one input toggle, they must be modes/tabs on a single page.
5. **Publishing with qualityScore below 60.** The spec's `qualityScore` field must be ≥ 60. Pages scoring 60–69 require documented justification.
6. **FAQ schema without visible FAQ content.** If `hasFAQ: true` in the spec, there must be a visible FAQ section on the rendered page with real questions and answers.
7. **Generic filler phrases.** Phrases like "in today's fast-paced world," "whether you're a beginner or expert," "this powerful tool," or "take control of your financial future" add zero value.
8. **Describing instead of interpreting in results sections.** "This calculator computes your monthly payment" is description. "A payment of $1,247 puts you at 31% of gross income — within the safe zone" is interpretation.

### Technical Anti-Patterns

9. **Fake or hallucinated source citations.** Never invent a source. If you don't have a real source, don't cite one.
10. **Untyped formula modules.** All inputs and outputs must have TypeScript types.
11. **Tests with fewer than 10 cases.** The minimum is 10, including edge cases.
12. **Broken internal links.** Every internal link must resolve to an existing page in `draft`, `review`, or `published` status.
13. **Duplicate meta descriptions.** Each page's meta description must be unique across the entire site.
14. **Missing canonical URL.** Every page must have a self-referencing canonical.

---

## 7. Quality Scoring

The quality score is computed across six gates. A page must score ≥ 60 overall to be eligible for publishing, and ≥ 80 for auto-approval.

### Gate Breakdown

| Gate | Weight | What It Measures |
|---|---|---|
| G1: Structure | 20% | All required sections present, correct heading hierarchy, no empty sections |
| G2: Content Depth | 25% | Word count within tier target, citable statements meet minimum, BLUF quality |
| G3: Technical | 20% | Spec fields complete, formula module typed and tested, 10+ tests passing |
| G4: SEO | 15% | Meta tags valid, schema correct, canonical set, internal links present |
| G5: Accuracy | 10% | Formulas verified, sources cited correctly, worked examples check out |
| G6: Polish | 10% | No placeholders, no anti-patterns, no filler, consistent tone |

### Score Thresholds

| Score | Status | Action |
|---|---|---|
| 90–100 | Excellent | Auto-publish eligible |
| 80–89 | Good | Publish with confidence |
| 70–79 | Acceptable | Publish, flag for future improvement |
| 60–69 | Marginal | Publish only with documented justification |
| Below 60 | Rejected | Must not be published. Fix and re-score. |

---

## 8. Acceptance Checklist

Every item must be **YES** before a page can be published. This checklist is designed to be machine-parseable for future automation.

```yaml
acceptance_checklist:
  # === STRUCTURE ===
  - id: S1
    check: "BLUF intro present, 40-80 words, contains specific number"
    required: true
  - id: S2
    check: "Calculator widget renders without errors"
    required: true
  - id: S3
    check: "What Your Results Mean section present, ≤150 words, interprets not describes"
    required: true
  - id: S4
    check: "Formula section uses KaTeX, all variables defined"
    required: true
  - id: S5
    check: "Worked example(s) with real numbers, step-by-step, ends with interpretation"
    required: true
  - id: S6
    check: "All tier-required sections present (see Section 1 matrix)"
    required: true
  - id: S7
    check: "Section word counts within guidelines (no section exceeds hard max)"
    required: true
  - id: S8
    check: "Heading hierarchy is H1 > H2 > H3, no skipped levels"
    required: true

  # === CONTENT QUALITY ===
  - id: C1
    check: "BLUF does not start with banned phrases (Welcome to, In today's world, etc.)"
    required: true
  - id: C2
    check: "Citable statements meet tier minimum (flagship: 5+, standard: 3+, utility: 1-2)"
    required: true
  - id: C3
    check: "FAQ uses H3 headings, not details/summary elements"
    required: true
  - id: C4
    check: "FAQ first sentence is a direct answer (if FAQ exists)"
    required: true
  - id: C5
    check: "No placeholder text ([TODO], Lorem ipsum, [INSERT], etc.)"
    required: true
  - id: C6
    check: "No generic filler phrases (see Anti-Pattern #7)"
    required: true
  - id: C7
    check: "What Your Results Mean contains at least 1 internal link"
    required: true
  - id: C8
    check: "Word count is within tier target range"
    required: true

  # === TECHNICAL ===
  - id: T1
    check: "Spec file has all required fields populated with real values"
    required: true
  - id: T2
    check: "Formula module is TypeScript with typed inputs/outputs"
    required: true
  - id: T3
    check: "Formula module is a pure function with JSDoc"
    required: true
  - id: T4
    check: "10+ test cases including edge cases, all passing"
    required: true
  - id: T5
    check: "Related calculators: 4-6 contextual links to existing pages"
    required: true
  - id: T6
    check: "qualityScore field is ≥ 60"
    required: true

  # === SEO ===
  - id: E1
    check: "Meta title ≤ 60 chars, format: {Title} — Free Online Calculator"
    required: true
  - id: E2
    check: "Meta description 120-155 chars, action verb start, unique"
    required: true
  - id: E3
    check: "Self-referencing canonical URL set"
    required: true
  - id: E4
    check: "BreadcrumbList + WebPage schema present"
    required: true
  - id: E5
    check: "FAQPage schema present ONLY if hasFAQ: true AND visible FAQ content exists"
    required: true
  - id: E6
    check: "Speakable schema on flagship tier calculators"
    required: true
  - id: E7
    check: "URL matches pattern /calculators/{category}/{slug}"
    required: true

  # === SOURCES ===
  - id: R1
    check: "If requiresSources: true → Methodology & Sources section with named sources, years, and what they provide"
    required: true
  - id: R2
    check: "If requiresSources: false → How This Is Calculated section (2-4 sentences, no fake citations)"
    required: true
  - id: R3
    check: "No citations of ancient mathematicians for basic formulas"
    required: true

  # === ANTI-PATTERNS ===
  - id: A1
    check: "What Your Results Mean is NOT a 200+ word wall of text"
    required: true
  - id: A2
    check: "No <details>/<summary> elements used for FAQ"
    required: true
  - id: A3
    check: "No standalone page for what should be a tab/mode"
    required: true
  - id: A4
    check: "No broken internal links"
    required: true
  - id: A5
    check: "No duplicate meta descriptions across site"
    required: true
  - id: A6
    check: "No hallucinated or fake source citations"
    required: true

  # === INFRASTRUCTURE ===
  - id: I1
    check: "Layout matches tier requirement (3-col flagship, 2-col standard/utility)"
    required: true
  - id: I2
    check: "Table of Contents present and scroll-highlighting works (flagship + standard)"
    required: true
  - id: I3
    check: "Sticky calculator widget works on desktop, floating button on mobile"
    required: true
  - id: I4
    check: "Related calculators sidebar card present with correct link count per tier"
    required: true
  - id: I5
    check: "Key Takeaway aside block present with aria-label='summary'"
    required: true

  # === AI/LLM DISCOVERY ===
  - id: D1
    check: "data-speakable attributes on BLUF intro and results interpretation"
    required: true
  - id: D2
    check: "Citable statements have data-fact='true' markup (3+ per page)"
    required: true
  - id: D3
    check: "FAQ dual-rendered: JSON-LD schema AND visible HTML with H3 headings"
    required: true
  - id: D4
    check: "Citation meta tags present (citation_title, citation_author)"
    required: true
  - id: D5
    check: "Full schema stack matches tier requirement"
    required: true
  - id: D6
    check: "'Last updated' date visible at top of article"
    required: true

  # === DATA PAGES (only if requiresSources: true) ===
  - id: P1
    check: "Interactive data table with sort/filter/search"
    required: false
  - id: P2
    check: "Data visualization present (chart, map, or graphic)"
    required: false
  - id: P3
    check: "Dataset schema in JSON-LD"
    required: false
```

---

## 9. Page Infrastructure Requirements

Every calculator page must use the shared infrastructure components. The layout and required features are determined by the calculator's tier.

### Flagship Tier (required)

- **3-column layout:** TOC (left sticky) + Article (center) + Calculator + Related Sidebar (right sticky)
- **Table of Contents** auto-generated from H2/H3 headings, sticky on desktop, collapsible on mobile, scroll-highlighted
- **Sticky calculator widget** that follows user on scroll (desktop), "Back to calculator" floating button (mobile)
- **Related calculators sidebar card** below sticky calculator (6 links)
- **Key Takeaway aside block** at top for AI/LLM extraction
- **Speakable schema** on BLUF intro and What Your Results Mean sections
- **Full schema stack:** WebPage + BreadcrumbList + FAQPage + SpeakableSpecification + HowTo + SoftwareApplication
- All citable statements wrapped in `data-fact="true"` markup
- "Last updated" date visible at top
- "Data sources" attribution visible
- Reading progress indicator
- **Core Web Vitals:** lazy load below-fold, priority load calculator, font-display: swap, preconnect CDNs

### Standard Tier (required)

- **2-column layout:** Article (left) + Calculator (right sticky)
- **Table of Contents** auto-generated, sticky on desktop
- **Sticky calculator widget**
- **Related calculators sidebar card** (4–5 links)
- **Key Takeaway aside block**
- **Schema:** WebPage + BreadcrumbList + FAQPage (if hasFAQ) + SoftwareApplication
- Citable statements with `data-fact` markup
- "Last updated" date visible
- Core Web Vitals optimizations

### Utility Tier (required)

- **2-column layout:** Article (left) + Calculator (right sticky)
- **Sticky calculator widget**
- **Related calculators** at bottom (3–4 links)
- **Schema:** WebPage + BreadcrumbList + SoftwareApplication
- Core Web Vitals optimizations

### Data-Dependent Pages (additional requirements when `requiresSources: true`)

- Interactive data table component (sortable, filterable, searchable)
- Data visualization where applicable (chart, map, or comparison graphic)
- Dataset schema in JSON-LD
- Source citations with URLs visible in Methodology section

### AI/LLM Discovery (all tiers)

- `data-speakable` attributes on BLUF and results sections
- Key Takeaway aside with `aria-label="summary"`
- Structured FAQ dual-rendered (JSON-LD + visible HTML)
- Citation meta tags (`citation_title`, `citation_author`)
- Every page must have 3+ citable statements with specific numbers that AI search can extract as direct answers

---

## Quick Reference: Build Workflow

When building a new calculator page, follow this sequence:

1. **Classify tier** → Determines word count target, required sections, FAQ requirements
2. **Create spec file** → All required fields, correct tier, related calculators identified
3. **Build formula module** → TypeScript, typed, pure function, JSDoc
4. **Write tests** → 10+ cases, edge cases, at least 2 against known authoritative results
5. **Write MDX content** → Follow section order from the tier matrix, hit word count targets
6. **Apply sources logic** → Check `requiresSources`, use correct heading and format
7. **Add SEO elements** → Meta tags, schema, canonical, internal links
8. **Run acceptance checklist** → Every item must be YES
9. **Score** → Must be ≥ 60 to publish, ≥ 80 for auto-approval
10. **Set status** → `review` if 60–79, `published` if ≥ 80

---

*This document consolidates requirements from CLAUDE.md, content-template.md, quality-gates.md, seo-rules.md, and calculator-spec-schema.md. It is the single acceptance gate for all CalcAuthority calculator pages.*
