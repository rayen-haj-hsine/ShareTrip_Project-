import { api } from './api';
import type { Booking, BookingCreate } from '../Types';

export async function createBooking(payload: BookingCreate) {
  const { data } = await api.post<Booking>('/bookings', payload);
  return data;
}