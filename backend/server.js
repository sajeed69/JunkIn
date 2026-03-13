require('dotenv').config();
require('express-async-errors');
const app = require('./src/app');

const PORT = process.env.PORT || 5000;

const server = app.listen(PORT, () => {
    console.log(`\n🚀 JunkIn API Server running on port ${PORT}`);
    console.log(`📖 Swagger docs: http://localhost:${PORT}/api-docs`);
    console.log(`🌱 Environment: ${process.env.NODE_ENV}\n`);
});

process.on('unhandledRejection', (err) => {
    console.error('Unhandled Rejection:', err.message);
    server.close(() => process.exit(1));
});

process.on('SIGTERM', () => {
    server.close(() => {
        console.log('Server closed gracefully.');
        process.exit(0);
    });
});
