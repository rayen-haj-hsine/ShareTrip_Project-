import { api } from './api';
import type { Trip } from '../Types';

export async function fetchTrips(params?: {
  origin?: string;
  destination?: string;
  date?: string; // YYYY-MM-DD
  status?: 'Draft' | 'Published' | 'Cancelled';
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

// NEW: create a trip (auth + driver only). driver_id is taken from token on the server.
export async function createTrip(payload: {
  origin: string;
  destination: string;
  date_time: string;   // 'YYYY-MM-DD HH:mm:ss'
  total_seats: number;
  price: number;
  status?: 'Draft' | 'Published' | 'Cancelled';
}) {
  const { data } = await api.post<Trip>('/trips', payload);
  return data;
}