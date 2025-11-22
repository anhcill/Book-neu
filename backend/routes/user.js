const express = require('express');
const router = express.Router();
const userController = require('../controllers/userController');
const { authenticateToken: authMiddleware } = require('../middleware/authMiddleware');

// @route   GET /api/user
// @desc    Lấy thông tin user (cart, wishlist)
// @access  Private (Bắt buộc phải có token)
router.get('/user', authMiddleware, userController.getUserData);

module.exports = router;