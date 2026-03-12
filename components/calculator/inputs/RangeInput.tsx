'use client';

import { useCallback, useId } from 'react';
import { InputComponentProps } from './types';

export default function RangeInput({ field, value, error, onChange }: InputComponentProps) {
  const id = useId();
  const numValue = typeof value === 'number' ? value : (field.defaultValue as number) ?? field.min ?? 0;
  const min = field.min ?? 0;
  const max = field.max ?? 100;
  const step = field.step ?? 1;

  const handleChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      onChange(parseFloat(e.target.value));
    },
    [onChange]
  );

  const pct = ((numValue - min) / (max - min)) * 100;

  return (
    <div className="flex flex-col gap-1">
      <div className="flex items-center justify-between">
        <label htmlFor={id} className="text-sm font-medium text-gray-700 dark:text-slate-300">
          {field.label}
          {field.required && <span className="text-danger-500 ml-0.5">*</span>}
        </label>
        <span className="text-sm font-semibold text-brand-600">
          {numValue.toLocaleString('en-US')}
          {field.suffix ? ` ${field.suffix}` : ''}
        </span>
      </div>
      <input
        id={id}
        type="range"
        min={min}
        max={max}
        step={step}
        value={numValue}
        onChange={handleChange}
        aria-valuenow={numValue}
        aria-valuemin={min}
        aria-valuemax={max}
        aria-describedby={error ? `${id}-error` : field.helpText ? `${id}-help` : undefined}
        className="h-2 w-full cursor-pointer appearance-none rounded-full bg-gray-200 dark:bg-slate-700 accent-brand-500"
        style={{
          background: `linear-gradient(to right, #1A6FA0 0%, #1A6FA0 ${pct}%, #e5e7eb ${pct}%, #e5e7eb 100%)`,
        }}
      />
      <div className="flex justify-between text-xs text-gray-400 dark:text-slate-500">
        <span>{min.toLocaleString('en-US')}</span>
        <span>{max.toLocaleString('en-US')}</span>
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
