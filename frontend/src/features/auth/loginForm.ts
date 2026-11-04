import { z } from 'zod';

const EMAIL_PATTERN = /^\S+@\S+\.\S+$/;

export const loginFormSchema = z.object({
  email: z.string().trim().min(1, 'Email is required').regex(EMAIL_PATTERN, 'Enter a valid email address'),

  // Only "required" here: the password rules belong to the server and are not repeated on login
  password: z.string().min(1, 'Password is required'),
});

export type LoginFormValues = z.infer<typeof loginFormSchema>;

export const emptyLoginForm: LoginFormValues = {
  email: '',
  password: '',
};
