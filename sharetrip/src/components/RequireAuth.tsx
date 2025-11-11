import React from 'react';
import { Navigate, useLocation } from 'react-router-dom';

/**
 * Wrap any protected page with <RequireAuth>...</RequireAuth>
 * If there is no token, redirect to /login and remember where the user came from.
 */
export default function RequireAuth({ children }: { children: React.ReactElement }) {
  const hasToken = !!localStorage.getItem('token');
  const location = useLocation();

  if (!hasToken) {
    return <Navigate to="/login" replace state={{ from: location }} />;
  }
  return children;
}