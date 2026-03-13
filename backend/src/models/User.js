const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const addressSchema = new mongoose.Schema({
    label: { type: String, default: 'Home' },
    line1: { type: String, required: true },
    city: { type: String, required: true },
    state: { type: String, required: true },
    pincode: { type: String, required: true },
    isDefault: { type: Boolean, default: false },
});

const userSchema = new mongoose.Schema(
    {
        name: { type: String, required: true, trim: true, maxlength: 100 },
        email: {
            type: String,
            required: true,
            unique: true,
            lowercase: true,
            trim: true,
            match: [/^\S+@\S+\.\S+$/, 'Invalid email format'],
        },
        phone: { type: String, trim: true, sparse: true },
        password: { type: String, required: true, minlength: 8, select: false },
        role: {
            type: String,
            enum: ['user', 'kabadiwala', 'recycler', 'admin'],
            default: 'user',
        },
        isVerified: { type: Boolean, default: false },
        isApproved: { type: Boolean, default: true }, // kabadiwala requires admin approval
        isBanned: { type: Boolean, default: false },
        otp: { type: String, select: false },
        otpExpiry: { type: Date, select: false },
        addresses: [addressSchema],
        rating: {
            average: { type: Number, default: 0, min: 0, max: 5 },
            count: { type: Number, default: 0 },
        },
        earnings: { type: Number, default: 0 },
        trustScore: { type: Number, default: 100, min: 0, max: 200 },
        bio: { type: String, maxlength: 500 },
        totalTransactions: { type: Number, default: 0 },
        profileImage: { type: String },
        subscription: {
            type: { type: String, enum: ['free', 'pro'], default: 'free' },
            expiresAt: Date,
        },
    },
    { timestamps: true }
);

// Indexes
userSchema.index({ email: 1 });
userSchema.index({ role: 1 });
userSchema.index({ 'rating.average': -1 });

// Hash password before save
userSchema.pre('save', async function (next) {
    if (!this.isModified('password')) return next();
    this.password = await bcrypt.hash(this.password, 12);
    next();
});

// Compare password
userSchema.methods.comparePassword = async function (candidate) {
    return bcrypt.compare(candidate, this.password);
};

// Hide sensitive fields in JSON response
userSchema.methods.toJSON = function () {
    const obj = this.toObject();
    delete obj.password;
    delete obj.otp;
    delete obj.otpExpiry;
    return obj;
};

module.exports = mongoose.model('User', userSchema);
