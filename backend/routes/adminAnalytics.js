const express = require('express');
const router = express.Router();
const adminAnalyticsController = require('../controllers/adminAnalyticsController');
const { adminMiddleware } = require('../middleware/adminMiddleware');

// @route   GET api/admin/analytics/products
// @desc    Phân tích sản phẩm
// @access  Admin only
router.get('/products', adminMiddleware, adminAnalyticsController.getProductAnalytics);

// @route   GET api/admin/analytics/revenue
// @desc    Phân tích doanh thu
// @access  Admin only
router.get('/revenue', adminMiddleware, adminAnalyticsController.getRevenueAnalytics);

// @route   GET api/admin/analytics/customers
// @desc    Phân tích khách hàng
// @access  Admin only
router.get('/customers', adminMiddleware, adminAnalyticsController.getCustomerAnalytics);

module.exports = router;
