import { redis } from "../index.js";

export const ratelimit = async (req, res, next) => {
  const ip = req.ip;
  const key = `ratelimit:${ip}`;
  const request = await redis.incr(key);
  if (request === 1) {
    await redis.expire(key, 60); // Set expiration time for the key (e.g., 60 seconds)
  }
  if (request > 6) {
    return res
      .status(429)
      .json({ message: "Too many requests. Please try 1m later." });
  }
  next();
};
