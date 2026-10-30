'use client';

import { ServerErrorAlert } from '@/components/shared/ServerErrorAlert';
import { Button } from '@/components/ui/Button';
import { TextField } from '@/components/ui/TextField';
import { useFormSubmit } from '@/hooks/useFormSubmit';
import { zodResolver } from '@hookform/resolvers/zod';
import { useForm } from 'react-hook-form';
import { teacherFormSchema, type TeacherFormValues } from '../teacherForm';

interface TeacherFormProps {
  initialValues: TeacherFormValues;
  submitLabel: string;
  onSubmit: (values: TeacherFormValues) => Promise<void>;
}

export function TeacherForm({ initialValues, submitLabel, onSubmit }: TeacherFormProps) {
  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<TeacherFormValues>({
    resolver: zodResolver(teacherFormSchema),
    defaultValues: initialValues,
    mode: 'onTouched',
  });

  const { run, serverError, done } = useFormSubmit(onSubmit);

  return (
    <form onSubmit={handleSubmit(run)} noValidate className="grid max-w-xl gap-4">
      <ServerErrorAlert error={serverError} />

      <TextField id="name" label="Name" error={errors.name?.message} {...register('name')} />

      <TextField id="email" label="Email" type="email" error={errors.email?.message} {...register('email')} />

      <TextField
        id="phone"
        label="Phone (optional)"
        inputMode="numeric"
        maxLength={10}
        error={errors.phone?.message}
        {...register('phone')}
      />

      <TextField id="subject" label="Subject" error={errors.subject?.message} {...register('subject')} />

      <div>
        <Button type="submit" disabled={isSubmitting || done}>
          {isSubmitting ? 'Saving...' : submitLabel}
        </Button>
      </div>
    </form>
  );
}
