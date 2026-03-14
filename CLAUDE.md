# CLAUDE.md — Calculator Authority Site

## Project Overview
This is a large-scale calculator authority site built with Next.js 14 (App Router), Tailwind CSS, TypeScript, and Vercel. It launches with 94 standalone calculator pages + 6 tab/mode features = 100 calculator experiences. Each calculator is defined by a JSON spec + MDX content file, rendered by a shared CalculatorRenderer component.

Every calculator article is designed for dual-ranking: Google search AND AI model citation (ChatGPT, Perplexity, Gemini, Google AI Overview). The content framework bakes in SEO, AEO, GEO, AIO, LLMO, E-E-A-T, HCU, YMYL, Schema, BLUF, CWV, and RAG principles through 7 structural rules — not 20 separate checklists.

## Skill Reference
**Before doing ANY work on this project, read the skill file:**
→ `calculator-site-skill/SKILL.md`

That file contains a routing table to specific reference docs. Read the relevant reference(s) for your current task BEFORE writing code or content.

| Task | Read First |
|------|-----------|
| Project init / scaffolding | `calculator-site-skill/references/setup-guide.md` + `calculator-site-skill/references/architecture.md` |
| Following Milestone 1 tasks step-by-step | `calculator-site-skill/references/setup-guide.md` (Task Prompts section at bottom) |
| Creating a calculator (spec + MDX + formula) | `calculator-site-skill/references/calculator-spec-schema.md` + `calculator-site-skill/references/content-template.md` |
| Building UI components | `calculator-site-skill/references/component-patterns.md` |
| Writing or editing content / articles | `calculator-site-skill/references/content-template.md` |
| Building pages (homepage, hubs, glossary, methodology, about) | `calculator-site-skill/references/page-specs.md` |
| Category JSON schema, disclaimer text, hub specs | `calculator-site-skill/references/page-specs.md` |
| SEO, schema, meta tags, Speakable schema | `calculator-site-skill/references/seo-rules.md` |
| Quality checks / validation / publish gates | `calculator-site-skill/references/quality-gates.md` |
| Checking the full calculator list | `calculator-site-skill/references/calculator-inventory.md` |
| Dependencies, configs, npm scripts | `calculator-site-skill/references/setup-guide.md` |
| Writing validation/scaffold scripts | `calculator-site-skill/references/setup-guide.md` (Scripts Specifications section) |

## Tech Stack
- **Framework:** Next.js 14 (App Router)
- **Language:** TypeScript (strict mode)
- **Styling:** Tailwind CSS
- **Content:** JSON spec files + MDX (next-mdx-remote)
- **Charting:** Recharts
- **Math display:** KaTeX
- **Search:** Fuse.js (client-side)
- **Hosting:** Vercel
- **Testing:** Jest + React Testing Library

## Project Structure
```
app/                          → Next.js pages (App Router)
components/calculator/        → CalculatorRenderer, inputs/, outputs/, features/
components/layout/            → Navbar, Footer, Breadcrumbs
components/seo/               → JsonLd, MetaTags
components/content/           → RelatedCalculators, FAQ, FormulaBlock, Disclaimer
components/ui/                → Button, Card, SearchBar
content/calculators/{cat}/    → .spec.json + .mdx per calculator
content/categories/           → Category definition JSONs
content/glossary/             → Glossary term MDX files
content/methodology/          → Methodology page MDX files
lib/formulas/{cat}/           → Pure TypeScript formula functions
lib/types.ts                  → All TypeScript interfaces (CalculatorSpec, InputField, etc.)
lib/units/                    → Unit conversion utilities
lib/validation/               → Input validation utilities
lib/content-loader.ts         → Build-time spec + MDX loader
lib/search-index.ts           → Fuse.js index builder
scripts/                      → generate-calculator, validate-content, check-duplicates, audit-links
__tests__/formulas/           → Formula unit tests (organized by category)
calculator-site-skill/        → Skill reference files for Claude Code
```

## Commands
```bash
npm run dev              # Local development server
npm run build            # Production build
npm run validate         # Run content quality gate checks (all 6 gates)
npm run check-dupes      # Check for keyword/intent duplicates
npm run audit-links      # Check for orphan pages and broken links
npm run qa               # Run all validation (validate + check-dupes + audit-links + formula tests)
npm run generate         # Scaffold a new calculator (interactive CLI)
npm run test             # Run all tests
npm run test:formulas    # Run formula unit tests only
```

## Calculator Tiers
Every calculator has a tier that determines article depth and review level:

| Tier | Count | Word Target | Review | Key Difference |
|------|-------|-------------|--------|---------------|
| Flagship | 25 | 2,000-3,000 | Full manual review | All 17 sections. Comparison tables. 2-3 worked examples. 3-5 FAQs. |
| Standard | 45 | 1,000-1,800 | 30% spot-check | Core sections + Key Factors + Assumptions + FAQ if genuine. |
| Utility | 24 | 600-1,000 | Automated gates + 10% spot | Core sections only. No FAQ unless genuinely warranted. |

Check `calculator-site-skill/references/calculator-inventory.md` for which calculators are in which tier.

## Critical Rules — Always Follow These

Before building or reviewing any calculator, read `calculator-site-skill/CALCULATOR_ACCEPTANCE_STANDARD.md` and validate ALL checklist items (Section 8) pass before marking as complete.

### File Naming
- Calculator specs: `content/calculators/{category}/{slug}.spec.json`
- Calculator content: `content/calculators/{category}/{slug}.mdx`
- Formula modules: `lib/formulas/{category}/{formula-name}.ts`
- Formula tests: `__tests__/formulas/{category}/{formula-name}.test.ts`
- Slugs: lowercase, hyphenated (e.g., `mortgage-calculator`)
- Components: PascalCase (e.g., `CurrencyInput.tsx`)

### Every Calculator Needs
1. A `.spec.json` file with ALL required fields including `formulaCitation`, `articleWordTarget`, `speakableSelectors`
2. An `.mdx` file with tier-appropriate sections (see content-template.md)
3. A formula module in `/lib/formulas/` with typed inputs/outputs
4. Unit tests with 10+ test cases including edge cases
5. 4-6 related calculator links that are contextually relevant
6. A unique `primaryKeyword` not used by any other calculator
7. A `formulaCitation` citing the authoritative source for the formula
8. A BLUF intro paragraph with at least one specific number

### Before Creating a New Calculator
Run the merge-vs-new-page check:
1. Does it share >70% of input fields with an existing calc? → **Merge as tab/mode**
2. Does it target the same primary keyword? → **Do not create**
3. Same core formula with different defaults only? → **Merge as preset/tab**
4. Has 1,000+ monthly standalone searches? → **Create standalone page**

### Before Any Deploy
Run `npm run qa` and fix all errors. Zero warnings allowed for production deploys.

### Content Writing Rules (AI Citation Optimized)
- **BLUF intro:** First paragraph gives the direct answer with a specific number. This is what AI models quote.
- **Formula section:** KaTeX formula + every variable defined + source citation. This is the #1 GEO/LLMO asset.
- **Worked examples:** Show every step with real numbers. End with practical interpretation.
- **FAQ answers:** First sentence IS the direct answer. Self-contained and citable.
- **Sources section:** Every calculator must cite at least one authoritative source.
- **Citable statements:** Write precise facts with specific numbers, not fluffy prose.

### Page Infrastructure Requirements
Every new calculator page MUST use the infrastructure components (TOC, sticky calculator, related sidebar, SEO framework, AI discovery markup). The layout is determined by the `tier` field in the spec: flagship = 3-column with full infrastructure, standard = 2-column with TOC and sticky widget, utility = 2-column minimal. See `calculator-site-skill/CALCULATOR_ACCEPTANCE_STANDARD.md` Section 9 for the complete infrastructure requirements per tier. No calculator page should be built without these components.

### Data-Dependent Calculator Requirements
For data-dependent calculators (`requiresSources: true`), always include an interactive data table component and at least one data visualization. Always include Dataset schema in JSON-LD. The sales tax calculator (`content/calculators/finance/sales-tax.json`) is the reference implementation for flagship data-dependent pages.

### Never Do These
- Never create a calculator without a spec + MDX + formula + tests
- Never copy content between calculator MDX files
- Never use the same primaryKeyword for two calculators
- Never create a subcategory hub for fewer than 4 calculators
- Never add FAQ schema without a visible FAQ section in the MDX
- Never put ads inside the calculator widget area
- Never skip formula unit tests
- Never publish a page with quality score below 60
- Never generate more than 10 calculators between quality checks
- Never write a BLUF intro without a specific number or concrete fact
- Never skip the Sources & Methodology section — every calculator needs a formula citation
- Never write "Compound interest can really add up" — write "At 7% annual return with monthly compounding, $10,000 grows to $19,671.51 in 10 years"

## Quality Gates (All 6 Must Pass)
1. **Calculator Works** — 10+ unit tests pass including edge cases
2. **Content Exists** — All tier-required sections present, word count meets target
3. **Content Is Original** — No copy-pasted content between calculators
4. **No Keyword Conflict** — Primary keyword unique across all specs
5. **Not Too Thin** — Genuine informational value beyond the widget
6. **Content Citability** — BLUF has specific number, formula has source citation, FAQ answers start with direct answer

## Execution Milestones

### Milestone 1: Framework Complete
A single test calculator (Mortgage) renders correctly on localhost with working nav, breadcrumbs, schema, and all required page sections. **Stop and verify before building more calculators.**

### Milestone 2: Flagship 25 Live
All 25 flagship calculators pass all 6 quality gates. Manual review completed on all 25. **Stop and verify before starting expansion batches.**

### Milestone 3: Full 94 Live
All 94 standalone calculators + 6 tab/mode features live. Full `npm run qa` passes. Sitemap submitted to GSC.

### Milestone 4: Hardening ✅ COMPLETE
- [x] Fix 3 broken formula references
- [ ] Expand 2 thin content pages to meet word minimums
- [x] Wire up quality scoring system and evaluate all 28 draft specs
- [x] Build auto-discovery formula registry (replace manual imports)
- [x] Add missing infrastructure (robots.txt, URL middleware, HTML sitemap, OG images)
- [x] Build glossary pages (terms referenced by 3+ calculators)
- [x] Build methodology pages (complex formula deep-dives)
- [x] Audit hasFAQ consistency (81 specs claim FAQ — verify MDX matches)
- [x] Fix sitemap lastmod to use spec.lastContentUpdate
- [ ] Prepare for 1,000+ scale (split sitemap, CI/CD pipeline)

### Milestone 5: Pre-Launch (CURRENT)
- [x] US market content localization pass (146 MDX files updated):
  - [x] Fix **bold** rendering as literal asterisks in BLUF sections (46 files → <strong> tags)
  - [x] Replace template "This calculator" CTAs in BLUFs with varied language (79 files)
  - [x] Replace formal language site-wide: individuals→people, expenditure→cost/spending (39 files, 117 replacements)
  - [x] Rewrite 5 productivity BLUF intros + H2s for conversational American tone
  - [x] Rewrite 5 health BLUF intros for warmer second-person tone
  - [x] Vary generic H2 headers on 5 ecommerce/real-estate calculators
- [ ] Filter draft specs from sitemap and routes (age-calc, exponent-calc)
- [ ] Migrate state tax URLs from /calculators/finance/ to /finance/
- [ ] Add Sales Tax by State section to finance category hub
- [ ] Domain setup + Vercel deployment
- [ ] Google Search Console submission
- [ ] Analytics integration
- [ ] AdSense integration
- [ ] Final cross-browser + mobile QA

## Code Style
- TypeScript strict mode, no `any` types in formula modules
- Functional components with hooks (no class components)
- Tailwind for all styling (no CSS modules, no styled-components)
- Pure functions for all formula modules (no side effects)
- Named exports for formula functions, default exports for React components
- Use `interface` over `type` for object shapes
- All formula functions must have JSDoc comments with the mathematical formula

## Git Conventions
- Commit messages: `feat: add mortgage calculator spec + formula + tests`
- Branch per milestone: `milestone-1/framework`, `milestone-2/flagship-25`, `milestone-3/expansion`
- PR required for each batch of calculators (3-5 per PR)
- No direct pushes to main
