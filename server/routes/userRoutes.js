// server/routes/userRoutes.js
import express from "express";
import {
  getUsers, addUser, getUser, updateUser, deleteUser,
  getMe, updateMeSelf, deleteMeSelf
} from "../controllers/userController.js";
import { verifyToken } from "../middleware/authMiddleware.js";

const router = express.Router();

/* --- Auth-scoped "me" must come BEFORE '/:id' --- */
router.get("/me", verifyToken, getMe);
router.put("/me", verifyToken, updateMeSelf);
router.delete("/me", verifyToken, deleteMeSelf);

/* Public / admin-oriented user CRUD */
router.get("/", getUsers);
router.post("/", addUser);
router.get("/:id", getUser);
router.put("/:id", updateUser);
router.delete("/:id", deleteUser);

export default router;