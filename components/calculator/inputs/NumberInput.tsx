'use client';

import { useCallback, useId } from 'react';
import { InputComponentProps } from './types';

function formatDisplay(val: number): string {
  return val.toLocaleString('en-US');
}

export default function NumberInput({ field, value, error, onChange }: InputComponentProps) {
  const id = useId();
  const numValue = typeof value === 'number' ? value : (typeof value === 'string' ? parseFloat(value) : undefined);

  const handleChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      const raw = e.target.value.replace(/,/g, '');
      if (raw === '' || raw === '-') {
        onChange(raw as unknown as number);
        return;
      }
      const parsed = parseFloat(raw);
      if (!isNaN(parsed)) {
        onChange(parsed);
      }
    },
    [onChange]
  );

  const handleStep = useCallback(
    (direction: 1 | -1) => {
      const current = typeof numValue === 'number' && !isNaN(numValue) ? numValue : 0;
      const step = field.step ?? 1;
      let next = current + step * direction;
      if (field.min !== undefined) next = Math.max(field.min, next);
      if (field.max !== undefined) next = Math.min(field.max, next);
      onChange(next);
    },
    [numValue, field.step, field.min, field.max, onChange]
  );

  const displayValue =
    typeof numValue === 'number' && !isNaN(numValue) ? formatDisplay(numValue) : (value as string) ?? '';

  return (
    <div className="flex flex-col gap-1">
      <label htmlFor={id} className="text-sm font-medium text-gray-700">
        {field.label}
        {field.required && <span className="text-danger-500 ml-0.5">*</span>}
      </label>
      <div className="flex items-center">
        <button
          type="button"
          aria-label={`Decrease ${field.label}`}
          className="flex h-10 w-10 items-center justify-center rounded-l-lg border border-r-0 border-gray-300 bg-gray-50 text-gray-600 hover:bg-gray-100 active:bg-gray-200 transition-colors"
          onClick={() => handleStep(-1)}
          tabIndex={-1}
        >
          −
        </button>
        <input
          id={id}
          type="text"
          inputMode="decimal"
          value={displayValue}
          onChange={handleChange}
          placeholder={field.placeholder ?? ''}
          aria-invalid={!!error}
          aria-describedby={error ? `${id}-error` : field.helpText ? `${id}-help` : undefined}
          className={`h-10 w-full border-y px-3 text-center text-sm outline-none transition-colors ${
            error
              ? 'border-danger-500 focus:ring-2 focus:ring-danger-500/30'
              : 'border-gray-300 focus:border-brand-500 focus:ring-2 focus:ring-brand-500/30'
          }`}
        />
        <button
          type="button"
          aria-label={`Increase ${field.label}`}
          className="flex h-10 w-10 items-center justify-center rounded-r-lg border border-l-0 border-gray-300 bg-gray-50 text-gray-600 hover:bg-gray-100 active:bg-gray-200 transition-colors"
          onClick={() => handleStep(1)}
          tabIndex={-1}
        >
          +
        </button>
      </div>
      {error && (
        <p id={`${id}-error`} className="text-xs text-danger-500" role="alert">
          {error}
        </p>
      )}
      {!error && field.helpText && (
        <p id={`${id}-help`} className="text-xs text-gray-500">
          {field.helpText}
        </p>
      )}
    </div>
  );
}
