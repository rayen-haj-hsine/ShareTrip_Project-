// controllers/tripController.js
import { getAllTrips, createTrip, getTripById, updateTripById, deleteTripById } from "../models/tripModel.js";
import { getUserById } from "../models/userModel.js"; // 👈 add this import

// helper to ensure the given user is a driver
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

export const getTrips = async (_req, res) => {
  try { res.json(await getAllTrips()); }
  catch (err) { res.status(500).json({ error: err.message }); }
};

export const addTrip = async (req, res) => {
  try {
    // ensure driver_id belongs to a driver
    const driverId = req.body.driver_id;
    if (!driverId) return res.status(400).json({ message: "driver_id is required" });
    await assertIsDriver(driverId);

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

    // if driver_id is being changed, ensure new driver_id is actually a driver
    if (req.body.driver_id !== undefined) {
      await assertIsDriver(req.body.driver_id);
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
  } catch (err) { res.status(500).json({ error: err.message }); }
};

// legacy
export const updateSeats = async (_req, res) => {
  res.status(400).json({ error: "Not supported: seats are derived from bookings" });
};