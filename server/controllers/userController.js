// server/controllers/userController.js
import {
  getAllUsers,
  createUser,
  getUserById,
  updateUserById,
  deleteUserById,
} from "../models/userModel.js";

export const getUsers = async (_req, res) => {
  try {
    res.json(await getAllUsers());
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

export const addUser = async (req, res) => {
  try {
    if (!req.body.name || !req.body.email || !req.body.role) {
      return res.status(400).json({ message: "name, email, role are required" });
    }
    res.status(201).json(await createUser(req.body));
  } catch (err) {
    if (err?.code === "ER_DUP_ENTRY" || err?.errno === 1062) {
      return res.status(409).json({ message: "Email already in use" });
    }
    res.status(400).json({ error: err.message });
  }
};

export const getUser = async (req, res) => {
  try {
    const user = await getUserById(req.params.id);
    if (!user) return res.status(404).json({ message: "User not found" });
    res.json(user);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

export const updateUser = async (req, res) => {
  try {
    const exists = await getUserById(req.params.id);
    if (!exists) return res.status(404).json({ message: "User not found" });
    const updated = await updateUserById(req.params.id, req.body);
    res.json(updated);
  } catch (err) {
    if (err?.code === "ER_DUP_ENTRY" || err?.errno === 1062) {
      return res.status(409).json({ message: "Email already in use" });
    }
    res.status(400).json({ error: err.message });
  }
};

export const deleteUser = async (req, res) => {
  try {
    const ok = await deleteUserById(req.params.id);
    if (!ok) return res.status(404).json({ message: "User not found" });
    res.json({ message: "User deleted" });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};