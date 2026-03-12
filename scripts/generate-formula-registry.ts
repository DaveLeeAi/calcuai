/**
 * generate-formula-registry.ts — Build-time code generator
 *
 * Scans all formula modules in lib/formulas/, reads their FORMULA_REGISTRY exports,
 * and generates lib/formulas/index.ts with all imports and a flat registry object.
 *
 * Run with: npm run generate:registry
 */
import * as fs from 'fs';
import * as path from 'path';
import { glob } from 'glob';

const ROOT = path.resolve(__dirname, '..');
const FORMULAS_DIR = path.join(ROOT, 'lib', 'formulas');
const OUTPUT_FILE = path.join(FORMULAS_DIR, 'index.ts');

interface ModuleEntry {
  /** Relative path from lib/formulas/, e.g. 'finance/mortgage-payment' (no .ts) */
  importPath: string;
  /** Safe identifier for the import alias, e.g. 'finance_mortgage_payment' */
  importAlias: string;
  /** Category extracted from path, e.g. 'finance' */
  category: string;
  /** Formula IDs this module provides */
  formulaIds: string[];
}

/**
 * Extracts formula IDs from a module's FORMULA_REGISTRY export using regex.
 * Looks for string keys in the FORMULA_REGISTRY object literal.
 */
function extractFormulaIds(source: string): string[] {
  // Match the FORMULA_REGISTRY block — find the object literal after the assignment
  // Use [^{]* to skip the type annotation (which contains => but no braces)
  const registryMatch = source.match(
    /export\s+const\s+FORMULA_REGISTRY[^{]*\{([\s\S]*?)\};/
  );
  if (!registryMatch) return [];

  const body = registryMatch[1];
  const ids: string[] = [];

  // Extract all string keys: 'some-id': functionName
  const keyPattern = /['"]([^'"]+)['"]\s*:/g;
  let match: RegExpExecArray | null;
  while ((match = keyPattern.exec(body)) !== null) {
    ids.push(match[1]);
  }

  return ids;
}

/**
 * Creates a safe TypeScript identifier from a relative path.
 * e.g. 'finance/mortgage-payment' → 'finance_mortgage_payment'
 * e.g. 'finance/401k-growth' → 'finance__401k_growth'
 */
function toSafeIdentifier(relativePath: string): string {
  return relativePath
    .replace(/\//g, '_')
    .replace(/-/g, '_')
    .replace(/^(\d)/, '_$1'); // Prefix with _ if starts with digit
}

async function main(): Promise<void> {
  // Find all .ts files in lib/formulas/ recursively, excluding index.ts
  const allFiles = await glob('**/*.ts', {
    cwd: FORMULAS_DIR,
    posix: true,
  });

  const formulaFiles = allFiles
    .filter((f) => f !== 'index.ts' && !f.endsWith('/index.ts'))
    .sort();

  const modules: ModuleEntry[] = [];
  const allFormulaIds: string[] = [];
  const errors: string[] = [];

  for (const file of formulaFiles) {
    const fullPath = path.join(FORMULAS_DIR, file);
    const source = fs.readFileSync(fullPath, 'utf8');

    const ids = extractFormulaIds(source);
    if (ids.length === 0) {
      errors.push(`WARNING: No FORMULA_REGISTRY found in ${file}`);
      continue;
    }

    const importPath = file.replace(/\.ts$/, '');
    const importAlias = toSafeIdentifier(importPath);
    const category = file.split('/')[0];

    modules.push({
      importPath,
      importAlias,
      category,
      formulaIds: ids,
    });

    allFormulaIds.push(...ids);
  }

  // Check for duplicate formula IDs
  const idCounts = new Map<string, string[]>();
  for (const mod of modules) {
    for (const id of mod.formulaIds) {
      const sources = idCounts.get(id) || [];
      sources.push(mod.importPath);
      idCounts.set(id, sources);
    }
  }

  for (const [id, sources] of idCounts) {
    if (sources.length > 1) {
      errors.push(`ERROR: Duplicate formula ID '${id}' in: ${sources.join(', ')}`);
    }
  }

  // Generate the output file
  const categories = [...new Set(modules.map((m) => m.category))].sort();

  let output = `/**
 * AUTO-GENERATED — Do not edit manually.
 * Run: npm run generate:registry
 * Source: scripts/generate-formula-registry.ts
 *
 * ${modules.length} modules, ${allFormulaIds.length} formula IDs
 * Generated: ${new Date().toISOString().split('T')[0]}
 */
import type { FormulaFunction } from '@/lib/types';

`;

  // Group imports by category
  for (const category of categories) {
    const categoryModules = modules.filter((m) => m.category === category);
    output += `// ${category.charAt(0).toUpperCase() + category.slice(1)}\n`;
    for (const mod of categoryModules) {
      output += `import { FORMULA_REGISTRY as ${mod.importAlias} } from './${mod.importPath}';\n`;
    }
    output += '\n';
  }

  // Build the registry object
  output += `const formulaRegistry: Record<string, FormulaFunction> = {\n`;
  for (const category of categories) {
    const categoryModules = modules.filter((m) => m.category === category);
    output += `  // ${category.charAt(0).toUpperCase() + category.slice(1)}\n`;
    for (const mod of categoryModules) {
      output += `  ...${mod.importAlias},\n`;
    }
  }
  output += `};\n\n`;

  // Export getFormula and default
  output += `export function getFormula(id: string): FormulaFunction {
  const fn = formulaRegistry[id];
  if (!fn) {
    throw new Error(
      \`Formula not found: "\${id}". Run "npm run generate:registry" to rebuild the formula index.\`
    );
  }
  return fn;
}

export default formulaRegistry;
`;

  fs.writeFileSync(OUTPUT_FILE, output);

  // Report
  console.log(`\n=== Formula Registry Generator ===`);
  console.log(`Modules scanned: ${formulaFiles.length}`);
  console.log(`Modules with FORMULA_REGISTRY: ${modules.length}`);
  console.log(`Total formula IDs: ${allFormulaIds.length}`);
  console.log(`Output: ${path.relative(ROOT, OUTPUT_FILE)}`);

  if (errors.length > 0) {
    console.log(`\n--- Issues ---`);
    for (const err of errors) {
      console.log(err);
    }
  }

  console.log(`\nFormula IDs by category:`);
  for (const category of categories) {
    const categoryIds = modules
      .filter((m) => m.category === category)
      .flatMap((m) => m.formulaIds);
    console.log(`  ${category}: ${categoryIds.length}`);
  }

  console.log(`\nDone!`);

  // Exit with error if there were ERROR-level issues
  if (errors.some((e) => e.startsWith('ERROR'))) {
    process.exit(1);
  }
}

main().catch((err) => {
  console.error('Fatal error:', err);
  process.exit(1);
});
