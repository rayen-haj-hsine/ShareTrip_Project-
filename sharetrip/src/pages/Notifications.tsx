import React, { useEffect, useState } from 'react';
import { fetchMyNotifications, markAllNotificationsRead, Notification } from '../services/notifications';
import { Link } from 'react-router-dom';

export default function NotificationsPage() {
  const [items, setItems] = useState<Notification[]>([]);
  const [loading, setLoading] = useState(false);
  const [err, setErr] = useState<string | null>(null);
  const [marking, setMarking] = useState(false);

  async function load() {
    setLoading(true); setErr(null);
    try {
      const list = await fetchMyNotifications();
      setItems(list);
    } catch (e: any) {
      setErr(e?.response?.data?.error ?? e?.message ?? 'Failed to load notifications');
    } finally {
      setLoading(false);
    }
  }

  async function markAll() {
    setMarking(true);
    try {
      await markAllNotificationsRead();
      await load();
    } catch (e: any) {
      setErr(e?.response?.data?.error ?? e?.message ?? 'Failed to mark notifications');
    } finally {
      setMarking(false);
    }
  }

  useEffect(() => { load(); }, []);

  return (
    <section className="container stack">
      <div className="row" style={{ justifyContent: 'space-between', alignItems: 'center' }}>
        <Link className="link" to="/">← Back</Link>
        <div className="row" style={{ gap: 8 }}>
          <button className="btn ghost" onClick={load} disabled={loading}>Refresh</button>
          <button className="btn" onClick={markAll} disabled={marking || items.length === 0}>
            {marking ? 'Marking…' : 'Mark all read'}
          </button>
        </div>
      </div>

      <div className="card slide-up">
        <h2 style={{ margin: 0 }}>Notifications</h2>
        {err && <div className="badge danger">{err}</div>}
        {loading ? (
          <div>Loading…</div>
        ) : items.length === 0 ? (
          <div>No new notifications.</div>
        ) : (
          <ul style={{ margin: 0, paddingLeft: 18 }}>
            {items.map(n => (
              <li key={n.id}>
                {n.message} <span className="trip-sub">({new Date(n.created_at).toLocaleString()})</span>
              </li>
            ))}
          </ul>
        )}
      </div>
    </section>
  );
}