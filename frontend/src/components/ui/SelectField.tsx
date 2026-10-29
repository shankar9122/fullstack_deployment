import type { ComponentProps } from 'react';
import { FormField } from './FormField';
import { Select } from './Select';

interface SelectFieldProps extends ComponentProps<'select'> {
  id: string;
  label: string;
  error?: string;
}

export function SelectField({ id, label, error, children, ...selectProps }: SelectFieldProps) {
  return (
    <FormField label={label} htmlFor={id} error={error}>
      <Select
        id={id}
        aria-invalid={error ? true : undefined}
        aria-describedby={error ? `${id}-error` : undefined}
        {...selectProps}
      >
        {children}
      </Select>
    </FormField>
  );
}
