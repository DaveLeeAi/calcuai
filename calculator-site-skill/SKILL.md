---
name: calculator-authority-site
description: "Build and maintain a production-grade calculator authority site. Use this skill for ANY task related to the calculator site project: scaffolding, creating calculators, writing content, implementing components, fixing bugs, adding features, running QA, or generating specs. This skill contains the architecture rules, spec schema, component patterns, content templates, quality gates, and file conventions that MUST be followed. Always read this skill before doing any work on the calculator site."
---

# Calculator Authority Site — Claude Code Execution Skill

## Overview

You are building a large-scale calculator authority site. This skill defines everything you need to follow when working on this project. **Read this file first on every task.** Then read the relevant reference file(s) before writing any code.

## Reference Files — Read Before Acting

| Task | Read This First |
|------|----------------|
| Setting up the project / scaffolding | `references/setup-guide.md` + `references/architecture.md` |
| Following the exact Milestone 1 steps | `references/setup-guide.md` (Task Prompts section) |
| Creating a new calculator (spec + MDX + formula) | `references/calculator-spec-schema.md` + `references/content-template.md` |
| Building UI components (inputs, outputs, renderer) | `references/component-patterns.md` |
| Writing or reviewing content (MDX sections) | `references/content-template.md` |
| Building non-calculator pages (homepage, hubs, glossary, methodology) | `references/page-specs.md` |
| Category definitions, hub content, disclaimer text | `references/page-specs.md` |
| SEO, schema, meta tags, sitemaps | `references/seo-rules.md` |
| Quality checks, validation, publishing | `references/quality-gates.md` |
| Understanding the full calculator inventory | `references/calculator-inventory.md` |
| Dependencies, configs, npm scripts | `references/setup-guide.md` |
| Writing validation/scaffold scripts | `references/setup-guide.md` (Scripts Specifications section) |

## Critical Rules (Always Apply)

### File Conventions
- Calculator specs: `/content/calculators/{category}/{slug}.spec.json`
- Calculator content: `/content/calculators/{category}/{slug}.mdx`
- Formula modules: `/lib/formulas/{category}/{formula-name}.ts`
- Formula tests: `/__tests__/formulas/{category}/{formula-name}.test.ts`
- Category definitions: `/content/categories/{category}.json`
- Components: `/components/calculator/inputs/`, `/components/calculator/outputs/`, etc.

### Naming Rules
- Slugs: lowercase, hyphenated, no special characters (e.g., `mortgage-calculator`)
- Formula module names: match the formula they implement (e.g., `mortgage-payment.ts`)
- Component names: PascalCase (e.g., `CurrencyInput.tsx`, `LineChart.tsx`)
- Category slugs: single word when possible (`finance`, `health`, `math`, `construction`, `science`, `everyday`, `business`, `conversion`)

### Never Do These
- Never create a calculator page without a spec file AND an MDX content file
- Never skip formula unit tests — every formula needs 10+ test cases including edge cases
- Never copy content between calculator MDX files — every section must be unique
- Never create a standalone page for a calculator that should be a tab/mode in another calculator
- Never publish without passing all 5 quality gates
- Never use the same primary keyword for two different calculator pages
- Never create a subcategory hub page for fewer than 4 calculators
- Never add FAQ schema to a page without a visible FAQ section
- Never put ads inside the calculator input/output area

### Merge-vs-New-Page Rule
Before creating any new calculator, check these 4 things:
1. Does it share >70% of input fields with an existing calc? → Merge as tab/mode
2. Does it target the same primary keyword as an existing calc? → Do not create
3. Does it use the same core formula with only different defaults? → Merge as preset/tab
4. Does it have 1,000+ monthly searches as standalone? → Create standalone page

### Quality Gates (All 5 Must Pass)
1. **Calculator Works** — 10+ unit tests pass including edge cases
2. **Content Exists** — All 10 required sections present, word count meets minimum
3. **Content Is Original** — No content block copy-pasted from another calculator
4. **No Keyword Conflict** — Primary keyword is unique across all specs
5. **Not Too Thin** — Page has genuine informational value beyond the widget

## Execution Milestones

### Milestone 1: Framework Complete
One test calculator (Mortgage) renders correctly on Vercel preview with working nav, breadcrumbs, schema, and all required page sections. **Do not build more calculators until Milestone 1 is verified.**

### Milestone 2: Flagship 25 Live
All 25 flagship calculators pass all 5 quality gates. Manual review completed. **Do not start expansion batches until Milestone 2 is verified.**

### Milestone 3: Full 94 Live
All 94 standalone calculators + 6 tab/mode features live. Full validation suite passes. Ready for production launch.

## How to Generate a Calculator (Standard Workflow)

1. Read `references/calculator-spec-schema.md` and `references/content-template.md`
2. **Determine tier:** Check `references/calculator-inventory.md` — is this calculator flagship, standard, or utility?
3. **Identify formula source:** Find the authoritative source for the formula (IRS, CFPB, WHO, etc.)
4. Run scaffold script: `npx ts-node scripts/generate-calculator.ts --slug {slug} --title "{title}" --category {category} --subcategory {subcategory} --formula {formula-name} --priority {flagship|standard|utility}`
5. Implement formula module in `/lib/formulas/{category}/{formula-name}.ts`
6. Write unit tests in `/__tests__/formulas/{category}/{formula-name}.test.ts` — minimum 10 test cases
7. Fill in the spec JSON with all required fields including `formulaCitation`, `articleWordTarget`, and `speakableSelectors`
8. Write the MDX content file following the tier-appropriate sections from content-template.md:
   - **All tiers:** BLUF intro (with specific number), What This Tells You, How to Use, Formula (with source citation), Worked Example, Sources & Methodology
   - **Flagship + Standard:** Key Factors, Assumptions, FAQ (if genuine PAA questions exist)
   - **Flagship only:** Common Mistakes, Comparison Table
9. Verify: BLUF intro has a specific number, formula has source citation, at least 3 citable statements exist
10. Set related calculators (4-6, following the linking priority rules)
11. Run `npm run validate` to check all 6 quality gates
12. Fix any validation errors
13. Set `editorialStatus` to `"review"` and notify for manual review

## Batching Rules

- Generate calculators in batches of 3-5 within the same subcategory
- After each batch: run `npm run validate`, run formula tests, check for keyword duplicates
- Never generate more than 10 calculators between quality checks
- When batching, create shared formula modules first, then specs, then content
