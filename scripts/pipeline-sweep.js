/**
 * Pipeline Sweep — Tests ALL calculators through the exact same pipeline
 * as CalculatorRenderer: getDefaults → flatten → formula → check outputs
 */
const fs = require('fs');
const path = require('path');

// Load formula registry
const formulaIndex = require('../lib/formulas/index');
const getFormula = formulaIndex.getFormula;

// Find all spec files
function findSpecs(dir) {
  let results = [];
  for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
    const full = path.join(dir, entry.name);
    if (entry.isDirectory()) results = results.concat(findSpecs(full));
    else if (entry.name.endsWith('.spec.json')) results.push(full);
  }
  return results;
}

// Simulate getDefaults (same logic as CalculatorRenderer)
function getDefaults(spec) {
  const defaults = {};
  for (const field of spec.inputs) {
    if (field.type === 'unit-pair') {
      defaults[field.id] = {
        value: field.defaultValue != null ? field.defaultValue : 0,
        unit: field.defaultUnit || (field.units && field.units[0] ? field.units[0].value : ''),
      };
    } else {
      defaults[field.id] = field.defaultValue != null ? field.defaultValue : '';
    }
  }
  return defaults;
}

// Simulate flatten (same logic as handleCalculate)
function flattenInputs(inputs) {
  const flat = {};
  for (const [key, val] of Object.entries(inputs)) {
    if (typeof val === 'object' && val !== null && 'value' in val && 'unit' in val) {
      flat[key] = val.value;
      flat[key + 'Unit'] = val.unit;
    } else {
      flat[key] = val;
    }
  }
  return flat;
}

const specDir = path.join(__dirname, '..', 'content', 'calculators');
const specFiles = findSpecs(specDir);

const results = [];
let failures = 0;
let successes = 0;

for (const specFile of specFiles) {
  const spec = JSON.parse(fs.readFileSync(specFile, 'utf8'));
  const slug = spec.slug || path.basename(specFile, '.spec.json');

  try {
    const formula = getFormula(spec.formula);
    const defaults = getDefaults(spec);
    const flatInputs = flattenInputs(defaults);
    const output = formula(flatInputs);

    const issues = [];

    if (!output || typeof output !== 'object') {
      issues.push('Formula returned null/undefined/non-object');
    } else {
      // Check each expected output field
      for (const outField of spec.outputs) {
        const val = output[outField.id];
        if (val === undefined) {
          issues.push('MISSING output: ' + outField.id);
        } else if (val === null) {
          issues.push('NULL output: ' + outField.id);
        } else if (typeof val === 'number' && isNaN(val)) {
          issues.push('NaN output: ' + outField.id);
        } else if (typeof val === 'number' && !isFinite(val)) {
          issues.push('Infinity output: ' + outField.id);
        }
      }

      // Check if ALL single-value outputs are zero (suspicious for calcs with non-zero defaults)
      const singleValues = spec.outputs.filter(o => o.type === 'single-value');
      if (singleValues.length >= 2) {
        const allZero = singleValues.every(o => {
          const v = output[o.id];
          return typeof v === 'number' && v === 0;
        });
        if (allZero) {
          issues.push('ALL single-value outputs are 0 (suspicious)');
        }
      }

      // Check for any output keys the formula returns that are NOT in spec
      const specOutputIds = new Set(spec.outputs.map(o => o.id));
      const extraKeys = Object.keys(output).filter(k => !specOutputIds.has(k));
      if (extraKeys.length > 0) {
        // Not an error, but worth noting
      }
    }

    if (issues.length > 0) {
      failures++;
      results.push({
        slug,
        formula: spec.formula,
        status: 'ISSUES',
        issues,
        flatInputs: JSON.stringify(flatInputs).substring(0, 300),
        output: output ? JSON.stringify(output).substring(0, 300) : 'null',
      });
    } else {
      successes++;
      const keyOutputs = {};
      for (const o of spec.outputs.filter(o => o.type === 'single-value').slice(0, 4)) {
        keyOutputs[o.id] = output[o.id];
      }
      results.push({ slug, formula: spec.formula, status: 'OK', keyOutputs });
    }
  } catch (err) {
    failures++;
    results.push({ slug, formula: spec.formula, status: 'ERROR', error: err.message });
  }
}

console.log('=== CALCULATOR PIPELINE SWEEP ===');
console.log('Total specs:', specFiles.length);
console.log('Successes:', successes);
console.log('Failures:', failures);
console.log('');

// Print failures first
const failedResults = results.filter(r => r.status !== 'OK');
if (failedResults.length > 0) {
  console.log('=== FAILURES / ISSUES ===');
  for (const r of failedResults) {
    console.log('\n[' + r.status + '] ' + r.slug + ' (formula: ' + r.formula + ')');
    if (r.issues) {
      for (const issue of r.issues) {
        console.log('  - ' + issue);
      }
    }
    if (r.error) console.log('  Error: ' + r.error);
    if (r.flatInputs) console.log('  Inputs: ' + r.flatInputs);
    if (r.output) console.log('  Output: ' + r.output);
  }
  console.log('');
}

// Print successes
console.log('=== SUCCESSES ===');
for (const r of results.filter(r => r.status === 'OK')) {
  const vals = Object.entries(r.keyOutputs || {}).map(([k, v]) => k + '=' + v).join(', ');
  console.log('  [OK] ' + r.slug + ': ' + (vals || '(no single-value outputs)'));
}
