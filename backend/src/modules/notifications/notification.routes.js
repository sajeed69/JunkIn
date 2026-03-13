const express = require('express');
const router = express.Router();
const protect = require('../../middleware/auth');
const ctrl = require('./notification.controller');

router.use(protect);
router.get('/', ctrl.getNotifications);
router.put('/:id/read', ctrl.markAsRead);
router.put('/read-all', ctrl.readAll);

module.exports = router;
