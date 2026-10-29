import type { Student, StudentInput } from '@/types/student';
import { z } from 'zod';

const EMAIL_PATTERN = /^\S+@\S+\.\S+$/;
const PHONE_PATTERN = /^[6-9]\d{9}$/;

// Saare fields string hain, kyunki HTML inputs string hi dete hain.
// Number/undefined ka badlav neeche toStudentInput mein hota hai, schema mein nahi.
export const studentFormSchema = z.object({
  name: z.string().trim().min(2, 'Name must be at least 2 characters').max(100, 'Name cannot exceed 100 characters'),

  rollNumber: z
    .string()
    .trim()
    .regex(/^[1-9]\d*$/, 'Roll number must be a whole number, 1 or more')
    .refine((value) => Number.isSafeInteger(Number(value)), 'Roll number is too large'),

  classId: z.string().min(1, 'Please select a class'),

  dob: z
    .string()
    .min(1, 'Date of birth is required')
    .refine((value) => new Date(value) <= new Date(), 'Date of birth cannot be in the future'),

  // '' ka matlab "not specified". .optional() ki jagah isliye, kyunki "" par woh galat error deta hai
  gender: z.enum(['', 'male', 'female', 'other']),

  // Optional: khaali chalega, bhara ho toh email jaisa dikhna chahiye
  email: z
    .string()
    .trim()
    .refine((value) => value === '' || EMAIL_PATTERN.test(value), 'Invalid email address'),

  guardianName: z.string().trim().min(1, 'Guardian name is required'),

  guardianPhone: z.string().trim().regex(PHONE_PATTERN, 'Enter a valid 10-digit phone number starting with 6-9'),
});

// Type schema se aata hai, alag se likhna nahi padta
export type StudentFormValues = z.infer<typeof studentFormSchema>;

export const emptyStudentForm: StudentFormValues = {
  name: '',
  rollNumber: '',
  email: '',
  dob: '',
  gender: '',
  guardianName: '',
  guardianPhone: '',
  classId: '',
};

// Edit page: backend ke Student ko form ke values mein badlo
export function fromStudent(student: Student): StudentFormValues {
  return {
    name: student.name,
    rollNumber: String(student.rollNumber),
    email: student.email ?? '',
    dob: student.dob.slice(0, 10), // ISO se "yyyy-mm-dd", date input yahi leta hai
    gender: student.gender ?? '',
    guardianName: student.guardianName,
    guardianPhone: student.guardianPhone,
    classId: student.class._id,
  };
}

// Form ke values ko backend ke payload mein badlo
// (zodResolver pehle hi trim kar chuka hota hai)
export function toStudentInput(values: StudentFormValues): StudentInput {
  return {
    name: values.name,
    rollNumber: Number(values.rollNumber),
    email: values.email || undefined,
    dob: values.dob,
    gender: values.gender || undefined,
    guardianName: values.guardianName,
    guardianPhone: values.guardianPhone,
    class: values.classId,
  };
}
