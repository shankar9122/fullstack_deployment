'use client';

import { ServerErrorAlert } from '@/components/shared/ServerErrorAlert';
import { Button } from '@/components/ui/Button';
import { SelectField } from '@/components/ui/SelectField';
import { TextField } from '@/components/ui/TextField';
import { useFormSubmit } from '@/hooks/useFormSubmit';
import { zodResolver } from '@hookform/resolvers/zod';
import { useForm } from 'react-hook-form';
import { createUserSchema, editUserSchema, type UserFormValues } from '../userForm';

interface UserFormProps {
  mode: 'create' | 'edit';
  initialValues: UserFormValues;
  submitLabel: string;
  /** True when an admin edits their own account: role, status and password are hidden */
  isSelf?: boolean;
  onSubmit: (values: UserFormValues) => Promise<void>;
}

export function UserForm({ mode, initialValues, submitLabel, isSelf = false, onSubmit }: UserFormProps) {
  const isEdit = mode === 'edit';

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting, isDirty },
  } = useForm<UserFormValues>({
    resolver: zodResolver(isEdit ? editUserSchema : createUserSchema),
    defaultValues: initialValues,
    mode: 'onTouched',
  });

  const { run, serverError, done } = useFormSubmit(onSubmit);

  const showAccessFields = !isSelf; // role and status
  const showPassword = !isSelf;

  return (
    <form onSubmit={handleSubmit(run)} noValidate className="grid max-w-xl gap-4">
      <ServerErrorAlert error={serverError} />

      <TextField id="name" label="Name" error={errors.name?.message} {...register('name')} />

      <TextField
        id="email"
        label="Email"
        type="email"
        autoComplete="off"
        error={errors.email?.message}
        {...register('email')}
      />

      {showAccessFields && (
        <SelectField
          id="role"
          label="Role"
          hint="Admins can change records and manage users. Teachers can only view."
          error={errors.role?.message}
          {...register('role')}
        >
          <option value="teacher">Teacher</option>
          <option value="admin">Admin</option>
        </SelectField>
      )}

      {isEdit && showAccessFields && (
        <SelectField
          id="status"
          label="Status"
          hint="Disabled users cannot sign in, and their current session ends immediately."
          error={errors.status?.message}
          {...register('status')}
        >
          <option value="active">Active</option>
          <option value="disabled">Disabled</option>
        </SelectField>
      )}

      {showPassword && (
        <TextField
          id="password"
          label={isEdit ? 'New password (optional)' : 'Password'}
          type="password"
          autoComplete="new-password"
          hint={
            isEdit
              ? 'Leave blank to keep the current password. A new password signs the user out of their current session.'
              : 'At least 8 characters. Share it with the user privately.'
          }
          error={errors.password?.message}
          {...register('password')}
        />
      )}

      {isSelf && (
        <p className="rounded border bg-gray-50 p-3 text-sm text-gray-600">
          You cannot change your own role, status or password here. This prevents you from locking yourself out.
        </p>
      )}

      <div>
        {/* In edit mode there is nothing to save until something changed */}
        <Button type="submit" disabled={isSubmitting || done || (isEdit && !isDirty)}>
          {isSubmitting ? 'Saving...' : submitLabel}
        </Button>
      </div>
    </form>
  );
}
