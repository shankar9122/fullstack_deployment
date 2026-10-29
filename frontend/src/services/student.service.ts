import { http } from '@/lib/http/client';
import type { Paginated, Pagination } from '@/types/api';
import type { Student, StudentListQuery } from '@/types/student';

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

  async remove(id: string): Promise<void> {
    await http.delete(`/students/${id}`);
  },
};
