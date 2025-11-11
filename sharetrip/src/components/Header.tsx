import React, { useEffect, useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import ThemeToggle from './ThemeToggle';
import { fetchMyNotifications } from '../services/notifications';

type UserLite = { id: number; name: string; role: string } | null;

export default function Header() {
  const [user, setUser] = useState<UserLite>(null);
  const [unread, setUnread] = useState(0);
  const navigate = useNavigate();
  const location = useLocation();

  async function refreshUser() {
    try {
      const raw = localStorage.getItem('user');
      setUser(raw ? JSON.parse(raw) : null);
    } catch {
      setUser(null);
    }
  }

  async function refreshUnread() {
    if (!localStorage.getItem('token')) {
      setUnread(0);
      return;
    }
    try {
      const list = await fetchMyNotifications();
      setUnread(list.length);
    } catch {
      setUnread(0);
    }
  }

  useEffect(() => {
    // update on route change
    refreshUser();
    refreshUnread();
    // also update when tab gains focus
    const onVis = () => { if (document.visibilityState === 'visible') refreshUnread(); };
    document.addEventListener('visibilitychange', onVis);
    return () => document.removeEventListener('visibilitychange', onVis);
  }, [location.pathname]);

  function logout() {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    setUser(null);
    setUnread(0);
    navigate('/login', { replace: true });
  }

  return (
    <header className="header">
      <nav className="nav">
        <Link to="/" className="logo">
          <span className="logo-dot"></span>
          TripShare
        </Link>

        <div className="row" style={{ gap: 8, alignItems: 'center' }}>
          

          {user ? (
            <div className="row" style={{ gap: 8, alignItems: 'center' }}>
              {/* Bell / notifications */}
              <Link to="/notifications" className="btn ghost" title="Notifications" aria-label="Notifications">
                <span style={{ position: 'relative', display: 'inline-flex', alignItems: 'center', gap: 6 }}>
                  {/* bell icon */}
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
                    <path d="M12 2a6 6 0 00-6 6v3.586l-1.707 1.707A1 1 0 005 15h14a1 1 0 00.707-1.707L18 11.586V8a6 6 0 00-6-6zm0 20a3 3 0 01-3-3h6a3 3 0 01-3 3z"/>
                  </svg>
                  {unread > 0 && (
                    <span
                      className="badge"
                      style={{
                        padding: '2px 6px',
                        borderRadius: 999,
                        fontSize: 12,
                        fontWeight: 800
                      }}
                    >
                      {unread}
                    </span>
                  )}
                </span>
              </Link>

              {/* Driver quick links */}
              {user.role === 'driver' && (
                <>
                  <Link className="btn ghost" to="/driver/publish">Post a trip</Link>
                  <Link className="btn ghost" to="/driver/my-trips">My trips</Link>
                </>
              )}

              <Link className="btn ghost" to="/account">Account</Link>
              <span className="badge">Hi, {user.name}</span>
              <button className="btn ghost" onClick={logout}>Logout</button>
            </div>
          ) : (
            <div className="row" style={{ gap: 8 }}>
              <Link className="btn ghost" to="/login">Login</Link>
              <Link className="btn" to="/register">Register</Link>
            </div>
          )}

          <ThemeToggle />
        </div>
      </nav>
    </header>
  );
}