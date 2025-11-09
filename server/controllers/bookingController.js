import { getAllBookings, createBooking, getBookingById, updateBookingById, deleteBookingById } from "../models/bookingModel.js";
import { getTripById } from "../models/tripModel.js";

export const getBookings = async (_req, res) => {
  try { res.json(await getAllBookings()); }
  catch (err) { res.status(500).json({ error: err.message }); }
};

export const addBooking = async (req, res) => {
  const { trip_id, passenger_id } = req.body;
  const seats = req.body.seats ?? req.body.seats_reserved;
  try {
    if (!trip_id || !passenger_id || !seats) return res.status(400).json({ message: "trip_id, passenger_id, seats are required" });
    const trip = await getTripById(trip_id);
    if (!trip) return res.status(404).json({ message: "Trip not found" });
    if (trip.seats_available < seats) return res.status(400).json({ message: "Not enough seats available" });

    const booking = await createBooking({ trip_id, passenger_id, seats });
    res.status(201).json(booking);
  } catch (err) {
    if (err?.code === "ER_DUP_ENTRY" || err?.errno === 1062) {
      return res.status(409).json({ message: "Passenger already has a booking for this trip" });
    }
    res.status(400).json({ error: err.message });
  }
};

export const getBooking = async (req, res) => {
  try {
    const booking = await getBookingById(req.params.id);
    if (!booking) return res.status(404).json({ message: "Booking not found" });
    res.json(booking);
  } catch (err) { res.status(500).json({ error: err.message }); }
};

// ✅ NEW — ensure availability when increasing confirmed seats
export const updateBooking = async (req, res) => {
  try {
    const id = req.params.id;
    const existing = await getBookingById(id);
    if (!existing) return res.status(404).json({ message: "Booking not found" });

    const patch = {};
    if (req.body.seats !== undefined) patch.seats = Number(req.body.seats);
    if (req.body.is_paid !== undefined) patch.is_paid = Number(req.body.is_paid) ? 1 : 0;
    if (req.body.status !== undefined) patch.status = req.body.status; // 'Confirmed' | 'Cancelled'

    // compute delta in confirmed seats
    const oldSeats = Number(existing.seats);
    const oldStatus = existing.status;
    const newSeats = patch.seats !== undefined ? Number(patch.seats) : oldSeats;
    const newStatus = patch.status !== undefined ? patch.status : oldStatus;

    const effectiveOld = oldStatus === "Confirmed" ? oldSeats : 0;
    const effectiveNew = newStatus === "Confirmed" ? newSeats : 0;
    const delta = effectiveNew - effectiveOld;

    if (delta > 0) {
      const trip = await getTripById(existing.trip_id);
      if (!trip) return res.status(404).json({ message: "Trip not found" });
      if (trip.seats_available < delta) {
        return res.status(400).json({ message: "Not enough seats available for the update" });
      }
    }

    const updated = await updateBookingById(id, patch);
    res.json(updated);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
};

// ✅ NEW
export const deleteBooking = async (req, res) => {
  try {
    const ok = await deleteBookingById(req.params.id);
    if (!ok) return res.status(404).json({ message: "Booking not found" });
    res.json({ message: "Booking deleted" });
  } catch (err) { res.status(500).json({ error: err.message }); }
};