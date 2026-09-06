import express from "express";
import dotenv from "dotenv";
import connectDB from "./lib/db.js";
import User, { createUsersTable } from "./model/user.model.js"; // Import both default and named exports
import Redis from "ioredis";
import { ratelimit } from "./middleware/ratelimit.js";
dotenv.config();

const app = express();
app.use(express.json());

const port = process.env.PORT || 5000;
export const redis = new Redis(process.env.REDIS_URL);
app.get("/", (req, res) => {
  return res.status(200).json({
    message: "Hello I Am Redis!",
  });
});
// Cache user data in Redis when a new user is created
app.post("/users/create", async (req, res) => {
  const { name, email, password } = req.body;
  await redis.del("user:all"); // Clear the cache when a new user is created
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
app.get("/users/get-all", ratelimit, async (req, res) => {
  try {
    const users = await User.find({});
    return res.status(200).json(users);
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

// OTP storage in Redis
app.post("/send-otp", async (req, res) => {
  const { email } = req.body;
  const otp = Math.floor(100000 + Math.random() * 900000).toString(); // Generate a 6-digit OTP
  await redis.set(`otp:${email}`, otp, "EX", 40); // Store OTP with a 40-second expiration
  return res.status(200).json({ message: "OTP sent successfully", otp }); // In a real application, you would send the OTP via email or SMS
});

app.post("/verify-otp", async (req, res) => {
  const { email, otp } = req.body;
  const cashedOtp = await redis.get(`otp:${email}`);
  if (!cashedOtp) {
    return res.status(400).json({ message: "OTP expired or not found" });
  }
  if (cashedOtp !== otp) {
    return res.status(400).json({ message: "Invalid OTP" });
  }
  await redis.del(`otp:${email}`); // Delete OTP after successful verification
  return res.status(200).json({ message: "OTP verified successfully" });
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
