import { http } from '@/lib/http/client';
import type { Paginated, Pagination } from '@/types/api';
import type { Student, StudentInput, StudentListQuery } from '@/types/student';

interface StudentListResponse {
  students: Student[];
  pagination: Pagination;
}

export const studentService = {
  async list(query: StudentListQuery = {}, signal?: AbortSignal): Promise<Paginated<Student>> {
    const { students, pagination } = await http.get<StudentListResponse>('/students', {
      params: { ...query },
      signal,
    });
    return { items: students, pagination };
  },

  async getById(id: string, signal?: AbortSignal): Promise<Student> {
    const { student } = await http.get<{ student: Student }>(`/students/${id}`, { signal });
    return student;
  },

  async create(input: StudentInput): Promise<Student> {
    const { student } = await http.post<{ student: Student }>('/students', { body: input });
    return student;
  },

  async update(id: string, input: StudentInput): Promise<Student> {
    const { student } = await http.patch<{ student: Student }>(`/students/${id}`, { body: input });
    return student;
  },

  async remove(id: string): Promise<void> {
    await http.delete(`/students/${id}`);
  },
};
