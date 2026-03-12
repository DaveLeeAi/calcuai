/**
 * Pipeline Sweep — Tests ALL calculators through the exact same pipeline
 * as CalculatorRenderer: getDefaults → flatten → formula → check outputs
 *
 * This test catches:
 * - Formulas that return zero for valid default inputs
 * - Missing output fields
 * - NaN / Infinity / null / undefined outputs
 * - Formula registry mismatches
 * - Type coercion bugs in the flatten step
 */
import * as fs from 'fs';
import * as path from 'path';
import { getFormula } from '@/lib/formulas';

interface SpecInput {
  id: string;
  label: string;
  type: string;
  required?: boolean;
  defaultValue?: unknown;
  defaultUnit?: string;
  units?: { value: string; label: string }[];
  min?: number;
  max?: number;
  options?: { value: string; label: string }[];
  [key: string]: unknown;
}

interface SpecOutput {
  id: string;
  label: string;
  type: string;
  format?: string;
  precision?: number;
  highlight?: boolean;
  [key: string]: unknown;
}

interface CalcSpec {
  id: string;
  slug: string;
  title: string;
  category: string;
  formula: string;
  inputs: SpecInput[];
  outputs: SpecOutput[];
  [key: string]: unknown;
}

// Find all spec files recursively
function findSpecs(dir: string): string[] {
  let results: string[] = [];
  for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
    const full = path.join(dir, entry.name);
    if (entry.isDirectory()) results = results.concat(findSpecs(full));
    else if (entry.name.endsWith('.spec.json')) results.push(full);
  }
  return results;
}

// Simulate getDefaults (same logic as CalculatorRenderer)
function getDefaults(spec: CalcSpec): Record<string, unknown> {
  const defaults: Record<string, unknown> = {};
  for (const field of spec.inputs) {
    if (field.type === 'unit-pair') {
      defaults[field.id] = {
        value: field.defaultValue ?? 0,
        unit: field.defaultUnit ?? field.units?.[0]?.value ?? '',
      };
    } else {
      defaults[field.id] = field.defaultValue ?? '';
    }
  }
  return defaults;
}

// Simulate flatten (same logic as handleCalculate in CalculatorRenderer)
function flattenInputs(inputs: Record<string, unknown>): Record<string, unknown> {
  const flat: Record<string, unknown> = {};
  for (const [key, val] of Object.entries(inputs)) {
    if (typeof val === 'object' && val !== null && 'value' in val && 'unit' in val) {
      const pair = val as { value: number; unit: string };
      flat[key] = pair.value;
      flat[`${key}Unit`] = pair.unit;
    } else {
      flat[key] = val;
    }
  }
  return flat;
}

// Load all specs
const specDir = path.join(__dirname, '..', 'content', 'calculators');
const specFiles = findSpecs(specDir);
const allSpecs: { file: string; spec: CalcSpec }[] = specFiles.map((f) => ({
  file: f,
  spec: JSON.parse(fs.readFileSync(f, 'utf8')) as CalcSpec,
}));

describe('Calculator Pipeline Sweep — Default Inputs', () => {
  test.each(allSpecs.map(({ spec }) => [spec.slug, spec]))(
    '%s: formula executes and returns valid outputs with defaults',
    (_slug, spec) => {
      // 1. Get formula
      const formula = getFormula(spec.formula);
      expect(formula).toBeDefined();

      // 2. Create defaults (same as CalculatorRenderer)
      const defaults = getDefaults(spec);

      // 3. Flatten unit-pair values (same as handleCalculate)
      const flatInputs = flattenInputs(defaults);

      // 4. Execute formula
      const output = formula(flatInputs);

      // 5. Verify output is a valid object
      expect(output).toBeDefined();
      expect(typeof output).toBe('object');
      expect(output).not.toBeNull();

      // 6. Verify each expected output field exists and is not NaN/null/undefined
      // Mode-based calculators may return null for outputs belonging to an inactive mode/tab.
      // These are valid — the UI shows '—' for null values. We only reject undefined (missing field).
      const modeBasedCalcs = new Set([
        'percentage-calculator',  // 3 modes: percent-of, percent-change, percent-difference
        'date-calculator',        // tabs: days-between vs add/subtract
        'significant-figures-calculator', // count mode returns null roundedValue
        'scientific-notation-calculator', // tabs: to-scientific vs from-scientific
        'pythagorean-theorem-calculator', // tabs: find-c, find-a, find-b
        'p-value-calculator',     // z-test mode returns null degreesOfFreedom
      ]);
      const isModeBasedCalc = modeBasedCalcs.has(spec.slug);

      for (const outField of spec.outputs) {
        const val = output[outField.id];
        expect(val).not.toBeUndefined();
        // Allow null for mode-based calculators (inactive mode outputs)
        if (!isModeBasedCalc) {
          expect(val).not.toBeNull();
        }
        if (typeof val === 'number') {
          expect(isNaN(val)).toBe(false);
          expect(isFinite(val)).toBe(true);
        }
      }
    }
  );
});

describe('Calculator Pipeline Sweep — Zero-Output Detection', () => {
  // Calculators that legitimately return zero for some single-value outputs.
  // GPA calculator requires array-of-objects input (courses) that can't be expressed
  // as a simple default value — it returns 0.0 GPA with empty/missing course data.
  const allowedZeroCalcs = new Set([
    'gpa-calculator',
  ]);

  test.each(allSpecs.map(({ spec }) => [spec.slug, spec]))(
    '%s: not all single-value outputs are zero',
    (_slug, spec) => {
      const formula = getFormula(spec.formula);
      const defaults = getDefaults(spec);
      const flatInputs = flattenInputs(defaults);
      const output = formula(flatInputs);

      const singleValues = spec.outputs.filter((o) => o.type === 'single-value');
      if (singleValues.length < 2) return; // Skip if too few to be suspicious

      const allZero = singleValues.every((o) => {
        const v = output[o.id];
        return typeof v === 'number' && v === 0;
      });

      if (allowedZeroCalcs.has(spec.slug)) return;

      expect(allZero).toBe(false);
    }
  );
});

describe('Calculator Pipeline Sweep — Input Sensitivity', () => {
  // Calculators where input sensitivity can't be tested via simple numeric perturbation:
  // - date-calculator: tab-based; default mode uses date inputs, not the numeric daysToAdd
  // - gpa-calculator: requires array-of-objects (courses) input, not simple numerics
  // - final-grade-calculator: requires array-of-objects (categories) input, not simple numerics
  const skipSensitivityCalcs = new Set([
    'date-calculator',
    'gpa-calculator',
    'final-grade-calculator',
    'significant-figures-calculator', // primary input is text (string-based counting), not numeric
  ]);

  // For each calculator, verify that changing a key numeric input changes at least one output
  test.each(allSpecs.map(({ spec }) => [spec.slug, spec]))(
    '%s: changing primary input changes outputs',
    (_slug, spec) => {
      if (skipSensitivityCalcs.has(spec.slug)) return;
      const formula = getFormula(spec.formula);
      const defaults = getDefaults(spec);

      // Find first numeric-like input to perturb
      const numericInput = spec.inputs.find(
        (inp) =>
          inp.type === 'number' ||
          inp.type === 'currency' ||
          inp.type === 'percentage' ||
          inp.type === 'unit-pair'
      );
      if (!numericInput) return; // Skip if no numeric inputs (e.g., date-only calcs)

      // Run with defaults
      const flatDefault = flattenInputs(defaults);
      const outputDefault = formula(flatDefault);

      // Run with perturbed input (double the value)
      const perturbed = { ...defaults };
      if (numericInput.type === 'unit-pair') {
        const pair = perturbed[numericInput.id] as { value: number; unit: string };
        perturbed[numericInput.id] = { value: pair.value * 2, unit: pair.unit };
      } else {
        const currentVal = Number(perturbed[numericInput.id]) || 1;
        perturbed[numericInput.id] = currentVal * 2;
      }
      const flatPerturbed = flattenInputs(perturbed);
      const outputPerturbed = formula(flatPerturbed);

      // At least one single-value output should differ
      const singleValues = spec.outputs.filter((o) => o.type === 'single-value');
      if (singleValues.length === 0) return;

      const anyDifferent = singleValues.some((o) => {
        const v1 = outputDefault[o.id];
        const v2 = outputPerturbed[o.id];
        if (typeof v1 === 'number' && typeof v2 === 'number') {
          return Math.abs(v1 - v2) > 0.001;
        }
        return v1 !== v2;
      });

      expect(anyDifferent).toBe(true);
    }
  );
});
