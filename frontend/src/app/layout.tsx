import { Navbar } from '@/components/layout/Navbar';
import { AuthProvider } from '@/providers/AuthProvider';
import type { Metadata } from 'next';
import './globals.css';

export const metadata: Metadata = {
  title: 'School Admin',
  description: 'School management dashboard',
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body>
        <AuthProvider>
          <Navbar />
          <main className="mx-auto max-w-5xl p-6">{children}</main>
        </AuthProvider>
      </body>
    </html>
  );
}
