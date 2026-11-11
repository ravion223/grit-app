import api from './client';
import type { DailyLog, DailyLogUpsert } from '../types';

export interface GetDailyLogsParams {
  month?: string;
  cookie_jar_only?: boolean;
}

export const dailyLogsApi = {
  getAll: async (params?: GetDailyLogsParams): Promise<DailyLog[]> => {
    const response = await api.get<DailyLog[]>('/daily-logs/', { params });
    return response.data;
  },

  getByDate: async (logDate: string): Promise<DailyLog | null> => {
    try {
      const response = await api.get<DailyLog>(`/daily-logs/${logDate}`);
      return response.data;
    } catch {
      return null;
    }
  },

  upsert: async (logDate: string, data: DailyLogUpsert): Promise<DailyLog> => {
    const response = await api.put<DailyLog>(`/daily-logs/${logDate}`, data);
    return response.data;
  },

  delete: async (logDate: string): Promise<void> => {
    await api.delete(`/daily-logs/${logDate}`);
  },
};
