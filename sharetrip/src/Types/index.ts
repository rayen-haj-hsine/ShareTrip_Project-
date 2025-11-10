export type TripStatus = 'Draft' | 'Published' | 'Cancelled';
export type BookingStatus = 'Confirmed' | 'Cancelled';

export interface Trip {
  id: number;
  driver_id: number;
  origin: string;
  destination: string;
  date_time: string; // ISO string from backend
  total_seats: number;
  price: number | string; // MySQL DECIMAL could be string
  status: TripStatus;
  seats_available: number | string; // could be numeric string
  driver_name?: string;
}

export interface TripCreate {
  driver_id: number;
  origin: string;
  destination: string;
  date_time: string;      // "YYYY-MM-DD HH:mm:ss"
  total_seats: number;
  price: number;
  status?: TripStatus;
}

export interface Booking {
  id: number;
  trip_id: number;
  passenger_id: number;
  seats: number;
  is_paid: 0 | 1 | boolean;
  status: BookingStatus;
  created_at: string;
  passenger_name?: string;
  origin?: string;
  destination?: string;
  date_time?: string;
}

export interface BookingCreate {
  trip_id: number;
  passenger_id: number;
  seats: number;
}