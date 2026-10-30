'use client';

import { ServerErrorAlert } from '@/components/shared/ServerErrorAlert';
import { Button } from '@/components/ui/Button';
import { SelectField } from '@/components/ui/SelectField';
import { TextField } from '@/components/ui/TextField';
import { useFormSubmit } from '@/hooks/useFormSubmit';
import type { Teacher } from '@/types/teacher';
import { zodResolver } from '@hookform/resolvers/zod';
import { useForm } from 'react-hook-form';
import { CLASS_NAMES, SECTIONS, classFormSchema, type ClassFormValues } from '../classForm';

interface ClassFormProps {
  initialValues: ClassFormValues;
  teachers: Teacher[];
  submitLabel: string;
  onSubmit: (values: ClassFormValues) => Promise<void>;
}

export function ClassForm({ initialValues, teachers, submitLabel, onSubmit }: ClassFormProps) {
  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<ClassFormValues>({
    resolver: zodResolver(classFormSchema),
    defaultValues: initialValues,
    mode: 'onTouched',
  });

  const { run, serverError, done } = useFormSubmit(onSubmit);

  return (
    <form onSubmit={handleSubmit(run)} noValidate className="grid max-w-xl gap-4">
      <ServerErrorAlert error={serverError} />

      <SelectField id="name" label="Class" error={errors.name?.message} {...register('name')}>
        <option value="">Select a class</option>
        {CLASS_NAMES.map((name) => (
          <option key={name} value={name}>
            Class {name}
          </option>
        ))}
      </SelectField>

      <SelectField id="section" label="Section" error={errors.section?.message} {...register('section')}>
        <option value="">Select a section</option>
        {SECTIONS.map((section) => (
          <option key={section} value={section}>
            {section}
          </option>
        ))}
      </SelectField>

      <TextField
        id="academicYear"
        label="Academic year"
        placeholder="2025-26"
        error={errors.academicYear?.message}
        {...register('academicYear')}
      />

      <SelectField
        id="classTeacherId"
        label="Class teacher (optional)"
        error={errors.classTeacherId?.message}
        {...register('classTeacherId')}
      >
        <option value="">No class teacher</option>
        {teachers.map((teacher) => (
          <option key={teacher._id} value={teacher._id}>
            {teacher.name} ({teacher.subject})
          </option>
        ))}
      </SelectField>

      <div>
        <Button type="submit" disabled={isSubmitting || done}>
          {isSubmitting ? 'Saving...' : submitLabel}
        </Button>
      </div>
    </form>
  );
}
