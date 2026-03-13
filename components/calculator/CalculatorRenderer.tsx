'use client';

import { useState, useCallback, useMemo } from 'react';
import { CalculatorSpec, InputField as InputFieldType } from '@/lib/types';
import { getFormula } from '@/lib/formulas';
import InputField from './InputField';
import OutputDisplay from './OutputDisplay';
import TabSwitcher from './features/TabSwitcher';
import { ResultHeader, AssumptionsBar, MethodologyFooter } from './results';
interface CalculatorRendererProps {
  spec: CalculatorSpec;
}

function getDefaults(spec: CalculatorSpec, tabId?: string | null): Record<string, unknown> {
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

  // Apply tab overrides
  if (tabId && spec.tabs) {
    const tab = spec.tabs.find((t) => t.id === tabId);
    if (tab?.defaultInputOverrides) {
      for (const [key, val] of Object.entries(tab.defaultInputOverrides)) {
        defaults[key] = val;
      }
    }
  }

  return defaults;
}

function validateInputs(
  fields: InputFieldType[],
  values: Record<string, unknown>
): Record<string, string> {
  const errors: Record<string, string> = {};

  for (const field of fields) {
    const val = values[field.id];

    // Required check
    if (field.required) {
      if (val === undefined || val === null || val === '') {
        errors[field.id] = `${field.label} is required`;
        continue;
      }
    }

    // Numeric range check
    if (field.type === 'number' || field.type === 'currency' || field.type === 'percentage' || field.type === 'range') {
      const num = typeof val === 'number' ? val : parseFloat(String(val));
      if (val !== '' && val !== undefined && !isNaN(num)) {
        if (field.min !== undefined && num < field.min) {
          errors[field.id] = `${field.label} must be at least ${field.min}`;
        }
        if (field.max !== undefined && num > field.max) {
          errors[field.id] = `${field.label} must be at most ${field.max}`;
        }
      } else if (field.required && (val === '' || isNaN(num))) {
        errors[field.id] = `${field.label} must be a valid number`;
      }
    }
  }

  return errors;
}

export default function CalculatorRenderer({ spec }: CalculatorRendererProps) {
  const [activeTab, setActiveTab] = useState<string | null>(spec.tabs?.[0]?.id ?? null);
  const [inputs, setInputs] = useState<Record<string, unknown>>(() => getDefaults(spec, activeTab));
  const [results, setResults] = useState<Record<string, unknown> | null>(null);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [hasCalculated, setHasCalculated] = useState(false);
  const [calculatedInputs, setCalculatedInputs] = useState<Record<string, unknown>>({});

  // Determine which inputs are visible based on active tab and visibleWhen conditions
  const visibleInputs = useMemo(() => {
    let fields = spec.inputs;

    // Filter by tab visibility
    if (activeTab && spec.tabs) {
      const tab = spec.tabs.find((t) => t.id === activeTab);
      if (tab?.visibleInputs) {
        fields = fields.filter((inp) => tab.visibleInputs!.includes(inp.id));
      }
    }

    // Filter by visibleWhen conditions (conditional visibility based on other field values)
    fields = fields.filter((field) => {
      if (!field.visibleWhen) return true;
      return Object.entries(field.visibleWhen).every(([condFieldId, allowedValues]) => {
        const currentVal = String(inputs[condFieldId] ?? '');
        return allowedValues.includes(currentVal);
      });
    });

    return fields;
  }, [spec.inputs, spec.tabs, activeTab, inputs]);

  const handleTabChange = useCallback(
    (tabId: string) => {
      setActiveTab(tabId);
      setInputs(getDefaults(spec, tabId));
      setResults(null);
      setErrors({});
      setHasCalculated(false);
    },
    [spec]
  );

  const handleInputChange = useCallback(
    (fieldId: string, value: unknown) => {
      setInputs((prev) => {
        const next = { ...prev, [fieldId]: value };

        // Cross-field update: when state is selected, auto-fill tax rate
        if (fieldId === 'stateCode' && value && value !== 'custom') {
          try {
            const stateOption = spec.inputs
              .find((i) => i.id === 'stateCode')
              ?.options?.find((o) => o.value === value);
            if (stateOption) {
              // Extract rate from label like "Idaho (6.03%)"
              const match = stateOption.label.match(/\((\d+\.?\d*)%\)/);
              if (match) {
                next['taxRate'] = parseFloat(match[1]);
              }
            }
          } catch (e) {
            // Fallback: don't update taxRate
          }
        }
        // If state is set back to custom, clear the auto-filled rate
        if (fieldId === 'stateCode' && value === 'custom') {
          next['taxRate'] = 0;
        }

        return next;
      });
      // Clear previous results when any input changes
      setResults(null);
      setHasCalculated(false);
      // Clear error for this field on change
      setErrors((prev) => {
        if (!prev[fieldId]) return prev;
        const next = { ...prev };
        delete next[fieldId];
        return next;
      });
    },
    [spec]
  );

  const handleReset = useCallback(() => {
    setInputs(getDefaults(spec, activeTab));
    setResults(null);
    setErrors({});
    setHasCalculated(false);
  }, [spec, activeTab]);

  const handleCalculate = useCallback(() => {
    const validationErrors = validateInputs(visibleInputs, inputs);
    if (Object.keys(validationErrors).length > 0) {
      setErrors(validationErrors);
      setResults(null);
      return;
    }
    setErrors({});
    try {
      const formula = getFormula(spec.formula);

      // Flatten unit-pair values: { value, unit } → fieldId = value, fieldIdUnit = unit
      const flatInputs: Record<string, unknown> = {};
      for (const [key, val] of Object.entries(inputs)) {
        if (typeof val === 'object' && val !== null && 'value' in val && 'unit' in val) {
          const pair = val as { value: number; unit: string };
          flatInputs[key] = pair.value;
          flatInputs[`${key}Unit`] = pair.unit;
        } else {
          flatInputs[key] = val;
        }
      }

      const output = formula(flatInputs);
      setResults(output);
      setCalculatedInputs({ ...inputs });
      setHasCalculated(true);
    } catch (err) {
      console.error('Formula execution error:', err);
      setResults(null);
    }
  }, [spec.formula, inputs, visibleInputs]);

  // Determine grid layout: 2 columns if 6+ inputs
  const useGrid = visibleInputs.length >= 6;

  // Separate highlighted outputs from the rest for visual hierarchy
  const highlightedOutputs = spec.outputs.filter((o) => o.highlight);
  const remainingOutputs = spec.outputs.filter((o) => !o.highlight);

  const isFlagship = spec.priority === 'flagship';

  return (
    <div className="mx-auto max-w-calculator">
      <div className="rounded-xl border border-gray-200 dark:border-slate-700 bg-white dark:bg-slate-800 shadow-sm">
        {/* Tabs */}
        {spec.tabs && spec.tabs.length > 0 && (
          <div className="px-4 pt-3 sm:px-5 sm:pt-4">
            <TabSwitcher tabs={spec.tabs} activeTab={activeTab} onChange={handleTabChange} />
          </div>
        )}

        {/* Results — shown ABOVE inputs after calculation */}
        {hasCalculated && results && (
          <div className="bg-brand-50/60 dark:bg-brand-900/20 p-4 sm:p-5">
            {/* Primary result(s) — large, bold numbers */}
            {highlightedOutputs.length > 0 && (
              <div className="space-y-3">
                {highlightedOutputs.map((output) => (
                  <OutputDisplay key={output.id} field={output} data={results} />
                ))}
              </div>
            )}

            {/* Remaining outputs */}
            {remainingOutputs.length > 0 && (
              <div className={`space-y-3 ${highlightedOutputs.length > 0 ? 'mt-3' : ''}`}>
                {remainingOutputs.map((output) => (
                  <OutputDisplay key={output.id} field={output} data={results} />
                ))}
              </div>
            )}

            {/* Result header with formula source */}
            <ResultHeader
              formulaCitation={isFlagship ? spec.formulaCitation : undefined}
            />

            {/* Assumptions bar */}
            {isFlagship && (
              <div className="mt-3">
                <AssumptionsBar inputs={visibleInputs} values={calculatedInputs} />
              </div>
            )}

            {/* Methodology footer */}
            {isFlagship && (
              <div className="mt-4">
                <MethodologyFooter
                  formulaCitation={spec.formulaCitation}
                  formulaSource={spec.formulaSource}
                  disclaimer={spec.disclaimer}
                  slug={spec.slug}
                />
              </div>
            )}

            {/* Actions bar */}
            <div className="mt-4 pt-3 border-t border-brand-200/50 dark:border-brand-800/30 flex flex-wrap items-center gap-3">
              <button
                onClick={handleReset}
                className="inline-flex items-center gap-2 rounded-lg border border-gray-200 dark:border-slate-600 bg-white dark:bg-slate-700 px-4 py-2 text-sm font-medium text-gray-600 dark:text-slate-300 transition-colors hover:bg-gray-50 dark:hover:bg-slate-600 hover:text-gray-800 dark:hover:text-slate-100"
                type="button"
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                </svg>
                Reset
              </button>
            </div>
          </div>
        )}

        {/* Divider between results and inputs */}
        {hasCalculated && results && (
          <div className="border-t border-gray-200 dark:border-slate-700" />
        )}

        {/* Inputs */}
        <div className="p-4 sm:p-5">
          <div
            className={
              useGrid
                ? 'grid gap-3 md:grid-cols-2'
                : 'flex flex-col gap-3'
            }
            role={spec.tabs ? 'tabpanel' : undefined}
            id={activeTab ? `tabpanel-${activeTab}` : undefined}
          >
            {visibleInputs.map((field) => (
              <InputField
                key={field.id}
                field={field}
                value={inputs[field.id] as number | string | boolean | { value: number; unit: string } | undefined}
                error={errors[field.id]}
                onChange={(val) => handleInputChange(field.id, val)}
              />
            ))}
          </div>

          {/* Calculate button — full width, prominent */}
          <div className="mt-4">
            <button
              onClick={handleCalculate}
              className="w-full rounded-lg bg-brand-500 px-6 py-2.5 text-sm font-semibold text-white shadow-sm transition-colors hover:bg-brand-600 active:bg-brand-700 focus:outline-none focus:ring-2 focus:ring-brand-500/30 focus:ring-offset-2 dark:focus:ring-offset-slate-800"
            >
              Calculate
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
