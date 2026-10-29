import type { ComponentProps } from 'react';

export function Input({ className = '', ...props }: ComponentProps<'input'>) {
  return <input className={`rounded border px-3 py-2 text-sm ${className}`} {...props} />;
}
