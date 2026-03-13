const ReuseTransaction = require('../../models/ReuseTransaction');
const Listing = require('../../models/Listing');
const Notification = require('../../models/Notification');
const User = require('../../models/User');

// POST /api/reuse/buy/:listingId
exports.buyItem = async (req, res) => {
    const { finalAmount, paymentMethod } = req.body;
    const listing = await Listing.findById(req.params.listingId);

    if (!listing) return res.status(404).json({ success: false, message: 'Listing not found.' });
    if (listing.status !== 'active') return res.status(400).json({ success: false, message: 'Item no longer available.' });
    if (listing.userId.toString() === req.user._id.toString()) {
        return res.status(400).json({ success: false, message: 'You cannot buy your own item.' });
    }

    const transaction = await ReuseTransaction.create({
        listingId: listing._id,
        sellerId: listing.userId,
        buyerId: req.user._id,
        finalAmount: finalAmount || listing.askingPrice || listing.AI_resale_estimate,
        paymentMethod: paymentMethod || 'cash',
        status: 'pending',
    });

    listing.status = 'sold';
    listing.buyerId = req.user._id;
    await listing.save();

    // Notify Seller
    await Notification.create({
        userId: listing.userId,
        type: 'item_sold',
        title: 'Item Sold!',
        message: `Your item "${listing.title}" has been bought by ${req.user.name}.`,
        data: { transactionId: transaction._id, buyerId: req.user._id },
    });

    res.status(201).json({ success: true, transaction });
};

// GET /api/reuse/my-purchases
exports.getMyPurchases = async (req, res) => {
    const purchases = await ReuseTransaction.find({ buyerId: req.user._id })
        .populate('listingId', 'title images category')
        .populate('sellerId', 'name rating phone')
        .sort('-createdAt');
    res.json({ success: true, purchases });
};

// GET /api/reuse/my-sales
exports.getMySales = async (req, res) => {
    const sales = await ReuseTransaction.find({ sellerId: req.user._id })
        .populate('listingId', 'title images category')
        .populate('buyerId', 'name rating phone')
        .sort('-createdAt');
    res.json({ success: true, sales });
};
