const express = require('express');
const router = express.Router();
const protect = require('../../middleware/auth');
const ctrl = require('./bid.controller');

// Public — view auctions and bids
router.get('/auctions/active', ctrl.getAuctionListings);
router.get('/:listingId', ctrl.getBidsForListing);

// Protected — place a bid
router.use(protect);
router.post('/:listingId', ctrl.placeBid);

module.exports = router;
