'use client';

import { useCallback, useId } from 'react';
import { InputComponentProps } from './types';

export default function RadioInput({ field, value, error, onChange }: InputComponentProps) {
  const groupId = useId();
  const stringValue = typeof value === 'string' ? value : '';

  const handleChange = useCallback(
    (optValue: string) => {
      onChange(optValue);
    },
    [onChange]
  );

  const isInline = (field.options?.length ?? 0) <= 4;

  return (
    <div className="flex flex-col gap-1">
      <fieldset aria-describedby={error ? `${groupId}-error` : field.helpText ? `${groupId}-help` : undefined}>
        <legend className="text-sm font-medium text-gray-700">
          {field.label}
          {field.required && <span className="text-danger-500 ml-0.5">*</span>}
        </legend>
        <div
          className={`mt-1.5 ${isInline ? 'flex flex-wrap gap-3' : 'flex flex-col gap-2'}`}
          role="radiogroup"
          aria-label={field.label}
        >
          {field.options?.map((opt) => {
            const optId = `${groupId}-${opt.value}`;
            const selected = stringValue === opt.value;
            return (
              <label
                key={opt.value}
                htmlFor={optId}
                className={`flex cursor-pointer items-center gap-2 rounded-lg border px-3 py-2 text-sm transition-colors ${
                  selected
                    ? 'border-brand-500 bg-brand-50 text-brand-700'
                    : 'border-gray-200 bg-white text-gray-700 hover:border-gray-300'
                }`}
              >
                <input
                  id={optId}
                  type="radio"
                  name={groupId}
                  value={opt.value}
                  checked={selected}
                  onChange={() => handleChange(opt.value)}
                  className="sr-only"
                />
                <span
                  className={`flex h-4 w-4 shrink-0 items-center justify-center rounded-full border-2 ${
                    selected ? 'border-brand-500' : 'border-gray-400'
                  }`}
                >
                  {selected && <span className="h-2 w-2 rounded-full bg-brand-500" />}
                </span>
                {opt.label}
              </label>
            );
          })}
        </div>
      </fieldset>
      {error && (
        <p id={`${groupId}-error`} className="text-xs text-danger-500" role="alert">
          {error}
        </p>
      )}
      {!error && field.helpText && (
        <p id={`${groupId}-help`} className="text-xs text-gray-500">
          {field.helpText}
        </p>
      )}
    </div>
  );
}
