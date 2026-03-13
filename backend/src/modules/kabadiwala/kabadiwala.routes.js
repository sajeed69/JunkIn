const express = require('express');
const router = express.Router();
const protect = require('../../middleware/auth');
const authorize = require('../../middleware/rbac');
const ctrl = require('./kabadiwala.controller');

router.use(protect);
router.use(authorize('kabadiwala', 'admin'));

router.get('/requests', ctrl.getAvailableRequests);
router.get('/active', ctrl.getActivePickups);
router.post('/accept/:id', ctrl.acceptPickup);
router.put('/complete/:id', ctrl.completePickup);

module.exports = router;
