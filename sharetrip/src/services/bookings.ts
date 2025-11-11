import { api } from './api';
import type { Booking, BookingCreate } from '../Types';

export async function createBooking(payload: BookingCreate) {
  const { data } = await api.post<Booking>('/bookings', payload);
  return data;
}

/** NEW: get current user's booking for a trip (auth) */
export async function getMyBooking(tripId: number) {
  const { data } = await api.get<Booking | null>(`/trips/${tripId}/my-booking`);
  return data;
}

/** NEW: quit a trip (cancel current user's booking) (auth) */
export async function quitTrip(tripId: number) {
  const { data } = await api.post<Booking>(`/trips/${tripId}/quit`);
  return data;
}