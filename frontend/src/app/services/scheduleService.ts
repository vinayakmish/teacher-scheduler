import api from './authService';
import {
  Schedule,
  ApiResponse,
  CreateScheduleRequest,
  UpdateScheduleRequest,
} from '@teacher-scheduler/shared-types';

// Enhanced error handling with specific error types
class ScheduleServiceError extends Error {
  constructor(
    message: string,
    public statusCode?: number,
    public originalError?: unknown
  ) {
    super(message);
    this.name = 'ScheduleServiceError';
  }
}

// Helper function to extract error message from API response
const extractErrorMessage = (error: unknown): string => {
  if (typeof error === 'object' && error !== null) {
    const err = error as {
      response?: {
        data?: { error?: string };
        statusText?: string;
      };
      message?: string;
    };

    // Check for API response error message
    if (err.response?.data?.error) {
      return err.response.data.error;
    }

    // Check for axios error message
    if (err.response?.statusText) {
      return err.response.statusText;
    }

    // Check for generic error message
    if (err.message) {
      return err.message;
    }
  }

  return 'An unexpected error occurred';
};

// Helper function to handle API errors consistently
const handleApiError = (error: unknown, operation: string): never => {
  const message = extractErrorMessage(error);
  const statusCode = (error as { response?: { status?: number } })?.response
    ?.status;

  console.error(`${operation} failed:`, error);

  throw new ScheduleServiceError(`${operation}: ${message}`, statusCode, error);
};

export const scheduleService = {
  async getAllSchedules(): Promise<Schedule[]> {
    try {
      const response = await api.get<ApiResponse<Schedule[]>>('/schedules');

      if (!response.data.success) {
        throw new Error(response.data.error || 'Failed to fetch schedules');
      }

      return response.data.data || [];
    } catch (error) {
      return handleApiError(error, 'Get all schedules');
    }
  },

  async getScheduleById(id: string): Promise<Schedule> {
    try {
      if (!id || typeof id !== 'string') {
        throw new Error('Invalid schedule ID provided');
      }

      const response = await api.get<ApiResponse<Schedule>>(`/schedules/${id}`);

      if (!response.data.success) {
        throw new Error(response.data.error || 'Failed to fetch schedule');
      }

      if (!response.data.data) {
        throw new Error('Schedule not found');
      }

      return response.data.data;
    } catch (error) {
      return handleApiError(error, 'Get schedule by ID');
    }
  },

  async createSchedule(scheduleData: CreateScheduleRequest): Promise<Schedule> {
    try {
      // Validate required fields
      if (!scheduleData.subject?.trim()) {
        throw new Error('Subject is required');
      }
      if (!scheduleData.date) {
        throw new Error('Date is required');
      }
      if (!scheduleData.startTime) {
        throw new Error('Start time is required');
      }
      if (!scheduleData.endTime) {
        throw new Error('End time is required');
      }
      if (!scheduleData.maxStudents || scheduleData.maxStudents < 1) {
        throw new Error('Max students must be at least 1');
      }

      const response = await api.post<ApiResponse<Schedule>>(
        '/schedules',
        scheduleData
      );

      if (!response.data.success) {
        throw new Error(response.data.error || 'Failed to create schedule');
      }

      if (!response.data.data) {
        throw new Error('No schedule data returned from server');
      }

      return response.data.data;
    } catch (error) {
      return handleApiError(error, 'Create schedule');
    }
  },

  async updateSchedule(
    id: string,
    scheduleData: UpdateScheduleRequest
  ): Promise<Schedule> {
    try {
      if (!id || typeof id !== 'string') {
        throw new Error('Invalid schedule ID provided');
      }

      const response = await api.put<ApiResponse<Schedule>>(
        `/schedules/${id}`,
        scheduleData
      );

      if (!response.data.success) {
        throw new Error(response.data.error || 'Failed to update schedule');
      }

      if (!response.data.data) {
        throw new Error('No schedule data returned from server');
      }

      return response.data.data;
    } catch (error) {
      return handleApiError(error, 'Update schedule');
    }
  },

  async deleteSchedule(id: string): Promise<void> {
    try {
      if (!id || typeof id !== 'string') {
        throw new Error('Invalid schedule ID provided');
      }

      const response = await api.delete<ApiResponse<void>>(`/schedules/${id}`);

      if (!response.data.success) {
        throw new Error(response.data.error || 'Failed to delete schedule');
      }
    } catch (error) {
      return handleApiError(error, 'Delete schedule');
    }
  },

  async enrollInSchedule(id: string): Promise<Schedule> {
    try {
      if (!id || typeof id !== 'string') {
        throw new Error('Invalid schedule ID provided');
      }

      const response = await api.post<ApiResponse<Schedule>>(
        `/schedules/${id}/enroll`
      );

      if (!response.data.success) {
        throw new Error(response.data.error || 'Failed to enroll in schedule');
      }

      if (!response.data.data) {
        throw new Error('No schedule data returned from server');
      }

      return response.data.data;
    } catch (error) {
      return handleApiError(error, 'Enroll in schedule');
    }
  },

  async unenrollFromSchedule(id: string): Promise<Schedule> {
    try {
      if (!id || typeof id !== 'string') {
        throw new Error('Invalid schedule ID provided');
      }

      const response = await api.post<ApiResponse<Schedule>>(
        `/schedules/${id}/unenroll`
      );

      if (!response.data.success) {
        throw new Error(
          response.data.error || 'Failed to unenroll from schedule'
        );
      }

      if (!response.data.data) {
        throw new Error('No schedule data returned from server');
      }

      return response.data.data;
    } catch (error) {
      return handleApiError(error, 'Unenroll from schedule');
    }
  },
};

export default scheduleService;
export { ScheduleServiceError };
