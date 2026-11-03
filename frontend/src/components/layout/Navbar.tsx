'use client';

import { Button } from '@/components/ui/Button';
import { useAuth } from '@/providers/auth-context';
import Link from 'next/link';

const links = [
  { href: '/students', label: 'Students' },
  { href: '/classes', label: 'Classes' },
  { href: '/teachers', label: 'Teachers' },
];

export function Navbar() {
  const { user, status, logout } = useAuth();
  const isAuthenticated = status === 'authenticated' && user !== null;

  return (
    <header className="border-b">
      <nav className="mx-auto flex max-w-5xl items-center gap-6 p-4">
        <Link href="/" className="font-bold">
          School Admin
        </Link>

        {/* Links and user info only for logged-in users; on /login only the brand shows */}
        {isAuthenticated && (
          <>
            {links.map((link) => (
              <Link key={link.href} href={link.href} className="text-sm hover:underline">
                {link.label}
              </Link>
            ))}

            <div className="ml-auto flex items-center gap-3 text-sm">
              <span>
                {user.name} <span className="rounded bg-gray-100 px-2 py-0.5 text-xs capitalize">{user.role}</span>
              </span>
              <Button onClick={logout}>Log out</Button>
            </div>
          </>
        )}
      </nav>
    </header>
  );
}
