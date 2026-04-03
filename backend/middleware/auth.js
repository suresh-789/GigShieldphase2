const jwt = require('jsonwebtoken');

const JWT_SECRET = process.env.JWT_SECRET || 'gigshield-secret-key-change-in-production';

/**
 * JWT Authentication Middleware
 * Verifies the JWT token and adds user info to request
 */
const authenticateToken = (req, res, next) => {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];
  
  if (!token) {
    return res.status(401).json({ 
      success: false, 
      message: 'Access denied. No token provided.' 
    });
  }
  
  jwt.verify(token, JWT_SECRET, (err, user) => {
    if (err) {
      return res.status(403).json({ 
        success: false, 
        message: 'Invalid or expired token' 
      });
    }
    req.user = user;
    next();
  });
};

/**
 * Rate Limiting Middleware Factory
 * Creates rate limiter with custom configuration
 */
const createRateLimiter = (windowMs, max, message) => {
  const rateLimit = require('express-rate-limit');
  return rateLimit({
    windowMs,
    max,
    message: { success: false, message }
  });
};

/**
 * Auth Rate Limiter
 * Limits login attempts to prevent brute force
 */
const authLimiter = createRateLimiter(
  15 * 60 * 1000, // 15 minutes
  5, // 5 attempts per window
  'Too many login attempts. Please try again later.'
);

/**
 * OTP Rate Limiter
 * Limits OTP requests to prevent abuse
 */
const otpLimiter = createRateLimiter(
  60 * 60 * 1000, // 1 hour
  3, // 3 OTP requests per hour
  'Too many OTP requests. Please try again later.'
);

/**
 * Request Logger Middleware
 * Logs all incoming requests
 */
const requestLogger = (req, res, next) => {
  const timestamp = new Date().toISOString();
  const method = req.method;
  const url = req.url;
  const ip = req.ip || req.connection.remoteAddress;
  
  console.log(`[${timestamp}] ${method} ${url} - IP: ${ip}`);
  next();
};

/**
 * Error Handler Middleware
 * Catches and handles all errors
 */
const errorHandler = (err, req, res, next) => {
  console.error('Error:', err.stack);
  
  res.status(err.status || 500).json({
    success: false,
    message: err.message || 'Internal Server Error',
    ...(process.env.NODE_ENV === 'development' && { stack: err.stack })
  });
};

/**
 * Not Found Handler
 * Handles 404 errors
 */
const notFoundHandler = (req, res) => {
  res.status(404).json({
    success: false,
    message: `Route ${req.method} ${req.url} not found`
  });
};

module.exports = {
  authenticateToken,
  authLimiter,
  otpLimiter,
  requestLogger,
  errorHandler,
  notFoundHandler,
  JWT_SECRET
};
