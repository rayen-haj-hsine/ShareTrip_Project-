import { api } from './api';

export interface Notification {
  id: number;
  message: string;
  is_read: 0 | 1;
  created_at: string;
}

export async function fetchMyNotifications(): Promise<Notification[]> {
  const { data } = await api.get<Notification[]>('/notifications/my');
  return data;
}

export async function markAllNotificationsRead(): Promise<{ updated: number }> {
  const { data } = await api.post<{ updated: number }>('/notifications/read-all');
  return data;
}