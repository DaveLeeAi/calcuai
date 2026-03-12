'use client';

import { useState, useMemo } from 'react';
import { OutputComponentProps, formatValue } from './types';

const ROWS_PER_PAGE = 25;

export default function DataTable({ field, data }: OutputComponentProps) {
  const rows = (data[field.id] as Record<string, unknown>[]) ?? [];
  const columns = field.columns ?? [];

  const [sortKey, setSortKey] = useState<string | null>(null);
  const [sortDir, setSortDir] = useState<'asc' | 'desc'>('asc');
  const [page, setPage] = useState(0);

  const sorted = useMemo(() => {
    if (!sortKey) return rows;
    return [...rows].sort((a, b) => {
      const av = a[sortKey];
      const bv = b[sortKey];
      const numA = typeof av === 'number' ? av : parseFloat(String(av));
      const numB = typeof bv === 'number' ? bv : parseFloat(String(bv));
      if (!isNaN(numA) && !isNaN(numB)) {
        return sortDir === 'asc' ? numA - numB : numB - numA;
      }
      return sortDir === 'asc'
        ? String(av).localeCompare(String(bv))
        : String(bv).localeCompare(String(av));
    });
  }, [rows, sortKey, sortDir]);

  const totalPages = Math.ceil(sorted.length / ROWS_PER_PAGE);
  const pageRows = sorted.slice(page * ROWS_PER_PAGE, (page + 1) * ROWS_PER_PAGE);

  const handleSort = (key: string) => {
    if (sortKey === key) {
      setSortDir((d) => (d === 'asc' ? 'desc' : 'asc'));
    } else {
      setSortKey(key);
      setSortDir('asc');
    }
  };

  return (
    <div className="rounded-lg bg-gray-50 dark:bg-slate-700/50 p-4">
      <h4 className="text-xs font-medium uppercase tracking-wider text-gray-500 dark:text-slate-400 mb-3">
        {field.label}
      </h4>
      <div className="overflow-x-auto rounded-lg border border-gray-200 dark:border-slate-600">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-gray-200 dark:border-slate-600 bg-gray-100 dark:bg-slate-700">
              {columns.map((col) => (
                <th
                  key={col.key}
                  className="cursor-pointer select-none px-3 py-2 text-left font-medium text-gray-600 dark:text-slate-300 hover:text-gray-900 dark:hover:text-white"
                  onClick={() => handleSort(col.key)}
                >
                  {col.label}
                  {sortKey === col.key && (
                    <span className="ml-1">{sortDir === 'asc' ? '↑' : '↓'}</span>
                  )}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {pageRows.map((row, i) => (
              <tr
                key={i}
                className={`border-b border-gray-100 dark:border-slate-700 ${i % 2 === 0 ? 'bg-white dark:bg-slate-800' : 'bg-gray-50/50 dark:bg-slate-700/30'}`}
              >
                {columns.map((col) => (
                  <td key={col.key} className="px-3 py-2 text-gray-800 dark:text-slate-200 whitespace-nowrap">
                    {formatValue(
                      row[col.key],
                      col.format as 'currency' | 'percentage' | 'number' | undefined
                    )}
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      {totalPages > 1 && (
        <div className="mt-3 flex items-center justify-between text-xs text-gray-500 dark:text-slate-400">
          <span>
            Showing {page * ROWS_PER_PAGE + 1}–{Math.min((page + 1) * ROWS_PER_PAGE, sorted.length)} of{' '}
            {sorted.length}
          </span>
          <div className="flex gap-1">
            <button
              onClick={() => setPage((p) => Math.max(0, p - 1))}
              disabled={page === 0}
              className="rounded border border-gray-300 dark:border-slate-600 px-2 py-1 hover:bg-gray-100 dark:hover:bg-slate-700 disabled:opacity-40"
            >
              Prev
            </button>
            <button
              onClick={() => setPage((p) => Math.min(totalPages - 1, p + 1))}
              disabled={page >= totalPages - 1}
              className="rounded border border-gray-300 dark:border-slate-600 px-2 py-1 hover:bg-gray-100 dark:hover:bg-slate-700 disabled:opacity-40"
            >
              Next
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
