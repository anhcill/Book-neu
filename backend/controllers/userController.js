// Import các model đã được khởi tạo từ file db.js
const { User, Product, Cart, Wishlist } = require('../config/db');

// --- HÀM HỖ TRỢ 1 (ĐÃ SỬA LỖI GIÁ 0đ) ---
const getFormattedCart = async (userId) => {
    const cartItemsRaw = await Cart.findAll({ where: { userId }, include: [Product] });
    return cartItemsRaw.map(item => ({
        _id: item.Product.id,
        bookName: item.Product.title,
        author: item.Product.author,
        originalPrice: item.Product.originalPrice,
        discountedPrice: item.Product.discountedPrice,
        discountPercent: item.Product.discountPercent,
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
        originalPrice: item.Product.originalPrice,
        discountedPrice: item.Product.discountedPrice,
        discountPercent: item.Product.discountPercent,
        imgSrc: item.Product.imageUrl,
        imgAlt: item.Product.imgAlt,
        genre: item.Product.category,
        fastDeliveryAvailable: true
    }));
};

// --- GET /api/user ---
exports.getUserData = async (req, res) => {
  try {
    const userId = req.userId; 

    const user = await User.findByPk(userId, {
      attributes: { exclude: ['password'] }
    });
    if (!user) {
      return res.status(404).json({ message: 'Không tìm thấy user.' });
    }

    // LẤY DỮ LIỆU ĐÃ "LÀM PHẲNG" (ĐÃ SỬA)
    const cartItems = await getFormattedCart(userId);
    const wishlistItems = await getFormattedWishlist(userId);

    res.status(200).json({
      status: 'ok',
      user: {
        id: user.id,
        username: user.username,
        email: user.email,
        cart: cartItems,
        wishlist: wishlistItems
      }
    });

  } catch (error) {
    console.error("LỖI KHI LẤY USER DATA:", error);
    res.status(500).json({ message: 'Lỗi server', error: error.message });
  }
};