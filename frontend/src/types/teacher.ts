export interface Teacher {
  _id: string;
  name: string;
  email: string;
  phone?: string;
  subject: string;
  createdAt: string;
  updatedAt: string;
}

// Populate ke baad class ke andar sirf yeh fields aate hain
export type TeacherSummary = Pick<Teacher, '_id' | 'name' | 'email' | 'subject'>;

export interface TeacherListQuery {
  search?: string;
  page?: number;
  limit?: number;
}
