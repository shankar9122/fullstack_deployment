import type { ClassInput, ClassItem } from '@/types/class';
import { z } from 'zod';

export const CLASS_NAMES = Array.from({ length: 12 }, (_, index) => String(index + 1));
export const SECTIONS = ['A', 'B', 'C', 'D', 'E', 'F'];

// All fields are strings because HTML selects and inputs return strings
export const classFormSchema = z.object({
  name: z.string().refine((value) => CLASS_NAMES.includes(value), 'Please select a class'),

  section: z.string().refine((value) => SECTIONS.includes(value), 'Please select a section'),

  academicYear: z
    .string()
    .trim()
    .regex(/^\d{4}-\d{2}$/, 'Academic year must look like 2025-26'),

  // Empty string means "no class teacher"
  classTeacherId: z.string(),
});

export type ClassFormValues = z.infer<typeof classFormSchema>;

export const emptyClassForm: ClassFormValues = {
  name: '',
  section: '',
  academicYear: '',
  classTeacherId: '',
};

export function fromClass(classItem: ClassItem): ClassFormValues {
  return {
    name: classItem.name,
    section: classItem.section,
    academicYear: classItem.academicYear,
    classTeacherId: classItem.classTeacher?._id ?? '',
  };
}

// Form values -> API payload
export function toClassInput(values: ClassFormValues): ClassInput {
  return {
    name: values.name,
    section: values.section,
    academicYear: values.academicYear,
    classTeacher: values.classTeacherId || null,
  };
}
