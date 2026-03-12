/**
 * validate-content.ts — Build-time quality gate checks
 * Run with: npm run validate
 */
import * as fs from 'fs';
import * as path from 'path';
import { glob } from 'glob';

const ROOT = path.resolve(__dirname, '..');
const CONTENT_DIR = path.join(ROOT, 'content', 'calculators');
const FORMULAS_DIR = path.join(ROOT, 'lib', 'formulas');
const TESTS_DIR = path.join(ROOT, '__tests__', 'formulas');
const CATEGORIES_DIR = path.join(ROOT, 'content', 'categories');

interface SpecFile {
  id: string;
  title: string;
  slug: string;
  category: string;
  subcategory: string;
  primaryKeyword: string;
  metaTitle: string;
  metaDescription: string;
  inputs: unknown[];
  outputs: unknown[];
  formula: string;
  relatedCalculators: string[];
  disclaimer: string;
  formulaCitation: string;
  articleWordTarget: number;
  speakableSelectors: string[];
  hasFAQ: boolean;
  requiresSources?: boolean;
  priority?: string;
  [key: string]: unknown;
}

let errors: string[] = [];
let warnings: string[] = [];

function error(msg: string) { errors.push(`ERROR: ${msg}`); }
function warn(msg: string) { warnings.push(`WARN: ${msg}`); }

// Load all specs
function loadSpecs(): SpecFile[] {
  const specFiles = glob.sync('**/*.spec.json', { cwd: CONTENT_DIR });
  return specFiles.map(f => {
    const raw = fs.readFileSync(path.join(CONTENT_DIR, f), 'utf-8');
    return JSON.parse(raw) as SpecFile;
  });
}

// Load all category JSONs
function loadCategories(): Record<string, string[]> {
  const catMap: Record<string, string[]> = {};
  const catFiles = glob.sync('*.json', { cwd: CATEGORIES_DIR });
  for (const cf of catFiles) {
    const raw = JSON.parse(fs.readFileSync(path.join(CATEGORIES_DIR, cf), 'utf-8'));
    const allCalcIds: string[] = [];
    for (const sub of (raw.subcategories || [])) {
      for (const cid of (sub.calculators || [])) {
        allCalcIds.push(cid);
      }
    }
    catMap[raw.id || raw.slug] = allCalcIds;
  }
  return catMap;
}

function main() {
  console.log('Running content validation...\n');

  const specs = loadSpecs();
  const specIds = new Set(specs.map(s => s.id));
  const categories = loadCategories();

  // Flatten all calculator IDs from categories
  const allCategoryCalcIds = new Set<string>();
  for (const ids of Object.values(categories)) {
    for (const id of ids) allCategoryCalcIds.add(id);
  }

  const REQUIRED_FIELDS = [
    'id', 'title', 'slug', 'category', 'primaryKeyword',
    'metaTitle', 'metaDescription', 'inputs', 'outputs',
    'formula', 'relatedCalculators', 'disclaimer',
    'formulaCitation', 'articleWordTarget', 'speakableSelectors'
  ];

  for (const spec of specs) {
    const label = `[${spec.category}/${spec.id}]`;

    // 1. Spec completeness
    for (const field of REQUIRED_FIELDS) {
      const val = spec[field];
      if (val === undefined || val === null || val === '') {
        error(`${label} Missing required field: ${field}`);
      }
    }

    // 2. MDX existence
    const mdxPath = path.join(CONTENT_DIR, spec.category, `${spec.slug}.mdx`);
    if (!fs.existsSync(mdxPath)) {
      error(`${label} Missing MDX file: ${spec.category}/${spec.slug}.mdx`);
    } else {
      const mdxContent = fs.readFileSync(mdxPath, 'utf-8');

      // 3. Word count
      const textOnly = mdxContent
        .replace(/---[\s\S]*?---/m, '')       // front matter
        .replace(/\{\/\*[\s\S]*?\*\/\}/g, '')  // JSX comments
        .replace(/\$\$[\s\S]*?\$\$/g, '')     // block math only
        .replace(/<[^>]+>/g, '')              // HTML/JSX tags
        .replace(/[#*|_`\[\]()]/g, ' ')       // markdown symbols (keep hyphens)
        .replace(/\s+/g, ' ');
      const words = textOnly.split(/\s+/).filter(w => w.length > 0).length;

      const tier = spec.priority || 'standard';
      const minWords = tier === 'flagship' ? 700 : tier === 'utility' ? 300 : 450;
      if (words < minWords) {
        error(`${label} Word count ${words} below minimum ${minWords} for ${tier} tier`);
      }

      // 4. Required sections
      if (!mdxContent.includes('## ') || !mdxContent.includes('bluf-intro')) {
        warn(`${label} May be missing required sections (BLUF or H2 headings)`);
      }

      // 5. Placeholder detection
      const placeholders = ['[TODO]', 'Lorem ipsum', 'Content here', 'TBD', 'PLACEHOLDER'];
      for (const ph of placeholders) {
        if (mdxContent.includes(ph)) {
          error(`${label} Contains placeholder text: "${ph}"`);
        }
      }

      // 5b. Methodology section check (conditional on requiresSources)
      if (spec.requiresSources === true) {
        if (!mdxContent.includes('## Methodology & Sources')) {
          error(`${label} Data-dependent calculator missing "## Methodology & Sources" section`);
        }
      } else if (spec.requiresSources === false) {
        if (!mdxContent.includes('## How This Is Calculated')) {
          error(`${label} Formula-only calculator missing "## How This Is Calculated" section`);
        }
      }
    }

    // 7. Related calculators
    const related = spec.relatedCalculators || [];
    if (related.length < 4) {
      error(`${label} Only ${related.length} relatedCalculators (minimum 4)`);
    }
    if (related.length > 6) {
      error(`${label} Has ${related.length} relatedCalculators (maximum 6)`);
    }
    for (const rid of related) {
      if (!specIds.has(rid)) {
        error(`${label} relatedCalculator "${rid}" does not exist`);
      }
    }

    // 8. Formula module exists (check common naming patterns)
    const formulaId = spec.formula;
    const formulaCat = spec.category;
    const formulaPath = path.join(FORMULAS_DIR, formulaCat, `${formulaId}.ts`);
    // Also check if it might be in a different file (shared formulas)
    const allFormulaFiles = glob.sync(`**/${formulaId}.ts`, { cwd: FORMULAS_DIR });
    if (!fs.existsSync(formulaPath) && allFormulaFiles.length === 0) {
      // Check for known shared formulas
      const sharedMappings: Record<string, string> = {
        'hours-worked': 'everyday/time-math.ts',
        'age-calc': 'everyday/date-diff.ts',
      };
      if (!sharedMappings[formulaId]) {
        warn(`${label} No formula file found for "${formulaId}" (may be shared)`);
      }
    }

    // 10. Category registration
    const catCalcIds = categories[spec.category] || [];
    if (!catCalcIds.includes(spec.id)) {
      warn(`${label} Not registered in category JSON: content/categories/${spec.category}.json`);
    }
  }

  // 6. Meta uniqueness
  const titleMap = new Map<string, string>();
  const descMap = new Map<string, string>();
  for (const spec of specs) {
    if (titleMap.has(spec.metaTitle)) {
      error(`Duplicate metaTitle "${spec.metaTitle}" in ${titleMap.get(spec.metaTitle)} and ${spec.id}`);
    }
    titleMap.set(spec.metaTitle, spec.id);

    if (descMap.has(spec.metaDescription)) {
      warn(`Duplicate metaDescription in ${descMap.get(spec.metaDescription)} and ${spec.id}`);
    }
    descMap.set(spec.metaDescription, spec.id);
  }

  // Report
  console.log(`Validated ${specs.length} calculator specs\n`);

  if (warnings.length > 0) {
    console.log(`\n--- WARNINGS (${warnings.length}) ---`);
    for (const w of warnings) console.log(w);
  }

  if (errors.length > 0) {
    console.log(`\n--- ERRORS (${errors.length}) ---`);
    for (const e of errors) console.log(e);
    console.log(`\n${errors.length} errors found. Fix before deploying.`);
    process.exit(1);
  } else {
    console.log('\nAll validation checks passed!');
  }
}

main();
