const Notification = require('../../models/Notification');

// GET /api/notifications
exports.getNotifications = async (req, res) => {
    const notifications = await Notification.find({ userId: req.user._id })
        .sort('-createdAt')
        .limit(50);
    res.json({ success: true, notifications });
};

// PUT /api/notifications/:id/read
exports.markAsRead = async (req, res) => {
    const notification = await Notification.findOneAndUpdate(
        { _id: req.params.id, userId: req.user._id },
        { isRead: true, readAt: new Date() },
        { new: true }
    );
    if (!notification) return res.status(404).json({ success: false, message: 'Not found.' });
    res.json({ success: true, notification });
};

// PUT /api/notifications/read-all
exports.readAll = async (req, res) => {
    await Notification.updateMany(
        { userId: req.user._id, isRead: false },
        { isRead: true, readAt: new Date() }
    );
    res.json({ success: true, message: 'All marked as read.' });
};
