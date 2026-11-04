import type { ComponentProps } from 'react';
import { FormField } from './FormField';
import { Select } from './Select';

interface SelectFieldProps extends ComponentProps<'select'> {
  id: string;
  label: string;
  error?: string;
  hint?: string;
}

export function SelectField({ id, label, error, hint, children, ...selectProps }: SelectFieldProps) {
  const describedBy = error ? `${id}-error` : hint ? `${id}-hint` : undefined;

  return (
    <FormField label={label} htmlFor={id} error={error} hint={hint}>
      <Select id={id} aria-invalid={error ? true : undefined} aria-describedby={describedBy} {...selectProps}>
        {children}
      </Select>
    </FormField>
  );
}
