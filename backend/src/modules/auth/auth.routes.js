const express = require('express');
const router = express.Router();
const Joi = require('joi');
const ctrl = require('./auth.controller');

// Validation middleware
const validate = (schema) => (req, res, next) => {
    const { error } = schema.validate(req.body, { abortEarly: false });
    if (error) {
        return res.status(400).json({
            success: false,
            message: error.details.map((d) => d.message).join(', '),
        });
    }
    next();
};

const registerSchema = Joi.object({
    name: Joi.string().min(2).max(100).required(),
    email: Joi.string().email().required(),
    phone: Joi.string().pattern(/^[+]?[\d\s\-()]{10,15}$/).optional(),
    password: Joi.string().min(8).required(),
    role: Joi.string().valid('user', 'kabadiwala', 'recycler').optional(),
});

const loginSchema = Joi.object({
    email: Joi.string().email().required(),
    password: Joi.string().required(),
});

const otpSchema = Joi.object({
    userId: Joi.string().required(),
    otp: Joi.string().length(6).required(),
});

router.post('/register', validate(registerSchema), ctrl.register);
router.post('/login', validate(loginSchema), ctrl.login);
router.post('/verify-otp', validate(otpSchema), ctrl.verifyOtp);
router.post('/resend-otp', ctrl.resendOtp);

const protect = require('../../middleware/auth');
router.get('/me', protect, ctrl.getMe);

module.exports = router;
