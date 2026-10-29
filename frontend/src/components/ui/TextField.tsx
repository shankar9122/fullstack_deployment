import type { ComponentProps } from 'react';
import { FormField } from './FormField';
import { Input } from './Input';

interface TextFieldProps extends ComponentProps<'input'> {
  id: string;
  label: string;
  error?: string;
}

export function TextField({ id, label, error, ...inputProps }: TextFieldProps) {
  return (
    <FormField label={label} htmlFor={id} error={error}>
      <Input
        id={id}
        aria-invalid={error ? true : undefined}
        aria-describedby={error ? `${id}-error` : undefined}
        {...inputProps}
      />
    </FormField>
  );
}
