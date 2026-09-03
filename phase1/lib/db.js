import pg from "pg";

const { Pool } = pg;

let pool;

const getPool = () => {
  if (!process.env.DATABASE_URL) {
    throw new Error("DATABASE_URL is not defined in .env");
  }

  if (!pool) {
    pool = new Pool({
      connectionString: process.env.DATABASE_URL,
    });

    pool.on("error", (error) => {
      console.error("Unexpected PostgreSQL pool error:", error.message);
    });
  }

  return pool;
};

export const query = (text, params) => getPool().query(text, params);

export const closeDB = async () => {
  if (pool) {
    await pool.end();
    pool = undefined;
  }
};

const connectDB = async () => {
  await query("SELECT 1");
  console.log("PostgreSQL connected successfully");
};

export default connectDB;
