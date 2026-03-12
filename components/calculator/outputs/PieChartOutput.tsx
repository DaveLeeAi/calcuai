'use client';

import {
  PieChart,
  Pie,
  Cell,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from 'recharts';
import { OutputComponentProps, formatValue } from './types';

const DEFAULT_COLORS = ['#1A6FA0', '#2ECC71', '#F39C12', '#E74C3C', '#9B59B6', '#1ABC9C'];

interface SliceItem {
  name: string;
  value: number;
}

export default function PieChartOutput({ field, data }: OutputComponentProps) {
  const chartData = (data[field.id] as SliceItem[]) ?? [];
  const colors = field.chartConfig?.colors ?? DEFAULT_COLORS;

  return (
    <div className="rounded-lg bg-gray-50 p-4">
      <h4 className="text-xs font-medium uppercase tracking-wider text-gray-500 mb-3">
        {field.label}
      </h4>
      <div className="h-64 sm:h-72">
        <ResponsiveContainer width="100%" height="100%">
          <PieChart>
            <Pie
              data={chartData}
              dataKey="value"
              nameKey="name"
              cx="50%"
              cy="50%"
              innerRadius="45%"
              outerRadius="75%"
              paddingAngle={2}
              stroke="none"
            >
              {chartData.map((_, i) => (
                <Cell key={i} fill={colors[i % colors.length]} />
              ))}
            </Pie>
            <Tooltip
              formatter={(value: number) =>
                formatValue(value, field.format, field.precision)
              }
              contentStyle={{
                borderRadius: '8px',
                border: '1px solid #e5e7eb',
                fontSize: '13px',
              }}
            />
            <Legend
              verticalAlign="bottom"
              iconType="circle"
              iconSize={10}
              wrapperStyle={{ fontSize: '12px' }}
            />
          </PieChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}
