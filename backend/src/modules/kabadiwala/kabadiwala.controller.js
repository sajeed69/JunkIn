const ScrapTransaction = require('../../models/ScrapTransaction');
const Listing = require('../../models/Listing');
const User = require('../../models/User');
const Notification = require('../../models/Notification');

// GET /api/kabadiwala/available-requests
exports.getAvailableRequests = async (req, res) => {
    const requests = await ScrapTransaction.find({
        status: 'scheduled',
        kabadiwalaId: null,
    }).populate('userId', 'name rating');
    res.json({ success: true, requests });
};

// POST /api/kabadiwala/accept-pickup/:id
exports.acceptPickup = async (req, res) => {
    const transaction = await ScrapTransaction.findById(req.params.id);
    if (!transaction) return res.status(404).json({ success: false, message: 'Request not found.' });
    if (transaction.kabadiwalaId) return res.status(400).json({ success: false, message: 'Already assigned.' });

    transaction.kabadiwalaId = req.user._id;
    transaction.status = 'assigned';
    await transaction.save();

    // Notify User
    await Notification.create({
        userId: transaction.userId,
        type: 'pickup_assigned',
        title: 'Kabadiwala Assigned',
        message: `${req.user.name} has accepted your pickup request.`,
        data: { transactionId: transaction._id, kabadiwalaId: req.user._id },
    });

    res.json({ success: true, message: 'Pickup request accepted.', transaction });
};

// PUT /api/kabadiwala/complete-pickup/:id
exports.completePickup = async (req, res) => {
    const { weight, finalRate, notes } = req.body;
    const transaction = await ScrapTransaction.findById(req.params.id);

    if (!transaction) return res.status(404).json({ success: false, message: 'Transaction not found.' });
    if (transaction.kabadiwalaId.toString() !== req.user._id.toString()) {
        return res.status(403).json({ success: false, message: 'Not authorized for this pickup.' });
    }

    transaction.weight = parseFloat(weight);
    if (finalRate) transaction.rate = parseFloat(finalRate);
    transaction.status = 'completed';
    transaction.completedAt = new Date();
    transaction.notes = notes;
    await transaction.save();

    // Update listing status if linked
    if (transaction.listingId) {
        await Listing.findByIdAndUpdate(transaction.listingId, { status: 'completed' });
    }

    // Update user earnings (simplified logic)
    const user = await User.findById(transaction.userId);
    user.earnings += transaction.netAmount;
    await user.save();

    // Notify User
    await Notification.create({
        userId: transaction.userId,
        type: 'pickup_completed',
        title: 'Pickup Completed',
        message: `Your pickup for ${transaction.material} is complete. You earned ₹${transaction.netAmount}.`,
        data: { transactionId: transaction._id },
    });

    res.json({ success: true, message: 'Pickup completed successfully.', transaction });
};

// GET /api/kabadiwala/active-pickups
exports.getActivePickups = async (req, res) => {
    const pickups = await ScrapTransaction.find({
        kabadiwalaId: req.user._id,
        status: { $in: ['assigned', 'in_transit'] },
    }).populate('userId', 'name phone profileImage');
    res.json({ success: true, pickups });
};
