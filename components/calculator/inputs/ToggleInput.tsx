'use client';

import { useCallback, useId } from 'react';
import { InputComponentProps } from './types';

export default function ToggleInput({ field, value, error, onChange }: InputComponentProps) {
  const id = useId();
  const checked = typeof value === 'boolean' ? value : false;

  const handleChange = useCallback(() => {
    onChange(!checked);
  }, [checked, onChange]);

  return (
    <div className="flex flex-col gap-1">
      <div className="flex items-center justify-between">
        <label htmlFor={id} className="text-sm font-medium text-gray-700">
          {field.label}
        </label>
        <button
          id={id}
          type="button"
          role="switch"
          aria-checked={checked}
          aria-describedby={field.helpText ? `${id}-help` : undefined}
          onClick={handleChange}
          className={`relative inline-flex h-6 w-11 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none focus:ring-2 focus:ring-brand-500/30 focus:ring-offset-2 ${
            checked ? 'bg-brand-500' : 'bg-gray-300'
          }`}
        >
          <span
            className={`pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow ring-0 transition duration-200 ease-in-out ${
              checked ? 'translate-x-5' : 'translate-x-0'
            }`}
          />
        </button>
      </div>
      {error && (
        <p className="text-xs text-danger-500" role="alert">
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
