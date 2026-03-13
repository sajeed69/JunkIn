const jwt = require('jsonwebtoken');
const crypto = require('crypto');
const User = require('../../models/User');
const Notification = require('../../models/Notification');

const signToken = (id) =>
    jwt.sign({ id }, process.env.JWT_SECRET, { expiresIn: process.env.JWT_EXPIRES_IN || '7d' });

const generateOtp = () => Math.floor(100000 + Math.random() * 900000).toString();

// POST /api/auth/register
exports.register = async (req, res) => {
    const { name, email, phone, password, role } = req.body;

    const existing = await User.findOne({ email });
    if (existing) {
        return res.status(409).json({ success: false, message: 'Email already registered.' });
    }

    const otp = generateOtp();
    const otpExpiry = new Date(Date.now() + 10 * 60 * 1000); // 10 minutes

    const user = await User.create({
        name, email, phone, password, role: role || 'user', otp, otpExpiry,
        isVerified: false,
        isApproved: role !== 'kabadiwala', // kabadiwala needs approval
    });

    // In production: send via email/SMS. In dev: log to console
    console.log(`\n📱 OTP for ${email}: ${otp}\n`);

    res.status(201).json({
        success: true,
        message: 'Registration successful. OTP sent to your email.',
        userId: user._id,
    });
};

// POST /api/auth/verify-otp
exports.verifyOtp = async (req, res) => {
    const { userId, otp } = req.body;

    const user = await User.findById(userId).select('+otp +otpExpiry');
    if (!user) return res.status(404).json({ success: false, message: 'User not found.' });

    if (user.isVerified) {
        return res.status(400).json({ success: false, message: 'Account already verified.' });
    }

    if (user.otp !== otp) {
        return res.status(400).json({ success: false, message: 'Invalid OTP.' });
    }

    if (new Date() > user.otpExpiry) {
        return res.status(400).json({ success: false, message: 'OTP has expired. Please request a new one.' });
    }

    user.isVerified = true;
    user.otp = undefined;
    user.otpExpiry = undefined;
    await user.save();

    const token = signToken(user._id);

    res.status(200).json({
        success: true,
        message: 'Account verified successfully!',
        token,
        user: {
            _id: user._id,
            name: user.name,
            email: user.email,
            role: user.role,
            isVerified: user.isVerified,
        },
    });
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

    if (!user.isVerified) {
        const otp = generateOtp();
        user.otp = otp;
        user.otpExpiry = new Date(Date.now() + 10 * 60 * 1000);
        await user.save({ validateBeforeSave: false });
        console.log(`\n📱 Resent OTP for ${email}: ${otp}\n`);
        return res.status(403).json({
            success: false,
            message: 'Account not verified. OTP resent.',
            userId: user._id,
            requiresVerification: true,
        });
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

// POST /api/auth/resend-otp
exports.resendOtp = async (req, res) => {
    const { userId } = req.body;
    const user = await User.findById(userId);
    if (!user) return res.status(404).json({ success: false, message: 'User not found.' });
    if (user.isVerified) return res.status(400).json({ success: false, message: 'Already verified.' });

    const otp = generateOtp();
    user.otp = otp;
    user.otpExpiry = new Date(Date.now() + 10 * 60 * 1000);
    await user.save({ validateBeforeSave: false });
    console.log(`\n📱 Resent OTP for ${user.email}: ${otp}\n`);
    res.json({ success: true, message: 'OTP resent successfully.' });
};
