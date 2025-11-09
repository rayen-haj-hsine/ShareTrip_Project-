import express from "express";
import { getTrips, addTrip, getTrip, updateTrip, deleteTrip, updateSeats } from "../controllers/tripController.js";

const router = express.Router();
router.get("/", getTrips);
router.post("/", addTrip);
router.get("/:id", getTrip);

// ✅ NEW
router.put("/:id", updateTrip);
router.delete("/:id", deleteTrip);

// (Optional) legacy route — in your schema seats are derived, so this returns 400
router.put("/update-seats", updateSeats);

export default router;