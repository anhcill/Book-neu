const express = require('express');
const router = express.Router();
const wishlistController = require('../controllers/wishlistController');
const { authenticateToken: authMiddleware } = require('../middleware/authMiddleware'); // Bắt buộc đăng nhập

// @route   PATCH /api/wishlist
// @desc    Thêm 1 item vào wishlist
// @access  Private (Bảo vệ)
router.patch('/', authMiddleware, wishlistController.addItemToWishlist);

// @route   DELETE /api/wishlist/:id
// @desc    Xóa 1 item khỏi wishlist (với :id là productId)
// @access  Private (Bảo vệ)
router.delete('/:id', authMiddleware, wishlistController.removeItemFromWishlist);

module.exports = router;