/**
 * One-time migration script: replaces "## What This Calculator Tells You"
 * in all MDX files with category/subcategory-appropriate headings
 * using the mapping from lib/interpretation-headings.ts.
 *
 * Usage: npx ts-node --compiler-options '{"module":"commonjs"}' scripts/update-interpretation-headings.ts
 * Or:    npx tsx scripts/update-interpretation-headings.ts
 */

import * as fs from 'fs';
import * as path from 'path';

// Inline the heading map so the script has no import issues with path aliases.
const HEADING_BY_SUBCATEGORY: Record<string, Record<string, string>> = {
  finance: {
    mortgage: 'What Your Payment Breakdown Means',
    loans: 'What Your Payment Breakdown Means',
    investment: 'What Your Projection Shows',
    retirement: 'What Your Projection Shows',
    savings: 'What Your Projection Shows',
    tax: 'What Your Tax Estimate Shows',
  },
  health: {
    pregnancy: 'What Your Estimate Means',
    fitness: 'What Your Results Mean',
    'body-metrics': 'What Your Results Mean',
    nutrition: 'What Your Results Mean',
  },
  math: {
    basic: 'Your Result Explained',
    algebra: 'Your Result Explained',
    geometry: 'Your Result Explained',
    statistics: 'Your Result Explained',
  },
  science: {
    physics: 'Your Result Explained',
  },
  construction: {
    materials: 'What This Estimate Shows',
    landscaping: 'What This Estimate Shows',
    measurement: 'What This Measurement Shows',
  },
  everyday: {
    money: 'What Your Result Shows',
    'date-time': 'Your Result Explained',
    education: 'What Your Grade Means',
  },
  business: {
    margins: 'What Your Results Mean',
    sales: 'What Your Results Mean',
    pricing: 'What Your Results Mean',
    payroll: 'What Your Estimate Shows',
    tax: 'What Your Tax Estimate Shows',
  },
  conversion: {
    weight: 'How This Conversion Works',
    volume: 'How This Conversion Works',
    temperature: 'How This Conversion Works',
    length: 'How This Conversion Works',
    'data-storage': 'How This Conversion Works',
    area: 'How This Conversion Works',
  },
};

const HEADING_BY_CATEGORY: Record<string, string> = {
  finance: 'What Your Results Mean',
  health: 'What Your Results Mean',
  math: 'Your Result Explained',
  science: 'Your Result Explained',
  construction: 'What This Estimate Shows',
  everyday: 'Your Result Explained',
  business: 'What Your Results Mean',
  conversion: 'How This Conversion Works',
};

function getHeading(category: string, subcategory: string): string {
  return (
    HEADING_BY_SUBCATEGORY[category]?.[subcategory] ??
    HEADING_BY_CATEGORY[category] ??
    'What Your Results Mean'
  );
}

const CONTENT_DIR = path.join(__dirname, '..', 'content', 'calculators');
const OLD_HEADING = '## What This Calculator Tells You';

let updated = 0;
let skipped = 0;
let alreadyDone = 0;

const categories = fs.readdirSync(CONTENT_DIR).filter((d) =>
  fs.statSync(path.join(CONTENT_DIR, d)).isDirectory()
);

for (const category of categories) {
  const catDir = path.join(CONTENT_DIR, category);
  const mdxFiles = fs.readdirSync(catDir).filter((f) => f.endsWith('.mdx'));

  for (const mdxFile of mdxFiles) {
    const slug = mdxFile.replace('.mdx', '');
    const specPath = path.join(catDir, `${slug}.spec.json`);
    const mdxPath = path.join(catDir, mdxFile);

    if (!fs.existsSync(specPath)) {
      console.log(`  SKIP ${category}/${slug} — no spec.json`);
      skipped++;
      continue;
    }

    const spec = JSON.parse(fs.readFileSync(specPath, 'utf-8'));
    const subcategory: string = spec.subcategory ?? '';
    const newHeading = `## ${getHeading(category, subcategory)}`;

    let mdxContent = fs.readFileSync(mdxPath, 'utf-8');

    if (!mdxContent.includes(OLD_HEADING)) {
      // Check if already using a non-default heading
      if (mdxContent.includes(newHeading)) {
        alreadyDone++;
      } else {
        console.log(`  SKIP ${category}/${slug} — old heading not found`);
        skipped++;
      }
      continue;
    }

    // Also update the comment line if present
    mdxContent = mdxContent.replace(
      /\{\/\*\s*Section 6:\s*What This Calculator Tells You\s*\*\/\}/g,
      `{/* Section 6: ${getHeading(category, subcategory)} */}`
    );
    mdxContent = mdxContent.replace(OLD_HEADING, newHeading);

    fs.writeFileSync(mdxPath, mdxContent, 'utf-8');
    console.log(`  ✓ ${category}/${slug} → "${getHeading(category, subcategory)}"`);
    updated++;
  }
}

console.log(`\nDone. Updated: ${updated}, Already done: ${alreadyDone}, Skipped: ${skipped}`);
