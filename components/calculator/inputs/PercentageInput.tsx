'use client';

import { useCallback, useId } from 'react';
import { InputComponentProps } from './types';

export default function PercentageInput({ field, value, error, onChange }: InputComponentProps) {
  const id = useId();
  const numValue = typeof value === 'number' ? value : (typeof value === 'string' ? parseFloat(value) : undefined);

  const handleChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      const raw = e.target.value;
      if (raw === '' || raw === '.') {
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

  const displayValue =
    typeof numValue === 'number' && !isNaN(numValue) ? String(numValue) : (value as string) ?? '';

  return (
    <div className="flex flex-col gap-1">
      <label htmlFor={id} className="text-sm font-medium text-gray-700">
        {field.label}
        {field.required && <span className="text-danger-500 ml-0.5">*</span>}
      </label>
      <div className="relative">
        <input
          id={id}
          type="text"
          inputMode="decimal"
          value={displayValue}
          onChange={handleChange}
          placeholder={field.placeholder ?? '0'}
          aria-invalid={!!error}
          aria-describedby={error ? `${id}-error` : field.helpText ? `${id}-help` : undefined}
          className={`h-10 w-full rounded-lg border pl-3 pr-8 text-sm outline-none transition-colors ${
            error
              ? 'border-danger-500 focus:ring-2 focus:ring-danger-500/30'
              : 'border-gray-300 focus:border-brand-500 focus:ring-2 focus:ring-brand-500/30'
          }`}
        />
        <span className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-sm text-gray-500">
          {field.suffix ?? '%'}
        </span>
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
