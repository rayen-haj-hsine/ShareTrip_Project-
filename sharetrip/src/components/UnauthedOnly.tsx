import React from 'react';
import { Navigate } from 'react-router-dom';

/**
 * For pages like /login and /register.
 * If already logged in, redirect to home ("/").
 */
export default function UnauthedOnly({ children }: { children: React.ReactElement }) {
  const hasToken = !!localStorage.getItem('token');
  if (hasToken) {
    return <Navigate to="/" replace />;
  }
  return children;
}