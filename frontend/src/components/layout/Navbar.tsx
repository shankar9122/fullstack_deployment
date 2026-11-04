'use client';

import { Button } from '@/components/ui/Button';
import { useAuth } from '@/providers/auth-context';
import Link from 'next/link';

interface NavLink {
  href: string;
  label: string;
  adminOnly?: boolean;
}

const links: NavLink[] = [
  { href: '/students', label: 'Students' },
  { href: '/classes', label: 'Classes' },
  { href: '/teachers', label: 'Teachers' },
  { href: '/users', label: 'Users', adminOnly: true },
];

export function Navbar() {
  const { user, status, isAdmin, logout } = useAuth();
  const isAuthenticated = status === 'authenticated' && user !== null;
  const visibleLinks = links.filter((link) => !link.adminOnly || isAdmin);

  return (
    <header className="border-b">
      <nav className="mx-auto flex max-w-5xl items-center gap-6 p-4">
        <Link href="/" className="font-bold">
          School Admin
        </Link>

        {/* Links and user info only for logged-in users; on /login only the brand shows */}
        {isAuthenticated && (
          <>
            {visibleLinks.map((link) => (
              <Link key={link.href} href={link.href} className="text-sm hover:underline">
                {link.label}
              </Link>
            ))}

            <div className="ml-auto flex items-center gap-3 text-sm">
              <span>
                <Link href="/account" className="hover:underline">
                  {user.name}
                </Link>{' '}
                <span className="rounded bg-gray-100 px-2 py-0.5 text-xs capitalize">{user.role}</span>
              </span>
              <Button onClick={logout}>Log out</Button>
            </div>
          </>
        )}
      </nav>
    </header>
  );
}
