/**
 * populate-cross-links.ts — Auto-populate glossaryTerms and methodologyTopics
 * fields on all calculator specs based on content-linker matching rules.
 *
 * Run with: npx ts-node --project tsconfig.scripts.json scripts/populate-cross-links.ts
 * Dry-run:  npx ts-node --project tsconfig.scripts.json scripts/populate-cross-links.ts --dry-run
 */
import * as fs from 'fs';
import * as path from 'path';
import matter from 'gray-matter';

const ROOT = path.resolve(__dirname, '..');
const CONTENT_DIR = path.join(ROOT, 'content', 'calculators');
const GLOSSARY_DIR = path.join(ROOT, 'content', 'glossary');
const METHODOLOGY_DIR = path.join(ROOT, 'content', 'methodology');

interface SpecFile {
  id: string;
  slug: string;
  category: string;
  subcategory: string;
  primaryKeyword: string;
  formula: string;
  hasMethodologyPage: boolean;
  relatedCalculators: string[];
  glossaryTerms?: string[];
  methodologyTopics?: string[];
  [key: string]: unknown;
}

interface ContentItem {
  slug: string;
  title: string;
  relatedCalculators: string[];
}

function loadSpecs(): { spec: SpecFile; filePath: string }[] {
  const entries: { spec: SpecFile; filePath: string }[] = [];
  const categories = fs.readdirSync(CONTENT_DIR).filter(f =>
    fs.statSync(path.join(CONTENT_DIR, f)).isDirectory()
  );

  for (const cat of categories) {
    const catDir = path.join(CONTENT_DIR, cat);
    const files = fs.readdirSync(catDir).filter(f => f.endsWith('.spec.json'));
    for (const file of files) {
      const filePath = path.join(catDir, file);
      const raw = fs.readFileSync(filePath, 'utf-8');
      entries.push({ spec: JSON.parse(raw) as SpecFile, filePath });
    }
  }

  return entries;
}

function loadGlossary(): ContentItem[] {
  if (!fs.existsSync(GLOSSARY_DIR)) return [];
  return fs.readdirSync(GLOSSARY_DIR)
    .filter(f => f.endsWith('.mdx'))
    .map(f => {
      const raw = fs.readFileSync(path.join(GLOSSARY_DIR, f), 'utf-8');
      const { data } = matter(raw);
      return {
        slug: data.slug as string,
        title: data.title as string,
        relatedCalculators: (data.relatedCalculators as string[]) || [],
      };
    });
}

function loadMethodology(): ContentItem[] {
  if (!fs.existsSync(METHODOLOGY_DIR)) return [];
  return fs.readdirSync(METHODOLOGY_DIR)
    .filter(f => f.endsWith('.mdx'))
    .map(f => {
      const raw = fs.readFileSync(path.join(METHODOLOGY_DIR, f), 'utf-8');
      const { data } = matter(raw);
      return {
        slug: data.slug as string,
        title: data.title as string,
        relatedCalculators: (data.relatedCalculators as string[]) || [],
      };
    });
}

function matchGlossaryTerms(spec: SpecFile, terms: ContentItem[]): string[] {
  const matched: string[] = [];

  for (const term of terms) {
    // Rule 1: glossary explicitly references this calculator
    if (term.relatedCalculators.includes(spec.id)) {
      if (!matched.includes(term.slug)) matched.push(term.slug);
      continue;
    }

    // Rule 2: term slug appears in spec's primaryKeyword or subcategory
    const slugNormalized = term.slug.replace(/-/g, ' ');
    const keywordMatch =
      spec.primaryKeyword.toLowerCase().includes(slugNormalized) ||
      spec.subcategory.replace(/-/g, ' ').includes(slugNormalized);

    if (keywordMatch && !matched.includes(term.slug)) {
      matched.push(term.slug);
    }
  }

  return matched;
}

function matchMethodologyTopics(spec: SpecFile, topics: ContentItem[]): string[] {
  const matched: string[] = [];

  for (const topic of topics) {
    // Rule 1: methodology explicitly references this calculator
    if (topic.relatedCalculators.includes(spec.id)) {
      if (!matched.includes(topic.slug)) matched.push(topic.slug);
      continue;
    }

    // Rule 2: formula-name overlap
    if (spec.hasMethodologyPage) {
      const formulaNormalized = spec.formula.replace(/-/g, ' ').toLowerCase();
      const topicNormalized = topic.slug.replace(/-/g, ' ').toLowerCase();
      if (formulaNormalized.includes(topicNormalized) || topicNormalized.includes(formulaNormalized)) {
        if (!matched.includes(topic.slug)) matched.push(topic.slug);
      }
    }
  }

  return matched;
}

function main() {
  const dryRun = process.argv.includes('--dry-run');
  const entries = loadSpecs();
  const glossaryTerms = loadGlossary();
  const methodologyTopics = loadMethodology();

  let glossaryPopulated = 0;
  let methodologyPopulated = 0;
  let filesModified = 0;

  for (const { spec, filePath } of entries) {
    const matchedGlossary = matchGlossaryTerms(spec, glossaryTerms);
    const matchedMethodology = matchMethodologyTopics(spec, methodologyTopics);

    let modified = false;

    // Only update if we found matches and they differ from existing
    const existingGlossary = spec.glossaryTerms || [];
    const existingMethodology = spec.methodologyTopics || [];

    if (matchedGlossary.length > 0 &&
        JSON.stringify(matchedGlossary.sort()) !== JSON.stringify([...existingGlossary].sort())) {
      spec.glossaryTerms = matchedGlossary;
      modified = true;
      glossaryPopulated++;
    }

    if (matchedMethodology.length > 0 &&
        JSON.stringify(matchedMethodology.sort()) !== JSON.stringify([...existingMethodology].sort())) {
      spec.methodologyTopics = matchedMethodology;
      modified = true;
      methodologyPopulated++;
    }

    if (modified) {
      filesModified++;
      if (dryRun) {
        console.log(`  ${spec.id}:`);
        if (matchedGlossary.length > 0) console.log(`    glossary: ${matchedGlossary.join(', ')}`);
        if (matchedMethodology.length > 0) console.log(`    methodology: ${matchedMethodology.join(', ')}`);
      } else {
        fs.writeFileSync(filePath, JSON.stringify(spec, null, 2) + '\n', 'utf-8');
      }
    }
  }

  if (dryRun) {
    console.log(`\n[DRY RUN] Would update ${filesModified} specs (${glossaryPopulated} with glossary, ${methodologyPopulated} with methodology).`);
  } else {
    console.log(`\nDone. Updated ${filesModified} specs (${glossaryPopulated} with glossary, ${methodologyPopulated} with methodology).`);
  }

  // Report specs with no cross-links
  const noGlossary = entries.filter(e => !(e.spec.glossaryTerms && e.spec.glossaryTerms.length > 0)).length;
  const noMethodology = entries.filter(e => !(e.spec.methodologyTopics && e.spec.methodologyTopics.length > 0)).length;
  console.log(`Specs without glossary terms: ${noGlossary}/${entries.length}`);
  console.log(`Specs without methodology topics: ${noMethodology}/${entries.length}`);
}

main();
