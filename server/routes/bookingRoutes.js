import express from "express";
import { getBookings, addBooking, getBooking, updateBooking, deleteBooking } from "../controllers/bookingController.js";

const router = express.Router();
router.get("/", getBookings);
router.post("/", addBooking);
router.get("/:id", getBooking);

// ✅ NEW
router.put("/:id", updateBooking);
router.delete("/:id", deleteBooking);

export default router;