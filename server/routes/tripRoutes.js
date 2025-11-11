import express from "express";
import {
  getTrips,
  addTrip,
  getTrip,
  updateTrip,
  deleteTrip,
  updateSeats,
  getMyBookingForTrip,
  quitTrip
} from "../controllers/tripController.js";
import { verifyToken, requireDriver } from "../middleware/authMiddleware.js";

const router = express.Router();

router.get("/", getTrips);

// Create trip (auth + driver-only)
router.post("/", verifyToken, requireDriver, addTrip);

router.get("/:id", getTrip);

// Update trip (could also be protected if you want)
router.put("/:id", updateTrip);

// Delete trip (auth + driver-only, must own trip)
router.delete("/:id", verifyToken, requireDriver, deleteTrip);

// not supported
router.put("/update-seats", updateSeats);

// Booking helpers (auth)
router.get("/:id/my-booking", verifyToken, getMyBookingForTrip);
router.post("/:id/quit", verifyToken, quitTrip);

export default router;