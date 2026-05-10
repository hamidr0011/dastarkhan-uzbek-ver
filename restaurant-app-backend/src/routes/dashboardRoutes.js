const express = require('express');
const { getStats, getRecentOrders } = require('../controllers/dashboardController');
const { protect } = require('../middleware/authMiddleware');
const { requireRole } = require('../middleware/roleMiddleware');

const router = express.Router();

router.use(protect);
router.use(requireRole('manager'));

router.get('/stats', getStats);
router.get('/recent-orders', getRecentOrders);

module.exports = router;
