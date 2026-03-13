const express = require('express');
const router = express.Router();
const protect = require('../../middleware/auth');
const ctrl = require('./ai.controller');

router.use(protect);
router.post('/analyze', ctrl.analyzeItem);

module.exports = router;
