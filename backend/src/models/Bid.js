const mongoose = require('mongoose');

const bidSchema = new mongoose.Schema(
    {
        listingId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'Listing',
            required: true,
            index: true,
        },
        bidderId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'User',
            required: true,
        },
        amount: {
            type: Number,
            required: true,
            min: 1,
        },
    },
    { timestamps: true }
);

// Compound index for quick lookups
bidSchema.index({ listingId: 1, amount: -1 });
bidSchema.index({ bidderId: 1, createdAt: -1 });

module.exports = mongoose.model('Bid', bidSchema);
