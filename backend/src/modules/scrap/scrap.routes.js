const express = require('express');
const router = express.Router();
const protect = require('../../middleware/auth');
const ctrl = require('./scrap.controller');

router.get('/rates', ctrl.getRates);

router.use(protect);
router.post('/schedule', ctrl.schedulePickup);
router.get('/my-pickups', ctrl.getMyPickups);

module.exports = router;
