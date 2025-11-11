import pool from "../db.js";

export const getAllUsers = async () => {
  const [rows] = await pool.query(
    "SELECT id, name, email, phone, role, created_at FROM users"
  );
  return rows;
};

export const createUser = async ({ name, email, phone, role, password = null }) => {
  const [result] = await pool.query(
    "INSERT INTO users (name, email, phone, role, password) VALUES (?, ?, ?, ?, ?)",
    [name, email, phone, role, password]
  );
  return { id: result.insertId, name, email, phone, role };
};

export const getUserById = async (id) => {
  const [rows] = await pool.query(
    "SELECT id, name, email, phone, role, created_at FROM users WHERE id = ?",
    [id]
  );
  return rows[0];
};

export const getRawUserById = async (id) => {
  // Includes password (for internal use only)
  const [rows] = await pool.query("SELECT * FROM users WHERE id = ?", [id]);
  return rows[0];
};

export const updateUserById = async (id, patch) => {
  // Allow password updates as well; getters won't expose it
  const allowed = ["name", "email", "phone", "role", "password"];
  const fields = [];
  const values = [];
  for (const key of allowed) {
    if (patch[key] !== undefined) {
      fields.push(`${key} = ?`);
      values.push(patch[key]);
    }
  }
  if (!fields.length) return await getUserById(id);
  values.push(id);
  await pool.query(`UPDATE users SET ${fields.join(", ")} WHERE id = ?`, values);
  return await getUserById(id);
};

export const deleteUserById = async (id) => {
  const [res] = await pool.query("DELETE FROM users WHERE id = ?", [id]);
  return res.affectedRows > 0;
};

export const getUserByEmail = async (email) => {
  const [rows] = await pool.query("SELECT * FROM users WHERE email = ?", [email]);
  return rows[0];
};