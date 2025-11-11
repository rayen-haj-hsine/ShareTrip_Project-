import React, { useState } from 'react';
import { createTrip } from '../services/trips';
import { Link, useNavigate } from 'react-router-dom';

function toDateAtMidnight(dateOnly: string): string {
  // Input: 'YYYY-MM-DD'  -> Output: 'YYYY-MM-DD 00:00:00'
  if (!dateOnly) return '';
  return `${dateOnly} 00:00:00`;
}

export default function PublishTrip() {
  const [origin, setOrigin] = useState('');
  const [destination, setDestination] = useState('');
  const [dateOnly, setDateOnly] = useState(''); // <-- date only
  const [price, setPrice] = useState<number | ''>('');
  const [totalSeats, setTotalSeats] = useState<number | ''>('');
  const [status, setStatus] = useState<'Draft' | 'Published' | 'Cancelled'>('Published');

  const [loading, setLoading] = useState(false);
  const [msg, setMsg] = useState<string | null>(null);
  const [err, setErr] = useState<string | null>(null);

  const navigate = useNavigate();

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true); setErr(null); setMsg(null);

    try {
      if (!origin.trim() || !destination.trim() || !dateOnly || price === '' || totalSeats === '') {
        setErr('All fields are required.');
        setLoading(false);
        return;
      }
      const payload = {
        origin: origin.trim(),
        destination: destination.trim(),
        date_time: toDateAtMidnight(dateOnly), // store as midnight
        price: Number(price),
        total_seats: Number(totalSeats),
        status
      };
      const trip = await createTrip(payload);
      setMsg('Trip published!');
      navigate(`/trip/${trip.id}`, { replace: true });
    } catch (e: any) {
      const m = e?.response?.data?.message ?? e?.response?.data?.error ?? e?.message ?? 'Failed to publish trip';
      setErr(m);
    } finally {
      setLoading(false);
    }
  }

  return (
    <section className="container stack">
      <div className="row">
        <Link className="link" to="/">← Back</Link>
      </div>

      <form onSubmit={submit} className="card stack slide-up">
        <h2 style={{ margin: 0 }}>Post a trip</h2>

        <div className="grid" style={{ gridTemplateColumns: '1fr 1fr' }}>
          <div>
            <div className="trip-sub">Origin</div>
            <input className="input" value={origin} onChange={(e) => setOrigin(e.target.value)} placeholder="e.g. Tunis" />
          </div>
          <div>
            <div className="trip-sub">Destination</div>
            <input className="input" value={destination} onChange={(e) => setDestination(e.target.value)} placeholder="e.g. Sfax" />
          </div>
          <div>
            <div className="trip-sub">Date</div>
            <input className="input" type="date" value={dateOnly} onChange={(e) => setDateOnly(e.target.value)} />
          </div>
          <div>
            <div className="trip-sub">Price (TND)</div>
            <input className="input" type="number" min={0} step="0.01"
                   value={price} onChange={(e) => setPrice(e.target.value === '' ? '' : Number(e.target.value))} />
          </div>
          <div>
            <div className="trip-sub">Total seats</div>
            <input className="input" type="number" min={1}
                   value={totalSeats} onChange={(e) => setTotalSeats(e.target.value === '' ? '' : Number(e.target.value))} />
          </div>
          <div>
            <div className="trip-sub">Status</div>
            <select className="input" value={status} onChange={(e) => setStatus(e.target.value as any)}>
              <option value="Published">Published</option>
              <option value="Draft">Draft</option>
              <option value="Cancelled">Cancelled</option>
            </select>
          </div>
        </div>

        <button className="btn" type="submit" disabled={loading}>
          {loading ? 'Publishing…' : 'Publish'}
        </button>

        {msg && <div className="badge success">{msg}</div>}
        {err && <div className="badge danger">{err}</div>}
      </form>
    </section>
  );
}