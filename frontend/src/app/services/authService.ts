import axios from 'axios';
import {
  AuthResponse,
  LoginRequest,
  RegisterRequest,
  User,
  ApiResponse,
} from '@teacher-scheduler/shared-types';

const API_BASE_URL = '/api';

const api = axios.create({
  baseURL: API_BASE_URL,
});

// Add token to requests
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// Handle response errors
api.interceptors.response.use(
  (response) => response,
  (error) => {
    // Handle network errors
    if (error.code === 'ERR_NETWORK' || !error.response) {
      const networkError = new Error(
        'Unable to connect to server. Please check if the backend is running.'
      );
      networkError.name = 'NetworkError';
      return Promise.reject(networkError);
    }

    // Handle authentication errors
    if (error.response?.status === 401) {
      localStorage.removeItem('token');
      window.location.href = '/login';
    }

    // Enhance error messages for better debugging
    if (error.response?.data?.message) {
      error.message = error.response.data.message;
    } else if (error.response?.status) {
      switch (error.response.status) {
        case 500:
          error.message = 'Internal server error. Please try again later.';
          break;
        case 404:
          error.message = 'Requested resource not found.';
          break;
        case 403:
          error.message =
            'Access denied. You do not have permission to perform this action.';
          break;
        default:
          error.message = `Server error (${error.response.status}). Please try again.`;
      }
    }

    return Promise.reject(error);
  }
);

export const authService = {
  async login(credentials: LoginRequest): Promise<AuthResponse> {
    const response = await api.post<ApiResponse<AuthResponse>>(
      '/auth/login',
      credentials
    );
    if (!response.data.data) {
      throw new Error('Invalid response from server');
    }
    return response.data.data;
  },

  async register(userData: RegisterRequest): Promise<AuthResponse> {
    const response = await api.post<ApiResponse<AuthResponse>>(
      '/auth/register/public',
      userData
    );
    if (!response.data.data) {
      throw new Error('Invalid response from server');
    }
    return response.data.data;
  },

  async getCurrentUser(): Promise<Omit<User, 'password'>> {
    const response = await api.get<ApiResponse<Omit<User, 'password'>>>(
      '/users/profile'
    );
    if (!response.data.data) {
      throw new Error('Invalid response from server');
    }
    return response.data.data;
  },
};

export default api;
