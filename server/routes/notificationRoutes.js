import express from "express";
import { verifyToken } from "../middleware/authMiddleware.js";
import { myNotifications, markAllRead } from "../controllers/notificationController.js";

const router = express.Router();

router.get("/my", verifyToken, myNotifications);
router.post("/read-all", verifyToken, markAllRead);

export default router;