'use client';

import { useCallback, useId, useState } from 'react';
import { InputComponentProps } from './types';

function formatDisplay(val: number): string {
  return val.toLocaleString('en-US');
}

export default function NumberInput({ field, value, error, onChange }: InputComponentProps) {
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
      const raw = e.target.value.replace(/,/g, '');
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

  const handleStep = useCallback(
    (direction: 1 | -1) => {
      const current = !isNaN(numValue) ? numValue : 0;
      const step = field.step ?? 1;
      let next = current + step * direction;
      if (field.min !== undefined) next = Math.max(field.min, next);
      if (field.max !== undefined) next = Math.min(field.max, next);
      onChange(next);
      // Keep rawString in sync so blur doesn't overwrite the stepped value
      setRawString(String(next));
    },
    [numValue, field.step, field.min, field.max, onChange]
  );

  // While focused: show rawString so the user sees exactly what they type.
  // While blurred: show formatted value from parent state.
  const displayValue = isFocused
    ? rawString
    : !isNaN(numValue)
      ? formatDisplay(numValue)
      : '';

  return (
    <div className="flex flex-col gap-1">
      <label htmlFor={id} className="text-sm font-medium text-gray-700 dark:text-slate-300">
        {field.label}
        {field.required && <span className="text-danger-500 ml-0.5">*</span>}
      </label>
      <div className="flex items-center">
        <button
          type="button"
          aria-label={`Decrease ${field.label}`}
          className="flex h-9 w-10 items-center justify-center rounded-l-lg border border-r-0 border-gray-300 bg-gray-50 text-gray-600 hover:bg-gray-100 active:bg-gray-200 dark:border-slate-600 dark:bg-slate-700 dark:text-slate-300 dark:hover:bg-slate-600 dark:active:bg-slate-500 transition-colors"
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
          onFocus={handleFocus}
          onBlur={handleBlur}
          placeholder={field.placeholder ?? ''}
          aria-invalid={!!error}
          aria-describedby={error ? `${id}-error` : field.helpText ? `${id}-help` : undefined}
          className={`h-9 w-full border-y px-3 text-center text-sm outline-none transition-colors ${
            error
              ? 'border-danger-500 focus:ring-2 focus:ring-danger-500/30'
              : 'border-gray-300 focus:border-brand-500 focus:ring-2 focus:ring-brand-500/30 dark:border-slate-600 dark:bg-slate-800 dark:text-slate-200 dark:focus:border-brand-500 dark:focus:ring-brand-500/30'
          }`}
        />
        <button
          type="button"
          aria-label={`Increase ${field.label}`}
          className="flex h-9 w-10 items-center justify-center rounded-r-lg border border-l-0 border-gray-300 bg-gray-50 text-gray-600 hover:bg-gray-100 active:bg-gray-200 dark:border-slate-600 dark:bg-slate-700 dark:text-slate-300 dark:hover:bg-slate-600 dark:active:bg-slate-500 transition-colors"
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
        <p id={`${id}-help`} className="text-xs text-gray-500 dark:text-slate-400">
          {field.helpText}
        </p>
      )}
    </div>
  );
}
