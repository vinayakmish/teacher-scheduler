export interface User {
  _id?: string;
  email: string;
  password: string;
  firstName: string;
  lastName: string;
  role: UserRole;
  createdAt?: Date;
  updatedAt?: Date;
}

export enum UserRole {
  ADMIN = 'admin',
  TEACHER = 'teacher',
  STUDENT = 'student',
}

export interface Schedule {
  _id?: string;
  teacher: string | User; // User ID or populated User object
  subject: string;
  date: Date;
  startTime: string;
  endTime: string;
  notes?: string;
  summary?: string;
  maxStudents: number;
  enrolledStudents: (string | User)[]; // User IDs or populated User objects
  createdAt?: Date;
  updatedAt?: Date;
}

export interface AuthResponse {
  token: string;
  user: Omit<User, 'password'>;
}

export interface LoginRequest {
  email: string;
  password: string;
}

export interface RegisterRequest {
  email: string;
  password: string;
  firstName: string;
  lastName: string;
  role: UserRole;
}

export interface CreateScheduleRequest {
  subject: string;
  date: string;
  startTime: string;
  endTime: string;
  notes?: string;
  summary?: string;
  maxStudents: number;
}

export interface UpdateScheduleRequest extends Partial<CreateScheduleRequest> {
  _id: string;
}

export interface EnrollmentRequest {
  scheduleId: string;
}

export interface ApiResponse<T = unknown> {
  success: boolean;
  data?: T;
  message?: string;
  error?: string;
}

export interface DashboardStats {
  totalUsers: number;
  totalTeachers: number;
  totalStudents: number;
  totalSchedules: number;
  activeSchedules: number;
  enrollmentCount: number;
}
