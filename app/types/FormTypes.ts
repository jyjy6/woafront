export type FieldType = 'text' | 'number' | 'select' | 'textarea' | 'datetime-local';

export interface FieldConfig {
  name: string;
  label: string;
  type: FieldType;
  rules?: ((value: any) => boolean | string)[];
  items?: readonly string[]; // for select
  cols?: string | number;
  md?: string | number;
  suffix?: string;
  rows?: string | number; // for textarea
  min?: string | number; // for number
}
