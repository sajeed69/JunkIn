const Listing = require('../../models/Listing');
const User = require('../../models/User');
const axios = require('axios');

// POST /api/listings
exports.createListing = async (req, res) => {
    const { title, description, category, condition, estimatedWeight, address, brand, age } = req.body;

    console.log("Incoming listing request", req.body);
    const images = req.files ? req.files.map((f) => f.path || f.secure_url || f.filename) : [];
    
    let listing;
    try {
        console.log("Saving listing to DB (initial status: analyzing)");
        listing = await Listing.create({
            userId: req.user._id,
            title,
            description,
            category,
            condition,
            estimatedWeight: estimatedWeight ? parseFloat(estimatedWeight) : undefined,
            images,
            address,
            brand,
            age: age ? parseInt(age) : undefined,
            status: 'analyzing',
            mode: 'pending',
        });
    } catch (err) {
        console.error("Database error while creating listing:", err.message);
        return res.status(500).json({ success: false, message: 'Database error while creating listing.' });
    }

    // Call AI service asynchronously
    try {
        console.log("Running AI analysis");
        const aiResponse = await axios.post(`${process.env.AI_SERVICE_URL || 'http://localhost:8001'}/analyze-item`, {
            category,
            condition,
            estimated_weight: estimatedWeight,
            title,
            brand,
            age,
            description,
            image_urls: images
        }, { timeout: 15000 });
        
        const ai = aiResponse.data;
        console.log("AI response:", ai);

        listing.aiAnalysis = {
            resale_estimate: {
                min: ai.resale_estimate?.min || 0,
                max: ai.resale_estimate?.max || 0,
            },
            scrap_estimate: ai.scrap_estimate || 0,
            recycle_value: ai.recycle_value || 0,
            recommended_mode: ai.recommended_mode || 'reuse',
            resale_probability: ai.resale_probability || 70,
            confidence: ai.confidence || 50,
            identified_item: ai.identified_item || title,
            reasoning: ai.reasoning || '',
            material_type: ai.material_type || 'Other',
            co2_saving_est: ai.co2_saving_est || 0,
            market_demand: ai.market_demand || 'Moderate',
            environmental_impact: ai.environmental_impact || '',
            source: ai.source || 'gemini',
        };
        listing.AI_resale_estimate = ai.resale_estimate?.max || 0;
        listing.AI_scrap_estimate = ai.scrap_estimate || 0;
        listing.mode = ai.recommended_mode || 'reuse';
        listing.status = 'active';
        await listing.save();
        console.log("Final listing saved to DB with AI results");

        // ── Rarity Analysis (non-blocking) ──
        try {
            console.log("[RARITY] Starting rarity analysis for:", listing.title);
            const rarityResponse = await axios.post(
                `${process.env.AI_SERVICE_URL || 'http://localhost:8001'}/analyze-rarity`,
                {
                    title: listing.title,
                    category: listing.category,
                    condition: listing.condition,
                    brand: listing.brand,
                    description: listing.description,
                    identified_item: ai.identified_item || listing.title,
                },
                { timeout: 20000 }
            );

            const rarity = rarityResponse.data;
            console.log("[RARITY] Result:", JSON.stringify(rarity));

            listing.is_rare_item = rarity.is_rare || false;
            listing.rarity_score = rarity.rarity_score || 0;
            listing.rarity_signals = rarity.rarity_signals || [];
            listing.rarity_label = rarity.rarity_label || 'Common';

            if (rarity.is_rare) {
                listing.collector_bidding_enabled = true;
                listing.bidding_ends_at = new Date(Date.now() + 48 * 60 * 60 * 1000); // 48 hours
                console.log("[RARITY] 🏆 RARE ITEM DETECTED! Bidding enabled until:", listing.bidding_ends_at);
            }

            await listing.save();
            console.log("[RARITY] Listing updated with rarity data");
        } catch (rarityErr) {
            console.error("[RARITY] Rarity analysis failed (non-blocking):", rarityErr.message);
        }

    } catch (err) {
        console.error("AI Analysis failed (using fallback):", err.message);
        
        // Fallback valuation - Do NOT block listing creation
        listing.aiAnalysis = {
            resale_estimate: { min: 800, max: 1500 },
            scrap_estimate: 120,
            recycle_value: 144,
            recommended_mode: 'reuse',
            resale_probability: 70,
            confidence: 50,
            identified_item: title,
            reasoning: 'AI service unavailable - Using fallback valuation.',
            material_type: 'Other',
            co2_saving_est: 0,
            market_demand: 'Moderate',
            environmental_impact: 'General waste reduction.',
            source: 'fallback',
        };
        listing.AI_resale_estimate = 1500;
        listing.AI_scrap_estimate = 120;
        listing.mode = 'reuse';
        listing.status = 'active';
        await listing.save();
        console.log("Listing created with fallback valuations.");
    }

    res.status(201).json({ success: true, listing });

};

// GET /api/listings
exports.getListings = async (req, res) => {
    const { mode, status, category, page = 1, limit = 20, sort = '-createdAt' } = req.query;

    const filter = {};
    if (mode) filter.mode = mode;
    if (status) filter.status = status;
    else filter.status = 'active';
    if (category) filter.category = category;

    const skip = (parseInt(page) - 1) * parseInt(limit);

    const [listings, total] = await Promise.all([
        Listing.find(filter)
            .populate('userId', 'name rating profileImage')
            .sort(sort)
            .skip(skip)
            .limit(parseInt(limit))
            .lean(),
        Listing.countDocuments(filter),
    ]);

    res.json({
        success: true,
        listings,
        pagination: { page: parseInt(page), limit: parseInt(limit), total, pages: Math.ceil(total / parseInt(limit)) },
    });
};

// GET /api/listings/my-listings
exports.getMyListings = async (req, res) => {
    const listings = await Listing.find({ userId: req.user._id })
        .sort('-createdAt')
        .lean();
    res.json({ success: true, listings });
};

// GET /api/listings/:id
exports.getListingById = async (req, res) => {
    const listing = await Listing.findById(req.params.id)
        .populate('userId', 'name rating profileImage createdAt');

    if (!listing) return res.status(404).json({ success: false, message: 'Listing not found.' });

    res.json({ success: true, listing });
};

// PUT /api/listings/:id
exports.updateListing = async (req, res) => {
    const listing = await Listing.findById(req.params.id);
    if (!listing) return res.status(404).json({ success: false, message: 'Not found.' });
    if (listing.userId.toString() !== req.user._id.toString() && req.user.role !== 'admin') {
        return res.status(403).json({ success: false, message: 'Not authorized.' });
    }

    const allowed = ['title', 'description', 'askingPrice', 'condition'];
    allowed.forEach((k) => { if (req.body[k] !== undefined) listing[k] = req.body[k]; });
    await listing.save();

    res.json({ success: true, listing });
};

// PUT /api/listings/:id/convert-to-scrap
exports.convertToScrap = async (req, res) => {
    const listing = await Listing.findById(req.params.id);
    if (!listing) return res.status(404).json({ success: false, message: 'Not found.' });
    if (listing.userId.toString() !== req.user._id.toString()) {
        return res.status(403).json({ success: false, message: 'Not authorized.' });
    }

    listing.mode = 'scrap';
    listing.status = 'active';
    listing.convertedAt = new Date();
    await listing.save();

    res.json({ success: true, message: 'Listing converted to Scrap mode.', listing });
};

// POST /api/listings/:id/interest
exports.expressInterest = async (req, res) => {
    const listing = await Listing.findById(req.params.id);
    if (!listing) return res.status(404).json({ success: false, message: 'Not found.' });

    if (!listing.interestedBuyers.includes(req.user._id)) {
        listing.interestedBuyers.push(req.user._id);
        await listing.save();
    }

    res.json({ success: true, message: 'Interest registered! Seller will be notified.' });
};
