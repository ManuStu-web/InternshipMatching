const express = require('express');
const router = express.Router();
const auth = require('../middleware/authMiddleware');
const role = require('../middleware/roleMiddleware');
const { getOverview } = require('../controllers/analyticsController');

// Government-only analytics overview
router.get('/overview', auth, role('admin','officer'), getOverview);

module.exports = router;
