import { api } from './api';

export interface Me {
  id: number;
  name: string;
  email: string;
  phone: string | null;
  role: 'driver' | 'passenger';
  created_at: string;
}

export async function getMe(): Promise<Me> {
  const { data } = await api.get<Me>('/users/me');
  return data;
}

export async function updateMe(payload: {
  name?: string;
  email?: string;
  phone?: string;
  password?: string; // optional; if provided it will be updated
}): Promise<Me> {
  const { data } = await api.put<Me>('/users/me', payload);
  return data;
}

export async function deleteMe(): Promise<{ message: string }> {
  const { data } = await api.delete<{ message: string }>('/users/me');
  return data;
}