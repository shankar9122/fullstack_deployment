import type { ComponentProps } from 'react';

// Shared with LinkButton so a link can look exactly like a button
export const buttonClassName =
  'rounded border px-3 py-1.5 text-sm hover:bg-gray-100 disabled:cursor-not-allowed disabled:opacity-40';

export function Button({ className = '', ...props }: ComponentProps<'button'>) {
  return <button className={`${buttonClassName} ${className}`} {...props} />;
}
