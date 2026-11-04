import type { ComponentProps } from 'react';
import { FormField } from './FormField';
import { Input } from './Input';

interface TextFieldProps extends ComponentProps<'input'> {
  id: string;
  label: string;
  error?: string;
  hint?: string;
}

export function TextField({ id, label, error, hint, ...inputProps }: TextFieldProps) {
  // Point screen readers at whichever message is currently visible
  const describedBy = error ? `${id}-error` : hint ? `${id}-hint` : undefined;

  return (
    <FormField label={label} htmlFor={id} error={error} hint={hint}>
      <Input id={id} aria-invalid={error ? true : undefined} aria-describedby={describedBy} {...inputProps} />
    </FormField>
  );
}
