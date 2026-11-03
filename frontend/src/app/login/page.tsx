import { LoginView } from '@/features/auth/LoginView';
import type { Metadata } from 'next';

export const metadata: Metadata = { title: 'Sign in | School Admin' };

export default function LoginPage() {
  return <LoginView />;
}
