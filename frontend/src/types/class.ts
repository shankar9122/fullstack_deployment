import type { TeacherSummary } from './teacher';

export interface ClassItem {
  _id: string;
  name: string;
  section: string;
  academicYear: string;
  classTeacher?: TeacherSummary | null;
}

// Shape returned when a class is populated inside a student
export type ClassSummary = Pick<ClassItem, '_id' | 'name' | 'section' | 'academicYear'>;

export interface ClassListQuery {
  name?: string;
  academicYear?: string;
  page?: number;
  limit?: number;
}

// Payload sent to the backend
export interface ClassInput {
  name: string;
  section: string;
  academicYear: string;
  classTeacher: string | null; // null removes the class teacher on update
}
