import { OutputField } from '@/lib/types';

export interface OutputComponentProps {
  field: OutputField;
  data: Record<string, unknown>;
}

export function formatValue(
  value: unknown,
  format?: 'currency' | 'percentage' | 'number' | 'date' | 'text',
  precision?: number
): string {
  if (value === null || value === undefined) return '—';

  const num = typeof value === 'number' ? value : parseFloat(String(value));

  switch (format) {
    case 'currency':
      if (isNaN(num)) return String(value);
      return num.toLocaleString('en-US', {
        style: 'currency',
        currency: 'USD',
        minimumFractionDigits: precision ?? 2,
        maximumFractionDigits: precision ?? 2,
      });
    case 'percentage':
      if (isNaN(num)) return String(value);
      return `${num.toLocaleString('en-US', {
        minimumFractionDigits: precision ?? 1,
        maximumFractionDigits: precision ?? 1,
      })}%`;
    case 'number':
      if (isNaN(num)) return String(value);
      return num.toLocaleString('en-US', {
        minimumFractionDigits: precision ?? 0,
        maximumFractionDigits: precision ?? 2,
      });
    case 'date':
      return String(value);
    case 'text':
      return String(value);
    default:
      if (!isNaN(num)) {
        return num.toLocaleString('en-US', {
          minimumFractionDigits: precision ?? 0,
          maximumFractionDigits: precision ?? 2,
        });
      }
      return String(value);
  }
}
