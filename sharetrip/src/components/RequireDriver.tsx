import React from 'react';
import { Navigate, useLocation } from 'react-router-dom';

export default function RequireDriver({ children }: { children: React.ReactElement }) {
  const raw = localStorage.getItem('user');
  let role: string | null = null;
  try { role = raw ? (JSON.parse(raw)?.role ?? null) : null; } catch { role = null; }

  const location = useLocation();
  const hasToken = !!localStorage.getItem('token');
  if (!hasToken) {
    return <Navigate to="/login" replace state={{ from: location }} />;
  }
  if (role !== 'driver') {
    return <Navigate to="/" replace />;
  }
  return children;
}