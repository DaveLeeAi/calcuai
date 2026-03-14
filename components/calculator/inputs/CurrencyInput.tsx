'use client';

import { useCallback, useId, useState } from 'react';
import { InputComponentProps } from './types';

function formatCurrency(val: number): string {
  return val.toLocaleString('en-US');
}

export default function CurrencyInput({ field, value, error, onChange }: InputComponentProps) {
  const id = useId();
  const [rawString, setRawString] = useState<string>('');
  const [isFocused, setIsFocused] = useState(false);

  const numValue =
    typeof value === 'number' && !isNaN(value)
      ? value
      : typeof value === 'string'
        ? parseFloat(value)
        : NaN;

  const handleFocus = useCallback(() => {
    setIsFocused(true);
    // Seed rawString with the current numeric value (no formatting)
    setRawString(!isNaN(numValue) ? String(numValue) : '');
  }, [numValue]);

  const handleChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      const raw = e.target.value.replace(/[$,]/g, '');
      setRawString(raw);
      // Only call onChange when we have a fully parseable number
      // (not mid-decimal like "0." or lone "-")
      if (raw === '' || raw === '-') return;
      const parsed = parseFloat(raw);
      if (!isNaN(parsed)) {
        onChange(parsed);
      }
    },
    [onChange]
  );

  const handleBlur = useCallback(() => {
    setIsFocused(false);
    const trimmed = rawString.trim();
    if (trimmed === '' || trimmed === '-') {
      onChange(0);
    } else {
      const parsed = parseFloat(trimmed);
      onChange(!isNaN(parsed) ? parsed : 0);
    }
  }, [rawString, onChange]);

  // While focused: show rawString so the user sees exactly what they type.
  // While blurred: show formatted value from parent state.
  const displayValue = isFocused
    ? rawString
    : !isNaN(numValue)
      ? formatCurrency(numValue)
      : '';

  return (
    <div className="flex flex-col gap-1">
      <label htmlFor={id} className="text-sm font-medium text-gray-700 dark:text-slate-300">
        {field.label}
        {field.required && <span className="text-danger-500 ml-0.5">*</span>}
      </label>
      <div className="relative">
        <span className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-sm text-gray-500 dark:text-slate-400">
          {field.prefix ?? '$'}
        </span>
        <input
          id={id}
          type="text"
          inputMode="decimal"
          value={displayValue}
          onChange={handleChange}
          onFocus={handleFocus}
          onBlur={handleBlur}
          placeholder={field.placeholder ?? '0'}
          aria-invalid={!!error}
          aria-describedby={error ? `${id}-error` : field.helpText ? `${id}-help` : undefined}
          className={`h-9 w-full rounded-lg border pl-7 pr-3 text-sm outline-none transition-colors ${
            error
              ? 'border-danger-500 focus:ring-2 focus:ring-danger-500/30'
              : 'border-gray-300 focus:border-brand-500 focus:ring-2 focus:ring-brand-500/30 dark:border-slate-600 dark:bg-slate-800 dark:text-slate-200'
          }`}
        />
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
