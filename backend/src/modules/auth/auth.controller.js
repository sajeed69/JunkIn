const jwt = require('jsonwebtoken');
const crypto = require('crypto');
const nodemailer = require('nodemailer');
const User = require('../../models/User');
const Notification = require('../../models/Notification');

const signToken = (id) =>
    jwt.sign({ id }, process.env.JWT_SECRET, { expiresIn: process.env.JWT_EXPIRES_IN || '7d' });

const generateOtp = () => Math.floor(100000 + Math.random() * 900000).toString();

// Email transporter for sending OTP
const transporter = nodemailer.createTransport({
    service: 'gmail',
    auth: {
        user: process.env.SMTP_USER,
        pass: process.env.SMTP_PASS,
    },
});

const sendOtpEmail = async (email, otp) => {
    try {
        await transporter.sendMail({
            from: `"JunkIn" <${process.env.SMTP_USER}>`,
            to: email,
            subject: '🔐 Your JunkIn Verification Code',
            html: `
                <div style="font-family: Arial, sans-serif; max-width: 400px; margin: 0 auto; padding: 30px; background: #f8fafc; border-radius: 16px;">
                    <h2 style="color: #10b981; margin-bottom: 8px;">JunkIn Verification</h2>
                    <p style="color: #64748b; font-size: 14px;">Use this code to verify your account:</p>
                    <div style="background: #10b981; color: white; font-size: 32px; font-weight: bold; text-align: center; padding: 20px; border-radius: 12px; letter-spacing: 8px; margin: 20px 0;">
                        ${otp}
                    </div>
                    <p style="color: #94a3b8; font-size: 12px;">This code expires in 10 minutes. Don't share it with anyone.</p>
                </div>
            `,
        });
        console.log(`✅ OTP email sent to ${email}`);
        return true;
    } catch (err) {
        console.error(`❌ Failed to send OTP email to ${email}:`, err.message);
        console.log(`📱 OTP for ${email}: ${otp} (email failed, logged here)`);
        return false;
    }
};

// POST /api/auth/register
exports.register = async (req, res) => {
    try {
        const { name, email, phone, password, role } = req.body;

        const existing = await User.findOne({ email });
        if (existing) {
            if (existing.isVerified) {
                return res.status(409).json({ success: false, message: 'Email already registered.' });
            }
            // Delete old unverified account so user can re-register
            await User.deleteOne({ _id: existing._id });
            console.log(`[AUTH] Deleted unverified account for ${email}, allowing re-registration`);
        }

        const otp = generateOtp();
        const otpExpiry = new Date(Date.now() + 10 * 60 * 1000); // 10 minutes

        const user = await User.create({
            name, email, phone, password, role: role || 'user', otp, otpExpiry,
            isVerified: false,
            isApproved: role !== 'kabadiwala', // kabadiwala needs approval
        });

        // Send OTP via email
        await sendOtpEmail(email, otp);

        res.status(201).json({
            success: true,
            message: 'Registration successful. OTP sent to your email.',
            userId: user._id,
        });
    } catch (err) {
        console.error('[AUTH ERROR] Registration failed:', err);
        res.status(err.statusCode || 500).json({
            success: false,
            message: err.message || 'Registration failed. Please try again.',
            error: process.env.NODE_ENV === 'development' ? err.message : undefined
        });
    }
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
        await sendOtpEmail(email, otp);
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
    await sendOtpEmail(user.email, otp);
    res.json({ success: true, message: 'OTP resent successfully.' });
};
