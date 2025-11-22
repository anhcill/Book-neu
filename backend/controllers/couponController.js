const { Coupon, Product, Order } = require('../config/db').sequelize.models;
const { Op } = require('sequelize');

// Create coupon (Admin only)
exports.createCoupon = async (req, res) => {
  try {
    const {
      code,
      description,
      discountType,
      discountValue,
      minOrderValue,
      maxDiscount,
      usageLimit,
      startDate,
      endDate,
      applicableCategories
    } = req.body;

    // Check if code already exists
    const existingCoupon = await Coupon.findOne({ where: { code: code.toUpperCase() } });
    if (existingCoupon) {
      return res.status(400).json({ status: 'error', message: 'Mã giảm giá đã tồn tại' });
    }

    const coupon = await Coupon.create({
      code: code.toUpperCase(),
      description,
      discountType,
      discountValue,
      minOrderValue: minOrderValue || 0,
      maxDiscount,
      usageLimit,
      startDate,
      endDate,
      applicableCategories
    });

    res.json({
      status: 'ok',
      message: 'Tạo mã giảm giá thành công',
      coupon
    });
  } catch (error) {
    console.error('Error creating coupon:', error);
    res.status(500).json({ status: 'error', message: 'Lỗi khi tạo mã giảm giá' });
  }
};

// Get all coupons (Admin)
exports.getAllCoupons = async (req, res) => {
  try {
    const { active } = req.query;
    
    let where = {};
    if (active === 'true') {
      where = {
        isActive: true,
        startDate: { [Op.lte]: new Date() },
        endDate: { [Op.gte]: new Date() }
      };
    }

    const coupons = await Coupon.findAll({
      where,
      order: [['createdAt', 'DESC']]
    });

    res.json({
      status: 'ok',
      coupons
    });
  } catch (error) {
    console.error('Error fetching coupons:', error);
    res.status(500).json({ status: 'error', message: 'Lỗi khi tải mã giảm giá' });
  }
};

// Validate and apply coupon (Customer)
exports.validateCoupon = async (req, res) => {
  try {
    const { code, orderValue, cartItems } = req.body;

    const coupon = await Coupon.findOne({ where: { code: code.toUpperCase() } });

    if (!coupon) {
      return res.status(404).json({ status: 'error', message: 'Mã giảm giá không tồn tại' });
    }

    // Check if active
    if (!coupon.isActive) {
      return res.status(400).json({ status: 'error', message: 'Mã giảm giá đã bị vô hiệu hóa' });
    }

    // Check date range
    const now = new Date();
    if (now < coupon.startDate) {
      return res.status(400).json({ status: 'error', message: 'Mã giảm giá chưa có hiệu lực' });
    }
    if (now > coupon.endDate) {
      return res.status(400).json({ status: 'error', message: 'Mã giảm giá đã hết hạn' });
    }

    // Check usage limit
    if (coupon.usageLimit && coupon.usedCount >= coupon.usageLimit) {
      return res.status(400).json({ status: 'error', message: 'Mã giảm giá đã hết lượt sử dụng' });
    }

    // Check minimum order value
    if (orderValue < coupon.minOrderValue) {
      return res.status(400).json({
        status: 'error',
        message: `Đơn hàng tối thiểu ${new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(coupon.minOrderValue)}`
      });
    }

    // Check applicable categories
    if (coupon.applicableCategories && coupon.applicableCategories.length > 0) {
      const categories = cartItems.map(item => item.category);
      const hasApplicableProduct = categories.some(cat => 
        coupon.applicableCategories.includes(cat)
      );

      if (!hasApplicableProduct) {
        return res.status(400).json({
          status: 'error',
          message: 'Mã giảm giá không áp dụng cho sản phẩm trong giỏ hàng'
        });
      }
    }

    // Calculate discount
    let discountAmount = 0;
    if (coupon.discountType === 'percentage') {
      discountAmount = (orderValue * coupon.discountValue) / 100;
      if (coupon.maxDiscount) {
        discountAmount = Math.min(discountAmount, coupon.maxDiscount);
      }
    } else {
      discountAmount = coupon.discountValue;
    }

    const finalAmount = Math.max(0, orderValue - discountAmount);

    res.json({
      status: 'ok',
      message: 'Mã giảm giá hợp lệ',
      coupon: {
        code: coupon.code,
        description: coupon.description,
        discountType: coupon.discountType,
        discountValue: coupon.discountValue
      },
      discount: discountAmount,
      finalAmount
    });
  } catch (error) {
    console.error('Error validating coupon:', error);
    res.status(500).json({ status: 'error', message: 'Lỗi khi kiểm tra mã giảm giá' });
  }
};

// Apply coupon to order
exports.applyCoupon = async (req, res) => {
  try {
    const { code } = req.body;

    const coupon = await Coupon.findOne({ where: { code: code.toUpperCase() } });

    if (!coupon) {
      return res.status(404).json({ status: 'error', message: 'Mã giảm giá không tồn tại' });
    }

    // Increment usage count
    coupon.usedCount += 1;
    await coupon.save();

    res.json({
      status: 'ok',
      message: 'Đã áp dụng mã giảm giá'
    });
  } catch (error) {
    console.error('Error applying coupon:', error);
    res.status(500).json({ status: 'error', message: 'Lỗi khi áp dụng mã giảm giá' });
  }
};

// Update coupon (Admin)
exports.updateCoupon = async (req, res) => {
  try {
    const { id } = req.params;
    const updateData = req.body;

    const coupon = await Coupon.findByPk(id);
    if (!coupon) {
      return res.status(404).json({ status: 'error', message: 'Không tìm thấy mã giảm giá' });
    }

    await coupon.update(updateData);

    res.json({
      status: 'ok',
      message: 'Cập nhật mã giảm giá thành công',
      coupon
    });
  } catch (error) {
    console.error('Error updating coupon:', error);
    res.status(500).json({ status: 'error', message: 'Lỗi khi cập nhật mã giảm giá' });
  }
};

// Delete coupon (Admin)
exports.deleteCoupon = async (req, res) => {
  try {
    const { id } = req.params;

    const coupon = await Coupon.findByPk(id);
    if (!coupon) {
      return res.status(404).json({ status: 'error', message: 'Không tìm thấy mã giảm giá' });
    }

    await coupon.destroy();

    res.json({
      status: 'ok',
      message: 'Đã xóa mã giảm giá'
    });
  } catch (error) {
    console.error('Error deleting coupon:', error);
    res.status(500).json({ status: 'error', message: 'Lỗi khi xóa mã giảm giá' });
  }
};

// Toggle coupon status (Admin)
exports.toggleCouponStatus = async (req, res) => {
  try {
    const { id } = req.params;

    const coupon = await Coupon.findByPk(id);
    if (!coupon) {
      return res.status(404).json({ status: 'error', message: 'Không tìm thấy mã giảm giá' });
    }

    coupon.isActive = !coupon.isActive;
    await coupon.save();

    res.json({
      status: 'ok',
      message: `Đã ${coupon.isActive ? 'kích hoạt' : 'vô hiệu hóa'} mã giảm giá`,
      coupon
    });
  } catch (error) {
    console.error('Error toggling coupon:', error);
    res.status(500).json({ status: 'error', message: 'Lỗi khi cập nhật trạng thái' });
  }
};

module.exports = exports;
