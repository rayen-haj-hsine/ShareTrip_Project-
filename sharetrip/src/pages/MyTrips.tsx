import React, { useEffect, useMemo, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { fetchTrips } from '../services/trips';
import type { Trip } from '../Types';
import { api } from '../services/api';

function formatDateOnly(isoString: string) {
  const d = new Date(isoString);
  return d.toLocaleDateString();
}

export default function MyTrips() {
  const [trips, setTrips] = useState<Trip[]>([]);
  const [loading, setLoading] = useState(false);
  const [err, setErr] = useState<string | null>(null);
  const [actId, setActId] = useState<number | null>(null);

  const navigate = useNavigate();

  const currentUser = useMemo(() => {
    try { return JSON.parse(localStorage.getItem('user') || 'null') as { id: number; role: string; name: string } | null; }
    catch { return null; }
  }, []);

  const isDriver = currentUser?.role === 'driver';

  async function load() {
    if (!currentUser?.id) return;
    setLoading(true); setErr(null);
    try {
      const data = await fetchTrips({ driver_id: currentUser.id }); // server returns all statuses
      setTrips(data);
    } catch (e: any) {
      setErr(e?.response?.data?.error ?? e?.message ?? 'Failed to load trips');
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => { load(); }, [currentUser?.id]);

  async function deleteTrip(tripId: number) {
    if (!window.confirm("Delete this trip? Passengers will be notified.")) return;
    setActId(tripId);
    setErr(null);
    try {
      await api.delete(`/trips/${tripId}`); // backend: will verify ownership and notify passengers
      await load();
    } catch (e: any) {
      setErr(e?.response?.data?.message ?? e?.response?.data?.error ?? e?.message ?? 'Failed to delete trip');
    } finally {
      setActId(null);
    }
  }

  if (!isDriver) {
    return (
      <section className="container">
        <div className="card">Only drivers can access this page.</div>
      </section>
    );
  }

  return (
    <section className="container stack">
      <div className="row" style={{ justifyContent: 'space-between', alignItems: 'center' }}>
        <Link className="link" to="/">← Back</Link>
        <Link className="btn ghost" to="/driver/publish">Post a trip</Link>
      </div>

      <div className="card slide-up">
        <h2 style={{ margin: 0 }}>My trips</h2>
        {err && <div className="badge danger">{err}</div>}
        {loading ? (
          <div>Loading…</div>
        ) : trips.length === 0 ? (
          <div>No trips yet.</div>
        ) : (
          <div className="stack">
            {trips.map(t => (
              <div key={t.id} className="card" style={{ display: 'flex', gap: 12, alignItems: 'center', justifyContent: 'space-between' }}>
                <div>
                  <div style={{ fontWeight: 800 }}>{t.origin} → {t.destination}</div>
                  <div className="trip-sub">{formatDateOnly(t.date_time)} • Status: {t.status}</div>
                </div>
                <div className="row" style={{ gap: 8 }}>
                  <Link className="btn ghost" to={`/trip/${t.id}`}>View</Link>
                  <button className="btn" onClick={() => deleteTrip(t.id)} disabled={actId === t.id}>
                    {actId === t.id ? 'Deleting…' : 'Delete'}
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </section>
  );
}