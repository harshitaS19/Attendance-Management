// localStorage utility functions for data persistence

export interface Course {
  id: string;
  name: string;
  code: string;
}

export interface Subject {
  id: string;
  name: string;
  code: string;
  courseId: string;
  staffId?: string;
}

export interface Staff {
  id: string;
  name: string;
  email: string;
  assignedSubjects: string[];
}

export interface Student {
  id: string;
  name: string;
  rollNumber: string;
  email: string;
  courseId: string;
  subjects: string[];
}

export interface AttendanceRecord {
  date: string;
  studentId: string;
  subjectId: string;
  status: 'present' | 'absent';
}

export interface User {
  id: string;
  username: string;
  password: string;
  role: 'admin' | 'staff' | 'student';
  profileId: string;
}

// Initialize default data
const initializeData = () => {
  if (!localStorage.getItem('users')) {
    const defaultUsers: User[] = [
      { id: '1', username: 'admin', password: 'admin123', role: 'admin', profileId: '1' },
      { id: '2', username: 'staff1', password: 'staff123', role: 'staff', profileId: '1' },
      { id: '3', username: 'student1', password: 'student123', role: 'student', profileId: '1' },
    ];
    localStorage.setItem('users', JSON.stringify(defaultUsers));
  }

  if (!localStorage.getItem('courses')) {
    const defaultCourses: Course[] = [
      { id: '1', name: 'Information Technology', code: 'IT' },
      { id: '2', name: 'Computer Science', code: 'CS' },
    ];
    localStorage.setItem('courses', JSON.stringify(defaultCourses));
  }

  if (!localStorage.getItem('subjects')) {
    const defaultSubjects: Subject[] = [
      { id: '1', name: 'Artificial Intelligence', code: 'AI101', courseId: '1', staffId: '1' },
      { id: '2', name: 'Database Management Systems', code: 'DBMS101', courseId: '1', staffId: '1' },
      { id: '3', name: 'Web Development', code: 'WEB101', courseId: '1' },
    ];
    localStorage.setItem('subjects', JSON.stringify(defaultSubjects));
  }

  if (!localStorage.getItem('staff')) {
    const defaultStaff: Staff[] = [
      { id: '1', name: 'Dr. John Smith', email: 'john@example.com', assignedSubjects: ['1', '2'] },
    ];
    localStorage.setItem('staff', JSON.stringify(defaultStaff));
  }

  if (!localStorage.getItem('students')) {
    const defaultStudents: Student[] = [
      { id: '1', name: 'Harshi', rollNumber: 'IT001', email: 'harshi@example.com', courseId: '1', subjects: ['1', '2', '3'] },
      { id: '2', name: 'Priya Sharma', rollNumber: 'IT002', email: 'priya@example.com', courseId: '1', subjects: ['1', '2'] },
    ];
    localStorage.setItem('students', JSON.stringify(defaultStudents));
  }

  if (!localStorage.getItem('attendance')) {
    localStorage.setItem('attendance', JSON.stringify([]));
  }
};

// Generic storage functions
export const getFromStorage = <T>(key: string): T[] => {
  const data = localStorage.getItem(key);
  return data ? JSON.parse(data) : [];
};

export const saveToStorage = <T>(key: string, data: T[]): void => {
  localStorage.setItem(key, JSON.stringify(data));
};

// Specific getters
export const getCourses = (): Course[] => getFromStorage<Course>('courses');
export const getSubjects = (): Subject[] => getFromStorage<Subject>('subjects');
export const getStaff = (): Staff[] => getFromStorage<Staff>('staff');
export const getStudents = (): Student[] => getFromStorage<Student>('students');
export const getAttendance = (): AttendanceRecord[] => getFromStorage<AttendanceRecord>('attendance');
export const getUsers = (): User[] => getFromStorage<User>('users');

// Initialize on import
initializeData();

// Auth functions
export const getCurrentUser = (): User | null => {
  const userData = localStorage.getItem('currentUser');
  return userData ? JSON.parse(userData) : null;
};

export const setCurrentUser = (user: User | null): void => {
  if (user) {
    localStorage.setItem('currentUser', JSON.stringify(user));
  } else {
    localStorage.removeItem('currentUser');
  }
};

export const login = (username: string, password: string): User | null => {
  const users = getUsers();
  const user = users.find(u => u.username === username && u.password === password);
  if (user) {
    setCurrentUser(user);
  }
  return user || null;
};

export const logout = (): void => {
  setCurrentUser(null);
};
