export interface Teacher {
  _id: string;
  name: string;
  email: string;
  phone?: string | null;
  subject: string;
  createdAt: string;
  updatedAt: string;
}

// Only these fields come back when a teacher is populated inside a class
export type TeacherSummary = Pick<Teacher, '_id' | 'name' | 'email' | 'subject'>;

export interface TeacherListQuery {
  search?: string;
  page?: number;
  limit?: number;
}

// Payload sent to the backend
export interface TeacherInput {
  name: string;
  email: string;
  phone?: string | null; // null clears the phone on update
  subject: string;
}
