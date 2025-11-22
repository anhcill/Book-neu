const { Product, Order, OrderItem, User } = require('../config/db');
const { Sequelize } = require('sequelize');
const Op = Sequelize.Op;

// @route   GET api/admin/analytics/products
// @desc    Phân tích sản phẩm (bán chạy, tồn kho, doanh thu)
// @access  Admin only
exports.getProductAnalytics = async (req, res) => {
  try {
    // 1. Tổng số sản phẩm
    const totalProducts = await Product.count();

    // 2. Sản phẩm bán chạy nhất (Top 10)
    const bestSellers = await OrderItem.findAll({
      attributes: [
        'productId',
        [Sequelize.fn('SUM', Sequelize.col('quantity')), 'totalSold'],
        [Sequelize.fn('SUM', Sequelize.literal('quantity * price')), 'totalRevenue']
      ],
      include: [{
        model: Product,
        attributes: ['id', 'title', 'author', 'imageUrl', 'category', 'originalPrice', 'discountedPrice']
      }],
      group: ['productId', 'Product.id'],
      order: [[Sequelize.literal('totalSold'), 'DESC']],
      limit: 10,
      raw: false
    });

    // 3. Sản phẩm ít bán nhất (Top 10)
    const worstSellers = await OrderItem.findAll({
      attributes: [
        'productId',
        [Sequelize.fn('SUM', Sequelize.col('quantity')), 'totalSold']
      ],
      include: [{
        model: Product,
        attributes: ['id', 'title', 'author', 'imageUrl', 'category']
      }],
      group: ['productId', 'Product.id'],
      order: [[Sequelize.literal('totalSold'), 'ASC']],
      limit: 10,
      raw: false
    });

    // 4. Doanh thu theo danh mục
    const revenueByCategory = await OrderItem.findAll({
      attributes: [
        [Sequelize.fn('SUM', Sequelize.literal('OrderItem.quantity * OrderItem.price')), 'revenue'],
        [Sequelize.fn('SUM', Sequelize.col('OrderItem.quantity')), 'totalSold']
      ],
      include: [{
        model: Product,
        attributes: ['category']
      }],
      group: ['Product.category'],
      order: [[Sequelize.literal('revenue'), 'DESC']],
      raw: false
    });

    // 5. Sản phẩm chưa bán được
    const productsWithSales = await OrderItem.findAll({
      attributes: ['productId'],
      group: ['productId'],
      raw: true
    });
    const soldProductIds = productsWithSales.map(item => item.productId);
    
    const unsoldProducts = await Product.findAll({
      where: {
        id: {
          [Op.notIn]: soldProductIds.length > 0 ? soldProductIds : [0]
        }
      },
      attributes: ['id', 'title', 'author', 'imageUrl', 'category', 'discountedPrice'],
      limit: 20
    });

    // 6. Tổng doanh thu từ sản phẩm
    const totalRevenue = await OrderItem.findOne({
      attributes: [[Sequelize.fn('SUM', Sequelize.literal('quantity * price')), 'total']],
      raw: true
    });

    // 7. Phân tích theo thời gian (30 ngày gần đây)
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

    const salesTrend = await Order.findAll({
      attributes: [
        [Sequelize.fn('DATE', Sequelize.col('Order.createdAt')), 'date'],
        [Sequelize.fn('COUNT', Sequelize.col('Order.id')), 'orderCount'],
        [Sequelize.fn('SUM', Sequelize.col('totalAmount')), 'revenue']
      ],
      where: {
        createdAt: { [Op.gte]: thirtyDaysAgo },
        status: { [Op.notIn]: ['cancelled', 'pending'] }
      },
      group: [Sequelize.fn('DATE', Sequelize.col('Order.createdAt'))],
      order: [[Sequelize.fn('DATE', Sequelize.col('Order.createdAt')), 'ASC']],
      raw: true
    });

    res.json({
      status: 'ok',
      analytics: {
        overview: {
          totalProducts,
          totalRevenue: totalRevenue.total || 0,
          unsoldProductsCount: unsoldProducts.length
        },
        bestSellers: bestSellers.map(item => ({
          product: item.Product,
          totalSold: parseInt(item.dataValues.totalSold),
          totalRevenue: parseFloat(item.dataValues.totalRevenue || 0)
        })),
        worstSellers: worstSellers.map(item => ({
          product: item.Product,
          totalSold: parseInt(item.dataValues.totalSold)
        })),
        revenueByCategory: revenueByCategory.map(item => ({
          category: item.Product.category,
          revenue: parseFloat(item.dataValues.revenue || 0),
          totalSold: parseInt(item.dataValues.totalSold || 0)
        })),
        unsoldProducts,
        salesTrend
      }
    });

  } catch (error) {
    console.error('LỖI PHÂN TÍCH SẢN PHẨM:', error);
    res.status(500).json({ 
      status: 'error', 
      message: 'Lỗi khi phân tích sản phẩm',
      error: error.message 
    });
  }
};

// @route   GET api/admin/analytics/revenue
// @desc    Phân tích doanh thu chi tiết
// @access  Admin only
exports.getRevenueAnalytics = async (req, res) => {
  try {
    const { startDate, endDate } = req.query;

    let dateFilter = {};
    if (startDate && endDate) {
      dateFilter = {
        createdAt: {
          [Op.between]: [new Date(startDate), new Date(endDate)]
        }
      };
    }

    // Doanh thu theo tháng
    const monthlyRevenue = await Order.findAll({
      attributes: [
        [Sequelize.fn('YEAR', Sequelize.col('createdAt')), 'year'],
        [Sequelize.fn('MONTH', Sequelize.col('createdAt')), 'month'],
        [Sequelize.fn('SUM', Sequelize.col('totalAmount')), 'revenue'],
        [Sequelize.fn('COUNT', Sequelize.col('id')), 'orderCount']
      ],
      where: {
        ...dateFilter,
        status: { [Op.notIn]: ['cancelled', 'pending'] }
      },
      group: [
        Sequelize.fn('YEAR', Sequelize.col('createdAt')),
        Sequelize.fn('MONTH', Sequelize.col('createdAt'))
      ],
      order: [
        [Sequelize.fn('YEAR', Sequelize.col('createdAt')), 'DESC'],
        [Sequelize.fn('MONTH', Sequelize.col('createdAt')), 'DESC']
      ],
      raw: true
    });

    // Doanh thu theo phương thức thanh toán
    const revenueByPaymentMethod = await Order.findAll({
      attributes: [
        'paymentMethod',
        [Sequelize.fn('SUM', Sequelize.col('totalAmount')), 'revenue'],
        [Sequelize.fn('COUNT', Sequelize.col('id')), 'orderCount']
      ],
      where: {
        ...dateFilter,
        status: { [Op.notIn]: ['cancelled', 'pending'] }
      },
      group: ['paymentMethod'],
      raw: true
    });

    res.json({
      status: 'ok',
      analytics: {
        monthlyRevenue,
        revenueByPaymentMethod
      }
    });

  } catch (error) {
    console.error('LỖI PHÂN TÍCH DOANH THU:', error);
    res.status(500).json({ 
      status: 'error', 
      message: 'Lỗi khi phân tích doanh thu',
      error: error.message 
    });
  }
};

// @route   GET api/admin/analytics/customers
// @desc    Phân tích khách hàng
// @access  Admin only
exports.getCustomerAnalytics = async (req, res) => {
  try {
    // Top khách hàng mua nhiều nhất
    const topCustomers = await Order.findAll({
      attributes: [
        'userId',
        [Sequelize.fn('COUNT', Sequelize.col('Order.id')), 'orderCount'],
        [Sequelize.fn('SUM', Sequelize.col('totalAmount')), 'totalSpent']
      ],
      include: [{
        model: User,
        attributes: ['id', 'username', 'email']
      }],
      where: {
        status: { [Op.notIn]: ['cancelled', 'pending'] }
      },
      group: ['userId', 'User.id'],
      order: [[Sequelize.literal('totalSpent'), 'DESC']],
      limit: 10,
      raw: false
    });

    // Khách hàng mới (30 ngày gần đây)
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

    const newCustomers = await User.count({
      where: {
        createdAt: { [Op.gte]: thirtyDaysAgo }
      }
    });

    res.json({
      status: 'ok',
      analytics: {
        topCustomers: topCustomers.map(order => ({
          user: order.User,
          orderCount: parseInt(order.dataValues.orderCount),
          totalSpent: parseFloat(order.dataValues.totalSpent || 0)
        })),
        newCustomers
      }
    });

  } catch (error) {
    console.error('LỖI PHÂN TÍCH KHÁCH HÀNG:', error);
    res.status(500).json({ 
      status: 'error', 
      message: 'Lỗi khi phân tích khách hàng',
      error: error.message 
    });
  }
};
