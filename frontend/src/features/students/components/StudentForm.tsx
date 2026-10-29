'use client';

import { Alert } from '@/components/ui/Alert';
import { Button } from '@/components/ui/Button';
import { SelectField } from '@/components/ui/SelectField';
import { TextField } from '@/components/ui/TextField';
import { ApiError, getErrorMessage } from '@/lib/http/errors';
import type { ClassItem } from '@/types/class';
import { zodResolver } from '@hookform/resolvers/zod';
import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { studentFormSchema, type StudentFormValues } from '../studentForm';

interface StudentFormProps {
  initialValues: StudentFormValues;
  classes: ClassItem[];
  submitLabel: string;
  onSubmit: (values: StudentFormValues) => Promise<void>;
}

export function StudentForm({ initialValues, classes, submitLabel, onSubmit }: StudentFormProps) {
  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<StudentFormValues>({
    resolver: zodResolver(studentFormSchema),
    defaultValues: initialValues,
    mode: 'onTouched', // pehli baar field se bahar jaane par validate, uske baad har change par
  });

  const [serverError, setServerError] = useState<{ message: string; details?: string[] } | null>(null);
  const [done, setDone] = useState(false);

  // handleSubmit pehle schema chalata hai. Callback sirf tab chalta hai jab sab valid ho
  const submit = handleSubmit(async (values) => {
    setServerError(null);

    try {
      await onSubmit(values);
      setDone(true); // redirect ho raha hai, tab tak button disabled rahe (double submit na ho)
    } catch (error) {
      setServerError({
        message: getErrorMessage(error),
        details: error instanceof ApiError ? error.details : undefined,
      });
    }
  });

  return (
    <form onSubmit={submit} noValidate className="grid max-w-xl gap-4">
      {serverError && (
        <Alert>
          <p>{serverError.message}</p>
          {serverError.details && (
            <ul className="mt-1 list-disc pl-5">
              {serverError.details.map((detail) => (
                <li key={detail}>{detail}</li>
              ))}
            </ul>
          )}
        </Alert>
      )}

      <TextField id="name" label="Name" error={errors.name?.message} {...register('name')} />

      <TextField
        id="rollNumber"
        label="Roll number"
        inputMode="numeric"
        error={errors.rollNumber?.message}
        {...register('rollNumber')}
      />

      <SelectField id="classId" label="Class" error={errors.classId?.message} {...register('classId')}>
        <option value="">Select a class</option>
        {classes.map((c) => (
          <option key={c._id} value={c._id}>
            {c.name}-{c.section} ({c.academicYear})
          </option>
        ))}
      </SelectField>

      <TextField id="dob" label="Date of birth" type="date" error={errors.dob?.message} {...register('dob')} />

      <SelectField id="gender" label="Gender (optional)" error={errors.gender?.message} {...register('gender')}>
        <option value="">Not specified</option>
        <option value="male">Male</option>
        <option value="female">Female</option>
        <option value="other">Other</option>
      </SelectField>

      <TextField
        id="email"
        label="Email (optional)"
        type="email"
        error={errors.email?.message}
        {...register('email')}
      />

      <TextField
        id="guardianName"
        label="Guardian name"
        error={errors.guardianName?.message}
        {...register('guardianName')}
      />

      <TextField
        id="guardianPhone"
        label="Guardian phone"
        inputMode="numeric"
        maxLength={10}
        error={errors.guardianPhone?.message}
        {...register('guardianPhone')}
      />

      <div>
        <Button type="submit" disabled={isSubmitting || done}>
          {isSubmitting ? 'Saving...' : submitLabel}
        </Button>
      </div>
    </form>
  );
}
