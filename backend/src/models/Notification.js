const mongoose = require('mongoose');

const notificationSchema = new mongoose.Schema(
    {
        userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true, index: true },
        type: {
            type: String,
            enum: ['pickup_assigned', 'pickup_completed', 'item_sold', 'interest_received', 'convert_reminder', 'payment_received', 'rating_received', 'system'],
            required: true,
        },
        title: { type: String, required: true },
        message: { type: String, required: true },
        data: { type: mongoose.Schema.Types.Mixed }, // flexible payload
        isRead: { type: Boolean, default: false, index: true },
        readAt: Date,
    },
    { timestamps: true }
);

notificationSchema.index({ userId: 1, isRead: 1, createdAt: -1 });

module.exports = mongoose.model('Notification', notificationSchema);
