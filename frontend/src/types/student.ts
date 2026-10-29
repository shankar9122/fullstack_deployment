import type { ClassSummary } from './class';

export type Gender = 'male' | 'female' | 'other';
export type StudentSortField = 'name' | 'rollNumber' | 'dob' | 'createdAt';

export interface Student {
  _id: string;
  name: string;
  rollNumber: number;
  email?: string;
  dob: string;
  gender?: Gender;
  guardianName: string;
  guardianPhone: string;
  class: ClassSummary;
}

export interface StudentListQuery {
  search?: string;
  class?: string;
  gender?: Gender;
  sortBy?: StudentSortField;
  order?: 'asc' | 'desc';
  page?: number;
  limit?: number;
}

// Backend ko jo payload bhejna hai
export interface StudentInput {
  name: string;
  rollNumber: number;
  email?: string;
  dob: string; // "2012-03-15"
  gender?: Gender;
  guardianName: string;
  guardianPhone: string;
  class: string; // class ki _id
}
