const { Product } = require('../config/db').sequelize.models;
const { Op } = require('sequelize');

// Get low stock products
exports.getLowStockProducts = async (req, res) => {
  try {
    const { threshold = 10 } = req.query;

    const lowStockProducts = await Product.findAll({
      where: {
        stock: {
          [Op.lte]: parseInt(threshold),
          [Op.gt]: 0
        }
      },
      order: [['stock', 'ASC']]
    });

    // Get out of stock products
    const outOfStockProducts = await Product.findAll({
      where: { stock: 0 }
    });

    res.json({
      status: 'ok',
      lowStock: lowStockProducts,
      outOfStock: outOfStockProducts,
      alerts: {
        lowStockCount: lowStockProducts.length,
        outOfStockCount: outOfStockProducts.length
      }
    });
  } catch (error) {
    console.error('Error fetching inventory alerts:', error);
    res.status(500).json({ status: 'error', message: 'Lỗi khi tải cảnh báo tồn kho' });
  }
};

// Update stock
exports.updateStock = async (req, res) => {
  try {
    const { productId } = req.params;
    const { stock, action } = req.body; // action: 'set', 'increase', 'decrease'

    const product = await Product.findByPk(productId);
    if (!product) {
      return res.status(404).json({ status: 'error', message: 'Không tìm thấy sản phẩm' });
    }

    let newStock = product.stock;
    
    if (action === 'set') {
      newStock = parseInt(stock);
    } else if (action === 'increase') {
      newStock += parseInt(stock);
    } else if (action === 'decrease') {
      newStock = Math.max(0, newStock - parseInt(stock));
    }

    product.stock = newStock;
    product.outOfStock = newStock === 0;
    await product.save();

    res.json({
      status: 'ok',
      message: 'Cập nhật tồn kho thành công',
      product: {
        id: product.id,
        title: product.title,
        stock: product.stock,
        outOfStock: product.outOfStock
      }
    });
  } catch (error) {
    console.error('Error updating stock:', error);
    res.status(500).json({ status: 'error', message: 'Lỗi khi cập nhật tồn kho' });
  }
};

// Get inventory statistics
exports.getInventoryStats = async (req, res) => {
  try {
    const totalProducts = await Product.count();
    const inStockProducts = await Product.count({ where: { stock: { [Op.gt]: 0 } } });
    const outOfStockProducts = await Product.count({ where: { stock: 0 } });
    const lowStockProducts = await Product.count({ where: { stock: { [Op.lte]: 10, [Op.gt]: 0 } } });

    const totalStockValue = await Product.sum('stock');

    // Get products by stock range
    const stockRanges = await Product.findAll({
      attributes: [
        [Product.sequelize.fn('SUM', Product.sequelize.literal('CASE WHEN stock = 0 THEN 1 ELSE 0 END')), 'outOfStock'],
        [Product.sequelize.fn('SUM', Product.sequelize.literal('CASE WHEN stock > 0 AND stock <= 10 THEN 1 ELSE 0 END')), 'lowStock'],
        [Product.sequelize.fn('SUM', Product.sequelize.literal('CASE WHEN stock > 10 AND stock <= 50 THEN 1 ELSE 0 END')), 'mediumStock'],
        [Product.sequelize.fn('SUM', Product.sequelize.literal('CASE WHEN stock > 50 THEN 1 ELSE 0 END')), 'highStock']
      ],
      raw: true
    });

    res.json({
      status: 'ok',
      stats: {
        totalProducts,
        inStockProducts,
        outOfStockProducts,
        lowStockProducts,
        totalStockValue,
        stockRanges: stockRanges[0]
      }
    });
  } catch (error) {
    console.error('Error fetching inventory stats:', error);
    res.status(500).json({ status: 'error', message: 'Lỗi khi tải thống kê tồn kho' });
  }
};

module.exports = exports;
