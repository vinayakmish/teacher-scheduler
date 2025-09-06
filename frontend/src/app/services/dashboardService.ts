import api from './authService';
import { ApiResponse, DashboardStats } from '@teacher-scheduler/shared-types';

export const dashboardService = {
  async getDashboardStats(): Promise<DashboardStats> {
    const response = await api.get<ApiResponse<DashboardStats>>(
      '/schedules/dashboard/stats'
    );
    if (!response.data.data) {
      throw new Error('Failed to fetch dashboard stats');
    }
    return response.data.data;
  },
};

export default dashboardService;
