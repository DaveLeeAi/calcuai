import { InputField } from '@/lib/types';

export interface InputComponentProps {
  field: InputField;
  value: number | string | boolean | { value: number; unit: string } | undefined;
  error?: string;
  onChange: (value: number | string | boolean | { value: number; unit: string }) => void;
}
