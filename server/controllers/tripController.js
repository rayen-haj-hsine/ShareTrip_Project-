import {
  getAllTrips,
  createTrip,
  getTripById,
  updateTripById,
  deleteTripById,
  searchTrips
} from "../models/tripModel.js";
import { getUserById } from "../models/userModel.js";
import {
  getBookingByTripAndPassenger,
  cancelBookingById
} from "../models/bookingModel.js";
import { createNotificationsForTripCancellation } from "../models/notificationModel.js";

const assertIsDriver = async (driverId) => {
  const user = await getUserById(driverId);
  if (!user) { const e = new Error("Driver user not found"); e.status = 404; throw e; }
  if (user.role !== "driver") { const e = new Error("Only users with role 'driver' can create or own trips"); e.status = 403; throw e; }
};

const toInt = (v, d) => (v === undefined ? d : Number.parseInt(v, 10));
const toStr = (v) => (typeof v === "string" && v.trim().length ? v.trim() : undefined);

export const getTrips = async (req, res) => {
  try {
    const origin = toStr(req.query.origin);
    const destination = toStr(req.query.destination);
    const date = toStr(req.query.date);
    const status = toStr(req.query.status) || "Published";
    const driver_id = toInt(req.query.driver_id);
    const minSeats = req.query.minSeats !== undefined ? toInt(req.query.minSeats) : undefined;

    const hasFilters =
      origin || destination || date || req.query.status !== undefined || driver_id || minSeats !== undefined;

    if (!hasFilters) return res.json(await getAllTrips());
    const result = await searchTrips({ origin, destination, date, status, driver_id, minSeats });
    return res.json(result);
  } catch (err) {
    res.status(err.status || 500).json({ error: err.message });
  }
};

export const addTrip = async (req, res) => {
  try {
    const driverIdFromToken = req.user?.id;
    const driverId = driverIdFromToken ?? req.body.driver_id;
    if (!driverId) return res.status(400).json({ message: "driver_id is required" });
    if (!driverIdFromToken) await assertIsDriver(driverId);

    const payload = { ...req.body, driver_id: driverId };

    if (!payload.origin || !payload.destination || !payload.date_time || payload.total_seats == null) {
      return res.status(400).json({ message: "origin, destination, date_time, total_seats are required" });
    }
    if (payload.status && !["Draft", "Published", "Cancelled"].includes(payload.status)) {
      return res.status(400).json({ message: "status must be Draft | Published | Cancelled" });
    }

    const created = await createTrip(payload);
    res.status(201).json(created);
  } catch (err) {
    res.status(err.status || 400).json({ error: err.message });
  }
};

export const getTrip = async (req, res) => {
  try {
    const trip = await getTripById(req.params.id);
    if (!trip) return res.status(404).json({ message: "Trip not found" });
    res.json(trip);
  } catch (err) { res.status(500).json({ error: err.message }); }
};

export const updateTrip = async (req, res) => {
  try {
    const exists = await getTripById(req.params.id);
    if (!exists) return res.status(404).json({ message: "Trip not found" });

    if (req.body.driver_id !== undefined) await assertIsDriver(req.body.driver_id);
    if (req.body.status && !["Draft", "Published", "Cancelled"].includes(req.body.status)) {
      return res.status(400).json({ message: "status must be Draft | Published | Cancelled" });
    }

    const updated = await updateTripById(req.params.id, req.body);
    res.json(updated);
  } catch (err) {
    res.status(err.status || 400).json({ error: err.message });
  }
};

export const deleteTrip = async (req, res) => {
  try {
    const tripId = Number(req.params.id);
    const trip = await getTripById(tripId);
    if (!trip) return res.status(404).json({ message: "Trip not found" });

    // Enforce ownership: only the driver who owns this trip can delete it
    const userId = req.user?.id;
    if (!userId || userId !== trip.driver_id) {
      return res.status(403).json({ message: "You can only delete your own trips" });
    }

    // Notify passengers before deletion
    try {
      await createNotificationsForTripCancellation(tripId);
    } catch (e) {
      // Non-fatal: log and continue
      console.error("Failed to create notifications for trip cancellation:", e);
    }

    const ok = await deleteTripById(tripId);
    if (!ok) return res.status(404).json({ message: "Trip not found" });
    res.json({ message: "Trip deleted and passengers notified" });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

export const updateSeats = async (_req, res) => {
  res.status(400).json({ error: "Not supported: seats are derived from bookings" });
};

// ==== Booking helpers (already added earlier) ====

export const getMyBookingForTrip = async (req, res) => {
  try {
    const tripId = Number(req.params.id);
    const userId = req.user?.id;
    if (!userId) return res.status(401).json({ message: "Unauthorized" });

    const booking = await getBookingByTripAndPassenger(tripId, userId);
    res.json(booking || null);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
};

export const quitTrip = async (req, res) => {
  try {
    const tripId = Number(req.params.id);
    const userId = req.user?.id;
    if (!userId) return res.status(401).json({ message: "Unauthorized" });

    const booking = await getBookingByTripAndPassenger(tripId, userId);
    if (!booking) return res.status(404).json({ message: "No booking found for this trip" });
    if (booking.status === "Cancelled") return res.json(booking);

    const cancelled = await cancelBookingById(booking.id);
    res.json(cancelled);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
};