import bcrypt from "bcryptjs";
import {
  getAllUsers,
  createUser,
  getUserById,
  updateUserById,
  deleteUserById,
  getUserByEmail,
  getRawUserById
} from "../models/userModel.js";

export const getUsers = async (_req, res) => {
  try { res.json(await getAllUsers()); }
  catch (err) { res.status(500).json({ error: err.message }); }
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
  } catch (err) { res.status(500).json({ error: err.message }); }
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
  } catch (err) { res.status(500).json({ error: err.message }); }
};

/* =====================
   Auth-scoped "me" APIs
   ===================== */

export const getMe = async (req, res) => {
  try {
    const me = await getUserById(req.user.id);
    if (!me) return res.status(404).json({ message: "User not found" });
    res.json(me);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

export const updateMeSelf = async (req, res) => {
  try {
    const id = req.user.id;
    const exists = await getRawUserById(id);
    if (!exists) return res.status(404).json({ message: "User not found" });

    const patch = {};
    if (req.body.name !== undefined) patch.name = req.body.name;
    if (req.body.email !== undefined) patch.email = req.body.email;
    if (req.body.phone !== undefined) patch.phone = req.body.phone;
    if (req.body.password) {
      patch.password = await bcrypt.hash(req.body.password, 10);
    }

    const updated = await updateUserById(id, patch);
    res.json(updated);
  } catch (err) {
    if (err?.code === "ER_DUP_ENTRY" || err?.errno === 1062) {
      return res.status(409).json({ message: "Email already in use" });
    }
    res.status(400).json({ error: err.message });
  }
};

export const deleteMeSelf = async (req, res) => {
  try {
    const ok = await deleteUserById(req.user.id);
    if (!ok) return res.status(404).json({ message: "User not found" });
    res.json({ message: "Account deleted" });
  } catch (err) { res.status(500).json({ error: err.message }); }
};