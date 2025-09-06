import api from './authService';
import {
  User,
  ApiResponse,
  RegisterRequest,
} from '@teacher-scheduler/shared-types';

export const userService = {
  async getAllUsers(): Promise<User[]> {
    const response = await api.get<ApiResponse<User[]>>('/users');
    return response.data.data || [];
  },

  async getTeachers(): Promise<User[]> {
    const response = await api.get<ApiResponse<User[]>>('/users/teachers');
    return response.data.data || [];
  },

  async getStudents(): Promise<User[]> {
    const response = await api.get<ApiResponse<User[]>>('/users/students');
    return response.data.data || [];
  },

  async getUserProfile(): Promise<Omit<User, 'password'>> {
    const response = await api.get<ApiResponse<Omit<User, 'password'>>>(
      '/users/profile'
    );
    if (!response.data.data) {
      throw new Error('Failed to fetch user profile');
    }
    return response.data.data;
  },

  async updateProfile(data: {
    firstName: string;
    lastName: string;
  }): Promise<Omit<User, 'password'>> {
    const response = await api.put<ApiResponse<Omit<User, 'password'>>>(
      '/users/profile',
      data
    );
    if (!response.data.data) {
      throw new Error('Failed to update user profile');
    }
    return response.data.data;
  },

  async changePassword(data: {
    currentPassword: string;
    newPassword: string;
    confirmPassword: string;
  }): Promise<void> {
    await api.put('/users/change-password', data);
  },

  async deleteUser(userId: string): Promise<void> {
    await api.delete(`/users/${userId}`);
  },

  async registerUser(userData: RegisterRequest): Promise<void> {
    await api.post('/auth/register', userData);
  },
};

export default userService;
