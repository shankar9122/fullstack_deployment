'use client';

import { userService } from '@/services/user.service';
import { useRouter } from 'next/navigation';
import { UserForm } from './components/UserForm';
import { emptyUserForm, toCreateUserInput, type UserFormValues } from './userForm';

export function CreateUserView() {
  const router = useRouter();

  async function handleSubmit(values: UserFormValues) {
    await userService.create(toCreateUserInput(values));
    router.push('/users');
  }

  return (
    <section>
      <h1 className="mb-1 text-2xl font-bold">Add user</h1>
      <p className="mb-4 text-sm text-gray-600">
        There is no public sign-up. Accounts are created here, and the user signs in with the credentials you set.
      </p>

      <UserForm mode="create" initialValues={emptyUserForm} submitLabel="Create user" onSubmit={handleSubmit} />
    </section>
  );
}
