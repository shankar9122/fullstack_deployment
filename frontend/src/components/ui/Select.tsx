import type { ComponentProps } from 'react';

export function Select({ className = '', ...props }: ComponentProps<'select'>) {
  return <select className={`rounded border px-3 py-2 text-sm ${className}`} {...props} />;
}
