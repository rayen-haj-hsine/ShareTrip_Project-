import pool from "../db.js";

/** Create notifications for all passengers who have Confirmed bookings on the given trip. */
export const createNotificationsForTripCancellation = async (tripId) => {
  // Pull passengers + a friendly message with trip info
  const [rows] = await pool.query(
    `
    SELECT b.passenger_id AS user_id,
           CONCAT('Trip ', t.origin, ' → ', t.destination, ' on ', DATE(t.date_time),
                  ' was cancelled by the driver.') AS message
    FROM bookings b
    JOIN trips t ON t.id = b.trip_id
    WHERE b.trip_id = ? AND b.status = 'Confirmed'
    `,
    [tripId]
  );
  if (!rows.length) return 0;

  const values = rows.map(r => [r.user_id, r.message]);
  await pool.query(
    "INSERT INTO notifications (user_id, message) VALUES " +
      values.map(() => "(?, ?)").join(", "),
    values.flat()
  );
  return rows.length;
};

export const getUnreadNotificationsForUser = async (userId) => {
  const [rows] = await pool.query(
    "SELECT id, message, is_read, created_at FROM notifications WHERE user_id = ? AND is_read = 0 ORDER BY created_at DESC",
    [userId]
  );
  return rows;
};

export const markAllNotificationsReadForUser = async (userId) => {
  const [res] = await pool.query(
    "UPDATE notifications SET is_read = 1 WHERE user_id = ? AND is_read = 0",
    [userId]
  );
  return res.affectedRows;
};