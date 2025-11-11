import bcrypt from "bcryptjs";         
import jwt from "jsonwebtoken";
import { createUser, getUserByEmail } from "../models/userModel.js";

export const register = async (req, res) => {
  try {
    const { name, email, phone, password, role } = req.body;
    if (!name || !email || !password || !role) {
      return res.status(400).json({ message: "Missing required fields" });
    }
    const existing = await getUserByEmail(email);
    if (existing) return res.status(409).json({ message: "Email already in use" });

    const hashed = await bcrypt.hash(password, 10);
    const user = await createUser({ name, email, phone, role, password: hashed });
    res.status(201).json({ id: user.id, email: user.email });
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
};

export const login = async (req, res) => {
  try {
    const { email, password } = req.body;
    const user = await getUserByEmail(email);
    if (!user) return res.status(404).json({ message: "User not found" });

    const match = await bcrypt.compare(password, user.password || "");
    if (!match) return res.status(401).json({ message: "Invalid credentials" });

    const token = jwt.sign({ id: user.id, role: user.role }, process.env.JWT_SECRET, { expiresIn: "1d" });
    res.json({ token, user: { id: user.id, name: user.name, role: user.role } });
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
};