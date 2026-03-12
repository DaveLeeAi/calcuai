/**
 * audit-links.ts — Find orphan pages, broken links, and linking gaps
 * Covers: calculators, glossary terms, methodology topics
 * Run with: npm run audit-links
 */
import * as fs from 'fs';
import * as path from 'path';
import { glob } from 'glob';
import matter from 'gray-matter';

const ROOT = path.resolve(__dirname, '..');
const CONTENT_DIR = path.join(ROOT, 'content', 'calculators');
const CATEGORIES_DIR = path.join(ROOT, 'content', 'categories');
const GLOSSARY_DIR = path.join(ROOT, 'content', 'glossary');
const METHODOLOGY_DIR = path.join(ROOT, 'content', 'methodology');

interface SpecFile {
  id: string;
  slug: string;
  category: string;
  subcategory: string;
  relatedCalculators: string[];
  glossaryTerms?: string[];
  methodologyTopics?: string[];
  [key: string]: unknown;
}

interface CategoryFile {
  id: string;
  slug: string;
  subcategories: { id: string; slug: string; calculators: string[] }[];
}

interface ContentItem {
  slug: string;
  title: string;
  relatedCalculators: string[];
}

let errors: string[] = [];
let warnings: string[] = [];

function error(msg: string) { errors.push(`ERROR: ${msg}`); }
function warn(msg: string) { warnings.push(`WARN: ${msg}`); }

function loadSpecs(): SpecFile[] {
  const specFiles = glob.sync('**/*.spec.json', { cwd: CONTENT_DIR });
  return specFiles.map(f => {
    const raw = fs.readFileSync(path.join(CONTENT_DIR, f), 'utf-8');
    return JSON.parse(raw) as SpecFile;
  });
}

function loadCategories(): CategoryFile[] {
  const catFiles = glob.sync('*.json', { cwd: CATEGORIES_DIR });
  return catFiles.map(f => {
    const raw = fs.readFileSync(path.join(CATEGORIES_DIR, f), 'utf-8');
    return JSON.parse(raw) as CategoryFile;
  });
}

function loadGlossaryTerms(): ContentItem[] {
  if (!fs.existsSync(GLOSSARY_DIR)) return [];
  const files = fs.readdirSync(GLOSSARY_DIR).filter(f => f.endsWith('.mdx'));
  return files.map(f => {
    const raw = fs.readFileSync(path.join(GLOSSARY_DIR, f), 'utf-8');
    const { data } = matter(raw);
    return {
      slug: data.slug as string,
      title: data.title as string,
      relatedCalculators: (data.relatedCalculators as string[]) || [],
    };
  });
}

function loadMethodologyTopics(): ContentItem[] {
  if (!fs.existsSync(METHODOLOGY_DIR)) return [];
  const files = fs.readdirSync(METHODOLOGY_DIR).filter(f => f.endsWith('.mdx'));
  return files.map(f => {
    const raw = fs.readFileSync(path.join(METHODOLOGY_DIR, f), 'utf-8');
    const { data } = matter(raw);
    return {
      slug: data.slug as string,
      title: data.title as string,
      relatedCalculators: (data.relatedCalculators as string[]) || [],
    };
  });
}

function main() {
  console.log('Auditing links, orphans, and cross-content connections...\n');

  const specs = loadSpecs();
  const specIds = new Set(specs.map(s => s.id));
  const categories = loadCategories();
  const glossaryTerms = loadGlossaryTerms();
  const methodologyTopics = loadMethodologyTopics();

  // ═══════════════════════════════════════════════════════
  // 1. Calculator link validity
  // ═══════════════════════════════════════════════════════

  for (const spec of specs) {
    for (const rid of spec.relatedCalculators) {
      if (!specIds.has(rid)) {
        error(`${spec.id} references non-existent calculator: ${rid}`);
      }
    }
  }

  // ═══════════════════════════════════════════════════════
  // 2. Calculator reference counts + orphan detection
  // ═══════════════════════════════════════════════════════

  const refCount = new Map<string, number>();
  for (const id of specIds) refCount.set(id, 0);

  for (const spec of specs) {
    for (const rid of spec.relatedCalculators) {
      refCount.set(rid, (refCount.get(rid) || 0) + 1);
    }
  }

  // Build category registration set
  const catRegistered = new Set<string>();
  for (const cat of categories) {
    for (const sub of cat.subcategories) {
      for (const cid of sub.calculators) {
        catRegistered.add(cid);
      }
    }
  }

  const orphans: { id: string; refs: number; inCat: boolean }[] = [];
  for (const spec of specs) {
    const refs = refCount.get(spec.id) || 0;
    const inCat = catRegistered.has(spec.id);
    if (!inCat || refs < 2) {
      orphans.push({ id: spec.id, refs, inCat });
    }
  }

  if (orphans.length > 0) {
    console.log(`--- ORPHAN CALCULATORS (${orphans.length}) ---`);
    const critical = orphans.filter(o => o.refs === 0);
    const low = orphans.filter(o => o.refs === 1);
    const borderline = orphans.filter(o => o.refs >= 2 && !o.inCat);

    if (critical.length > 0) {
      console.log(`\n  Zero references (${critical.length}):`);
      for (const o of critical) {
        error(`${o.id} has 0 inbound references${o.inCat ? '' : ' and is NOT in category JSON'}`);
      }
    }

    if (low.length > 0) {
      console.log(`\n  Only 1 reference (${low.length}):`);
      for (const o of low) {
        warn(`${o.id} has only 1 inbound reference`);
      }
    }

    if (borderline.length > 0) {
      console.log(`\n  Not in category JSON (${borderline.length}):`);
      for (const o of borderline) {
        error(`${o.id} is not registered in any category JSON`);
      }
    }
  }

  // ═══════════════════════════════════════════════════════
  // 3. Category coverage
  // ═══════════════════════════════════════════════════════

  for (const spec of specs) {
    const cat = categories.find(c => c.id === spec.category || c.slug === spec.category);
    if (!cat) {
      error(`${spec.id} has category "${spec.category}" which doesn't match any category JSON`);
      continue;
    }
    const sub = cat.subcategories.find(s => s.id === spec.subcategory || s.slug === spec.subcategory);
    if (!sub) {
      warn(`${spec.id} has subcategory "${spec.subcategory}" not found in ${spec.category}.json`);
    }
  }

  // ═══════════════════════════════════════════════════════
  // 4. Bidirectional linking check
  // ═══════════════════════════════════════════════════════

  let asymmetricCount = 0;
  for (const spec of specs) {
    for (const rid of spec.relatedCalculators) {
      const relatedSpec = specs.find(s => s.id === rid);
      if (relatedSpec && !relatedSpec.relatedCalculators.includes(spec.id)) {
        asymmetricCount++;
      }
    }
  }

  if (asymmetricCount > 0) {
    warn(`${asymmetricCount} asymmetric links detected (A→B without B→A). Run fix-asymmetric-links.ts to repair.`);
  }

  // ═══════════════════════════════════════════════════════
  // 5. Glossary term reference validity
  // ═══════════════════════════════════════════════════════

  console.log(`\n--- GLOSSARY TERMS (${glossaryTerms.length}) ---`);
  let glossaryBroken = 0;
  let glossaryNoCalcs = 0;

  for (const term of glossaryTerms) {
    if (term.relatedCalculators.length === 0) {
      glossaryNoCalcs++;
      warn(`Glossary term "${term.slug}" has 0 related calculators`);
    }
    for (const calcId of term.relatedCalculators) {
      if (!specIds.has(calcId)) {
        glossaryBroken++;
        error(`Glossary term "${term.slug}" references non-existent calculator: ${calcId}`);
      }
    }
  }

  console.log(`  Valid: ${glossaryTerms.length - glossaryNoCalcs} terms with calculator links`);
  console.log(`  No links: ${glossaryNoCalcs} terms without calculator links`);
  console.log(`  Broken refs: ${glossaryBroken}`);

  // ═══════════════════════════════════════════════════════
  // 6. Methodology topic reference validity
  // ═══════════════════════════════════════════════════════

  console.log(`\n--- METHODOLOGY TOPICS (${methodologyTopics.length}) ---`);
  let methBroken = 0;
  let methNoCalcs = 0;

  for (const topic of methodologyTopics) {
    if (topic.relatedCalculators.length === 0) {
      methNoCalcs++;
      warn(`Methodology topic "${topic.slug}" has 0 related calculators`);
    }
    for (const calcId of topic.relatedCalculators) {
      if (!specIds.has(calcId)) {
        methBroken++;
        error(`Methodology topic "${topic.slug}" references non-existent calculator: ${calcId}`);
      }
    }
  }

  console.log(`  Valid: ${methodologyTopics.length - methNoCalcs} topics with calculator links`);
  console.log(`  No links: ${methNoCalcs} topics without calculator links`);
  console.log(`  Broken refs: ${methBroken}`);

  // ═══════════════════════════════════════════════════════
  // 7. Cross-content linking stats
  // ═══════════════════════════════════════════════════════

  console.log(`\n--- CROSS-CONTENT LINKING ---`);

  // How many calculators are referenced by glossary terms?
  const calcsReferencedByGlossary = new Set<string>();
  for (const term of glossaryTerms) {
    for (const calcId of term.relatedCalculators) {
      calcsReferencedByGlossary.add(calcId);
    }
  }

  // How many calculators are referenced by methodology topics?
  const calcsReferencedByMethodology = new Set<string>();
  for (const topic of methodologyTopics) {
    for (const calcId of topic.relatedCalculators) {
      calcsReferencedByMethodology.add(calcId);
    }
  }

  // How many calculators have explicit glossaryTerms or methodologyTopics fields?
  const specsWithGlossary = specs.filter(s => s.glossaryTerms && s.glossaryTerms.length > 0);
  const specsWithMethodology = specs.filter(s => s.methodologyTopics && s.methodologyTopics.length > 0);

  console.log(`  Calculators referenced by glossary:     ${calcsReferencedByGlossary.size}/${specs.length}`);
  console.log(`  Calculators referenced by methodology:  ${calcsReferencedByMethodology.size}/${specs.length}`);
  console.log(`  Calculators with explicit glossaryTerms field:      ${specsWithGlossary.length}/${specs.length}`);
  console.log(`  Calculators with explicit methodologyTopics field:  ${specsWithMethodology.length}/${specs.length}`);

  // ═══════════════════════════════════════════════════════
  // 8. Reference distribution summary
  // ═══════════════════════════════════════════════════════

  const refValues = [...refCount.values()];
  const zeroRefs = refValues.filter(v => v === 0).length;
  const oneRef = refValues.filter(v => v === 1).length;
  const twoRefs = refValues.filter(v => v === 2).length;
  const threePlus = refValues.filter(v => v >= 3).length;

  console.log(`\n--- REFERENCE DISTRIBUTION ---`);
  console.log(`  0 references: ${zeroRefs}`);
  console.log(`  1 reference:  ${oneRef}`);
  console.log(`  2 references: ${twoRefs}`);
  console.log(`  3+ references: ${threePlus}`);
  console.log(`  Total specs: ${specs.length}`);

  // Report
  if (warnings.length > 0) {
    console.log(`\n--- WARNINGS (${warnings.length}) ---`);
    for (const w of warnings) console.log(w);
  }

  if (errors.length > 0) {
    console.log(`\n--- ERRORS (${errors.length}) ---`);
    for (const e of errors) console.log(e);
    console.log(`\n${errors.length} link/orphan issues found.`);
    process.exit(1);
  } else {
    console.log('\nAll link checks passed!');
  }
}

main();
