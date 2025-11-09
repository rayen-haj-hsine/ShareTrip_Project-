import pool from "../db.js";

export const getAllBookings = async () => {
  const [rows] = await pool.query(`
    SELECT b.id, b.trip_id, b.passenger_id, b.seats, b.is_paid, b.status, b.created_at,
           u.name AS passenger_name,
           t.origin, t.destination, t.date_time
    FROM bookings b
    JOIN users u ON b.passenger_id = u.id
    JOIN trips t ON b.trip_id = t.id
    ORDER BY b.created_at DESC
  `);
  return rows;
};

export const createBooking = async ({ trip_id, passenger_id, seats }) => {
  const [result] = await pool.query(
    "INSERT INTO bookings (trip_id, passenger_id, seats) VALUES (?, ?, ?)",
    [trip_id, passenger_id, seats]
  );
  return { id: result.insertId, trip_id, passenger_id, seats };
};

export const getBookingById = async (id) => {
  const [rows] = await pool.query("SELECT * FROM bookings WHERE id = ?", [id]);
  return rows[0];
};

// ✅ NEW – patch seats/is_paid/status
export const updateBookingById = async (id, patch) => {
  const allowed = ["seats", "is_paid", "status"]; // status: 'Confirmed' | 'Cancelled'
  const fields = [];
  const values = [];
  for (const key of allowed) {
    if (patch[key] !== undefined) {
      fields.push(`${key} = ?`);
      values.push(patch[key]);
    }
  }
  if (!fields.length) return await getBookingById(id);

  values.push(id);
  await pool.query(`UPDATE bookings SET ${fields.join(", ")} WHERE id = ?`, values);
  return await getBookingById(id);
};

// ✅ NEW
export const deleteBookingById = async (id) => {
  const [res] = await pool.query("DELETE FROM bookings WHERE id = ?", [id]);
  return res.affectedRows > 0;
};
