import type { Teacher, TeacherInput } from '@/types/teacher';
import { z } from 'zod';

const EMAIL_PATTERN = /^\S+@\S+\.\S+$/;
const PHONE_PATTERN = /^[6-9]\d{9}$/;

// All fields are strings because HTML inputs always return strings.
// Converting empty values to null/undefined happens in the mapper below.
export const teacherFormSchema = z.object({
  name: z.string().trim().min(2, 'Name must be at least 2 characters').max(100, 'Name cannot exceed 100 characters'),

  email: z.string().trim().min(1, 'Email is required').regex(EMAIL_PATTERN, 'Invalid email address'),

  // Optional: empty is fine, otherwise it must be a valid Indian mobile number
  phone: z
    .string()
    .trim()
    .refine(
      (value) => value === '' || PHONE_PATTERN.test(value),
      'Phone must be a valid 10-digit number starting with 6-9',
    ),

  subject: z.string().trim().min(1, 'Subject is required'),
});

export type TeacherFormValues = z.infer<typeof teacherFormSchema>;

export const emptyTeacherForm: TeacherFormValues = {
  name: '',
  email: '',
  phone: '',
  subject: '',
};

export function fromTeacher(teacher: Teacher): TeacherFormValues {
  return {
    name: teacher.name,
    email: teacher.email,
    phone: teacher.phone ?? '',
    subject: teacher.subject,
  };
}

// Form values -> API payload (zodResolver has already trimmed the strings)
export function toTeacherInput(values: TeacherFormValues): TeacherInput {
  return {
    name: values.name,
    email: values.email,
    phone: values.phone || null,
    subject: values.subject,
  };
}
