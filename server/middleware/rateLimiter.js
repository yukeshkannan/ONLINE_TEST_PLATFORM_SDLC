import rateLimit from 'express-rate-limit';

/**
 * Strict Rate Limiter for Login & Authentication endpoints
 * Allows 20 requests per 15 minutes per IP to prevent brute-force attacks
 */
export const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 20, // Limit each IP to 20 login requests per windowMs
  standardHeaders: true, // Return rate limit info in the `RateLimit-*` headers
  legacyHeaders: false, // Disable the `X-RateLimit-*` headers
  message: {
    message: 'Too many login attempts from this IP address. Please try again after 15 minutes.'
  }
});

/**
 * Ultra-strict Rate Limiter for Sensitive Password Reset / OTP endpoints
 * Allows max 5 attempts per 15 minutes to prevent OTP guessing
 */
export const otpLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 5,
  standardHeaders: true,
  legacyHeaders: false,
  message: {
    message: 'Too many OTP / password reset requests. Please wait 15 minutes before trying again.'
  }
});

/**
 * Rate Limiter for Assessment Submission Endpoint
 * Allows up to 10 submissions per minute per IP (prevents script spam / accidental double rapid firing)
 */
export const submitLimiter = rateLimit({
  windowMs: 1 * 60 * 1000, // 1 minute
  max: 10,
  standardHeaders: true,
  legacyHeaders: false,
  message: {
    message: 'Too many test submission requests received. Please wait a moment.'
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
