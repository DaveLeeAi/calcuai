'use client';

import { useCallback, useId } from 'react';
import { InputComponentProps } from './types';

export default function DatePicker({ field, value, error, onChange }: InputComponentProps) {
  const id = useId();
  const dateValue = typeof value === 'string' ? value : '';

  const handleChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      onChange(e.target.value);
    },
    [onChange]
  );

  return (
    <div className="flex flex-col gap-1">
      <label htmlFor={id} className="text-sm font-medium text-gray-700">
        {field.label}
        {field.required && <span className="text-danger-500 ml-0.5">*</span>}
      </label>
      <input
        id={id}
        type="date"
        value={dateValue}
        onChange={handleChange}
        min={field.min !== undefined ? new Date(field.min).toISOString().split('T')[0] : undefined}
        max={field.max !== undefined ? new Date(field.max).toISOString().split('T')[0] : undefined}
        aria-invalid={!!error}
        aria-describedby={error ? `${id}-error` : field.helpText ? `${id}-help` : undefined}
        className={`h-10 w-full rounded-lg border px-3 text-sm outline-none transition-colors ${
          error
            ? 'border-danger-500 focus:ring-2 focus:ring-danger-500/30'
            : 'border-gray-300 focus:border-brand-500 focus:ring-2 focus:ring-brand-500/30'
        }`}
      />
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
