/**
 * check-duplicates.ts — Detect keyword and intent conflicts
 * Run with: npm run check-dupes
 */
import * as fs from 'fs';
import * as path from 'path';
import { glob } from 'glob';

const ROOT = path.resolve(__dirname, '..');
const CONTENT_DIR = path.join(ROOT, 'content', 'calculators');

interface SpecFile {
  id: string;
  primaryKeyword: string;
  metaTitle: string;
  inputs: { id: string }[];
  duplicationRisk?: string[];
  [key: string]: unknown;
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

function jaccardSimilarity(a: Set<string>, b: Set<string>): number {
  const intersection = new Set([...a].filter(x => b.has(x)));
  const union = new Set([...a, ...b]);
  return union.size === 0 ? 0 : intersection.size / union.size;
}

function main() {
  console.log('Checking for duplicates...\n');

  const specs = loadSpecs();

  // 1. Primary keyword uniqueness
  const kwMap = new Map<string, string>();
  for (const spec of specs) {
    const kw = spec.primaryKeyword?.toLowerCase().trim();
    if (!kw) continue;
    if (kwMap.has(kw)) {
      error(`Duplicate primaryKeyword "${kw}" in ${kwMap.get(kw)} and ${spec.id}`);
    }
    kwMap.set(kw, spec.id);
  }

  // 2. Title similarity (Jaccard > 50%)
  for (let i = 0; i < specs.length; i++) {
    for (let j = i + 1; j < specs.length; j++) {
      const wordsA = new Set(specs[i].metaTitle.toLowerCase().split(/\s+/).filter(w => w.length > 2));
      const wordsB = new Set(specs[j].metaTitle.toLowerCase().split(/\s+/).filter(w => w.length > 2));
      const sim = jaccardSimilarity(wordsA, wordsB);
      if (sim > 0.5) {
        warn(`High title similarity (${(sim * 100).toFixed(0)}%) between ${specs[i].id} and ${specs[j].id}`);
      }
    }
  }

  // 3. Input overlap (>70% of input field IDs match)
  for (let i = 0; i < specs.length; i++) {
    for (let j = i + 1; j < specs.length; j++) {
      const idsA = new Set((specs[i].inputs || []).map(inp => inp.id));
      const idsB = new Set((specs[j].inputs || []).map(inp => inp.id));
      if (idsA.size === 0 || idsB.size === 0) continue;
      const intersection = new Set([...idsA].filter(x => idsB.has(x)));
      const overlap = intersection.size / Math.min(idsA.size, idsB.size);
      if (overlap > 0.7) {
        warn(`High input overlap (${(overlap * 100).toFixed(0)}%) between ${specs[i].id} and ${specs[j].id} — merge candidate?`);
      }
    }
  }

  // 4. Duplication risk verification
  for (const spec of specs) {
    if (spec.duplicationRisk && spec.duplicationRisk.length > 0) {
      for (const riskId of spec.duplicationRisk) {
        const riskSpec = specs.find(s => s.id === riskId);
        if (riskSpec && riskSpec.primaryKeyword?.toLowerCase() === spec.primaryKeyword?.toLowerCase()) {
          error(`${spec.id} and ${riskId} are in each other's duplicationRisk and share the same primaryKeyword "${spec.primaryKeyword}"`);
        }
      }
    }
  }

  // Report
  console.log(`Checked ${specs.length} specs for duplicates\n`);

  if (warnings.length > 0) {
    console.log(`\n--- WARNINGS (${warnings.length}) ---`);
    for (const w of warnings) console.log(w);
  }

  if (errors.length > 0) {
    console.log(`\n--- ERRORS (${errors.length}) ---`);
    for (const e of errors) console.log(e);
    console.log(`\n${errors.length} duplicate conflicts found.`);
    process.exit(1);
  } else {
    console.log('\nNo keyword or intent duplicates found!');
  }
}

main();
