// Import các model đã được khởi tạo từ file db.js
const { User, Product, Cart, Wishlist, Order, OrderItem } = require('../config/db'); // Thêm Order, OrderItem
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
require('dotenv').config();
const { Sequelize } = require('sequelize');
// Sequelize.Op provides operators like ne, gt, etc.
const Op = Sequelize.Op;

// --- HÀM HỖ TRỢ 1 (ĐÃ SỬA LỖI GIÁ 0đ) ---
const getFormattedCart = async (userId) => {
    const cartItemsRaw = await Cart.findAll({ where: { userId }, include: [Product] });
    return cartItemsRaw.map(item => ({
        _id: item.Product.id,
        bookName: item.Product.title,
        author: item.Product.author,
        // === SỬA LỖI GIÁ 0đ (Đọc từ cột DB đúng) ===
        originalPrice: item.Product.originalPrice,
        discountedPrice: item.Product.discountedPrice,
        discountPercent: item.Product.discountPercent,
        // === KẾT THÚC SỬA LỖI ===
        imgSrc: item.Product.imageUrl,
        imgAlt: item.Product.imgAlt,
        cartItemId: item.id,
        quantity: item.quantity,
        genre: item.Product.category,
        fastDeliveryAvailable: true
    }));
};

// --- HÀM HỖ TRỢ 2 (ĐÃ SỬA LỖI GIÁ 0đ) ---
const getFormattedWishlist = async (userId) => {
    const wishlistItemsRaw = await Wishlist.findAll({ where: { userId }, include: [Product] });
    return wishlistItemsRaw.map(item => ({
        _id: item.Product.id,
        bookName: item.Product.title,
        author: item.Product.author,
        // === SỬA LỖI GIÁ 0đ (Đọc từ cột DB đúng) ===
        originalPrice: item.Product.originalPrice,
        discountedPrice: item.Product.discountedPrice,
        discountPercent: item.Product.discountPercent,
        // === KẾT THÚC SỬA LỖI ===
        imgSrc: item.Product.imageUrl,
        imgAlt: item.Product.imgAlt,
        genre: item.Product.category,
        fastDeliveryAvailable: true
    }));
};

// === HÀM HỖ TRỢ 3 (MỚI): LẤY ĐƠN HÀNG ===
const getFormattedOrders = async (userId) => {
  const orders = await Order.findAll({
    where: {
      userId,
      status: { [Op.ne]: 'pending' } // Lấy đơn hàng (không phải 'pending')
    },
    include: [{
      model: OrderItem,
      as: 'orderItems',
      include: [{ model: Product }]
    }],
    order: [['createdAt', 'DESC']]
  });

  const formattedOrders = [];
  orders.forEach(order => {
    const items = order.orderItems || [];
    items.forEach(item => {
      const prod = item.Product || item.Product || {};
      formattedOrders.push({
        _id: prod.id,
        bookName: prod.title || prod.bookName || '',
        author: prod.author,
        originalPrice: prod.originalPrice,
        discountedPrice: item.price,
        discountPercent: prod.discountPercent,
        imgSrc: prod.imageUrl || prod.imgSrc,
        imgAlt: prod.imgAlt,
        quantity: item.quantity,
        orderId: order.gatewayOrderId,
        paymentMethod: order.paymentMethod,
        status: order.status,
        orderDate: order.createdAt
      });
    });
  });
  return formattedOrders;
};
// === KẾT THÚC HÀM MỚI ===

// --- 1. ĐĂNG KÝ (SIGNUP) ---
exports.signup = async (req, res) => {
  try {
    const { newUserName: username, newUserEmail: email, newUserPassword: password } = req.body;
    if (!username || !email || !password) {
      return res.status(400).json({ message: 'Vui lòng điền đầy đủ thông tin.' });
    }
    const existingUser = await User.findOne({ where: { email } });
    if (existingUser) {
      return res.status(400).json({ message: 'Email đã được sử dụng.' });
    }
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);
    await User.create({
      username,
      email,
      password: hashedPassword
    });
    res.status(201).json({ status: 'ok', message: 'Đăng ký thành công!' });
  } catch (error) {
    console.error("LỖI KHI ĐĂNG KÝ:", error);
    res.status(500).json({ message: 'Lỗi server', error: error.message });
  }
};

// --- 2. ĐĂNG NHẬP (LOGIN) ---
exports.login = async (req, res) => {
  try {
    const { userEmail: email, userPassword: password } = req.body;

    const user = await User.findOne({ where: { email } });
    if (!user) {
      return res.status(404).json({ message: 'Email hoặc mật khẩu không đúng.' });
    }

    // Kiểm tra user có bị ban không
    if (user.isBanned) {
      return res.status(403).json({ 
        message: 'Tài khoản của bạn đã bị khóa. Vui lòng liên hệ quản trị viên.',
        isBanned: true
      });
    }

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(400).json({ message: 'Email hoặc mật khẩu không đúng.' });
    }

    const token = jwt.sign(
      { 
        userId: user.id, 
        email: user.email,
        name: user.username,
        role: user.role || 'user'
      },
      process.env.JWT_SECRET,
      { expiresIn: '1h' }
    );

    // LẤY DỮ LIỆU ĐÃ "LÀM PHẲNG" (ĐÃ SỬA)
    const cartItems = await getFormattedCart(user.id);
    const wishlistItems = await getFormattedWishlist(user.id);
    const orders = await getFormattedOrders(user.id); // <-- SỬA LỖI Ở ĐÂY

    res.status(200).json({
      message: 'Đăng nhập thành công!',
      token: token,
      user: {
        id: user.id,
        name: user.username,
        username: user.username,
        email: user.email,
        role: user.role || 'user',
        cart: cartItems,
        wishlist: wishlistItems,
        orders: orders
      }
    });

  } catch (error) {
    console.error("LỖI KHI ĐĂNG NHẬP:", error);
    res.status(500).json({ message: 'Lỗi server', error: error.message });
  }
};