import React, { useEffect, useMemo, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { fetchTripById } from '../services/trips';
import type { Trip, Booking } from '../Types';
import { toNumber } from '../services/api';
import BookingForm from '../components/BookingForm';
import { getMyBooking, quitTrip } from '../services/bookings';

function formatDateOnly(isoString: string) {
  const d = new Date(isoString);
  return d.toLocaleDateString();
}

export default function TripDetails() {
  const { id } = useParams();
  const [trip, setTrip] = useState<Trip | null>(null);
  const [myBooking, setMyBooking] = useState<Booking | null>(null);
  const [loading, setLoading] = useState(false);
  const [bookingLoading, setBookingLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [bError, setBError] = useState<string | null>(null);

  const currentUser = useMemo(() => {
    try { return JSON.parse(localStorage.getItem('user') || 'null'); }
    catch { return null; }
  }, []);

  const isDriverOwnTrip = useMemo(() => {
    if (!trip || !currentUser?.id) return false;
    return trip.driver_id === currentUser.id;
  }, [trip, currentUser?.id]);

  async function load() {
    if (!id) return;
    setLoading(true); setError(null);
    try {
      const tripData = await fetchTripById(Number(id));
      setTrip(tripData);
    } catch (e: any) {
      setError(e?.response?.data?.message ?? e?.message ?? 'Failed to load trip');
    } finally {
      setLoading(false);
    }
  }

  async function loadMyBooking() {
    if (!id) return;
    setBError(null);
    try {
      const b = await getMyBooking(Number(id));
      setMyBooking(b);
    } catch (e: any) {
      setMyBooking(null);
      if (e?.response?.status && e.response.status !== 401) {
        setBError(e?.response?.data?.message ?? e?.message ?? 'Failed to load your booking');
      }
    }
  }

  useEffect(() => { load(); }, [id]);
  useEffect(() => { if (!isDriverOwnTrip) loadMyBooking(); else setMyBooking(null); }, [id, isDriverOwnTrip]);

  if (loading) return <section className="container"><div className="card">Loading…</div></section>;
  if (error)   return <section className="container"><div className="card"><span className="badge danger">Error</span> {error}</div></section>;
  if (!trip)   return <section className="container"><div className="card">Trip not found.</div></section>;

  const price = typeof trip.price === 'string' ? Number(trip.price) : trip.price;
  const available = toNumber(trip.seats_available);

  async function handleQuit() {
    if (!id) return;
    setBookingLoading(true); setBError(null);
    try {
      await quitTrip(Number(id));
      await loadMyBooking();
      await load();
    } catch (e: any) {
      setBError(e?.response?.data?.message ?? e?.response?.data?.error ?? e?.message ?? 'Failed to quit trip');
    } finally {
      setBookingLoading(false);
    }
  }

  return (
    <section className="container stack">
      <div className="row">
        <Link to="/" className="link">← Back</Link>
      </div>

      <div className="card slide-up">
        <div className="trip-card">
          <div className="trip-main">
            <div className="trip-title">{trip.origin} → {trip.destination}</div>
            <div className="trip-sub">
              {formatDateOnly(trip.date_time)}
              {trip.driver_name ? ` • Driver: ${trip.driver_name}` : ''}
            </div>
            <div className="mt-2"><span className="badge">Status: {trip.status}</span></div>
          </div>
          <div className="trip-actions" style={{ marginLeft: 'auto' }}>
            <div className="trip-price">{price} TND</div>
            {available > 0 ? (
              <span className="badge success">{available} seats</span>
            ) : (
              <span className="badge danger">Sold out</span>
            )}
          </div>
        </div>
      </div>

      {/* If it’s the driver’s own trip, show a note and hide booking/quit UI */}
      {isDriverOwnTrip ? (
        <div className="card slide-up">
          <span className="badge note">Note</span> You are the driver of this trip, so you can’t book it.
        </div>
      ) : myBooking ? (
        <div className="card stack slide-up">
          <h2 style={{ margin: 0 }}>Your booking</h2>
          <div className="row" style={{ gap: 10, alignItems: 'center', flexWrap: 'wrap' }}>
            <span className="badge">Seats: {myBooking.seats}</span>
            <span className="badge">Status: {myBooking.status}</span>
            {trip.driver_name && <span className="badge">Driver: {trip.driver_name}</span>}
            {currentUser?.name && <span className="badge">Passenger: {currentUser.name}</span>}
            <button className="btn ghost" onClick={handleQuit} disabled={bookingLoading}>
              {bookingLoading ? 'Cancelling…' : 'Quit trip'}
            </button>
          </div>
          {bError && <div className="badge danger">{bError}</div>}
        </div>
      ) : (
        <>
          {trip.status !== 'Published' ? (
            <div className="card slide-up">
              <span className="badge note">Note</span> This trip is not open for bookings.
            </div>
          ) : available <= 0 ? (
            <div className="card slide-up">
              <span className="badge danger">No seats available</span>
            </div>
          ) : (
            <BookingForm
              tripId={trip.id}
              onBooked={() => {
                load();
                loadMyBooking();
              }}
            />
          )}
          {bError && <div className="badge danger">{bError}</div>}
        </>
      )}
    </section>
  );
}