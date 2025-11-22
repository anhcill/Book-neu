const { User, Order } = require('../config/db');
const { Sequelize } = require('sequelize');
const Op = Sequelize.Op;

// @route   GET api/admin/users
// @desc    Lấy danh sách tất cả users
// @access  Private/Admin
exports.getAllUsers = async (req, res) => {
  try {
    const { search, page = 1, limit = 20 } = req.query;
    const offset = (page - 1) * limit;

    const whereClause = {};
    if (search) {
      whereClause[Op.or] = [
        { username: { [Op.like]: `%${search}%` } },
        { email: { [Op.like]: `%${search}%` } }
      ];
    }

    const { count, rows } = await User.findAndCountAll({
      where: whereClause,
      attributes: { exclude: ['password'] },
      limit: parseInt(limit),
      offset: offset,
      order: [['createdAt', 'DESC']]
    });

    res.json({
      status: 'ok',
      total: count,
      page: parseInt(page),
      limit: parseInt(limit),
      pages: Math.ceil(count / limit),
      users: rows
    });
  } catch (error) {
    console.error('LỖI KHI LẤY DANH SÁCH USER:', error);
    res.status(500).json({ status: 'error', message: error.message });
  }
};

// @route   GET api/admin/users/:userId
// @desc    Lấy chi tiết một user
// @access  Private/Admin
exports.getUserById = async (req, res) => {
  try {
    const { userId } = req.params;

    const user = await User.findByPk(userId, {
      attributes: { exclude: ['password'] },
      include: [
        {
          model: Order,
          attributes: ['id', 'status', 'totalAmount', 'createdAt'],
          limit: 5,
          order: [['createdAt', 'DESC']]
        }
      ]
    });

    if (!user) {
      return res.status(404).json({ status: 'error', message: 'User không tồn tại' });
    }

    res.json({ status: 'ok', user });
  } catch (error) {
    console.error('LỖI KHI LẤY CHI TIẾT USER:', error);
    res.status(500).json({ status: 'error', message: error.message });
  }
};

// @route   PATCH api/admin/users/:userId/ban
// @desc    Ban một user
// @access  Private/Admin
exports.banUser = async (req, res) => {
  try {
    const { userId } = req.params;

    const user = await User.findByPk(userId);

    if (!user) {
      return res.status(404).json({ status: 'error', message: 'User không tồn tại' });
    }

    user.isBanned = true;
    await user.save();

    res.json({
      status: 'ok',
      message: `Đã ban user ${user.username}`,
      user: {
        id: user.id,
        username: user.username,
        email: user.email,
        isBanned: user.isBanned
      }
    });
  } catch (error) {
    console.error('LỖI KHI BAN USER:', error);
    res.status(500).json({ status: 'error', message: error.message });
  }
};

// @route   PATCH api/admin/users/:userId/unban
// @desc    Unban một user
// @access  Private/Admin
exports.unbanUser = async (req, res) => {
  try {
    const { userId } = req.params;

    const user = await User.findByPk(userId);

    if (!user) {
      return res.status(404).json({ status: 'error', message: 'User không tồn tại' });
    }

    user.isBanned = false;
    await user.save();

    res.json({
      status: 'ok',
      message: `Đã unban user ${user.username}`,
      user: {
        id: user.id,
        username: user.username,
        email: user.email,
        isBanned: user.isBanned
      }
    });
  } catch (error) {
    console.error('LỖI KHI UNBAN USER:', error);
    res.status(500).json({ status: 'error', message: error.message });
  }
};

// @route   DELETE api/admin/users/:userId
// @desc    Xóa một user
// @access  Private/Admin
exports.deleteUser = async (req, res) => {
  try {
    const { userId } = req.params;

    // Không cho xóa chính mình
    const adminId = req.userId;
    if (parseInt(userId) === adminId) {
      return res.status(400).json({ status: 'error', message: 'Không thể xóa tài khoản của chính mình' });
    }

    const user = await User.findByPk(userId);

    if (!user) {
      return res.status(404).json({ status: 'error', message: 'User không tồn tại' });
    }

    const username = user.username;
    await user.destroy();

    res.json({
      status: 'ok',
      message: `Đã xóa user ${username}`
    });
  } catch (error) {
    console.error('LỖI KHI XÓA USER:', error);
    res.status(500).json({ status: 'error', message: error.message });
  }
};

// @route   GET api/admin/users/stats/overview
// @desc    Lấy thống kê users
// @access  Private/Admin
exports.getUserStats = async (req, res) => {
  try {
    const totalUsers = await User.count();
    const bannedUsers = await User.count({ where: { isBanned: true } });
    const adminUsers = await User.count({ where: { role: 'admin' } });
    const newUsersThisMonth = await User.count({
      where: {
        createdAt: {
          [Op.gte]: new Date(new Date().setDate(1))
        }
      }
    });

    res.json({
      status: 'ok',
      stats: {
        totalUsers,
        bannedUsers,
        adminUsers,
        newUsersThisMonth,
        activeUsers: totalUsers - bannedUsers
      }
    });
  } catch (error) {
    console.error('LỖI KHI LẤY THỐNG KÊ USER:', error);
    res.status(500).json({ status: 'error', message: error.message });
  }
};
