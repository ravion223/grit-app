import api from './client';
import type { SessionCreate, SessionUpdate, TimeSession } from '../types';

export interface GetSessionsParams {
  category_id?: number;
  limit?: number;
  offset?: number;
}

export const sessionsApi = {
  getAll: async (params?: GetSessionsParams): Promise<TimeSession[]> => {
    const response = await api.get<TimeSession[]>('/sessions/', { params });
    return response.data;
  },

  getActive: async (): Promise<TimeSession | null> => {
    const response = await api.get<TimeSession | null>('/sessions/active');
    return response.data;
  },

  getById: async (id: number): Promise<TimeSession> => {
    const response = await api.get<TimeSession>(`/sessions/${id}`);
    return response.data;
  },

  start: async (data: SessionCreate): Promise<TimeSession> => {
    const response = await api.post<TimeSession>('/sessions/start', data);
    return response.data;
  },

  stop: async (): Promise<TimeSession> => {
    const response = await api.put<TimeSession>('/sessions/stop');
    return response.data;
  },

  update: async (id: number, data: SessionUpdate): Promise<TimeSession> => {
    const response = await api.put<TimeSession>(`/sessions/${id}`, data);
    return response.data;
  },

  delete: async (id: number): Promise<void> => {
    await api.delete(`/sessions/${id}`);
  },
};
