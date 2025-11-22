const express = require('express');
const router = express.Router();
const couponController = require('../controllers/couponController');
const { authenticateToken } = require('../middleware/authMiddleware');
const { adminMiddleware } = require('../middleware/adminMiddleware');

// Customer routes
router.post('/validate', authenticateToken, couponController.validateCoupon);
router.post('/apply', authenticateToken, couponController.applyCoupon);

// Admin routes
router.post('/', authenticateToken, adminMiddleware, couponController.createCoupon);
router.get('/', authenticateToken, adminMiddleware, couponController.getAllCoupons);
router.put('/:id', authenticateToken, adminMiddleware, couponController.updateCoupon);
router.delete('/:id', authenticateToken, adminMiddleware, couponController.deleteCoupon);
router.patch('/:id/toggle', authenticateToken, adminMiddleware, couponController.toggleCouponStatus);

module.exports = router;
