const express = require('express');
const router = express.Router();
const { authenticateToken: authMiddleware } = require('../middleware/authMiddleware');
const {
  getUserNotifications,
  markAsRead,
  markAllAsRead,
  deleteNotification
} = require('../controllers/notificationController');

// @route   GET api/notifications
// @desc    Lấy danh sách thông báo của user
// @access  Private
router.get('/', authMiddleware, getUserNotifications);

// @route   PATCH api/notifications/:id/read
// @desc    Đánh dấu thông báo đã đọc
// @access  Private
router.patch('/:id/read', authMiddleware, markAsRead);

// @route   PATCH api/notifications/read-all
// @desc    Đánh dấu tất cả đã đọc
// @access  Private
router.patch('/read-all', authMiddleware, markAllAsRead);

// @route   DELETE api/notifications/:id
// @desc    Xóa thông báo
// @access  Private
router.delete('/:id', authMiddleware, deleteNotification);

module.exports = router;
