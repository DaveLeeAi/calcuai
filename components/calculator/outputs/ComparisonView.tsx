'use client';

import { OutputComponentProps, formatValue } from './types';

interface ComparisonItem {
  label: string;
  values: unknown[];
}

export default function ComparisonView({ field, data }: OutputComponentProps) {
  const comparison = data[field.id] as {
    headers: string[];
    rows: ComparisonItem[];
  } | undefined;

  if (!comparison) return null;

  const { headers, rows } = comparison;

  return (
    <div className="rounded-lg bg-gray-50 dark:bg-slate-700/50 p-4">
      <h4 className="text-xs font-medium uppercase tracking-wider text-gray-500 dark:text-slate-400 mb-3">
        {field.label}
      </h4>
      <div className="overflow-x-auto rounded-lg border border-gray-200 dark:border-slate-600">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-gray-200 dark:border-slate-600 bg-gray-100 dark:bg-slate-700">
              <th className="px-3 py-2 text-left font-medium text-gray-600 dark:text-slate-300" />
              {headers.map((h, i) => (
                <th
                  key={i}
                  className={`px-3 py-2 text-center font-medium ${
                    i === 0 ? 'text-brand-600 dark:text-brand-400' : 'text-gray-600 dark:text-slate-300'
                  }`}
                >
                  {h}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {rows.map((row, i) => (
              <tr
                key={i}
                className={`border-b border-gray-100 dark:border-slate-700 ${i % 2 === 0 ? 'bg-white dark:bg-slate-800' : 'bg-gray-50/50 dark:bg-slate-700/30'}`}
              >
                <td className="px-3 py-2 font-medium text-gray-700 dark:text-slate-300">{row.label}</td>
                {row.values.map((val, j) => (
                  <td key={j} className="px-3 py-2 text-center text-gray-800 dark:text-slate-200">
                    {formatValue(val, field.format, field.precision)}
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
