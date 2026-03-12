'use client';

import { useState } from 'react';
import { InputField } from '@/lib/types';
import { formatValue } from '../outputs/types';

interface AssumptionsBarProps {
  inputs: InputField[];
  values: Record<string, unknown>;
}

function formatInputValue(field: InputField, value: unknown): string {
  if (value === undefined || value === null || value === '') return '—';

  if (field.type === 'unit-pair' && typeof value === 'object' && value !== null) {
    const pair = value as { value: number; unit: string };
    const unitLabel = field.units?.find((u) => u.value === pair.unit)?.label ?? pair.unit;
    return `${pair.value} ${unitLabel}`;
  }

  if (field.type === 'select' || field.type === 'radio') {
    const opt = field.options?.find((o) => o.value === String(value));
    return opt?.label ?? String(value);
  }

  if (field.type === 'toggle') {
    return value ? 'Yes' : 'No';
  }

  if (field.type === 'currency') {
    return formatValue(value, 'currency', 0);
  }

  if (field.type === 'percentage') {
    return formatValue(value, 'percentage', 2);
  }

  return String(value);
}

export default function AssumptionsBar({ inputs, values }: AssumptionsBarProps) {
  const [expanded, setExpanded] = useState(false);

  const filledInputs = inputs.filter((inp) => {
    const v = values[inp.id];
    return v !== undefined && v !== null && v !== '';
  });

  if (filledInputs.length === 0) return null;

  // Show first 4 inline, rest on expand
  const previewCount = 4;
  const preview = filledInputs.slice(0, previewCount);
  const rest = filledInputs.slice(previewCount);

  return (
    <div className="rounded-lg border border-gray-150 bg-gray-50/80 px-3 py-2.5 text-xs text-gray-600">
      <div className="flex flex-wrap items-center gap-x-1 gap-y-1">
        <span className="font-medium text-gray-500 mr-1">Based on:</span>
        {preview.map((field, i) => (
          <span key={field.id} className="inline-flex items-center">
            <span className="font-medium text-gray-700">{field.label}</span>
            <span className="mx-0.5">=</span>
            <span>{formatInputValue(field, values[field.id])}</span>
            {(i < preview.length - 1 || rest.length > 0) && (
              <span className="mx-1 text-gray-300">|</span>
            )}
          </span>
        ))}
        {rest.length > 0 && !expanded && (
          <button
            onClick={() => setExpanded(true)}
            className="font-medium text-brand-600 hover:text-brand-700 hover:underline"
          >
            +{rest.length} more
          </button>
        )}
        {expanded &&
          rest.map((field, i) => (
            <span key={field.id} className="inline-flex items-center">
              <span className="font-medium text-gray-700">{field.label}</span>
              <span className="mx-0.5">=</span>
              <span>{formatInputValue(field, values[field.id])}</span>
              {i < rest.length - 1 && (
                <span className="mx-1 text-gray-300">|</span>
              )}
            </span>
          ))}
        {expanded && (
          <button
            onClick={() => setExpanded(false)}
            className="ml-1 font-medium text-brand-600 hover:text-brand-700 hover:underline"
          >
            show less
          </button>
        )}
      </div>
    </div>
  );
}
