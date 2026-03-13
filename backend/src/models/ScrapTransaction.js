const mongoose = require('mongoose');

const scrapTransactionSchema = new mongoose.Schema(
    {
        listingId: { type: mongoose.Schema.Types.ObjectId, ref: 'Listing', required: true, index: true },
        userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true, index: true },
        kabadiwalaId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true, index: true },
        material: { type: String, required: true },
        category: { type: String },
        weight: { type: Number, min: 0 }, // actual weight entered by kabadiwala
        estimatedWeight: { type: Number, min: 0 },
        rate: { type: Number, required: true }, // ₹ per kg
        grossAmount: { type: Number }, // weight * rate
        commissionPct: { type: Number, default: 5 },
        commissionAmount: { type: Number },
        netAmount: { type: Number }, // grossAmount - commissionAmount
        status: {
            type: String,
            enum: ['scheduled', 'assigned', 'in_transit', 'completed', 'cancelled'],
            default: 'scheduled',
            index: true,
        },
        scheduledDate: { type: Date },
        scheduledTimeSlot: { type: String },
        pickupAddress: { type: String },
        notes: { type: String },
        receiptUrl: { type: String },
        receiptId: { type: String, unique: true, sparse: true },
        kabadiwalaRating: { type: Number, min: 1, max: 5 },
        kabadiwalaReview: { type: String },
        completedAt: { type: Date },
    },
    { timestamps: true }
);

// Calculate amounts before save
scrapTransactionSchema.pre('save', function (next) {
    if (this.weight && this.rate) {
        this.grossAmount = parseFloat((this.weight * this.rate).toFixed(2));
        this.commissionAmount = parseFloat((this.grossAmount * (this.commissionPct / 100)).toFixed(2));
        this.netAmount = parseFloat((this.grossAmount - this.commissionAmount).toFixed(2));
    }
    next();
});

scrapTransactionSchema.index({ status: 1, scheduledDate: -1 });

module.exports = mongoose.model('ScrapTransaction', scrapTransactionSchema);
