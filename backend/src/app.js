const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const morgan = require('morgan');
const path = require('path');

const connectDB = require('./config/db');
const errorHandler = require('./middleware/errorHandler');
const rateLimiter = require('./middleware/rateLimiter');

// Routes
const authRoutes = require('./modules/auth/auth.routes');
const listingRoutes = require('./modules/listings/listing.routes');
const scrapRoutes = require('./modules/scrap/scrap.routes');
const reuseRoutes = require('./modules/reuse/reuse.routes');
const kabadiwalaRoutes = require('./modules/kabadiwala/kabadiwala.routes');
const adminRoutes = require('./modules/admin/admin.routes');
const aiRoutes = require('./modules/ai/ai.routes');
const notificationRoutes = require('./modules/notifications/notification.routes');
const bidRoutes = require('./modules/bids/bid.routes');
const rewardRoutes = require('./modules/rewards/reward.routes');
const scrapController = require('./modules/scrap/scrap.controller');


// Connect to MongoDB
connectDB();

const app = express();

// Security
app.use(helmet());
app.use(cors({
    origin: process.env.FRONTEND_URL || 'http://localhost:5173',
    credentials: true,
}));

// Logging
if (process.env.NODE_ENV !== 'test') {
    app.use(morgan('dev'));
}

// Body parsing
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// Rate limiting
app.use('/api/auth', rateLimiter.authLimiter);
app.use('/api', rateLimiter.generalLimiter);

// Swagger docs
const swaggerUi = require('swagger-ui-express');
const YAML = require('yamljs');
try {
    const swaggerDoc = YAML.load(path.join(__dirname, '../swagger.yaml'));
    app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerDoc));
} catch {
    console.warn('swagger.yaml not found, skipping docs.');
}

// Health check
app.get('/health', (req, res) => {
    res.json({ status: 'ok', timestamp: new Date().toISOString(), version: '1.0.0' });
});

// API Routes
app.get('/api/scrap-prices', scrapController.getScrapPrices);
app.get('/api/resale-demand', scrapController.getResaleDemand);
app.get('/api/collector-availability', scrapController.getCollectorAvailability);

app.use('/api/auth', authRoutes);
app.use('/api/listings', listingRoutes);
app.use('/api/scrap', scrapRoutes);
app.use('/api/reuse', reuseRoutes);
app.use('/api/kabadiwala', kabadiwalaRoutes);
app.use('/api/admin', adminRoutes);
app.use('/api/ai', aiRoutes);
app.use('/api/notifications', notificationRoutes);
app.use('/api/bids', bidRoutes);
app.use('/api/rewards', rewardRoutes);

// 404
app.all('*', (req, res) => {
    res.status(404).json({ success: false, message: `Route ${req.originalUrl} not found` });
});

// Error handler (must be last)
app.use(errorHandler);

module.exports = app;
