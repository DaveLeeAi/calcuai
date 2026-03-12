# Quality Gates Reference

## The 5-Gate Publish Framework

Every calculator page must pass ALL 5 gates before publication. Failing any gate blocks the page.

### Gate 1: Calculator Works
- All formula unit tests pass (minimum 10 test cases per formula)
- Edge cases tested: zero values, maximum values, negative values (where applicable)
- Validation errors display correctly for invalid inputs
- Results format correctly (currency symbols, decimals, commas)
- Charts render with correct data (if applicable)
- **Tested by:** `npm run test:formulas`

### Gate 2: Content Exists
All 10 required sections are present and meet minimum word counts:

| Section | Required? | Min Words | Check |
|---------|-----------|-----------|-------|
| Breadcrumb | Yes | Auto-generated | Exists |
| H1 Title | Yes | Auto-generated | Exists |
| Intro paragraph | Yes | 30 | Word count |
| Calculator widget | Yes | Auto-rendered | Spec has inputs + outputs |
| Result display | Yes | Auto-rendered | Spec has outputs |
| How to Use | Yes | 80 | Word count + step count >= 3 |
| Formula / How It Works | Yes | 100 | Word count + formula block exists |
| Example Calculation | Yes | 80 | Word count + input/output values shown |
| Related Calculators | Yes | Auto-generated | 4-6 valid links |
| Disclaimer | Yes | Auto-generated | Disclaimer type set in spec |

- **Tested by:** `scripts/validate-content.ts`

### Gate 3: Content Is Original
- No MDX content block has Jaccard similarity > 30% with any other calculator's MDX
- "How to Use" section references specific input field names from THIS calculator's spec
- "Formula" section shows the formula specific to THIS calculator
- "Example" section uses numbers appropriate for THIS calculator's domain
- **Tested by:** `scripts/validate-content.ts` (similarity checker)

### Gate 4: No Keyword Conflict
- `spec.primaryKeyword` does not match any other published calculator's `primaryKeyword`
- `spec.metaTitle` does not match any other published calculator's `metaTitle`
- `spec.metaDescription` does not match any other published calculator's `metaDescription`
- **Tested by:** `scripts/check-duplicates.ts`

### Gate 5: Not Too Thin
Automated heuristic (for batch-generated calculators):
- Total MDX word count >= minimum for page type (flagship: 700, standard: 450)
- At least 3 distinct H2 sections in the MDX
- At least 1 formula/math block present
- At least 1 example with concrete numbers
- Calculator has >= 3 input fields AND >= 2 output values
- If all heuristics pass, gate passes automatically

Manual review (for flagship calculators):
- A reviewer reads the page and confirms: "Would I trust this page? Does it help me?"
- If no → page does not publish until content is improved

**Tested by:** `scripts/validate-content.ts` (automated) + manual review (flagships)

### Gate 6: Content Citability (NEW — for AI/LLM ranking)
- BLUF intro contains at least one specific number or concrete fact
- Formula section has a source citation (formulaCitation field is non-empty in spec)
- FAQ answers (if present) start with a direct answer in the first sentence
- Article contains at least 3 citable statements (precise factual claims with specific numbers)
- Sources & Methodology section is present in the MDX
- **Tested by:** `scripts/validate-content.ts` (checks for number in intro, source citation presence, Sources section heading)

## Quality Score Calculation

Each calculator page gets a score out of 100:

| Factor | Points | Criteria |
|--------|--------|----------|
| Calculator works | 20 | All unit tests pass |
| Content depth | 20 | Word count meets or exceeds target (not just minimum) |
| Formula transparency | 15 | Formula shown in KaTeX, all variables defined, source cited |
| Example quality | 15 | Realistic example with step-by-step and practical interpretation |
| Related tools | 10 | 4-6 contextual related calculator links |
| Visual output | 10 | Chart, table, gauge, or visual result beyond plain text |
| Extras | 10 | Genuine FAQ, methodology link, comparison feature, or assumptions block |

**Publish thresholds:**
- 80+: Publish immediately
- 60-79: Publish but flag for content improvement within 30 days
- Below 60: Do NOT publish. Fix first.

## Thin Page Signals (Auto-Flagged)

The build-time validator flags pages with these signals:
- Total MDX content below minimum word count
- "How to Use" section fewer than 80 words
- "Formula" section fewer than 100 words
- No example calculation present
- Fewer than 4 related calculator links
- Meta description missing or duplicate
- Calculator has fewer than 3 inputs AND fewer than 2 outputs (suspiciously simple)
- MDX file contains placeholder text ([TODO], Lorem ipsum, "content here")

Any flag triggers a warning in the build output. Two or more flags block the build.

## Duplication Risk Pairs

These calculator pairs are pre-identified as having overlap risk. Content for each must be clearly differentiated.

| Calculator A | Calculator B | Key Differentiator |
|-------------|-------------|-------------------|
| Mortgage Calculator | Home Affordability Calculator | "How much will I pay" vs "How much can I afford" |
| Loan Calculator | Payment Calculator | Full loan details vs reverse-solve for payment |
| Margin Calculator | Markup Calculator | Revenue-based vs cost-based |
| Profit Calculator | Revenue Calculator | Revenue - costs vs price × units |
| Savings Calculator | CD Calculator | Regular deposits vs lump sum fixed term |
| Salary Calculator | Payroll Calculator | Frequency conversion vs gross-to-net deductions |
| Sales Tax (Finance) | Sales Tax (Business) | Consumer "how much tax" vs merchant "how much to charge" |

For each pair:
- Primary keywords MUST be different
- Formula explanations MUST be written from different perspectives
- Example calculations MUST use different scenarios
- Intro paragraphs MUST address different user problems

## Validation Scripts

### scripts/validate-content.ts
Checks all calculator specs and MDX files for:
- Required sections present
- Word count minimums
- Placeholder text detection
- Meta tag presence and uniqueness
- Related calculator link count and validity
- Schema completeness

### scripts/check-duplicates.ts
Checks for:
- Duplicate primaryKeyword across specs
- Duplicate metaTitle across specs
- Duplicate metaDescription across specs
- High Jaccard similarity between MDX files

### scripts/audit-links.ts
Checks for:
- Orphan pages (not linked from any other page)
- Broken internal links (link target doesn't exist)
- Related calculator links that point to non-existent specs
- Category hub listings that don't match actual calculator specs

### npm run qa
Runs all three scripts in sequence. Must pass before any deploy.
