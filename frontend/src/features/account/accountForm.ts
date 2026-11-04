import { MAX_PASSWORD_BYTES, MIN_PASSWORD_LENGTH, passwordByteLength } from '@/lib/validation/password';
import type { ChangePasswordInput } from '@/types/auth';
import { z } from 'zod';

export const changePasswordSchema = z
  .object({
    // Only "required": the real check is done by the server
    currentPassword: z.string().min(1, 'Enter your current password'),

    newPassword: z
      .string()
      .min(MIN_PASSWORD_LENGTH, `Password must be at least ${MIN_PASSWORD_LENGTH} characters`)
      .refine(
        (value) => passwordByteLength(value) <= MAX_PASSWORD_BYTES,
        `Password is too long (${MAX_PASSWORD_BYTES} bytes maximum)`,
      ),

    confirmPassword: z.string().min(1, 'Confirm your new password'),
  })
  // The checks below run once each field is valid on its own
  .refine((values) => values.newPassword === values.confirmPassword, {
    message: 'Passwords do not match',
    path: ['confirmPassword'],
  })
  .refine((values) => values.newPassword !== values.currentPassword, {
    message: 'New password must be different from the current one',
    path: ['newPassword'],
  });

export type ChangePasswordFormValues = z.infer<typeof changePasswordSchema>;

export const emptyChangePasswordForm: ChangePasswordFormValues = {
  currentPassword: '',
  newPassword: '',
  confirmPassword: '',
};

// confirmPassword exists only for the form, the API never receives it
export function toChangePasswordInput(values: ChangePasswordFormValues): ChangePasswordInput {
  return {
    currentPassword: values.currentPassword,
    newPassword: values.newPassword,
  };
}
