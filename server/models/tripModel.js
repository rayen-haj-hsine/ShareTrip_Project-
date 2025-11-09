import pool from "../db.js";

// Compute availability from confirmed bookings
const seatsAvailableExpr = `
  (t.total_seats - IFNULL(
    (SELECT SUM(b.seats) FROM bookings b WHERE b.trip_id = t.id AND b.status = 'Confirmed'),
    0
  )) AS seats_available
`;

export const getAllTrips = async () => {
  const [rows] = await pool.query(`
    SELECT t.id, t.driver_id, t.origin, t.destination, t.date_time, t.total_seats, t.price, t.status,
           ${seatsAvailableExpr},
           u.name AS driver_name
    FROM trips t
    JOIN users u ON t.driver_id = u.id
    ORDER BY t.date_time ASC
  `);
  return rows;
};

export const createTrip = async (trip) => {
  const driver_id   = trip.driver_id;
  const origin      = trip.origin ?? trip.departure;
  const destination = trip.destination;
  const date_time   = trip.date_time ?? trip.departure_time;
  const total_seats = trip.total_seats ?? trip.seats_total;
  const price       = trip.price;

  if (!driver_id || !origin || !destination || !date_time || !total_seats || price == null) {
    throw new Error("Missing required fields: driver_id, origin, destination, date_time, total_seats, price");
  }

  const [result] = await pool.query(
    `INSERT INTO trips (driver_id, origin, destination, date_time, price, total_seats)
     VALUES (?, ?, ?, ?, ?, ?)`,
    [driver_id, origin, destination, date_time, price, total_seats]
  );

  return await getTripById(result.insertId);
};

export const getTripById = async (id) => {
  const [rows] = await pool.query(`
    SELECT t.id, t.driver_id, t.origin, t.destination, t.date_time, t.total_seats, t.price, t.status,
           ${seatsAvailableExpr}
    FROM trips t
    WHERE t.id = ?
  `, [id]);
  return rows[0];
};

// ✅ NEW – how many seats already confirmed for a trip?
export const getConfirmedSeatsCount = async (tripId) => {
  const [rows] = await pool.query(
    "SELECT IFNULL(SUM(seats), 0) AS booked FROM bookings WHERE trip_id = ? AND status = 'Confirmed'",
    [tripId]
  );
  return Number(rows[0]?.booked || 0);
};

// ✅ NEW – patch fields; enforce total_seats ≥ confirmed seats
export const updateTripById = async (id, patch) => {
  const allowed = ["driver_id", "origin", "destination", "date_time", "price", "total_seats", "status"];
  const fields = [];
  const values = [];

  for (const key of allowed) {
    if (patch[key] !== undefined) {
      fields.push(`${key} = ?`);
      values.push(patch[key]);
    }
  }
  if (!fields.length) return await getTripById(id);

  if (patch.total_seats !== undefined) {
    const booked = await getConfirmedSeatsCount(id);
    if (Number(patch.total_seats) < booked) {
      throw new Error(`total_seats cannot be less than currently confirmed seats (${booked})`);
    }
  }

  values.push(id);
  await pool.query(`UPDATE trips SET ${fields.join(", ")} WHERE id = ?`, values);
  return await getTripById(id);
};

// ✅ NEW
export const deleteTripById = async (id) => {
  const [res] = await pool.query("DELETE FROM trips WHERE id = ?", [id]);
  return res.affectedRows > 0;
};

// Legacy: not supported because availability is derived
export const updateAvailableSeats = async () => {
  throw new Error("Not supported: seats are derived from bookings");
};