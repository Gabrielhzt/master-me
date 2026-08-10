import rateLimit from "express-rate-limit";

// Tighter than a general API limit — each request costs LLM tokens.
export const coursesLimiter = rateLimit({
  windowMs: 60_000,
  limit: 10,
  standardHeaders: true,
  legacyHeaders: false,
  message: { message: "Too many requests, please try again shortly." },
});
