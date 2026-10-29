import type { SelectHTMLAttributes } from 'react';

export function Select({ className = '', ...props }: SelectHTMLAttributes<HTMLSelectElement>) {
  return <select className={`rounded border px-3 py-2 text-sm ${className}`} {...props} />;
}
