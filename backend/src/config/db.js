const mongoose = require('mongoose');
const logger = require('../utils/logger');
const dns = require('dns');

// Force Google DNS for SRV resolution (fixes ECONNREFUSED on some networks)
dns.setServers(['8.8.8.8', '8.8.4.4']);

// Prefer IPv4 for DNS resolution
if (dns.setDefaultResultOrder) {
    dns.setDefaultResultOrder('ipv4first');
}

const connectDB = async () => {
    try {
        const conn = await mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/junkin', {
            serverSelectionTimeoutMS: 5000,
        });
        logger.info(`✅ MongoDB connected: ${conn.connection.host}`);

        // Drop stale unique index on referral_code (was removed from schema)
        try {
            await conn.connection.collection('users').dropIndex('referral_code_1');
            logger.info('🗑️ Dropped stale referral_code_1 index');
        } catch (e) {
            // Index doesn't exist — that's fine
        }
    } catch (err) {
        logger.error(`❌ MongoDB connection error: ${err.message}`);
        process.exit(1);
    }
};

mongoose.connection.on('disconnected', () => {
    logger.warn('MongoDB disconnected. Attempting to reconnect...');
});

module.exports = connectDB;
