const { Notification } = require('../config/db');

// Helper function to create notification
const createNotification = async (sequelize, userId, orderId, type, title, message) => {
  try {
    await Notification.create({
      userId,
      orderId,
      type,
      title,
      message,
      isRead: false
    });
    console.log(`✅ Notification created: ${type} for user ${userId}`);
  } catch (error) {
    console.error('❌ Error creating notification:', error);
  }
};

// @route   GET api/notifications
// @desc    Lấy danh sách thông báo của user
// @access  Private
const getUserNotifications = async (req, res) => {
  try {
    const userId = req.userId; // From auth middleware

    const notifications = await Notification.findAll({
      where: { userId },
      order: [['createdAt', 'DESC']],
      limit: 50
    });

    res.json({
      status: 'ok',
      notifications
    });
  } catch (error) {
    console.error('❌ Error fetching notifications:', error);
    res.status(500).json({
      status: 'error',
      message: 'Lỗi khi lấy thông báo',
      error: error.message
    });
  }
};

// @route   PATCH api/notifications/:id/read
// @desc    Đánh dấu thông báo đã đọc
// @access  Private
const markAsRead = async (req, res) => {
  try {
    const { id } = req.params;
    const userId = req.userId;

    const notification = await Notification.findOne({
      where: { id, userId }
    });

    if (!notification) {
      return res.status(404).json({
        status: 'error',
        message: 'Không tìm thấy thông báo'
      });
    }

    notification.isRead = true;
    await notification.save();

    res.json({
      status: 'ok',
      message: 'Đã đánh dấu đã đọc',
      notification
    });
  } catch (error) {
    console.error('❌ Error marking notification as read:', error);
    res.status(500).json({
      status: 'error',
      message: 'Lỗi khi cập nhật thông báo',
      error: error.message
    });
  }
};

// @route   PATCH api/notifications/read-all
// @desc    Đánh dấu tất cả thông báo đã đọc
// @access  Private
const markAllAsRead = async (req, res) => {
  try {
    const userId = req.userId;

    await Notification.update(
      { isRead: true },
      { where: { userId, isRead: false } }
    );

    res.json({
      status: 'ok',
      message: 'Đã đánh dấu tất cả đã đọc'
    });
  } catch (error) {
    console.error('❌ Error marking all as read:', error);
    res.status(500).json({
      status: 'error',
      message: 'Lỗi khi cập nhật thông báo',
      error: error.message
    });
  }
};

// @route   DELETE api/notifications/:id
// @desc    Xóa thông báo
// @access  Private
const deleteNotification = async (req, res) => {
  try {
    const { id } = req.params;
    const userId = req.userId;

    const notification = await Notification.findOne({
      where: { id, userId }
    });

    if (!notification) {
      return res.status(404).json({
        status: 'error',
        message: 'Không tìm thấy thông báo'
      });
    }

    await notification.destroy();

    res.json({
      status: 'ok',
      message: 'Đã xóa thông báo'
    });
  } catch (error) {
    console.error('❌ Error deleting notification:', error);
    res.status(500).json({
      status: 'error',
      message: 'Lỗi khi xóa thông báo',
      error: error.message
    });
  }
};

module.exports = {
  createNotification,
  getUserNotifications,
  markAsRead,
  markAllAsRead,
  deleteNotification
};
