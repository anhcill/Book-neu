const { Order, OrderItem, Product, Notification } = require('../config/db');
const { Sequelize } = require('sequelize');
const Op = Sequelize.Op;

// @route   GET api/orders
// @desc    Lấy tất cả đơn hàng của user đã đăng nhập
// @access  Private
exports.getOrders = async (req, res) => {
  try {
    const userId = req.userId;

    const orders = await Order.findAll({
      where: { 
        userId: userId
        // Hiển thị tất cả các đơn hàng (pending, confirmed, shipping, delivered, cancelled)
      },
      // Sắp xếp đơn hàng mới nhất lên đầu
      order: [['createdAt', 'DESC']], 
      include: [
        {
          model: OrderItem,
          as: 'orderItems', // Đặt bí danh để khớp với frontend
          include: [
            {
              model: Product,
              // Lấy các trường cần thiết của sản phẩm
              attributes: ['id', 'title', 'author', 'imageUrl'], 
            },
          ],
        },
      ],
    });

    if (!orders) {
      return res.status(200).json([]); // Trả về mảng rỗng nếu không có đơn hàng
    }

    res.status(200).json(orders);
  } catch (error) {
    console.error('LỖI KHI LẤY ĐƠN HÀNG:', error);
    res.status(500).json({ message: 'Lỗi server', error: error.message });
  }
};

// @route   GET api/orders/:orderId
// @desc    Lấy chi tiết một đơn hàng
// @access  Private
exports.getOrderById = async (req, res) => {
  try {
    const userId = req.userId;
    const { orderId } = req.params;

    const order = await Order.findByPk(orderId, {
      include: [
        {
          model: OrderItem,
          as: 'orderItems',
          include: [
            {
              model: Product,
              attributes: ['id', 'title', 'author', 'imageUrl'],
            },
          ],
        },
      ],
    });

    if (!order) {
      return res.status(404).json({ status: 'error', message: 'Đơn hàng không tồn tại' });
    }

    // Verify order belongs to user
    if (order.userId !== userId) {
      return res.status(403).json({ status: 'error', message: 'Không có quyền xem đơn này' });
    }

    res.json({ status: 'ok', order });
  } catch (error) {
    console.error('LỖI KHI LẤY CHI TIẾT ĐƠN HÀNG:', error);
    res.status(500).json({ status: 'error', message: error.message });
  }
};

// @route   PATCH api/orders/:orderId/cancel
// @desc    Hủy đơn hàng (chỉ pending orders)
// @access  Private
exports.cancelOrder = async (req, res) => {
  try {
    const userId = req.userId;
    const { orderId } = req.params;
    const { reason } = req.body;

    // Find order
    const order = await Order.findByPk(orderId);

    if (!order) {
      return res.status(404).json({ status: 'error', message: 'Đơn hàng không tồn tại' });
    }

    // Check if order belongs to user
    if (order.userId !== userId) {
      return res.status(403).json({ status: 'error', message: 'Không có quyền hủy đơn này' });
    }

    // Check if order can be cancelled (only pending or confirmed)
    if (!['pending', 'confirmed'].includes(order.status)) {
      return res.status(400).json({ status: 'error', message: 'Không thể hủy đơn hàng đã được vận chuyển hoặc giao' });
    }

    // Update order status and reason
    order.status = 'cancelled';
    order.cancellationReason = reason || 'Khách hàng yêu cầu hủy';
    await order.save();

    // Create notification
    const { sequelize } = require('../config/db');
    const notification = await Notification.create({
      userId,
      orderId: order.id,
      type: 'order_cancelled',
      title: '❌ Đơn hàng bị hủy',
      message: `Đơn hàng #${order.id} của bạn đã bị hủy. Lý do: ${order.cancellationReason}`
    });

    res.json({ 
      status: 'ok', 
      message: 'Hủy đơn hàng thành công', 
      order,
      notification 
    });
  } catch (error) {
    console.error('LỖI KHI HỦY ĐƠN HÀNG:', error);
    res.status(500).json({ status: 'error', message: error.message });
  }
};