import rateLimit from "express-rate-limit";

// General rate limiter - 100 requests per minute
export const generalLimiter = rateLimit({
  windowMs: 60 * 1000, // 1 minute
  max: 100, // Limit each IP to 100 requests per windowMs
  message: {
    error: "Too many requests from this IP, please try again later.",
    retryAfter: "1 minute"
  },
  standardHeaders: true,
  legacyHeaders: false
});

// Stricter limiter for scraper routes - 10 requests per minute
export const scraperLimiter = rateLimit({
  windowMs: 60 * 1000, // 1 minute
  max: 10, // Limit each IP to 10 requests per windowMs
  message: {
    error: "Too many scraper requests from this IP, please try again later.",
    retryAfter: "1 minute"
  },
  standardHeaders: true,
  legacyHeaders: false
});

// More lenient for course data - 200 requests per minute
export const courseLimiter = rateLimit({
  windowMs: 60 * 1000, // 1 minute
  max: 200, // Limit each IP to 200 requests per windowMs
  message: {
    error: "Too many course requests from this IP, please try again later.",
    retryAfter: "1 minute"
  },
  standardHeaders: true,
  legacyHeaders: false
});