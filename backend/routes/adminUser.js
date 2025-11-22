const express = require('express');
const router = express.Router();
const adminUserController = require('../controllers/adminUserController');
const { adminMiddleware } = require('../middleware/adminMiddleware');
const { authenticateToken: authMiddleware } = require('../middleware/authMiddleware');

// @route   GET api/admin/users
// @desc    Lấy danh sách tất cả users (có pagination)
// @access  Private/Admin
router.get('/', authMiddleware, adminMiddleware, adminUserController.getAllUsers);

// @route   GET api/admin/users/stats/overview
// @desc    Lấy thống kê users
// @access  Private/Admin
router.get('/stats/overview', authMiddleware, adminMiddleware, adminUserController.getUserStats);

// @route   GET api/admin/users/:userId
// @desc    Lấy chi tiết một user
// @access  Private/Admin
router.get('/:userId', authMiddleware, adminMiddleware, adminUserController.getUserById);

// @route   PATCH api/admin/users/:userId/ban
// @desc    Ban một user
// @access  Private/Admin
router.patch('/:userId/ban', authMiddleware, adminMiddleware, adminUserController.banUser);

// @route   PATCH api/admin/users/:userId/unban
// @desc    Unban một user
// @access  Private/Admin
router.patch('/:userId/unban', authMiddleware, adminMiddleware, adminUserController.unbanUser);

// @route   DELETE api/admin/users/:userId
// @desc    Xóa một user
// @access  Private/Admin
router.delete('/:userId', authMiddleware, adminMiddleware, adminUserController.deleteUser);

module.exports = router;
