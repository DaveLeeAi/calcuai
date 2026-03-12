'use client';

import { useCallback, useId } from 'react';
import { InputComponentProps } from './types';

export default function SelectInput({ field, value, error, onChange }: InputComponentProps) {
  const id = useId();
  const stringValue = typeof value === 'string' ? value : '';

  const handleChange = useCallback(
    (e: React.ChangeEvent<HTMLSelectElement>) => {
      onChange(e.target.value);
    },
    [onChange]
  );

  return (
    <div className="flex flex-col gap-1">
      <label htmlFor={id} className="text-sm font-medium text-gray-700 dark:text-slate-300">
        {field.label}
        {field.required && <span className="text-danger-500 ml-0.5">*</span>}
      </label>
      <select
        id={id}
        value={stringValue}
        onChange={handleChange}
        aria-invalid={!!error}
        aria-describedby={error ? `${id}-error` : field.helpText ? `${id}-help` : undefined}
        className={`h-10 w-full appearance-none rounded-lg border bg-white px-3 pr-8 text-sm outline-none transition-colors dark:bg-slate-800 dark:text-slate-200 ${
          error
            ? 'border-danger-500 focus:ring-2 focus:ring-danger-500/30'
            : 'border-gray-300 focus:border-brand-500 focus:ring-2 focus:ring-brand-500/30 dark:border-slate-600'
        }`}
      >
        {field.placeholder && (
          <option value="" disabled>
            {field.placeholder}
          </option>
        )}
        {field.options?.map((opt) => (
          <option key={opt.value} value={opt.value}>
            {opt.label}
          </option>
        ))}
      </select>
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
