import pool from "../db.js";

export const getAllUsers = async () => {
  const [rows] = await pool.query("SELECT * FROM users");
  return rows;
};

export const createUser = async (user) => {
  const { name, email, phone, role } = user;
  const [result] = await pool.query(
    "INSERT INTO users (name, email, phone, role) VALUES (?, ?, ?, ?)",
    [name, email, phone, role]
  );
  return { id: result.insertId, ...user };
};

export const getUserById = async (id) => {
  const [rows] = await pool.query("SELECT * FROM users WHERE id = ?", [id]);
  return rows[0];
};

// ✅ NEW
export const updateUserById = async (id, patch) => {
  const allowed = ["name", "email", "phone", "role"];
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