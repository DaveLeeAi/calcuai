'use client';

import { useCallback, useId } from 'react';
import { InputComponentProps } from './types';

export default function UnitPairInput({ field, value, error, onChange }: InputComponentProps) {
  const id = useId();

  const pairValue =
    typeof value === 'object' && value !== null && 'value' in value && 'unit' in value
      ? (value as { value: number; unit: string })
      : { value: (field.defaultValue as number) ?? 0, unit: field.defaultUnit ?? field.units?.[0]?.value ?? '' };

  const handleValueChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      const raw = e.target.value.replace(/,/g, '');
      if (raw === '') {
        onChange({ value: 0, unit: pairValue.unit });
        return;
      }
      const parsed = parseFloat(raw);
      if (!isNaN(parsed)) {
        onChange({ value: parsed, unit: pairValue.unit });
      }
    },
    [pairValue.unit, onChange]
  );

  const handleUnitChange = useCallback(
    (e: React.ChangeEvent<HTMLSelectElement>) => {
      onChange({ value: pairValue.value, unit: e.target.value });
    },
    [pairValue.value, onChange]
  );

  const displayValue = pairValue.value !== 0 ? pairValue.value.toLocaleString('en-US') : '';

  return (
    <div className="flex flex-col gap-1">
      <label htmlFor={id} className="text-sm font-medium text-gray-700 dark:text-slate-300">
        {field.label}
        {field.required && <span className="text-danger-500 ml-0.5">*</span>}
      </label>
      <div className="flex gap-2">
        <input
          id={id}
          type="text"
          inputMode="decimal"
          value={displayValue}
          onChange={handleValueChange}
          placeholder={field.placeholder ?? '0'}
          aria-invalid={!!error}
          aria-describedby={error ? `${id}-error` : field.helpText ? `${id}-help` : undefined}
          className={`h-10 flex-1 rounded-lg border px-3 text-sm outline-none transition-colors ${
            error
              ? 'border-danger-500 focus:ring-2 focus:ring-danger-500/30'
              : 'border-gray-300 focus:border-brand-500 focus:ring-2 focus:ring-brand-500/30 dark:border-slate-600 dark:bg-slate-800 dark:text-slate-200'
          }`}
        />
        <select
          aria-label={`${field.label} unit`}
          value={pairValue.unit}
          onChange={handleUnitChange}
          className="h-10 rounded-lg border border-gray-300 bg-white px-2 text-sm outline-none transition-colors focus:border-brand-500 focus:ring-2 focus:ring-brand-500/30 dark:border-slate-600 dark:bg-slate-800 dark:text-slate-200"
        >
          {field.units?.map((u) => (
            <option key={u.value} value={u.value}>
              {u.label}
            </option>
          ))}
        </select>
      </div>
      {error && (
        <p id={`${id}-error`} className="text-xs text-danger-500" role="alert">
          {error}
        </p>
      )}
      {!error && field.helpText && (
        <p id={`${id}-help`} className="text-xs text-gray-500 dark:text-slate-400">
          {field.helpText}
        </p>
      )}
    </div>
  );
}
