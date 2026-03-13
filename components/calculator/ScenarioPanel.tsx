'use client';

import { useMemo } from 'react';
import { CalculatorSpec } from '@/lib/types';
import { getFormula } from '@/lib/formulas';
import { formatValue } from './outputs/types';

interface ScenarioPanelProps {
  spec: CalculatorSpec;
  baseInputs: Record<string, unknown>;
}

type ColFormat = 'currency' | 'percentage' | 'number' | 'text';

interface ColumnDef {
  label: string;
  format: ColFormat;
}

interface ScenarioRow {
  label: string;
  isCurrent: boolean;
  values: Record<string, unknown>;
}

interface ScenarioData {
  heading: string;
  subheading: string;
  firstColLabel: string;
  columns: Record<string, ColumnDef>;
  rows: ScenarioRow[];
}

function buildMortgageScenarios(
  formula: (inputs: Record<string, unknown>) => Record<string, unknown>,
  baseInputs: Record<string, unknown>
): ScenarioData | null {
  const baseRate = Number(baseInputs.interestRate);
  if (!baseRate || baseRate <= 0) return null;

  const offsets = [-1, -0.5, 0, 0.5, 1];
  const rows: ScenarioRow[] = [];

  for (const offset of offsets) {
    const rate = parseFloat((baseRate + offset).toFixed(4));
    if (rate <= 0 || rate > 25) continue;
    const result = formula({ ...baseInputs, interestRate: rate });
    rows.push({
      label: `${rate % 1 === 0 ? rate.toFixed(1) : rate.toFixed(2)}%`,
      isCurrent: offset === 0,
      values: {
        monthlyPayment: result.monthlyPayment,
        totalInterest: result.totalInterest,
        totalCost: result.totalCost,
      },
    });
  }

  if (rows.length === 0) return null;

  return {
    heading: 'Rate Comparison',
    subheading: 'How your payments change at different interest rates. Your current rate is highlighted.',
    firstColLabel: 'Interest Rate',
    columns: {
      monthlyPayment: { label: 'Monthly Payment', format: 'currency' },
      totalInterest: { label: 'Total Interest', format: 'currency' },
      totalCost: { label: 'Total Cost', format: 'currency' },
    },
    rows,
  };
}

function buildLoanScenarios(
  formula: (inputs: Record<string, unknown>) => Record<string, unknown>,
  baseInputs: Record<string, unknown>
): ScenarioData | null {
  const baseTerm = Number(baseInputs.loanTerm);
  if (!baseTerm || baseTerm <= 0) return null;

  const offsets = [-24, -12, 0, 12, 24];
  const rows: ScenarioRow[] = [];

  for (const offset of offsets) {
    const term = baseTerm + offset;
    if (term < 1 || term > 360) continue;
    const result = formula({ ...baseInputs, loanTerm: term });
    const years = term / 12;
    const termLabel =
      years % 1 === 0
        ? `${term} mo (${years} yr)`
        : `${term} mo`;
    rows.push({
      label: termLabel,
      isCurrent: offset === 0,
      values: {
        monthlyPayment: result.monthlyPayment,
        totalInterest: result.totalInterest,
        totalPayment: result.totalPayment,
      },
    });
  }

  if (rows.length === 0) return null;

  return {
    heading: 'Term Comparison',
    subheading: 'How your payments and total cost change at different loan lengths. Your current term is highlighted.',
    firstColLabel: 'Loan Term',
    columns: {
      monthlyPayment: { label: 'Monthly Payment', format: 'currency' },
      totalInterest: { label: 'Total Interest', format: 'currency' },
      totalPayment: { label: 'Total Cost', format: 'currency' },
    },
    rows,
  };
}

export default function ScenarioPanel({ spec, baseInputs }: ScenarioPanelProps) {
  const scenarioData = useMemo((): ScenarioData | null => {
    try {
      const formula = getFormula(spec.formula);
      if (!formula) return null;

      if (spec.formula === 'mortgage-payment') {
        return buildMortgageScenarios(formula, baseInputs);
      }
      if (spec.formula === 'loan-payment') {
        return buildLoanScenarios(formula, baseInputs);
      }
      return null;
    } catch {
      return null;
    }
  }, [spec.formula, baseInputs]);

  if (!scenarioData || scenarioData.rows.length < 2) return null;

  const { heading, subheading, firstColLabel, columns, rows } = scenarioData;
  const columnKeys = Object.keys(columns);

  return (
    <div className="mt-4 rounded-lg border border-gray-200 dark:border-slate-700 overflow-hidden">
      <div className="bg-gray-50 dark:bg-slate-700/50 px-4 py-3 border-b border-gray-200 dark:border-slate-700">
        <h4 className="text-sm font-semibold text-gray-700 dark:text-slate-200">{heading}</h4>
        <p className="text-xs text-gray-500 dark:text-slate-400 mt-0.5">{subheading}</p>
      </div>
      <div className="overflow-x-auto">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-gray-200 dark:border-slate-700">
              <th className="text-left px-4 py-2.5 text-xs font-medium text-gray-500 dark:text-slate-400 uppercase tracking-wider whitespace-nowrap">
                {firstColLabel}
              </th>
              {columnKeys.map((key) => (
                <th
                  key={key}
                  className="text-right px-4 py-2.5 text-xs font-medium text-gray-500 dark:text-slate-400 uppercase tracking-wider whitespace-nowrap"
                >
                  {columns[key].label}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {rows.map((row, i) => (
              <tr
                key={i}
                className={
                  row.isCurrent
                    ? 'bg-brand-50 dark:bg-brand-900/20'
                    : i % 2 === 0
                    ? 'bg-white dark:bg-slate-800'
                    : 'bg-gray-50/50 dark:bg-slate-700/20'
                }
              >
                <td className="px-4 py-2.5 text-gray-700 dark:text-slate-300">
                  <div className="flex items-center gap-2">
                    <span className={row.isCurrent ? 'font-semibold' : ''}>{row.label}</span>
                    {row.isCurrent && (
                      <span className="text-xs bg-brand-100 dark:bg-brand-800/40 text-brand-700 dark:text-brand-300 px-1.5 py-0.5 rounded-full font-medium leading-none">
                        current
                      </span>
                    )}
                  </div>
                </td>
                {columnKeys.map((key) => (
                  <td
                    key={key}
                    className={`px-4 py-2.5 text-right tabular-nums ${
                      row.isCurrent
                        ? 'font-semibold text-gray-900 dark:text-slate-100'
                        : 'text-gray-700 dark:text-slate-300'
                    }`}
                  >
                    {formatValue(row.values[key], columns[key].format, 0)}
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
