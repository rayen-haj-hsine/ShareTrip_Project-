import React from 'react';
import { Link } from 'react-router-dom';
import type { Trip } from '../Types';
import { toNumber } from '../services/api';

function formatDateOnly(isoString: string) {
  const d = new Date(isoString);
  // Force to local date only
  return d.toLocaleDateString();
}

type Props = { trip: Trip };

export default function TripCard({ trip }: Props) {
  const available = toNumber(trip.seats_available);
  const price = typeof trip.price === 'string' ? Number(trip.price) : trip.price;

  return (
    <div className="card trip-card slide-up">
      <div className="trip-main">
        <div className="trip-title">{trip.origin} → {trip.destination}</div>
        <div className="trip-sub">
          {formatDateOnly(trip.date_time)}
          {trip.driver_name ? ` • Driver: ${trip.driver_name}` : ''}
        </div>
        <div className="mt-2">
          {available > 0
            ? <span className="badge success">{available} seats left</span>
            : <span className="badge danger">Sold out</span>}
        </div>
      </div>
      <div className="trip-actions" style={{ marginLeft: 'auto' }}>
        <div className="trip-price">{price} TND</div>
        <Link to={`/trip/${trip.id}`} className="btn">View details</Link>
      </div>
    </div>
  );
}