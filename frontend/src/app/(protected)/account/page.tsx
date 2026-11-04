import { AccountView } from '@/features/account/AccountView';
import type { Metadata } from 'next';

export const metadata: Metadata = { title: 'My account | School Admin' };

export default function AccountPage() {
  return <AccountView />;
}
