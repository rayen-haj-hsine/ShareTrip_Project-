import React, { useState } from 'react';
import { api } from '../services/api';
import { useNavigate, useLocation, Link } from 'react-router-dom';

type LocationState = { from?: { pathname?: string } } | null;

export default function Login() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const navigate = useNavigate();
  const location = useLocation();
  const state = (location.state as LocationState) ?? null;
  const redirectTo = state?.from?.pathname ?? '/';

  async function handleLogin(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError(null);
    try {
      const { data } = await api.post('/auth/login', { email, password });
      localStorage.setItem('token', data.token);
      localStorage.setItem('user', JSON.stringify(data.user));
      navigate(redirectTo, { replace: true });
    } catch (err: any) {
      const msg =
        err?.response?.data?.message ??
        err?.response?.data?.error ??
        'Login failed';
      setError(msg);
    } finally {
      setLoading(false);
    }
  }

  return (
    <section className="container stack">
      <form onSubmit={handleLogin} className="card stack slide-up">
        <h2>Login</h2>

        <input
          className="input"
          type="email"
          placeholder="Email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          required
          autoComplete="email"
        />
        <input
          className="input"
          type="password"
          placeholder="Password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          required
          autoComplete="current-password"
        />

        <button className="btn" type="submit" disabled={loading}>
          {loading ? 'Logging in…' : 'Login'}
        </button>

        {error && <div className="badge danger">{error}</div>}

        <div className="row" style={{ gap: 8 }}>
          <span className="trip-sub">New here?</span>
          <Link className="link" to="/register">Create an account</Link>
        </div>
      </form>
    </section>
  );
}