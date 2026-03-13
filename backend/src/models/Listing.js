const mongoose = require('mongoose');

const aiAnalysisSchema = new mongoose.Schema({
    resale_estimate: {
        min: Number,
        max: Number,
    },
    scrap_estimate: Number,
    recycle_value: Number,
    recommended_mode: { type: String, enum: ['reuse', 'scrap'] },
    resale_probability: Number,
    confidence: Number,
    identified_item: String,
    reasoning: String,
    material_type: String,
    co2_saving_est: Number,
    market_demand: String,
    environmental_impact: String,
    source: String,
}, { _id: false });

const listingSchema = new mongoose.Schema(
    {
        userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true, index: true },
        title: { type: String, required: true, trim: true, maxlength: 200 },
        description: { type: String, required: true, maxlength: 2000 },
        category: {
            type: String,
            required: true,
            enum: ['Electronics', 'Furniture', 'Clothing', 'Books', 'Appliances', 'Metals', 'Plastics', 'Paper', 'Glass', 'Other'],
        },
        condition: {
            type: String,
            required: true,
            enum: ['New', 'Good', 'Moderate', 'Poor', 'Scrap'],
        },
        images: [{ type: String }], // Cloudinary URLs
        estimatedWeight: { type: Number, min: 0 },
        brand: { type: String, trim: true },
        age: { type: Number, min: 0 },
        mode: {
            type: String,
            enum: ['reuse', 'scrap', 'pending'],
            default: 'pending',
        },
        status: {
            type: String,
            enum: ['analyzing', 'active', 'sold', 'converted', 'completed', 'cancelled'],
            default: 'analyzing',
            index: true,
        },
        AI_resale_estimate: Number,
        AI_scrap_estimate: Number,
        aiAnalysis: aiAnalysisSchema,
        // Reuse fields
        askingPrice: Number,
        buyerId: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
        interestedBuyers: [{ type: mongoose.Schema.Types.ObjectId, ref: 'User' }],
        isBoosted: { type: Boolean, default: false },
        boostExpiresAt: Date,
        // Scrap fields
        kabadiwalaId: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
        location: {
            type: {
                type: String,
                enum: ['Point'],
                default: 'Point',
            },
            coordinates: { type: [Number], default: [0, 0] },
        },
        address: String,
        convertedAt: Date,
        scheduledPickupDate: Date,
        scheduledTimeSlot: String,
        // Rarity detection fields
        is_rare_item: { type: Boolean, default: false },
        rarity_score: { type: Number, default: 0 },
        rarity_signals: [{ type: String }],
        rarity_label: { type: String, default: 'Common' },
        // Collector bidding fields
        collector_bidding_enabled: { type: Boolean, default: false },
        bidding_ends_at: Date,
        highest_bid: { type: Number, default: 0 },

    },
    { timestamps: true }
);

// Geospatial index for location-based queries
listingSchema.index({ location: '2dsphere' });
listingSchema.index({ userId: 1, status: 1 });
listingSchema.index({ mode: 1, status: 1, createdAt: -1 });
listingSchema.index({ category: 1, status: 1 });
listingSchema.index({ isBoosted: -1, createdAt: -1 });

module.exports = mongoose.model('Listing', listingSchema);
