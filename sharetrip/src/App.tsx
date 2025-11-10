import React from 'react';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import SearchTrips from './pages/SearchTrips';
import TripDetails from './pages/TripDetails';
import Header from './components/Header';

export default function App() {
  return (
    <BrowserRouter>
      <Header />
      <section className="hero container fade-in">
        <h1>Find a trip</h1>
        <p>Search rides published by drivers and reserve your seat in seconds.</p>
      </section>
      <Routes>
        <Route path="/" element={<SearchTrips />} />
        <Route path="/trip/:id" element={<TripDetails />} />
      </Routes>
    </BrowserRouter>
  );
}