import React, { useEffect, useMemo, useState } from 'react';
import { fetchTrips } from '../services/trips';
import type { Trip } from '../Types';
import TripCard from '../components/TripCard';

export default function SearchTrips() {
  const [origin, setOrigin] = useState('');
  const [destination, setDestination] = useState('');
  const [date, setDate] = useState('');
  const [minSeats, setMinSeats] = useState<number | ''>('');
  const [loading, setLoading] = useState(false);
  const [trips, setTrips] = useState<Trip[]>([]);
  const [error, setError] = useState<string | null>(null);

  const currentUser = useMemo(() => {
    try { return JSON.parse(localStorage.getItem('user') || 'null') as { id: number; role: string; name: string } | null; }
    catch { return null; }
  }, []);

  async function load() {
    setLoading(true); setError(null);
    try {
      const params: any = {};
      if (origin.trim()) params.origin = origin.trim();
      if (destination.trim()) params.destination = destination.trim();
      if (date) params.date = date;
      if (minSeats !== '' && Number(minSeats) >= 0) params.minSeats = Number(minSeats);

      const data = await fetchTrips(params);
      setTrips(data);
    } catch (e: any) {
      setError(e?.response?.data?.error ?? e?.message ?? 'Failed to load trips');
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => { load(); }, []);

  // Hide the driver's own trips from the list (driver can book other trips)
  const visibleTrips = useMemo(() => {
    if (!currentUser?.id) return trips;
    return trips.filter(t => t.driver_id !== currentUser.id);
  }, [trips, currentUser?.id]);

  return (
    <section className="container stack">
      <div className="card slide-up">
        <div className="grid">
          <input className="input" placeholder="Origin" value={origin} onChange={e => setOrigin(e.target.value)} />
          <input className="input" placeholder="Destination" value={destination} onChange={e => setDestination(e.target.value)} />
          <input className="input" type="date" value={date} onChange={e => setDate(e.target.value)} />
          <input
            className="input" type="number" min={0} placeholder="Min seats"
            value={minSeats}
            onChange={e => setMinSeats(e.target.value === '' ? '' : Number(e.target.value))}
          />
        </div>
        <div className="row" style={{ gap: 10, marginTop: 10 }}>
          <button onClick={load} className="btn">Search</button>
          <button
            onClick={() => { setOrigin(''); setDestination(''); setDate(''); setMinSeats(''); load(); }}
            className="btn ghost"
          >
            Reset
          </button>
        </div>
      </div>

      {loading && <div className="card slide-up">Loading…</div>}
      {error && <div className="card slide-up"><span className="badge danger">Error</span> {error}</div>}
      {!loading && !error && visibleTrips.length === 0 && <div className="card slide-up">No trips found.</div>}

      <div className="stack stagger">
        {visibleTrips.map(t => <TripCard key={t.id} trip={t} />)}
      </div>
    </section>
  );
}