'use client';

import { Alert } from '@/components/ui/Alert';
import { useAuth } from '@/providers/auth-context';
import { userService } from '@/services/user.service';
import { useRouter } from 'next/navigation';
import { UserForm } from './components/UserForm';
import { useUser } from './hooks/useUser';
import { fromUser, toUpdateUserInput, type UserFormValues } from './userForm';

export function EditUserView({ id }: { id: string }) {
  const router = useRouter();
  const { user: currentUser, refreshUser } = useAuth();
  const { user, loading, error } = useUser(id);

  if (loading) return <p className="text-sm">Loading...</p>;
  if (error) return <Alert>{error}</Alert>;
  if (!user) return null;

  const isSelf = user._id === currentUser?._id;

  async function handleSubmit(values: UserFormValues) {
    const input = toUpdateUserInput(values, user!, isSelf);

    // Nothing really changed (for example only the email's letter case)
    if (Object.keys(input).length === 0) {
      router.push('/users');
      return;
    }

    await userService.update(id, input);

    // The Navbar shows the signed-in user's name, so refresh it after they edit themselves.
    // A failure here must not hide the fact that the save worked
    if (isSelf) await refreshUser().catch(() => {});

    router.push('/users');
  }

  return (
    <section>
      <h1 className="mb-4 text-2xl font-bold">Edit user</h1>
      <UserForm
        mode="edit"
        initialValues={fromUser(user)}
        submitLabel="Save changes"
        isSelf={isSelf}
        onSubmit={handleSubmit}
      />
    </section>
  );
}
