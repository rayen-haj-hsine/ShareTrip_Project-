// server/controllers/tripController.js
import {
  getAllTrips,
  createTrip,
  getTripById,
  updateTripById,
  deleteTripById,
  searchTrips, // ⬅️ new
} from "../models/tripModel.js";
import { getUserById } from "../models/userModel.js";

// ---- helpers ---------------------------------------------------------------
const assertIsDriver = async (driverId) => {
  const user = await getUserById(driverId);
  if (!user) {
    const err = new Error("Driver user not found");
    err.status = 404;
    throw err;
  }
  if (user.role !== "driver") {
    const err = new Error("Only users with role 'driver' can create or own trips");
    err.status = 403;
    throw err;
  }
};

const toInt = (v, d = undefined) => (v === undefined ? d : Number.parseInt(v, 10));
const toStr = (v) => (typeof v === "string" && v.trim().length ? v.trim() : undefined);

// ---- controllers -----------------------------------------------------------
export const getTrips = async (req, res) => {
  try {
    // Filters for US‑1 (passenger search) & US‑2 (driver dashboard)
    const origin = toStr(req.query.origin);
    const destination = toStr(req.query.destination);
    const date = toStr(req.query.date); // YYYY-MM-DD
    const status = toStr(req.query.status) || "Published"; // default
    const driver_id = toInt(req.query.driver_id);
    const minSeats = toInt(req.query.minSeats);
    const page = toInt(req.query.page, 1);
    const pageSize = toInt(req.query.pageSize, 10);

    const hasFilters =
      origin ||
      destination ||
      date ||
      req.query.status !== undefined ||
      driver_id ||
      minSeats !== undefined ||
      req.query.page !== undefined ||
      req.query.pageSize !== undefined;

    if (!hasFilters && typeof getAllTrips === "function") {
      // Backward-compatible: no filters -> simple list
      const rows = await getAllTrips();
      return res.json(rows);
    }

    
const result = await searchTrips({
  origin,
  destination,
  date,
  status,
  driver_id,
  minSeats,
});


    return res.json(result);
  } catch (err) {
    return res.status(err.status || 500).json({ error: err.message });
  }
};

export const addTrip = async (req, res) => {
  try {
    const driverId = req.body.driver_id;
    if (!driverId) return res.status(400).json({ message: "driver_id is required" });
    await assertIsDriver(driverId);

    if (!req.body.origin || !req.body.destination || !req.body.date_time || req.body.total_seats == null) {
      return res
        .status(400)
        .json({ message: "origin, destination, date_time, total_seats are required" });
    }
    if (req.body.status && !["Draft", "Published", "Cancelled"].includes(req.body.status)) {
      return res.status(400).json({ message: "status must be Draft | Published | Cancelled" });
    }

    const created = await createTrip(req.body);
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
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

export const updateTrip = async (req, res) => {
  try {
    const exists = await getTripById(req.params.id);
    if (!exists) return res.status(404).json({ message: "Trip not found" });

    if (req.body.driver_id !== undefined) {
      await assertIsDriver(req.body.driver_id);
    }
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
    const ok = await deleteTripById(req.params.id);
    if (!ok) return res.status(404).json({ message: "Trip not found" });
    res.json({ message: "Trip deleted" });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// legacy — derived seats
export const updateSeats = async (_req, res) => {
  res.status(400).json({ error: "Not supported: seats are derived from bookings" });
};