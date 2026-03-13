const express = require('express');
const router = express.Router();
const protect = require('../../middleware/auth');
const ctrl = require('./listing.controller');

const upload = require('../../utils/upload');

// Public
router.get('/', ctrl.getListings);
router.get('/:id', ctrl.getListingById);

// Protected
router.use(protect);
router.get('/user/my-listings', ctrl.getMyListings);
router.post('/', upload.array('images', 5), ctrl.createListing);
router.put('/:id', ctrl.updateListing);
router.put('/:id/convert-to-scrap', ctrl.convertToScrap);
router.post('/:id/interest', ctrl.expressInterest);

module.exports = router;
