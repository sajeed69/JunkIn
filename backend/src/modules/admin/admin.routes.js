const express = require('express');
const router = express.Router();
const protect = require('../../middleware/auth');
const authorize = require('../../middleware/rbac');
const ctrl = require('./admin.controller');

router.use(protect);
router.use(authorize('admin'));

router.get('/stats', ctrl.getStats);
router.get('/users', ctrl.getAllUsers);
router.put('/users/:id/ban', ctrl.banUser);
router.put('/users/:id/approve', ctrl.approveKabadiwala);
router.get('/config', ctrl.getConfig);
router.put('/config', ctrl.updateConfig);

module.exports = router;
