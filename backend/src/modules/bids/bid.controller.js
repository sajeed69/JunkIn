const Bid = require('../../models/Bid');
const Listing = require('../../models/Listing');

// POST /api/bids/:listingId — Place a bid on a rare item
exports.placeBid = async (req, res) => {
    try {
        const { listingId } = req.params;
        const { amount } = req.body;

        if (!amount || amount <= 0) {
            return res.status(400).json({ success: false, message: 'Invalid bid amount.' });
        }

        const listing = await Listing.findById(listingId);
        if (!listing) {
            return res.status(404).json({ success: false, message: 'Listing not found.' });
        }

        if (!listing.collector_bidding_enabled) {
            return res.status(400).json({ success: false, message: 'Bidding is not enabled for this item.' });
        }

        // Check if bidding has ended
        if (listing.bidding_ends_at && new Date() > listing.bidding_ends_at) {
            return res.status(400).json({ success: false, message: 'Bidding has ended for this item.' });
        }

        // Bid must be higher than current highest
        if (amount <= listing.highest_bid) {
            return res.status(400).json({
                success: false,
                message: `Bid must be higher than current highest bid of ₹${listing.highest_bid}.`,
            });
        }

        // Create the bid
        const bid = await Bid.create({
            listingId,
            bidderId: req.user._id,
            amount,
        });

        // Update listing's highest bid
        listing.highest_bid = amount;
        await listing.save();

        console.log(`[BID] New bid ₹${amount} on listing ${listingId} by user ${req.user._id}`);

        res.status(201).json({
            success: true,
            message: `Bid of ₹${amount} placed successfully!`,
            bid,
            highest_bid: amount,
        });
    } catch (err) {
        console.error('[BID] Error placing bid:', err.message);
        res.status(500).json({ success: false, message: 'Failed to place bid.' });
    }
};

// GET /api/bids/:listingId — Get all bids for a listing
exports.getBidsForListing = async (req, res) => {
    try {
        const bids = await Bid.find({ listingId: req.params.listingId })
            .populate('bidderId', 'name profileImage')
            .sort('-amount')
            .lean();

        res.json({ success: true, bids });
    } catch (err) {
        console.error('[BID] Error fetching bids:', err.message);
        res.status(500).json({ success: false, message: 'Failed to fetch bids.' });
    }
};

// GET /api/bids/auctions/active — Get all active auction listings
exports.getAuctionListings = async (req, res) => {
    try {
        const { page = 1, limit = 20 } = req.query;
        const skip = (parseInt(page) - 1) * parseInt(limit);

        const filter = {
            collector_bidding_enabled: true,
            status: 'active',
        };

        const [listings, total] = await Promise.all([
            Listing.find(filter)
                .populate('userId', 'name rating profileImage')
                .sort('-createdAt')
                .skip(skip)
                .limit(parseInt(limit))
                .lean(),
            Listing.countDocuments(filter),
        ]);

        res.json({
            success: true,
            listings,
            pagination: {
                page: parseInt(page),
                limit: parseInt(limit),
                total,
                pages: Math.ceil(total / parseInt(limit)),
            },
        });
    } catch (err) {
        console.error('[BID] Error fetching auction listings:', err.message);
        res.status(500).json({ success: false, message: 'Failed to fetch auction listings.' });
    }
};
