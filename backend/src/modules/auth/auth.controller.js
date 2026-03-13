const jwt = require('jsonwebtoken');
const crypto = require('crypto');
const User = require('../../models/User');
const Notification = require('../../models/Notification');

const signToken = (id) =>
    jwt.sign({ id }, process.env.JWT_SECRET, { expiresIn: process.env.JWT_EXPIRES_IN || '7d' });

// POST /api/auth/register
exports.register = async (req, res) => {
    try {
        const { name, email, phone, password, role } = req.body;

        const existing = await User.findOne({ email });
        if (existing) {
            return res.status(409).json({ success: false, message: 'Email already registered.' });
        }

        const user = await User.create({
            name, email, phone, password, role: role || 'user',
            isVerified: true, // Auto-verify for seamless experience
            isApproved: role !== 'kabadiwala', // kabadiwala still needs manual approval
        });

        const token = signToken(user._id);

        res.status(201).json({
            success: true,
            message: 'Registration successful!',
            token,
            user: {
                _id: user._id,
                name: user.name,
                email: user.email,
                role: user.role,
                isVerified: user.isVerified,
            },
        });
    } catch (err) {
        console.error('[AUTH ERROR] Registration failed:', err);
        res.status(err.statusCode || 500).json({
            success: false,
            message: err.message || 'Registration failed. Please try again.',
        });
    }
};

// POST /api/auth/login
exports.login = async (req, res) => {
    const { email, password } = req.body;

    const user = await User.findOne({ email }).select('+password');
    if (!user || !(await user.comparePassword(password))) {
        return res.status(401).json({ success: false, message: 'Invalid email or password.' });
    }

    if (user.isBanned) {
        return res.status(403).json({ success: false, message: 'Your account has been banned. Contact support.' });
    }

    const token = signToken(user._id);

    res.status(200).json({
        success: true,
        token,
        user: {
            _id: user._id,
            name: user.name,
            email: user.email,
            phone: user.phone,
            role: user.role,
            isApproved: user.isApproved,
            rating: user.rating,
            profileImage: user.profileImage,
            trustScore: user.trustScore,
            bio: user.bio,
            totalTransactions: user.totalTransactions,
            earnings: user.earnings,
        },
    });
};

// GET /api/auth/me
exports.getMe = async (req, res) => {
    const user = await User.findById(req.user._id);
    res.status(200).json({ success: true, user });
};
