import Link from 'next/link';

const links = [
  { href: '/students', label: 'Students' },
  { href: '/classes', label: 'Classes' },
  { href: '/teachers', label: 'Teachers' },
];

export function Navbar() {
  return (
    <header className="border-b">
      <nav className="mx-auto flex max-w-5xl items-center gap-6 p-4">
        <Link href="/" className="font-bold">
          School Admin
        </Link>
        {links.map((link) => (
          <Link key={link.href} href={link.href} className="text-sm hover:underline">
            {link.label}
          </Link>
        ))}
      </nav>
    </header>
  );
}
