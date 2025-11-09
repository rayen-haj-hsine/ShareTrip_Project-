import { useEffect, useState } from 'react';
import api from '../services/api';

interface Trip {
  id: number;
  origin: string;
  destination: string;
  price: number;
  date_time: string;
}

export default function Trips() {
  const [trips, setTrips] = useState<Trip[]>([]);

  useEffect(() => {
    api.get('/trips')
      .then(res => setTrips(res.data))
      .catch(err => console.error(err));
  }, []);

  return (
    <div>
      <h1>Available Trips</h1>
      <ul>
        {trips.map(trip => (
          <li key={trip.id}>
            {trip.origin} → {trip.destination} | {trip.price} TND
          </li>
        ))}
      </ul>
    </div>
  );
}
