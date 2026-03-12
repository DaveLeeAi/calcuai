'use client';

import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  Legend,
  ResponsiveContainer,
  CartesianGrid,
} from 'recharts';
import { OutputComponentProps, formatValue } from './types';

const DEFAULT_COLORS = ['#1A6FA0', '#2ECC71', '#F39C12', '#E74C3C'];

export default function BarChartOutput({ field, data }: OutputComponentProps) {
  const chartData = (data[field.id] as Record<string, unknown>[]) ?? [];
  const colors = field.chartConfig?.colors ?? DEFAULT_COLORS;

  if (chartData.length === 0) return null;

  const allKeys = Object.keys(chartData[0]);
  const xKey = allKeys[0];
  const barKeys = allKeys.slice(1);

  return (
    <div className="rounded-lg bg-gray-50 p-4">
      <h4 className="text-xs font-medium uppercase tracking-wider text-gray-500 mb-3">
        {field.label}
      </h4>
      <div className="h-64 sm:h-72">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart data={chartData} margin={{ top: 5, right: 20, bottom: 30, left: 10 }}>
            <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
            <XAxis
              dataKey={xKey}
              tick={{ fontSize: 11 }}
              label={
                field.chartConfig?.xLabel
                  ? { value: field.chartConfig.xLabel, position: 'insideBottom', offset: -5, fontSize: 12 }
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
              formatter={(value: number) => formatValue(value, field.format, field.precision)}
              contentStyle={{
                borderRadius: '8px',
                border: '1px solid #e5e7eb',
                fontSize: '13px',
              }}
            />
            {barKeys.length > 1 && (
              <Legend verticalAlign="top" align="center" iconType="square" iconSize={10} wrapperStyle={{ fontSize: '12px', paddingBottom: '8px' }} />
            )}
            {barKeys.map((key, i) => (
              <Bar
                key={key}
                dataKey={key}
                fill={colors[i % colors.length]}
                radius={[4, 4, 0, 0]}
              />
            ))}
          </BarChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}
