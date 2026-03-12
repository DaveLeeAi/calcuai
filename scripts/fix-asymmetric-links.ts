/**
 * fix-asymmetric-links.ts — Repair one-way relatedCalculators references
 *
 * For every A→B link where B does not link back to A:
 * - If B has room (< MAX_RELATED), simply add A to B's list.
 * - If B is at MAX_RELATED, find B's weakest link (fewest shared
 *   connections with B) and replace it with A — but only if A is a
 *   stronger contextual match.
 *
 * Run with: npx ts-node --project tsconfig.scripts.json scripts/fix-asymmetric-links.ts
 * Dry-run:  npx ts-node --project tsconfig.scripts.json scripts/fix-asymmetric-links.ts --dry-run
 */
import * as fs from 'fs';
import * as path from 'path';

const ROOT = path.resolve(__dirname, '..');
const CONTENT_DIR = path.join(ROOT, 'content', 'calculators');
const MAX_RELATED = 7;

interface SpecFile {
  slug: string;
  id: string;
  category: string;
  subcategory: string;
  relatedCalculators: string[];
  [key: string]: unknown;
}

interface SpecEntry {
  spec: SpecFile;
  filePath: string;
  modified: boolean;
}

function loadAllSpecs(): SpecEntry[] {
  const entries: SpecEntry[] = [];
  const categories = fs.readdirSync(CONTENT_DIR).filter(f =>
    fs.statSync(path.join(CONTENT_DIR, f)).isDirectory()
  );

  for (const cat of categories) {
    const catDir = path.join(CONTENT_DIR, cat);
    const files = fs.readdirSync(catDir).filter(f => f.endsWith('.spec.json'));
    for (const file of files) {
      const filePath = path.join(catDir, file);
      const raw = fs.readFileSync(filePath, 'utf-8');
      const spec = JSON.parse(raw) as SpecFile;
      entries.push({ spec, filePath, modified: false });
    }
  }

  return entries;
}

/**
 * Score how relevant two specs are to each other based on:
 * - Same category (+3)
 * - Same subcategory (+5)
 * - Shared related calculators (+1 per shared link)
 */
function relevanceScore(a: SpecFile, b: SpecFile, specMap: Map<string, SpecFile>): number {
  let score = 0;
  if (a.category === b.category) score += 3;
  if (a.subcategory === b.subcategory) score += 5;

  // Count shared connections (how many of A's related also appear in B's related)
  for (const rid of a.relatedCalculators) {
    if (b.relatedCalculators.includes(rid)) score += 1;
  }

  return score;
}

function main() {
  const dryRun = process.argv.includes('--dry-run');
  const entries = loadAllSpecs();
  const specMap = new Map<string, SpecEntry>();
  for (const entry of entries) {
    specMap.set(entry.spec.id, entry);
  }

  let addCount = 0;
  let swapCount = 0;
  let skipCount = 0;

  // Collect all asymmetric pairs first
  const asymmetricPairs: { source: string; target: string }[] = [];
  for (const entry of entries) {
    for (const relId of entry.spec.relatedCalculators) {
      const target = specMap.get(relId);
      if (!target) continue;
      if (!target.spec.relatedCalculators.includes(entry.spec.id)) {
        asymmetricPairs.push({ source: entry.spec.id, target: relId });
      }
    }
  }

  for (const { source, target } of asymmetricPairs) {
    const targetEntry = specMap.get(target);
    const sourceEntry = specMap.get(source);
    if (!targetEntry || !sourceEntry) continue;

    // Already fixed in a previous iteration
    if (targetEntry.spec.relatedCalculators.includes(source)) continue;

    if (targetEntry.spec.relatedCalculators.length < MAX_RELATED) {
      // Room available — just add
      targetEntry.spec.relatedCalculators.push(source);
      targetEntry.modified = true;
      addCount++;
      console.log(`  + ${target} ← ${source}`);
    } else {
      // At cap — try to swap out the weakest existing link
      const sourceSpec = sourceEntry.spec;
      const targetSpec = targetEntry.spec;

      // Score the new link
      const newScore = relevanceScore(sourceSpec, targetSpec, new Map(entries.map(e => [e.spec.id, e.spec])));

      // Find the weakest existing link that is NOT reciprocal (don't break existing bidirectional)
      let weakestIdx = -1;
      let weakestScore = Infinity;

      for (let i = 0; i < targetSpec.relatedCalculators.length; i++) {
        const existingId = targetSpec.relatedCalculators[i];
        const existingEntry = specMap.get(existingId);
        if (!existingEntry) continue;

        // Don't remove a link that would create a NEW asymmetry
        // (i.e., if the existing link's spec also links back to target, keep it)
        if (existingEntry.spec.relatedCalculators.includes(target)) continue;

        const existingScore = relevanceScore(existingEntry.spec, targetSpec, new Map(entries.map(e => [e.spec.id, e.spec])));
        if (existingScore < weakestScore) {
          weakestScore = existingScore;
          weakestIdx = i;
        }
      }

      if (weakestIdx >= 0 && newScore > weakestScore) {
        const removed = targetSpec.relatedCalculators[weakestIdx];
        targetSpec.relatedCalculators[weakestIdx] = source;
        targetEntry.modified = true;
        swapCount++;
        console.log(`  ⟳ ${target}: swapped ${removed} → ${source} (score ${weakestScore} → ${newScore})`);
      } else {
        skipCount++;
      }
    }
  }

  // Write modified specs back to disk
  if (!dryRun) {
    let writeCount = 0;
    for (const entry of entries) {
      if (entry.modified) {
        fs.writeFileSync(entry.filePath, JSON.stringify(entry.spec, null, 2) + '\n', 'utf-8');
        writeCount++;
      }
    }
    console.log(`\nDone. Added ${addCount}, swapped ${swapCount}, skipped ${skipCount} across ${writeCount} files.`);
  } else {
    console.log(`\n[DRY RUN] Would add ${addCount}, swap ${swapCount}, skip ${skipCount}.`);
  }

  // Report remaining asymmetric
  let remaining = 0;
  for (const entry of entries) {
    for (const relId of entry.spec.relatedCalculators) {
      const target = specMap.get(relId);
      if (target && !target.spec.relatedCalculators.includes(entry.spec.id)) {
        remaining++;
      }
    }
  }
  console.log(`Remaining asymmetric links: ${remaining}`);
}

main();
