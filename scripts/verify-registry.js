const fs = require('fs');
const path = require('path');
const glob = require('glob');

// Collect all formula IDs from FORMULA_REGISTRY in all modules
const modules = glob.sync('lib/formulas/**/*.ts', { ignore: 'lib/formulas/index.ts' });
const registryIds = new Set();
for (const mod of modules) {
  const src = fs.readFileSync(mod, 'utf8');
  const match = src.match(/FORMULA_REGISTRY[^{]*\{([\s\S]*?)\};/);
  if (!match) continue;
  const body = match[1];
  const re = /'([^']+)'\s*:/g;
  let m;
  while ((m = re.exec(body)) !== null) {
    registryIds.add(m[1]);
  }
}

// Collect all formula IDs from specs
const specs = glob.sync('content/calculators/**/*.spec.json');
const specIds = new Set();
for (const s of specs) {
  const data = JSON.parse(fs.readFileSync(s, 'utf8'));
  specIds.add(data.formula);
}

// Check for missing
let missing = 0;
for (const id of specIds) {
  if (!registryIds.has(id)) {
    console.log('MISSING:', id);
    missing++;
  }
}

console.log('Registry formula IDs:', registryIds.size);
console.log('Unique spec formula IDs:', specIds.size);
console.log('Missing:', missing);
if (missing === 0) console.log('All spec formula IDs covered!');
