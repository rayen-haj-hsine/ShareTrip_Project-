import React, { useEffect, useMemo, useState } from 'react';
import { fetchMyNotifications, markAllNotificationsRead, Notification } from '../services/notifications';

export default function NotificationsBar() {
  const [items, setItems] = useState<Notification[]>([]);
  const [loading, setLoading] = useState(false);
  const [dismissed, setDismissed] = useState(false);

  const loggedIn = useMemo(() => !!localStorage.getItem('token'), []);

  async function load() {
    if (!loggedIn) return;
    setLoading(true);
    try {
      const list = await fetchMyNotifications();
      setItems(list);
    } catch {
      // ignore
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => { load(); }, []);

  if (!loggedIn || dismissed || loading) return null;
  if (!items || items.length === 0) return null;

  async function dismiss() {
    setDismissed(true);
    try { await markAllNotificationsRead(); } catch { /* ignore */ }
  }

  return (
    <div className="container">
      <div className="card slide-up" style={{ background: 'rgba(255, 210, 122, .06)' }}>
        <div className="row" style={{ justifyContent: 'space-between', alignItems: 'center', gap: 12 }}>
          <div className="stack">
            <div style={{ fontWeight: 800 }}>Notifications</div>
            <ul style={{ margin: 0, paddingLeft: 18 }}>
              {items.map(n => <li key={n.id}>{n.message}</li>)}
            </ul>
          </div>
          <button className="btn ghost" onClick={dismiss}>Dismiss</button>
        </div>
      </div>
    </div>
  );
}