import express from "express";
import dotenv from "dotenv";
import connectDB from "./lib/db.js";
import User, { createUsersTable } from "./model/user.model.js"; // Import both default and named exports
import Redis from "ioredis";
dotenv.config();

const app = express();
app.use(express.json());

const port = process.env.PORT || 5000;
const redis = new Redis(process.env.REDIS_URL);
app.get("/", (req, res) => {
  return res.status(200).json({
    message: "Hello I Am Redis!",
  });
});

app.post("/users/create", async (req, res) => {
  const { name, email, password } = req.body;
  try {
    const user = await User.create({ name, email, password });
    return res.status(201).json(user);
  } catch (error) {
    return res.status(500).json({ message: error.message });
  }
});

app.get("/users/get", async (req, res) => {
  const { email } = req.query;
  try {
    const user = await User.findByEmail(email);
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }
    return res.status(200).json(user);
  } catch (error) {
    return res.status(500).json({ message: error.message });
  }
});

app.get("/users/get-with-redis", async (req, res) => {
  const cashed = await redis.get("user:all");
  if (cashed) {
    return res.status(200).json(JSON.parse(cashed));
  }
  const user = await User.find({});
  await redis.set("user:all", JSON.stringify(user));
  return res.status(200).json(user);
});

const startServer = async () => {
  try {
    await connectDB();
    await createUsersTable(); // Now properly imported

    app.listen(port, () => {
      console.log(`Server is running on port ${port}`);
    });
  } catch (error) {
    console.error("Application startup failed:", error.message);
    process.exitCode = 1;
  }
};

startServer();
