import type { TeacherSummary } from './teacher';

export interface ClassItem {
  _id: string;
  name: string;
  section: string;
  academicYear: string;
  classTeacher?: TeacherSummary;
}

// Student ke andar populate hoke yahi aata hai
export type ClassSummary = Pick<ClassItem, '_id' | 'name' | 'section' | 'academicYear'>;

export interface ClassListQuery {
  name?: string;
  academicYear?: string;
  page?: number;
  limit?: number;
}
