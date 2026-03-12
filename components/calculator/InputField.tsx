'use client';

import { InputField as InputFieldType } from '@/lib/types';
import {
  NumberInput,
  CurrencyInput,
  PercentageInput,
  DatePicker,
  SelectInput,
  ToggleInput,
  RangeInput,
  RadioInput,
  UnitPairInput,
} from './inputs';

interface InputFieldProps {
  field: InputFieldType;
  value: number | string | boolean | { value: number; unit: string } | undefined;
  error?: string;
  onChange: (value: number | string | boolean | { value: number; unit: string }) => void;
}

const componentMap: Record<string, React.ComponentType<InputFieldProps>> = {
  number: NumberInput,
  currency: CurrencyInput,
  percentage: PercentageInput,
  date: DatePicker,
  select: SelectInput,
  toggle: ToggleInput,
  range: RangeInput,
  radio: RadioInput,
  'unit-pair': UnitPairInput,
};

export default function InputField({ field, value, error, onChange }: InputFieldProps) {
  const Component = componentMap[field.type];
  if (!Component) {
    return <div className="text-xs text-danger-500">Unknown input type: {field.type}</div>;
  }
  return <Component field={field} value={value} error={error} onChange={onChange} />;
}
