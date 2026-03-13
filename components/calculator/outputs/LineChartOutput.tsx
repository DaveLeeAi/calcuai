'use client';

import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  Tooltip,
  Legend,
  ResponsiveContainer,
  CartesianGrid,
} from 'recharts';
import { OutputComponentProps, formatValue } from './types';

const DEFAULT_COLORS = ['#1A6FA0', '#2ECC71', '#F39C12', '#E74C3C'];

export default function LineChartOutput({ field, data }: OutputComponentProps) {
  const chartData = (data[field.id] as Record<string, unknown>[]) ?? [];
  const colors = field.chartConfig?.colors ?? DEFAULT_COLORS;

  if (chartData.length === 0) return null;

  // Derive line keys from first data point, excluding x-axis key
  const allKeys = Object.keys(chartData[0]);
  const xKey = allKeys[0]; // first key is x-axis
  const lineKeys = allKeys.slice(1);

  // Readable labels for known keys
  const keyLabels: Record<string, string> = {
    balance: 'Standard Payoff',
    balanceWithExtra: 'With Extra Payments',
  };

  return (
    <div className="rounded-lg bg-gray-50 dark:bg-slate-700/50 p-4">
      <h4 className="text-xs font-medium uppercase tracking-wider text-gray-500 dark:text-slate-400 mb-1">
        {field.label}
      </h4>
      {field.description && (
        <p className="text-xs text-gray-400 dark:text-slate-500 mb-3">{field.description}</p>
      )}
      <div className="h-64 sm:h-72">
        <ResponsiveContainer width="100%" height="100%">
          <LineChart data={chartData} margin={{ top: 5, right: 20, bottom: 20, left: 10 }}>
            <CartesianGrid strokeDasharray="3 3" stroke="#9ca3af" opacity={0.3} />
            <XAxis
              dataKey={xKey}
              tick={{ fontSize: 11 }}
              label={
                field.chartConfig?.xLabel
                  ? { value: field.chartConfig.xLabel, position: 'insideBottom', offset: -10, fontSize: 12 }
                  : undefined
              }
            />
            <YAxis
              tick={{ fontSize: 11 }}
              tickFormatter={(v: number) => formatValue(v, field.format, 0)}
              label={
                field.chartConfig?.yLabel
                  ? {
                      value: field.chartConfig.yLabel,
                      angle: -90,
                      position: 'insideLeft',
                      fontSize: 12,
                    }
                  : undefined
              }
            />
            <Tooltip
              formatter={(value: number, name: string) => [
                formatValue(value, field.format, field.precision),
                keyLabels[name] ?? name,
              ]}
              contentStyle={{
                borderRadius: '8px',
                border: '1px solid #e5e7eb',
                fontSize: '13px',
                backgroundColor: 'white',
              }}
            />
            {lineKeys.length > 1 && (
              <Legend
                verticalAlign="top"
                align="center"
                iconType="line"
                iconSize={14}
                wrapperStyle={{ fontSize: '12px', paddingBottom: '8px' }}
                formatter={(value: string) => keyLabels[value] ?? value}
              />
            )}
            {lineKeys.map((key, i) => (
              <Line
                key={key}
                type="monotone"
                dataKey={key}
                name={key}
                stroke={colors[i % colors.length]}
                strokeWidth={2}
                dot={false}
                activeDot={{ r: 5 }}
              />
            ))}
          </LineChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}
