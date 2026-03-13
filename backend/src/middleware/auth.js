const jwt = require('jsonwebtoken');
const User = require('../models/User');

const protect = async (req, res, next) => {
    const authHeader = req.headers.authorization;
    console.log('[DEBUG] Auth Header:', authHeader ? 'Present' : 'Missing');

    if (!authHeader || !authHeader.startsWith('Bearer ')) {
        console.log('[DEBUG] Auth failed: No Bearer token');
        return res.status(401).json({ success: false, message: 'Access denied. No token provided.' });
    }

    const token = authHeader.split(' ')[1];

    try {
        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        const user = await User.findById(decoded.id).select('-password');

        if (!user) return res.status(401).json({ success: false, message: 'User not found.' });
        if (user.isBanned) return res.status(403).json({ success: false, message: 'Account has been banned.' });
        if (!user.isVerified) return res.status(403).json({ success: false, message: 'Please verify your account.' });

        req.user = user;
        next();
    } catch (err) {
        return res.status(401).json({ success: false, message: 'Invalid or expired token.' });
    }
};

module.exports = protect;
