'use client';

import { ServerErrorAlert } from '@/components/shared/ServerErrorAlert';
import { Button } from '@/components/ui/Button';
import { TextField } from '@/components/ui/TextField';
import { useFormSubmit } from '@/hooks/useFormSubmit';
import { zodResolver } from '@hookform/resolvers/zod';
import { useForm } from 'react-hook-form';
import { emptyLoginForm, loginFormSchema, type LoginFormValues } from '../loginForm';

interface LoginFormProps {
  onSubmit: (values: LoginFormValues) => Promise<void>;
}

export function LoginForm({ onSubmit }: LoginFormProps) {
  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<LoginFormValues>({
    resolver: zodResolver(loginFormSchema),
    defaultValues: emptyLoginForm,
    mode: 'onTouched',
  });

  const { run, serverError, done } = useFormSubmit(onSubmit);

  return (
    <form onSubmit={handleSubmit(run)} noValidate className="grid gap-4">
      <ServerErrorAlert error={serverError} />

      <TextField
        id="email"
        label="Email"
        type="email"
        autoComplete="username"
        error={errors.email?.message}
        {...register('email')}
      />

      <TextField
        id="password"
        label="Password"
        type="password"
        autoComplete="current-password"
        error={errors.password?.message}
        {...register('password')}
      />

      <Button type="submit" disabled={isSubmitting || done}>
        {isSubmitting ? 'Signing in...' : 'Sign in'}
      </Button>
    </form>
  );
}
