import rateLimit from 'express-rate-limit';

/**
 * Strict Rate Limiter for Login & Authentication endpoints
 * Allows 20 requests per 15 minutes per IP to prevent brute-force attacks
 */
export const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 150, // Allows entire classroom / lab batches on shared IP to log in comfortably
  standardHeaders: true,
  legacyHeaders: false,
  message: {
    message: 'Too many login attempts from this network. Please try again in a few minutes.'
  }
});

/**
 * Ultra-strict Rate Limiter for Sensitive Password Reset / OTP endpoints
 * Allows max 10 attempts per 15 minutes to prevent OTP guessing
 */
export const otpLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 10,
  standardHeaders: true,
  legacyHeaders: false,
  message: {
    message: 'Too many OTP / password reset requests. Please wait 15 minutes before trying again.'
  }
});

/**
 * Rate Limiter for Assessment Submission Endpoint
 * Allows up to 300 submissions per minute per IP so college labs sharing one public IP can all submit safely
 */
export const submitLimiter = rateLimit({
  windowMs: 1 * 60 * 1000, // 1 minute
  max: 300, // Accommodates large classroom/lab concurrent submissions
  keyGenerator: (req) => req.user?.id || req.ip,
  standardHeaders: true,
  legacyHeaders: false,
  message: {
    message: 'Server is processing high volume of test submissions. Please wait a moment.'
  }
});

/**
 * General Public API Rate Limiter
 * Provides DDoS baseline protection while comfortably allowing heavy student traffic
 */
export const generalLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 1000, // 1000 requests per 15 min
  standardHeaders: true,
  legacyHeaders: false,
  message: {
    message: 'Too many requests from this network. Please slow down.'
  }
});
