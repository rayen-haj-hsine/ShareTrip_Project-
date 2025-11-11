import React from 'react';
import { Link, useNavigate } from 'react-router-dom';

export default function Header() {
  const navigate = useNavigate();
  const user = localStorage.getItem('user') ? JSON.parse(localStorage.getItem('user')!) : null;

  function logout() {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    navigate('/login');
  }

  return (
    <header className="header">
      <nav className="nav">
        <Link to="/" className="logo">
          <span className="logo-dot"></span>
          TripShare
        </Link>
        <div className="row">
          {user ? (
            <>
              <span className="badge">Hello, {user.name}</span>
              <button className="btn ghost" onClick={logout}>Logout</button>
            </>
          ) : (
            <>
              <Link to="/login" className="link">Login</Link>
              <Link to="/register" className="link">Register</Link>
            </>
          )}
        </div>
      </nav>
    </header>
  );
}