import React, { useState } from 'react';
import { api } from '../services/api';
import { useNavigate, Link } from 'react-router-dom';

export default function Register() {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [password, setPassword] = useState('');
  const [role, setRole] = useState<'driver' | 'passenger'>('passenger');

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const navigate = useNavigate();

  async function handleRegister(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError(null);
    try {
      await api.post('/auth/register', { name, email, phone, password, role });
      navigate('/login', { replace: true });
    } catch (err: any) {
      setError(err?.response?.data?.message ?? 'Registration failed');
    } finally {
      setLoading(false);
    }
  }

  return (
    <section className="container stack">
      <form onSubmit={handleRegister} className="card stack slide-up">
        <h2>Register</h2>

        <input
          className="input"
          placeholder="Name"
          value={name}
          onChange={(e) => setName(e.target.value)}
          required
          autoComplete="name"
        />

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
          placeholder="Phone"
          value={phone}
          onChange={(e) => setPhone(e.target.value)}
          autoComplete="tel"
        />

        <input
          className="input"
          type="password"
          placeholder="Password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          required
          autoComplete="new-password"
        />

        <select
          className="input"
          value={role}
          onChange={(e) => setRole(e.target.value as 'driver' | 'passenger')}
        >
          <option value="passenger">Passenger</option>
          <option value="driver">Driver</option>
        </select>

        <button className="btn" type="submit" disabled={loading}>
          {loading ? 'Registering…' : 'Register'}
        </button>

        {error && <div className="badge danger">{error}</div>}

        <div className="row" style={{ gap: 8 }}>
          <span className="trip-sub">Already have an account?</span>
          <Link className="link" to="/login">Login</Link>
        </div>
      </form>
    </section>
  );
}