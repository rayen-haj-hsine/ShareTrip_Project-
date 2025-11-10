// src/components/Header.tsx
import React from 'react';
import { Link } from 'react-router-dom';
import ThemeToggle from './ThemeToggle';

export default function Header() {
  return (
    <header className="header">
      <nav className="nav">
        <Link to="/" className="logo">
          <span className="logo-dot"></span>
          TripShare
        </Link>

        <div className="row">
          <a
            className="link"
            href="https://github.com/rayen-haj-hsine/ShareTrip_Project-"
            target="_blank"
            rel="noreferrer"
          >
            GitHub
          </a>
          <ThemeToggle />
        </div>
      </nav>
    </header>
  );
}
