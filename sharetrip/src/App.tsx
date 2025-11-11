import React from 'react';
import { BrowserRouter, Routes, Route, Navigate, useLocation } from 'react-router-dom';

import Header from './components/Header';
import NotificationsBar from './components/NotificationsBar';

import SearchTrips from './pages/SearchTrips';
import TripDetails from './pages/TripDetails';
import Login from './pages/Login';
import Register from './pages/Register';
import PublishTrip from './pages/PublishTrip';
import MyTrips from './pages/MyTrips';
import NotificationsPage from './pages/Notifications';
import AccountPage from './pages/Account';

import RequireAuth from './components/RequireAuth';
import UnauthedOnly from './components/UnauthedOnly';
import RequireDriver from './components/RequireDriver';

function Hero() {
  const { pathname } = useLocation();

  if (pathname === '/login') return null;
  if (pathname === '/register') return null;

  let title = '';
  let subtitle = '';

  if (pathname === '/') {
    title = 'Find a trip';
    subtitle = 'Search rides published by drivers and reserve your seat in seconds.';
  } else if (pathname.startsWith('/trip')) {
    title = 'Trip details';
    subtitle = 'View trip information and book your seat.';
  } else if (pathname.startsWith('/driver/publish')) {
    title = 'Publish a trip';
    subtitle = 'Create a new trip for passengers to book.';
  } else if (pathname.startsWith('/driver/my-trips')) {
    title = 'My trips';
    subtitle = 'Manage your published trips and notify passengers.';
  } else if (pathname.startsWith('/notifications')) {
    title = 'Notifications';
    subtitle = 'Stay updated about changes to your bookings and trips.';
  } else if (pathname.startsWith('/account')) {
    title = 'Account settings';
    subtitle = 'Update your profile or delete your account.';
  } else {
    title = 'TripShare';
    subtitle = 'Organize your travels easily.';
  }

  return (
    <section className="hero container fade-in">
      <h1>{title}</h1>
      <p>{subtitle}</p>
    </section>
  );
}

export default function App() {
  return (
    <BrowserRouter>
      <Header />
      <NotificationsBar />
      <Hero />

      <Routes>
        {/* HOME & Trips */}
        <Route
          path="/"
          element={
            <RequireAuth>
              <SearchTrips />
            </RequireAuth>
          }
        />
        <Route
          path="/trip/:id"
          element={
            <RequireAuth>
              <TripDetails />
            </RequireAuth>
          }
        />

        {/* Driver-only */}
        <Route
          path="/driver/publish"
          element={
            <RequireDriver>
              <PublishTrip />
            </RequireDriver>
          }
        />
        <Route
          path="/driver/my-trips"
          element={
            <RequireDriver>
              <MyTrips />
            </RequireDriver>
          }
        />

        {/* Notifications */}
        <Route
          path="/notifications"
          element={
            <RequireAuth>
              <NotificationsPage />
            </RequireAuth>
          }
        />

        {/* Account */}
        <Route
          path="/account"
          element={
            <RequireAuth>
              <AccountPage />
            </RequireAuth>
          }
        />

        {/* Auth */}
        <Route
          path="/login"
          element={
            <UnauthedOnly>
              <Login />
            </UnauthedOnly>
          }
        />
        <Route
          path="/register"
          element={
            <UnauthedOnly>
              <Register />
            </UnauthedOnly>
          }
        />

        {/* Fallback */}
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </BrowserRouter>
  );
}