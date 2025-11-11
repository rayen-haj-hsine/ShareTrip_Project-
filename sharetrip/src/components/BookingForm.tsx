import React, { useMemo, useState } from 'react';
import { createBooking } from '../services/bookings';

type Props = {
  tripId: number;
  onBooked?: () => void;
};

export default function BookingForm({ tripId, onBooked }: Props) {
  // Read the logged-in user from localStorage (set by Login page)
  const currentUser = useMemo(() => {
    try {
      return JSON.parse(localStorage.getItem('user') || 'null') as { id: number; name?: string } | null;
    } catch {
      return null;
    }
  }, []);

  const [seats, setSeats] = useState(1);
  const [loading, setLoading] = useState(false);
  const [msg, setMsg] = useState<string | null>(null);
  const [err, setErr] = useState<string | null>(null);

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setErr(null);
    setMsg(null);

    try {
      if (!currentUser?.id) {
        setErr('You need to be logged in to book.');
        return;
      }
      await createBooking({ trip_id: tripId, passenger_id: currentUser.id, seats });
      setMsg('Booking created!');
      onBooked?.();
    } catch (e: any) {
      const m =
        e?.response?.data?.message ??
        e?.response?.data?.error ??
        e?.message ??
        'Failed to book';
      setErr(m);
    } finally {
      setLoading(false);
    }
  }

  return (
    <form onSubmit={submit} className="card stack slide-up">
      <h2 style={{ margin: 0 }}>Reserve seats</h2>

      {!currentUser?.id && (
        <div className="badge note">
          <a>You are not logged in. /loginLogin</a> to book.
        </div>
      )}

      <div className="grid" style={{ gridTemplateColumns: '1fr 1fr' }}>
        {/* Passenger ID is no longer shown. If you still want to display who is booking, use a read-only badge: */}
        {/* <div>
          <div className="trip-sub">Passenger</div>
          <div className="badge">{currentUser?.name ?? `User #${currentUser?.id ?? '—'}`}</div>
        </div> */}

        <div>
          <div className="trip-sub">Seats</div>
          <input
            type="number"
            className="input"
            min={1}
            value={seats}
            onChange={(e) => setSeats(Number(e.target.value))}
          />
        </div>

        <div style={{ alignSelf: 'end' }}>
          <button type="submit" className="btn" disabled={loading || !currentUser?.id}>
            {loading ? 'Booking…' : 'Book'}
          </button>
        </div>
      </div>

      {msg && <div className="badge success">{msg}</div>}
      {err && <div className="badge danger">{err}</div>}
    </form>
  );
}