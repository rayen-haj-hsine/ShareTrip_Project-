import React, { useState } from 'react';
import { createBooking } from '../services/bookings';

type Props = {
  tripId: number;
  defaultPassengerId?: number;
  onBooked?: () => void;
};

export default function BookingForm({ tripId, defaultPassengerId = 8, onBooked }: Props) {
  const [seats, setSeats] = useState(1);
  const [passengerId, setPassengerId] = useState(defaultPassengerId);
  const [loading, setLoading] = useState(false);
  const [msg, setMsg] = useState<string | null>(null);
  const [err, setErr] = useState<string | null>(null);

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true); setErr(null); setMsg(null);
    try {
      await createBooking({ trip_id: tripId, passenger_id: passengerId, seats });
      setMsg('Booking created!');
      onBooked?.();
    } catch (e: any) {
      const m = e?.response?.data?.message || e?.response?.data?.error || e?.message || 'Failed to book';
      setErr(m);
    } finally {
      setLoading(false);
    }
  }

  return (
    <form onSubmit={submit} className="card stack">
      <h2 style={{ margin: 0 }}>Reserve seats</h2>
      <div className="grid" style={{ gridTemplateColumns: '1fr 1fr 1fr' }}>
        <div>
          <div className="trip-sub">Passenger ID</div>
          <input type="number" className="input" min={1}
                 value={passengerId} onChange={(e) => setPassengerId(Number(e.target.value))} />
        </div>
        <div>
          <div className="trip-sub">Seats</div>
          <input type="number" className="input" min={1}
                 value={seats} onChange={(e) => setSeats(Number(e.target.value))} />
        </div>
        <div style={{ alignSelf: 'end' }}>
          <button type="submit" className="btn" disabled={loading}>
            {loading ? 'Booking…' : 'Book'}
          </button>
        </div>
      </div>

      {msg && <div className="badge success">{msg}</div>}
      {err && <div className="badge danger">{err}</div>}
    </form>
  );
}