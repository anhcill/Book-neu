const express = require('express');
const router = express.Router();
const adminOrderController = require('../controllers/adminOrderController');
const { adminMiddleware } = require('../middleware/adminMiddleware');

// @route   GET api/admin/orders
// @desc    Lấy tất cả đơn hàng (có phân trang, filter)
// @access  Admin only
router.get('/', adminMiddleware, adminOrderController.getAllOrders);

// @route   GET api/admin/orders/stats
// @desc    Lấy thống kê tổng quan
// @access  Admin only
router.get('/stats', adminMiddleware, adminOrderController.getOrderStats);

// @route   GET api/admin/orders/recent
// @desc    Lấy đơn hàng gần đây
// @access  Admin only
router.get('/recent', adminMiddleware, adminOrderController.getRecentOrders);

// @route   GET api/admin/orders/:id
// @desc    Lấy chi tiết đơn hàng
// @access  Admin only
// Note: Put '/recent' above before '/:id' to avoid route collision
router.get('/:id', adminMiddleware, adminOrderController.getOrderById);

// @route   PUT api/admin/orders/:id
// @desc    Cập nhật trạng thái đơn hàng
// @access  Admin only
router.put('/:id', adminMiddleware, adminOrderController.updateOrderStatus);

// @route   PATCH api/admin/orders/:id/confirm
// @desc    Admin xác nhận đơn hàng
// @access  Admin only
router.patch('/:id/confirm', adminMiddleware, adminOrderController.confirmOrder);

// @route   PATCH api/admin/orders/:id/shipping
// @desc    Admin cập nhật trạng thái shipping
// @access  Admin only
router.patch('/:id/shipping', adminMiddleware, adminOrderController.updateOrderShipping);

// @route   PATCH api/admin/orders/:id/delivered
// @desc    Admin cập nhật trạng thái đã giao
// @access  Admin only
router.patch('/:id/delivered', adminMiddleware, adminOrderController.updateOrderDelivered);

// @route   PATCH api/admin/orders/:id/cancel
// @desc    Admin hủy đơn hàng
// @access  Admin only
router.patch('/:id/cancel', adminMiddleware, adminOrderController.cancelOrder);

module.exports = router;
