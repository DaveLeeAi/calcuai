# Content Template Reference

Every calculator page has an MDX content file. This template integrates the unified content framework for dual-ranking (Google + AI citation). Following this template automatically satisfies SEO, AEO, GEO, AIO, LLMO, E-E-A-T, HCU, YMYL, Schema, BLUF, and RAG requirements.

## Article Tiers

| Tier | Count | Word Range | Required Sections | Review Level |
|------|-------|------------|-------------------|-------------|
| Flagship | 25 | 2,000-3,000 | All 17 sections | Full manual review |
| Standard | 45 | 1,000-1,800 | Sections 1-9, 13, 15-17 + optionals where genuine | 30% spot-check |
| Utility | 24 | 600-1,000 | Sections 1-9, 15-17 only | Automated gates + 10% spot-check |

## Full Section Blueprint

### Section 1: Breadcrumb (auto, all tiers)
Auto-generated. BreadcrumbList schema. Not in MDX.

### Section 2: H1 Title (auto, all tiers)
Auto-generated from spec.title. One per page.

### Section 3: BLUF Intro (all tiers, 40-80 words)
Most important paragraph. AI models quote this. Featured snippets pull from this.

Structure: [What this calculates] + [Who needs it] + [One specific number/fact]

Rules:
- 2-4 sentences max
- First sentence = what the calculator does
- Must include one specific number (makes it citable by AI)
- Never start with "Welcome to", "In today's world", or "This calculator is..."
- BAD: "Welcome to our mortgage calculator. Understanding your mortgage payments is important."
- GOOD: "Calculate your monthly mortgage payment including principal, interest, taxes, and insurance. On a $350,000 home with 20% down at 6.5%, expect a monthly P&I payment of approximately $1,770."

### Section 4: Calculator Widget (auto, all tiers)
Rendered by CalculatorRenderer. Not in MDX.

### Section 5: Result Display (auto, all tiers)
Rendered by output components. Not in MDX.

### Section 6: Interpretation Heading (all tiers, 100-200 words)
Goes AFTER results. Interprets what the numbers mean practically.

**Heading varies by category/subcategory** — do NOT use a universal heading. Use `getInterpretationHeading()` from `lib/interpretation-headings.ts`, or set `interpretationHeading` in the spec for a per-calculator override.

Default headings by category:
- **finance/investment, retirement, savings:** "What Your Projection Shows"
- **finance/mortgage, loans:** "What Your Payment Breakdown Means"
- **finance/tax:** "What Your Tax Estimate Shows"
- **health/pregnancy:** "What Your Estimate Means"
- **health/fitness, body-metrics, nutrition:** "What Your Results Mean"
- **math, science, everyday/date-time:** "Your Result Explained"
- **construction:** "What This Estimate Shows"
- **everyday/money:** "What Your Result Shows"
- **everyday/education:** "What Your Grade Means"
- **business/margins, sales, pricing:** "What Your Results Mean"
- **business/payroll:** "What Your Estimate Shows"
- **conversion:** "How This Conversion Works"

Rules:
- Interpret, don't restate
- Include context (is this typical? above/below average?)
- Natural internal link to a related calculator
- Write citable statements with specific thresholds

Example (BMI): "A BMI of 24.3 falls in the 'Normal Weight' category (18.5-24.9). However, BMI alone doesn't distinguish between muscle and fat mass. For a more complete picture, use our Body Fat Calculator alongside your BMI result."

### Section 7: How to Use This Calculator (all tiers, 100-250 words)
3-5 numbered steps matching actual input fields. Each step references a specific input by name with context on where to find the value. Never generic.

### Section 8: The Formula (all tiers, 150-400 words)
Your #1 GEO/LLMO asset. AI models cite formula sections most.

Required elements:
- Formula in KaTeX display block ($$...$$)
- Every variable defined with its unit
- Source citation (non-negotiable): "Source: [formula name] per [authority]"
- When applicable: multiple formula variants with explanation of when each applies
- Plain-language explanation of what the formula does

### Section 9: Worked Example(s) (all tiers, 200-600 words)
- Flagship: 2-3 examples with different scenarios
- Standard: 1-2 examples
- Utility: 1 example
- Use realistic numbers, show every step, end with practical interpretation

### Section 10: Key Factors That Affect Your Results (flagship + standard, 150-400 words)
3-5 most important variables and how they change the outcome. Use specific numbers to illustrate impact.

### Section 11: Common Mistakes to Avoid (flagship only, 100-250 words)
3-5 specific, actionable mistakes. Never generic.

### Section 12: Comparison Table (flagship only, 100-200 words + table)
Side-by-side scenarios only when users genuinely compare (15yr vs 30yr mortgage, Snowball vs Avalanche). Must include interpretation.

### Section 13: Assumptions & Limitations (flagship + standard, 50-150 words)
Bullet list of material assumptions the calculator makes.

### Section 14: FAQ (flagship 3-5, standard 2-3 if genuine, utility 0)
Rules:
- Every Q from Google PAA or autocomplete for the primary keyword
- Every A starts with direct answer (BLUF in each answer)
- Every A is self-contained and citable
- FAQPage schema only when 2+ genuine questions exist
- Never: "How does this calculator work?" or "Is this calculator free?"

### Section 15: Related Calculators (auto, all tiers)
4-6 links from spec. Not in MDX.

### Section 16: Methodology Section (all tiers)

**If `spec.requiresSources === true` (data-dependent calculators):**
Heading: `## Methodology & Sources`
Content: Name specific data sources with publication/year. State what year's data the calculator uses. Identify which part of the calculator each source applies to. This is a trust asset for YMYL pages.
- Finance: CFPB, IRS, CFA Institute, Federal Reserve
- Health: WHO, CDC, NIH, named study authors
- Construction: building codes, manufacturer specs

**If `spec.requiresSources === false` (formula-only calculators):**
Heading: `## How This Is Calculated`
Content: 2-4 sentences explaining the mathematical method, formula names, precision/rounding, and edge case handling. No citations needed — the formula IS the methodology. Keep it clean and honest. Max 80 words.

### Section 17: Disclaimer (auto, all tiers)
From spec.disclaimer. Not in MDX.

## Writing Citable Statements
Every factual claim must be precise enough for AI to quote accurately.
- BAD: "Compound interest can really add up over time."
- GOOD: "At 7% annual return with monthly compounding, $10,000 grows to $19,671.51 in 10 years."
- Include specific numbers. State facts as complete sentences. Avoid hedging.

## Quality Checklist
- [ ] BLUF intro has specific number
- [ ] Formula in KaTeX, all variables defined
- [ ] Formula source cited
- [ ] Worked example with step-by-step math
- [ ] Example has practical interpretation
- [ ] "What This Tells You" interprets (not restates)
- [ ] FAQ answers start with direct answer
- [ ] Methodology section present (Sources if data-dependent, How This Is Calculated if formula-only)
- [ ] No copied content from other calculators
- [ ] No placeholder text
- [ ] Word count in range for tier
- [ ] At least 3 citable statements with specific numbers
