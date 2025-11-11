const API = import.meta.env.VITE_API_URL || 'http://localhost:4000';

export type Student = {
  id?: string;
  name: string;
  rollNumber: string;
  email: string;
  courseId: string;
  subjects: string[];
};

export async function apiGet<T>(path: string): Promise<T> {
  const r = await fetch(`${API}${path}`);
  if (!r.ok) throw new Error(await r.text());
  return r.json();
}

export async function apiSend<T>(path: string, method: 'POST' | 'PUT' | 'DELETE', body?: any): Promise<T> {
  const r = await fetch(`${API}${path}`, {
    method,
    headers: body ? { 'Content-Type': 'application/json' } : undefined,
    body: body ? JSON.stringify(body) : undefined
  });
  if (!r.ok) throw new Error(await r.text());
  return r.status === 204 ? (undefined as unknown as T) : r.json();
}

export const AuthAPI = {
  login: async (username: string, password: string) => {
    return apiSend<{ user: any }>('/auth/login', 'POST', { username, password });
  }
};

export const CoursesAPI = {
  list: () => apiGet<any[]>('/courses')
};

export const SubjectsAPI = {
  list: () => apiGet<any[]>('/subjects')
};

export const StudentsAPI = {
  list: () => apiGet<Student[]>('/students'),
  create: (s: Student) => apiSend<Student>('/students', 'POST', s),
  update: (id: string, s: Student) => apiSend<Student>(`/students/${id}`, 'PUT', s),
  remove: (id: string) => apiSend<void>(`/students/${id}`, 'DELETE')
};


