const express = require('express');
const router = express.Router();
const cartController = require('../controllers/cartController');
const { authenticateToken: authMiddleware } = require('../middleware/authMiddleware'); // Bắt buộc đăng nhập

// @route   PATCH /api/cart
// @desc    Thêm 1 item vào cart (hoặc tăng số lượng)
// @access  Private (Bảo vệ)
router.patch('/', authMiddleware, cartController.addItemToCart);

// @route   PATCH /api/cart/:id (VỚI :id LÀ PRODUCT ID)
// @desc    Cập nhật số lượng 1 item
// @access  Private
router.patch('/:id', authMiddleware, cartController.updateCartItemQuantity);

// @route   DELETE /api/cart/:id (VỚI :id LÀ PRODUCT ID)
// @desc    Xóa 1 item khỏi cart (Đây là API bị lỗi 404)
// @access  Private
router.delete('/:id', authMiddleware, cartController.removeItemFromCart);

module.exports = router;