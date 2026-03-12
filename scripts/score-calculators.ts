/**
 * score-calculators.ts — Quality scoring for all calculator specs
 * Evaluates each calculator on a 100-point rubric, writes scores back to spec JSON files,
 * and updates editorialStatus based on thresholds.
 *
 * Run with: npm run score
 */
import * as fs from 'fs';
import * as path from 'path';
import { glob } from 'glob';

const ROOT = path.resolve(__dirname, '..');
const CONTENT_DIR = path.join(ROOT, 'content', 'calculators');
const TESTS_DIR = path.join(ROOT, '__tests__', 'formulas');

interface SpecFile {
  id: string;
  title: string;
  slug: string;
  category: string;
  formula: string;
  priority?: string;
  articleWordTarget?: number;
  formulaCitation?: string;
  relatedCalculators: string[];
  outputs: Array<{ type: string; [key: string]: unknown }>;
  features?: string[];
  qualityScore: number;
  editorialStatus: string;
  [key: string]: unknown;
}

interface ScoreBreakdown {
  calculatorWorks: number;
  contentDepth: number;
  formulaTransparency: number;
  exampleQuality: number;
  relatedTools: number;
  visualOutput: number;
  extras: number;
  total: number;
}

// ───────────────────────────────────────────────
// Word counting (matches validate-content.ts logic)
// ───────────────────────────────────────────────

function countWords(mdxContent: string): number {
  const textOnly = mdxContent
    .replace(/---[\s\S]*?---/m, '')        // front matter
    .replace(/\{\/\*[\s\S]*?\*\/\}/g, '')   // JSX comments
    .replace(/\$\$[\s\S]*?\$\$/g, '')      // block KaTeX
    .replace(/<[^>]+>/g, '')               // HTML/JSX tags
    .replace(/[#*|_`\[\]()]/g, ' ')        // markdown symbols
    .replace(/\s+/g, ' ');
  return textOnly.split(/\s+/).filter(w => w.length > 0).length;
}

// ───────────────────────────────────────────────
// 1. Calculator Works (20 pts)
// ───────────────────────────────────────────────

function scoreCalculatorWorks(spec: SpecFile): number {
  const formulaId = spec.formula;
  const category = spec.category;
  const categoryTestDir = path.join(TESTS_DIR, category);

  if (!fs.existsSync(categoryTestDir)) return 0;

  // Check for exact filename match: {formulaId}.test.ts
  const exactMatch = path.join(categoryTestDir, `${formulaId}.test.ts`);
  if (fs.existsSync(exactMatch)) return 20;

  // Check all test files in the category for the formula function name
  const testFiles = glob.sync('*.test.ts', { cwd: categoryTestDir });
  for (const tf of testFiles) {
    const content = fs.readFileSync(path.join(categoryTestDir, tf), 'utf-8');
    // Look for the formula ID as an import or function reference
    // Convert formula-id to camelCase for function name matching
    const camelCase = formulaId.replace(/-([a-z])/g, (_: string, c: string) => c.toUpperCase());
    if (
      content.includes(formulaId) ||
      content.includes(camelCase) ||
      content.includes(`calculate${camelCase.charAt(0).toUpperCase()}${camelCase.slice(1)}`)
    ) {
      return 20;
    }
  }

  return 0;
}

// ───────────────────────────────────────────────
// 2. Content Depth (20 pts)
// ───────────────────────────────────────────────

function scoreContentDepth(spec: SpecFile, mdxContent: string | null): number {
  if (!mdxContent) return 0;

  const wordCount = countWords(mdxContent);
  const tier = spec.priority || 'standard';
  const target = tier === 'flagship' ? 2500 : tier === 'utility' ? 800 : 1400;

  return Math.min(20, Math.round(20 * (wordCount / target)));
}

// ───────────────────────────────────────────────
// 3. Formula Transparency (15 pts)
// ───────────────────────────────────────────────

function scoreFormulaTransparency(spec: SpecFile, mdxContent: string | null): number {
  if (!mdxContent) return 0;
  let score = 0;

  // 5 points: KaTeX block present (at least two $$)
  const katexMatches = mdxContent.match(/\$\$/g);
  if (katexMatches && katexMatches.length >= 2) {
    score += 5;
  }

  // 5 points: Variable definitions near the formula ("Where:" or "where:" followed by definitions)
  if (/[Ww]here:/.test(mdxContent) && /[-*]\s*\*\*/.test(mdxContent)) {
    score += 5;
  }

  // 5 points: formulaCitation is non-empty and not a placeholder
  const citation = spec.formulaCitation || '';
  const placeholders = ['', 'TBD', 'TODO', 'N/A', 'none', 'placeholder'];
  if (citation.trim().length > 0 && !placeholders.includes(citation.trim().toLowerCase())) {
    score += 5;
  }

  return score;
}

// ───────────────────────────────────────────────
// 4. Example Quality (15 pts)
// ───────────────────────────────────────────────

function scoreExampleQuality(mdxContent: string | null): number {
  if (!mdxContent) return 0;
  let score = 0;

  // 5 points: Has a worked example section
  const hasExample = /##\s*(Worked Example|Example Calculation|Example)/i.test(mdxContent);
  if (hasExample) {
    score += 5;

    // Find the example section content (from the heading to the next ## heading)
    const exampleMatch = mdxContent.match(/##\s*(Worked Example|Example Calculation|Example)[\s\S]*?(?=\n## |\n---\s*$|$)/i);
    if (exampleMatch) {
      const exampleSection = exampleMatch[0];

      // 5 points: Contains real numbers in the example
      if (/\d+/.test(exampleSection)) {
        score += 5;
      }

      // 5 points: 2+ H3 subsections (multiple examples)
      const h3Matches = exampleSection.match(/###\s+/g);
      if (h3Matches && h3Matches.length >= 2) {
        score += 5;
      }
    }
  }

  return score;
}

// ───────────────────────────────────────────────
// 5. Related Tools (10 pts)
// ───────────────────────────────────────────────

function scoreRelatedTools(spec: SpecFile): number {
  const count = (spec.relatedCalculators || []).length;
  if (count >= 4 && count <= 6) return 10;
  if (count === 3) return 5;
  return 0;
}

// ───────────────────────────────────────────────
// 6. Visual Output (10 pts)
// ───────────────────────────────────────────────

function scoreVisualOutput(spec: SpecFile): number {
  const visualTypes = ['chart', 'table', 'gauge'];
  const outputs = spec.outputs || [];

  for (const output of outputs) {
    const outputType = (output.type || '').toLowerCase();
    if (visualTypes.some(vt => outputType.includes(vt))) {
      return 10;
    }
  }

  return 0;
}

// ───────────────────────────────────────────────
// 7. Extras (10 pts)
// ───────────────────────────────────────────────

function scoreExtras(spec: SpecFile, mdxContent: string | null): number {
  if (!mdxContent) return 0;
  let score = 0;

  // 3 points: FAQ section with at least one H3 question
  if (/##\s*Frequently Asked Questions/i.test(mdxContent)) {
    // Check for at least one H3 under it
    const faqMatch = mdxContent.match(/##\s*Frequently Asked Questions[\s\S]*?(?=\n## [^#]|\n---\s*$|$)/i);
    if (faqMatch && /###\s+/.test(faqMatch[0])) {
      score += 3;
    }
  }

  // 3 points: Assumptions section
  if (/##\s*(Assumptions|Assumptions\s*(&|and)\s*Limitations)/i.test(mdxContent)) {
    score += 3;
  }

  // 2 points: Common Mistakes or comparison section
  if (/##\s*(Common Mistakes|Comparison|.*vs\.?\s)/i.test(mdxContent)) {
    score += 2;
  }

  // 2 points: compare-scenarios feature
  const features = spec.features || [];
  if (features.includes('compare-scenarios')) {
    score += 2;
  }

  return score;
}

// ───────────────────────────────────────────────
// Main scoring function
// ───────────────────────────────────────────────

function scoreCalculator(spec: SpecFile, mdxContent: string | null): ScoreBreakdown {
  const calculatorWorks = scoreCalculatorWorks(spec);
  const contentDepth = scoreContentDepth(spec, mdxContent);
  const formulaTransparency = scoreFormulaTransparency(spec, mdxContent);
  const exampleQuality = scoreExampleQuality(mdxContent);
  const relatedTools = scoreRelatedTools(spec);
  const visualOutput = scoreVisualOutput(spec);
  const extras = scoreExtras(spec, mdxContent);

  return {
    calculatorWorks,
    contentDepth,
    formulaTransparency,
    exampleQuality,
    relatedTools,
    visualOutput,
    extras,
    total: calculatorWorks + contentDepth + formulaTransparency + exampleQuality + relatedTools + visualOutput + extras,
  };
}

function getEditorialStatus(score: number): string {
  if (score >= 80) return 'published';
  if (score >= 60) return 'review';
  return 'draft';
}

// ───────────────────────────────────────────────
// Main
// ───────────────────────────────────────────────

function main() {
  console.log('Scoring all calculators...\n');

  const specFiles = glob.sync('**/*.spec.json', { cwd: CONTENT_DIR });
  const results: Array<{
    id: string;
    tier: string;
    score: number;
    status: string;
    breakdown: ScoreBreakdown;
    specPath: string;
  }> = [];

  for (const specFile of specFiles) {
    const fullSpecPath = path.join(CONTENT_DIR, specFile);
    const raw = fs.readFileSync(fullSpecPath, 'utf-8');
    const spec = JSON.parse(raw) as SpecFile;

    // Load MDX if it exists
    const mdxPath = path.join(CONTENT_DIR, spec.category, `${spec.slug}.mdx`);
    let mdxContent: string | null = null;
    if (fs.existsSync(mdxPath)) {
      mdxContent = fs.readFileSync(mdxPath, 'utf-8');
    }

    const breakdown = scoreCalculator(spec, mdxContent);
    const newStatus = getEditorialStatus(breakdown.total);

    // Write updated score and status back to spec
    spec.qualityScore = breakdown.total;
    spec.editorialStatus = newStatus;
    fs.writeFileSync(fullSpecPath, JSON.stringify(spec, null, 2) + '\n');

    results.push({
      id: spec.id,
      tier: spec.priority || 'standard',
      score: breakdown.total,
      status: newStatus,
      breakdown,
      specPath: specFile,
    });
  }

  // Sort by score descending
  results.sort((a, b) => b.score - a.score);

  // Print summary table
  console.log('Quality Score Report');
  console.log('====================\n');
  console.log('Score | Status    | Tier     | Calculator');
  console.log('------|-----------|----------|----------------------------------');

  for (const r of results) {
    const score = String(r.score).padStart(4);
    const status = r.status.padEnd(9);
    const tier = r.tier.padEnd(8);
    console.log(`${score}  | ${status} | ${tier} | ${r.id}`);
  }

  // Summary stats
  const published = results.filter(r => r.status === 'published').length;
  const review = results.filter(r => r.status === 'review').length;
  const draft = results.filter(r => r.status === 'draft').length;
  const avg = Math.round(results.reduce((sum, r) => sum + r.score, 0) / results.length);

  console.log(`\nSummary:`);
  console.log(`  Published (80+): ${published} calculators`);
  console.log(`  Review (60-79):  ${review} calculators`);
  console.log(`  Draft (<60):     ${draft} calculators`);
  console.log(`  Average score:   ${avg}`);

  // Print breakdown for lowest-scoring calculators
  const lowScorers = results.filter(r => r.score < 60);
  if (lowScorers.length > 0) {
    console.log(`\nLowest Scoring (need attention):`);
    console.log('Score | Tests | Content | Formula | Example | Related | Visual | Extras | Calculator');
    console.log('------|-------|---------|---------|---------|---------|--------|--------|----------');
    for (const r of lowScorers) {
      const b = r.breakdown;
      console.log(
        `${String(r.score).padStart(4)}  | ${String(b.calculatorWorks).padStart(5)} | ${String(b.contentDepth).padStart(7)} | ${String(b.formulaTransparency).padStart(7)} | ${String(b.exampleQuality).padStart(7)} | ${String(b.relatedTools).padStart(7)} | ${String(b.visualOutput).padStart(6)} | ${String(b.extras).padStart(6)} | ${r.id}`
      );
    }
  }
}

main();
