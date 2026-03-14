const ScrapTransaction = require('../../models/ScrapTransaction');
const Listing = require('../../models/Listing');
const User = require('../../models/User');
const Notification = require('../../models/Notification');

// POST /api/scrap/schedule
exports.schedulePickup = async (req, res) => {
    const { listingId, date, timeSlot, scrapType, estimatedWeight, address, notes } = req.body;

    let listing;
    if (listingId) {
        listing = await Listing.findById(listingId);
        if (!listing) return res.status(404).json({ success: false, message: 'Listing not found.' });
        listing.status = 'active';
        listing.mode = 'scrap';
        listing.scheduledPickupDate = date;
        listing.scheduledTimeSlot = timeSlot;
        await listing.save();
    }

    const transaction = await ScrapTransaction.create({
        listingId: listingId || null,
        userId: req.user._id,
        kabadiwalaId: null, // to be assigned or claimed
        material: scrapType,
        estimatedWeight: estimatedWeight ? parseFloat(estimatedWeight) : 0,
        rate: 12, // default rate, should come from Config
        status: 'scheduled',
        scheduledDate: date,
        scheduledTimeSlot: timeSlot,
        pickupAddress: address,
        notes,
    });

    // Notify nearby kabadiwalas (simplified: create system notification)
    await Notification.create({
        userId: req.user._id, // notify the user themselves for confirmation
        type: 'system',
        title: 'Pickup Scheduled',
        message: `Your scrap pickup for ${scrapType} is scheduled for ${date}.`,
    });

    res.status(201).json({ success: true, transaction });
};

// GET /api/scrap/my-pickups
exports.getMyPickups = async (req, res) => {
    const pickups = await ScrapTransaction.find({ userId: req.user._id })
        .populate('kabadiwalaId', 'name phone rating')
        .sort('-createdAt');
    res.json({ success: true, pickups });
};

// GET /api/scrap/rates
exports.getRates = async (req, res) => {
    // Should pull from Config model
    const rates = {
        paper: 12,
        plastic: 18,
        metal: 32,
        electronics: 45,
        glass: 3,
    };
    res.json({ success: true, rates });
};

// GET /api/scrap-prices (Requestly Integration)
const SCRAP_PRICES = {
    plastic: 18,
    iron: 32,
    copper: 680,
    electronics: 50,
};

exports.getScrapPricesData = () => SCRAP_PRICES;

exports.getScrapPrices = async (req, res) => {
    console.log('[DEBUG] GET /api/scrap-prices - Current Market Rates:', SCRAP_PRICES);
    res.json(SCRAP_PRICES);
};
// GET /api/resale-demand (Simulation)
exports.getResaleDemand = async (req, res) => {
    const demand = {
        electronics: 0.82,
        furniture: 0.65,
        bicycle: 0.75,
        clothing: 0.45,
        appliances: 0.90
    };
    console.log('[DEBUG] GET /api/resale-demand - Current Market Demand:', demand);
    res.json(demand);
};

// GET /api/collector-availability (Simulation)
exports.getCollectorAvailability = async (req, res) => {
    const availability = {
        available_collectors: 12,
        avg_pickup_time: "2 hours",
        peak_hours: false
    };
    console.log('[DEBUG] GET /api/collector-availability - Real-time Status:', availability);
    res.json(availability);
};
