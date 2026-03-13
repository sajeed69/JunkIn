const express = require('express');
const router = express.Router();
const protect = require('../../middleware/auth');
const ctrl = require('./reward.controller');

// All routes require authentication
router.use(protect);

router.get('/me', ctrl.getMyRewards);
router.post('/scratch/:rewardId', ctrl.scratchCard);
router.post('/award', ctrl.awardPoints);

module.exports = router;
