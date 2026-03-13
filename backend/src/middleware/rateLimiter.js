const rateLimit = require('express-rate-limit');

exports.authLimiter = rateLimit({
    windowMs: 5 * 60 * 1000, // 5 minutes (reduced from 15)
    max: 100,
    skipSuccessfulRequests: true,
    message: { success: false, message: 'Too many login attempts. Please try again in a few minutes.' },
    standardHeaders: true,
    legacyHeaders: false,
});

exports.generalLimiter = rateLimit({
    windowMs: 15 * 60 * 1000,
    max: 200,
    message: { success: false, message: 'Too many requests. Please slow down.' },
    standardHeaders: true,
    legacyHeaders: false,
});

exports.uploadLimiter = rateLimit({
    windowMs: 60 * 60 * 1000, // 1 hour
    max: 30,
    message: { success: false, message: 'Too many uploads. Please wait before uploading more.' },
});
