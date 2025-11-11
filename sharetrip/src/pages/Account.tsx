import React, { useEffect, useState } from 'react';
import { getMe, updateMe, deleteMe, Me } from '../services/users';
import { Link, useNavigate } from 'react-router-dom';

export default function AccountPage() {
  const [me, setMe] = useState<Me | null>(null);
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [password, setPassword] = useState(''); // optional change

  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [err, setErr] = useState<string | null>(null);
  const [msg, setMsg] = useState<string | null>(null);

  const navigate = useNavigate();

  async function load() {
    setLoading(true); setErr(null);
    try {
      const data = await getMe();
      setMe(data);
      setName(data.name ?? '');
      setEmail(data.email ?? '');
      setPhone(data.phone ?? '');
    } catch (e: any) {
      setErr(e?.response?.data?.message ?? e?.response?.data?.error ?? e?.message ?? 'Failed to load account');
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => { load(); }, []);

  async function save(e: React.FormEvent) {
    e.preventDefault();
    setSaving(true); setErr(null); setMsg(null);
    try {
      const payload: any = { name, email, phone };
      if (password.trim()) payload.password = password;
      const updated = await updateMe(payload);
      setMe(updated);
      setPassword('');
      // refresh localStorage user copy (name may have changed)
      const raw = localStorage.getItem('user');
      if (raw) {
        const u = JSON.parse(raw);
        u.name = updated.name;
        u.role = updated.role;
        localStorage.setItem('user', JSON.stringify(u));
      }
      setMsg('Account updated');
    } catch (e: any) {
      setErr(e?.response?.data?.message ?? e?.response?.data?.error ?? e?.message ?? 'Failed to save');
    } finally {
      setSaving(false);
    }
  }

  async function deleteAccount() {
    if (!window.confirm("This will permanently delete your account. Continue?")) return;
    setDeleting(true); setErr(null); setMsg(null);
    try {
      await deleteMe();
      // logout
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      navigate('/register', { replace: true });
    } catch (e: any) {
      setErr(e?.response?.data?.message ?? e?.response?.data?.error ?? e?.message ?? 'Failed to delete account');
    } finally {
      setDeleting(false);
    }
  }

  if (loading) return <section className="container"><div className="card">Loading…</div></section>;
  if (err && !me) return <section className="container"><div className="card"><span className="badge danger">Error</span> {err}</div></section>;

  return (
    <section className="container stack">
      <div className="row" style={{ justifyContent: 'space-between', alignItems: 'center' }}>
        <Link className="link" to="/">← Back</Link>
        <span className="badge">Role: {me?.role}</span>
      </div>

      <form onSubmit={save} className="card stack slide-up">
        <h2 style={{ margin: 0 }}>Account</h2>

        <div className="grid" style={{ gridTemplateColumns: '1fr 1fr' }}>
          <div>
            <div className="trip-sub">Name</div>
            <input className="input" value={name} onChange={(e) => setName(e.target.value)} />
          </div>
          <div>
            <div className="trip-sub">Email</div>
            <input className="input" type="email" value={email} onChange={(e) => setEmail(e.target.value)} />
          </div>
          <div>
            <div className="trip-sub">Phone</div>
            <input className="input" value={phone} onChange={(e) => setPhone(e.target.value)} />
          </div>
          <div>
            <div className="trip-sub">New password (optional)</div>
            <input className="input" type="password" value={password} onChange={(e) => setPassword(e.target.value)} />
          </div>
        </div>

        <div className="row" style={{ gap: 8 }}>
          <button className="btn" type="submit" disabled={saving}>{saving ? 'Saving…' : 'Save changes'}</button>
          <button className="btn ghost" type="button" onClick={load}>Reset</button>
          <button className="btn" type="button" onClick={deleteAccount} disabled={deleting}>
            {deleting ? 'Deleting…' : 'Delete account'}
          </button>
        </div>

        {msg && <div className="badge success">{msg}</div>}
        {err && <div className="badge danger">{err}</div>}
      </form>
    </section>
  );
}