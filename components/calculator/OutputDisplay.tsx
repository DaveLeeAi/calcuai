'use client';

import { OutputField } from '@/lib/types';
import {
  SingleValue,
  ValueGroup,
  DataTable,
  PieChartOutput,
  LineChartOutput,
  BarChartOutput,
  GaugeIndicator,
  ComparisonView,
} from './outputs';

interface OutputDisplayProps {
  field: OutputField;
  data: Record<string, unknown>;
}

const componentMap: Record<string, React.ComponentType<OutputDisplayProps>> = {
  'single-value': SingleValue,
  'value-group': ValueGroup,
  table: DataTable,
  'chart-pie': PieChartOutput,
  'chart-line': LineChartOutput,
  'chart-bar': BarChartOutput,
  gauge: GaugeIndicator,
  comparison: ComparisonView,
};

export default function OutputDisplay({ field, data }: OutputDisplayProps) {
  const Component = componentMap[field.type];
  if (!Component) {
    return <div className="text-xs text-danger-500">Unknown output type: {field.type}</div>;
  }
  return <Component field={field} data={data} />;
}
