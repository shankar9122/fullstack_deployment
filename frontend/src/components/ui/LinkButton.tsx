import Link from 'next/link';
import type { ComponentProps } from 'react';
import { buttonClassName } from './Button';

// A navigation link styled as a button
export function LinkButton({ className = '', ...props }: ComponentProps<typeof Link>) {
  return <Link className={`${buttonClassName} ${className}`} {...props} />;
}
