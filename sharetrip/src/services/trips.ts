import { api } from './api';
import type { Trip } from '../Types';

export async function fetchTrips(params?: {
  origin?: string;
  destination?: string;
  date?: string;      // YYYY-MM-DD
  status?: 'Draft'|'Published'|'Cancelled';
  driver_id?: number;
  minSeats?: number;
}) {
  const { data } = await api.get<Trip[]>('/trips', { params });
  return data;
}

export async function fetchTripById(id: number) {
  const { data } = await api.get<Trip>(`/trips/${id}`);
  return data;
}