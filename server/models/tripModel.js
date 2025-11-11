// server/models/tripModel.js
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
  const status      = trip.status ?? "Published";

  if (!driver_id || !origin || !destination || !date_time || !total_seats || price == null) {
    throw new Error("Missing required fields: driver_id, origin, destination, date_time, total_seats, price");
  }

  const [result] = await pool.query(
    `INSERT INTO trips (driver_id, origin, destination, date_time, price, total_seats, status)
     VALUES (?, ?, ?, ?, ?, ?, ?)`,
    [driver_id, origin, destination, date_time, price, total_seats, status]
  );

  return await getTripById(result.insertId);
};

export const getTripById = async (id) => {
  const [rows] = await pool.query(
    `
    SELECT t.id, t.driver_id, t.origin, t.destination, t.date_time, t.total_seats, t.price, t.status,
           ${seatsAvailableExpr}
    FROM trips t
    WHERE t.id = ?
  `,
    [id]
  );
  return rows[0];
};

// how many seats already confirmed for a trip?
export const getConfirmedSeatsCount = async (tripId) => {
  const [rows] = await pool.query(
    "SELECT IFNULL(SUM(seats), 0) AS booked FROM bookings WHERE trip_id = ? AND status = 'Confirmed'",
    [tripId]
  );
  return Number(rows[0]?.booked || 0);
};

// patch fields; enforce total_seats ≥ confirmed seats
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

export const deleteTripById = async (id) => {
  const [res] = await pool.query("DELETE FROM trips WHERE id = ?", [id]);
  return res.affectedRows > 0;
};

// Legacy: not supported because availability is derived
export const updateAvailableSeats = async () => {
  throw new Error("Not supported: seats are derived from bookings");
};

// --- NEW: filtered search with pagination -----------------------------------
const push = (arr, params, clause, ...vals) => {
  arr.push(clause);
  params.push(...vals);
};

export const searchTrips = async ({ origin, destination, date, status = "Published", driver_id, minSeats }) => {
  const where = [];
  const params = [];

  // Normalize inputs
  const normalize = (v) => (typeof v === "string" ? v.trim().toLowerCase() : v);

  if (origin) {
    push(where, params, "LOWER(t.origin) LIKE ?", `%${normalize(origin)}%`);
  }
  if (destination) {
    push(where, params, "LOWER(t.destination) LIKE ?", `%${normalize(destination)}%`);
  }
  if (status) {
    push(where, params, "t.status = ?", status);
  }
  if (driver_id) {
    push(where, params, "t.driver_id = ?", Number(driver_id));
  }
  if (date) {
    // Expect YYYY-MM-DD format
    push(where, params, "t.date_time BETWEEN ? AND ?", `${date} 00:00:00`, `${date} 23:59:59`);
  }
  if (minSeats !== undefined && minSeats !== null && !isNaN(Number(minSeats))) {
    push(
      where,
      params,
      `(t.total_seats - IFNULL((SELECT SUM(b2.seats) FROM bookings b2 WHERE b2.trip_id = t.id AND b2.status='Confirmed'), 0)) >= ?`,
      Number(minSeats)
    );
  }

  const whereSql = where.length ? `WHERE ${where.join(" AND ")}` : "";

  const [rows] = await pool.query(
    `
    SELECT t.id, t.driver_id, t.origin, t.destination, t.date_time, t.total_seats, t.price, t.status,
    ${seatsAvailableExpr}, u.name AS driver_name
    FROM trips t
    JOIN users u ON t.driver_id = u.id
    ${whereSql}
    ORDER BY t.date_time ASC
    `,
    params
  );

  return rows;
};