import { query } from "../lib/db.js";

export const createUsersTable = async () => {
  await query(`
    CREATE TABLE IF NOT EXISTS users (
      id BIGSERIAL PRIMARY KEY,
      name VARCHAR(100) NOT NULL,
      email VARCHAR(255) UNIQUE NOT NULL,
      password TEXT NOT NULL,
      created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
      updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
    )
  `);
};

export const createUser = async ({ name, email, password }) => {
  const result = await query(
    `INSERT INTO users (name, email, password)
     VALUES ($1, $2, $3)
     RETURNING id, name, email, created_at, updated_at`,
    [name, email, password],
  );

  return result.rows[0];
};

export const findUserByEmail = async (email) => {
  const result = await query("SELECT * FROM users WHERE email = $1", [email]);

  return result.rows[0] ?? null;
};

export const findAllUsers = async () => {
  const result = await query(`
    SELECT id, name, email, created_at, updated_at
    FROM users
    ORDER BY id DESC
  `);

  return result.rows;
};

const User = {
  create: createUser,
  findByEmail: findUserByEmail,
  find: findAllUsers,
};

export default User;
