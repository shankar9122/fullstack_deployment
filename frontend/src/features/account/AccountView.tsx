'use client';

import { useAuth } from '@/providers/auth-context';
import { toChangePasswordInput, type ChangePasswordFormValues } from './accountForm';
import { ChangePasswordForm } from './components/ChangePasswordForm';

export function AccountView() {
  const { user, changePassword } = useAuth();

  async function handleSubmit(values: ChangePasswordFormValues) {
    await changePassword(toChangePasswordInput(values));
  }

  if (!user) return null;

  return (
    <section className="grid max-w-xl gap-8">
      <div>
        <h1 className="mb-4 text-2xl font-bold">My account</h1>

        <dl className="grid grid-cols-[8rem_1fr] gap-y-2 rounded border p-4 text-sm">
          <dt className="text-gray-500">Name</dt>
          <dd>{user.name}</dd>
          <dt className="text-gray-500">Email</dt>
          <dd>{user.email}</dd>
          <dt className="text-gray-500">Role</dt>
          <dd className="capitalize">{user.role}</dd>
        </dl>

        <p className="mt-2 text-xs text-gray-500">To change your name or email, ask an administrator.</p>
      </div>

      <div>
        <h2 className="mb-4 text-lg font-semibold">Change password</h2>
        <ChangePasswordForm onSubmit={handleSubmit} />
      </div>
    </section>
  );
}
