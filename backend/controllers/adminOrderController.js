const { Order, OrderItem, Product, User, Notification } = require('../config/db');
const { Sequelize } = require('sequelize');
const Op = Sequelize.Op;
const { createNotification } = require('./notificationController');

// @route   GET api/admin/orders
// @desc    Lấy tất cả đơn hàng của tất cả người dùng
// @access  Admin only
exports.getAllOrders = async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 20;
    const offset = (page - 1) * limit;
    const status = req.query.status; // Filter theo trạng thái (optional)

    let whereClause = {};
    if (status) {
      whereClause.status = status;
    }

    const { count, rows } = await Order.findAndCountAll({
      where: whereClause,
      limit,
      offset,
      order: [['createdAt', 'DESC']],
      include: [
        {
          model: User,
          attributes: ['id', 'username', 'email']
        },
        {
          model: OrderItem,
          as: 'orderItems',
          include: [
            {
              model: Product,
              attributes: ['id', 'title', 'author', 'imageUrl']
            }
          ]
        }
      ]
    });

    // Format orders untuk frontend
    const formattedOrders = rows.map(order => ({
      id: order.id,
      orderId: order.gatewayOrderId || `ORD-${order.id}`,
      customerName: order.User?.username || 'Unknown',
      customerEmail: order.User?.email || 'Unknown',
      totalAmount: order.totalAmount,
      status: order.status,
      paymentMethod: order.paymentMethod,
      createdAt: order.createdAt
    }));

    res.status(200).json({
      status: 'ok',
      totalOrders: count,
      totalPages: Math.ceil(count / limit),
      currentPage: page,
      orders: formattedOrders
    });
  } catch (error) {
    console.error('LỖI KHI LẤY DANH SÁCH ĐỐN HÀNG:', error);
    res.status(500).json({ 
      status: 'error',
      message: 'Lỗi server', 
      error: error.message 
    });
  }
};

// @route   GET api/admin/orders/:id
// @desc    Lấy chi tiết một đơn hàng
// @access  Admin only
exports.getOrderById = async (req, res) => {
  try {
    const { id } = req.params;

    const order = await Order.findByPk(id, {
      include: [
        {
          model: User,
          attributes: ['id', 'username', 'email']
        },
        {
          model: OrderItem,
          as: 'orderItems',
          include: [
            {
              model: Product,
              attributes: ['id', 'title', 'author', 'imageUrl', 'discountedPrice']
            }
          ]
        }
      ]
    });

    if (!order) {
      return res.status(404).json({ 
        status: 'error',
        message: 'Không tìm thấy đơn hàng' 
      });
    }

    // Format order detail cho frontend
    const formattedOrder = {
      id: order.id,
      orderId: order.gatewayOrderId || `ORD-${order.id}`,
      customerName: order.User?.username || 'Unknown',
      customerEmail: order.User?.email || 'Unknown',
      customerPhone: order.shippingPhone || 'N/A',
      shippingAddress: order.shippingAddress || 'N/A',
      status: order.status,
      paymentMethod: order.paymentMethod,
      subtotal: order.subtotal || order.totalAmount,
      shippingFee: order.shippingFee || 0,
      discount: order.discount || 0,
      totalAmount: order.totalAmount,
      createdAt: order.createdAt,
      items: order.orderItems?.map(item => ({
        id: item.id,
        bookName: item.Product?.title || 'Unknown',
        author: item.Product?.author || 'Unknown',
        bookImage: item.Product?.imageUrl || '',
        price: item.price,
        quantity: item.quantity
      })) || []
    };

    res.status(200).json({
      status: 'ok',
      order: formattedOrder
    });
  } catch (error) {
    console.error('LỖI KHI LẤY ĐƠN HÀNG:', error);
    res.status(500).json({ 
      status: 'error',
      message: 'Lỗi server', 
      error: error.message 
    });
  }
};

// @route   PUT api/admin/orders/:id
// @desc    Cập nhật trạng thái đơn hàng
// @access  Admin only
exports.updateOrderStatus = async (req, res) => {
  try {
    const { id } = req.params;
    const { status } = req.body;

    // Kiểm tra status hợp lệ
    const validStatuses = ['pending', 'confirmed', 'shipped', 'delivered', 'cancelled'];
    if (!validStatuses.includes(status)) {
      return res.status(400).json({ 
        status: 'error',
        message: 'Trạng thái không hợp lệ',
        validStatuses: validStatuses
      });
    }

    const order = await Order.findByPk(id);

    if (!order) {
      return res.status(404).json({ 
        status: 'error',
        message: 'Không tìm thấy đơn hàng' 
      });
    }

    order.status = status;
    await order.save();

    res.status(200).json({
      status: 'ok',
      message: 'Cập nhật trạng thái đơn hàng thành công',
      order: order
    });
  } catch (error) {
    console.error('LỖI KHI CẬP NHẬT ĐƠN HÀNG:', error);
    res.status(500).json({ 
      status: 'error',
      message: 'Lỗi server', 
      error: error.message 
    });
  }
};

// @route   GET api/admin/orders/stats/summary
// @desc    Lấy thống kê tổng quan
// @access  Admin only
exports.getOrderStats = async (req, res) => {
  try {
    // Tổng số đơn hàng
    const totalOrders = await Order.count();

    // Tổng số người dùng
    const totalUsers = await User.count();

    // Tổng số sản phẩm
    const totalProducts = await Product.count();

    // Tổng doanh thu (chỉ đơn delivered)
    const completedOrders = await Order.findAll({
      where: { status: 'delivered' },
      attributes: [[Sequelize.fn('SUM', Sequelize.col('totalAmount')), 'totalRevenue']]
    });
    const totalRevenue = completedOrders[0]?.dataValues?.totalRevenue || 0;

    res.status(200).json({
      status: 'ok',
      stats: {
        totalUsers: totalUsers,
        totalProducts: totalProducts,
        totalOrders: totalOrders,
        totalRevenue: parseFloat(totalRevenue) || 0
      }
    });
  } catch (error) {
    console.error('LỖI KHI LẤY THỐNG KÊ:', error);
    res.status(500).json({ 
      status: 'error',
      message: 'Lỗi server', 
      error: error.message 
    });
  }
};

// @route   GET api/admin/orders/recent
// @desc    Lấy các đơn hàng gần đây (mặc định 5)
// @access  Admin only
exports.getRecentOrders = async (req, res) => {
  try {
    const limit = parseInt(req.query.limit) || 5;

    const rows = await Order.findAll({
      limit,
      order: [['createdAt', 'DESC']],
      include: [
        {
          model: User,
          attributes: ['id', 'username', 'email']
        },
        {
          model: OrderItem,
          as: 'orderItems',
          include: [{ model: Product, attributes: ['id', 'title', 'author', 'imageUrl', 'discountedPrice'] }]
        }
      ]
    });

    const formatted = rows.map(order => ({
      id: order.id,
      orderId: order.gatewayOrderId || `ORD-${order.id}`,
      customerName: order.User?.username || 'Unknown',
      totalAmount: order.totalAmount,
      status: order.status,
      paymentMethod: order.paymentMethod,
      createdAt: order.createdAt
    }));

    res.status(200).json({ status: 'ok', orders: formatted });
  } catch (error) {
    console.error('LỖI KHI LẤY ĐƠN HÀNG GẦN ĐÂY:', error);
    res.status(500).json({ status: 'error', message: 'Lỗi server', error: error.message });
  }
};

// @route   PATCH api/admin/orders/:id/confirm
// @desc    Admin xác nhận đơn hàng (Pending → Confirmed)
// @access  Admin only
exports.confirmOrder = async (req, res) => {
  try {
    const { id } = req.params;
    const sequelize = Order.sequelize;

    const order = await Order.findByPk(id, {
      include: [{ model: User, attributes: ['id', 'username', 'email'] }]
    });

    if (!order) {
      return res.status(404).json({ status: 'error', message: 'Đơn hàng không tồn tại' });
    }

    if (order.status !== 'pending') {
      return res.status(400).json({ status: 'error', message: 'Chỉ có thể xác nhận đơn chờ' });
    }

    // Update order status
    order.status = 'confirmed';
    await order.save();

    // Create notification
    await createNotification(
      sequelize,
      order.userId,
      order.id,
      'order_confirmed',
      '✅ Đơn hàng được xác nhận',
      `Đơn hàng #${order.id} của bạn đã được xác nhận. Sẽ sớm được giao đi!`
    );

    res.json({ status: 'ok', message: 'Đơn hàng đã xác nhận', order });
  } catch (error) {
    console.error('LỖI KHI XÁC NHẬN ĐƠN HÀNG:', error);
    res.status(500).json({ status: 'error', message: error.message });
  }
};

// @route   PATCH api/admin/orders/:id/shipping
// @desc    Admin cập nhật trạng thái shipping
// @access  Admin only
exports.updateOrderShipping = async (req, res) => {
  try {
    const { id } = req.params;
    const sequelize = Order.sequelize;

    const order = await Order.findByPk(id, {
      include: [{ model: User, attributes: ['id', 'username', 'email'] }]
    });

    if (!order) {
      return res.status(404).json({ status: 'error', message: 'Đơn hàng không tồn tại' });
    }

    order.status = 'shipped';
    await order.save();

    // Create notification
    await createNotification(
      sequelize,
      order.userId,
      order.id,
      'order_shipped',
      '🚚 Đơn hàng đang giao',
      `Đơn hàng #${order.id} đang trên đường đến bạn!`
    );

    res.json({ status: 'ok', message: 'Cập nhật trạng thái giao hàng', order });
  } catch (error) {
    console.error('LỖI KHI CẬP NHẬT GIAO HÀNG:', error);
    res.status(500).json({ status: 'error', message: error.message });
  }
};

// @route   PATCH api/admin/orders/:id/delivered
// @desc    Admin cập nhật trạng thái đã giao
// @access  Admin only
exports.updateOrderDelivered = async (req, res) => {
  try {
    const { id } = req.params;
    const sequelize = Order.sequelize;

    const order = await Order.findByPk(id, {
      include: [{ model: User, attributes: ['id', 'username', 'email'] }]
    });

    if (!order) {
      return res.status(404).json({ status: 'error', message: 'Đơn hàng không tồn tại' });
    }

    order.status = 'delivered';
    await order.save();

    // Create notification
    await createNotification(
      sequelize,
      order.userId,
      order.id,
      'order_delivered',
      '📦 Đơn hàng đã được giao',
      `Đơn hàng #${order.id} đã giao thành công! Cảm ơn bạn mua hàng!`
    );

    res.json({ status: 'ok', message: 'Cập nhật trạng thái đã giao', order });
  } catch (error) {
    console.error('LỖI KHI CẬP NHẬT ĐÃ GIAO:', error);
    res.status(500).json({ status: 'error', message: error.message });
  }
};

// @route   PATCH api/admin/orders/:id/cancel
// @desc    Admin hủy đơn hàng
// @access  Admin only
exports.cancelOrder = async (req, res) => {
  try {
    const { id } = req.params;
    const sequelize = Order.sequelize;

    const order = await Order.findByPk(id, {
      include: [{ model: User, attributes: ['id', 'username', 'email'] }]
    });

    if (!order) {
      return res.status(404).json({ status: 'error', message: 'Đơn hàng không tồn tại' });
    }

    order.status = 'cancelled';
    await order.save();

    // Create notification
    await createNotification(
      sequelize,
      order.userId,
      order.id,
      'order_cancelled',
      '❌ Đơn hàng bị hủy',
      `Đơn hàng #${order.id} đã bị hủy.`
    );

    res.json({ status: 'ok', message: 'Đơn hàng đã hủy', order });
  } catch (error) {
    console.error('LỖI KHI HỦY ĐƠN HÀNG:', error);
    res.status(500).json({ status: 'error', message: error.message });
  }
};
