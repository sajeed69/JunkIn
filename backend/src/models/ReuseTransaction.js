const mongoose = require('mongoose');

const reuseTransactionSchema = new mongoose.Schema(
    {
        listingId: { type: mongoose.Schema.Types.ObjectId, ref: 'Listing', required: true, index: true },
        sellerId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true, index: true },
        buyerId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true, index: true },
        finalAmount: { type: Number, required: true, min: 0 },
        commissionPct: { type: Number, default: 5 },
        commissionAmount: { type: Number },
        sellerAmount: { type: Number },
        status: {
            type: String,
            enum: ['pending', 'completed', 'cancelled', 'disputed'],
            default: 'pending',
            index: true,
        },
        paymentMethod: { type: String, enum: ['cash', 'upi', 'bank'], default: 'cash' },
        paymentStatus: { type: String, enum: ['pending', 'paid'], default: 'pending' },
        buyerRating: { type: Number, min: 1, max: 5 },
        sellerRating: { type: Number, min: 1, max: 5 },
        completedAt: Date,
    },
    { timestamps: true }
);

reuseTransactionSchema.pre('save', function (next) {
    if (this.finalAmount) {
        this.commissionAmount = parseFloat((this.finalAmount * (this.commissionPct / 100)).toFixed(2));
        this.sellerAmount = parseFloat((this.finalAmount - this.commissionAmount).toFixed(2));
    }
    next();
});

module.exports = mongoose.model('ReuseTransaction', reuseTransactionSchema);
