const express = require('express');
const router = express.Router();
const orderController = require('../controllers/orderController');
const { authenticateToken: authMiddleware } = require('../middleware/authMiddleware');

// @route   GET api/orders
// @desc    Lấy tất cả đơn hàng của user đã đăng nhập
// @access  Private
router.get('/', authMiddleware, orderController.getOrders);

// @route   GET api/orders/:orderId
// @desc    Lấy chi tiết một đơn hàng
// @access  Private
router.get('/:orderId', authMiddleware, orderController.getOrderById);

// @route   PATCH api/orders/:orderId/cancel
// @desc    Hủy đơn hàng (chỉ pending orders)
// @access  Private
router.patch('/:orderId/cancel', authMiddleware, orderController.cancelOrder);

module.exports = router;
