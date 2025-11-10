import React, { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { fetchTripById } from '../services/trips';
import type { Trip } from '../Types';
import { toNumber } from '../services/api';
import BookingForm from '../components/BookingForm';

export default function TripDetails() {
  const { id } = useParams();
  const [trip, setTrip] = useState<Trip | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function load() {
    if (!id) return;
    setLoading(true); setError(null);
    try {
      const data = await fetchTripById(Number(id));
      setTrip(data);
    } catch (e: any) {
      setError(e?.response?.data?.message || e?.message || 'Failed to load trip');
    } finally {
      setLoading(false);
    }
  }
  useEffect(() => { load(); }, [id]);

  if (loading) return <section className="container"><div className="card">Loading…</div></section>;
  if (error)   return <section className="container"><div className="card"><span className="badge danger">Error</span>&nbsp;{error}</div></section>;
  if (!trip)   return <section className="container"><div className="card">Trip not found.</div></section>;

  const price = typeof trip.price === 'string' ? Number(trip.price) : trip.price;
  const available = toNumber(trip.seats_available);

  return (
    <section className="container stack">
      <div className="row">
        <Link to="/" className="link">← Back</Link>
      </div>

      <div className="card">
        <div className="trip-card">
          <div className="trip-main">
            <div className="trip-title">{trip.origin} → {trip.destination}</div>
            <div className="trip-sub">
              {new Date(trip.date_time).toLocaleString()} {trip.driver_name ? `• Driver: ${trip.driver_name}` : ''}
            </div>
            <div className="mt-2">
              <span className="badge">Status: {trip.status}</span>
            </div>
          </div>

          <div className="trip-actions" style={{ marginLeft: 'auto' }}>
            <div className="trip-price">{price} TND</div>
            {available > 0
              ? <span className="badge success">{available} seats</span>
              : <span className="badge danger">Sold out</span>}
          </div>
        </div>
      </div>

      {trip.status !== 'Published'
        ? <div className="card"><span className="badge note">Note</span>&nbsp;This trip is not open for bookings.</div>
        : available <= 0
          ? <div className="card"><span className="badge danger">No seats available</span></div>
          : <BookingForm tripId={trip.id} defaultPassengerId={8} onBooked={() => load()} />
      }
    </section>
  );
}