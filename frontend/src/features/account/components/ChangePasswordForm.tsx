'use client';

import { ServerErrorAlert } from '@/components/shared/ServerErrorAlert';
import { Button } from '@/components/ui/Button';
import { TextField } from '@/components/ui/TextField';
import { useFormSubmit } from '@/hooks/useFormSubmit';
import { zodResolver } from '@hookform/resolvers/zod';
import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { changePasswordSchema, emptyChangePasswordForm, type ChangePasswordFormValues } from '../accountForm';

interface ChangePasswordFormProps {
  onSubmit: (values: ChangePasswordFormValues) => Promise<void>;
}

export function ChangePasswordForm({ onSubmit }: ChangePasswordFormProps) {
  const {
    register,
    handleSubmit,
    reset,
    formState: { errors, isSubmitting },
  } = useForm<ChangePasswordFormValues>({
    resolver: zodResolver(changePasswordSchema),
    defaultValues: emptyChangePasswordForm,
    mode: 'onTouched',
  });

  const [saved, setSaved] = useState(false);

  // The form stays on the page after saving, so the button must stay usable
  const { run, serverError } = useFormSubmit(
    async (values: ChangePasswordFormValues) => {
      setSaved(false);
      await onSubmit(values);
      reset(emptyChangePasswordForm); // never keep passwords sitting in form state
      setSaved(true);
    },
    { disableAfterSuccess: false },
  );

  return (
    <form onSubmit={handleSubmit(run)} noValidate className="grid max-w-xl gap-4">
      <ServerErrorAlert error={serverError} />

      {saved && (
        <p role="status" className="rounded border border-green-300 bg-green-50 p-3 text-sm text-green-800">
          Password updated. Your other devices will be asked to sign in again.
        </p>
      )}

      <TextField
        id="currentPassword"
        label="Current password"
        type="password"
        autoComplete="current-password"
        error={errors.currentPassword?.message}
        {...register('currentPassword')}
      />

      <TextField
        id="newPassword"
        label="New password"
        type="password"
        autoComplete="new-password"
        hint="At least 8 characters. A longer passphrase is stronger than a short complicated one."
        error={errors.newPassword?.message}
        {...register('newPassword')}
      />

      <TextField
        id="confirmPassword"
        label="Confirm new password"
        type="password"
        autoComplete="new-password"
        error={errors.confirmPassword?.message}
        {...register('confirmPassword')}
      />

      <div>
        <Button type="submit" disabled={isSubmitting}>
          {isSubmitting ? 'Saving...' : 'Change password'}
        </Button>
      </div>
    </form>
  );
}
