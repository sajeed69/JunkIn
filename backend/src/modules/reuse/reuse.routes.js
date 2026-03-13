const express = require('express');
const router = express.Router();
const protect = require('../../middleware/auth');
const ctrl = require('./reuse.controller');

router.use(protect);

router.post('/buy/:listingId', ctrl.buyItem);
router.get('/my-purchases', ctrl.getMyPurchases);
router.get('/my-sales', ctrl.getMySales);

module.exports = router;
