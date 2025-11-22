// Import các model đã được khởi tạo từ file db.js
const { Wishlist, Product } = require('../config/db');

// --- HÀM HỖ TRỢ: Để "làm phẳng" dữ liệu wishlist ---
const getFormattedWishlist = async (userId) => {
    const wishlistItemsRaw = await Wishlist.findAll({
        where: { userId },
        include: [Product]
    });

    const formattedWishlist = wishlistItemsRaw.map(item => ({
        _id: item.Product.id,
        bookName: item.Product.title,
        author: item.Product.author,
        originalPrice: item.Product.price,
        discountedPrice: item.Product.price * 0.9,
        discountPercent: 10,
        imgSrc: item.Product.imageUrl,
        imgAlt: item.Product.title,
    }));
    return formattedWishlist;
};

// --- PATCH /api/wishlist (Thêm vào Wishlist) ---
exports.addItemToWishlist = async (req, res) => {
  try {
    const userId = req.userId;
    const { productdetails } = req.body;
    const productId = productdetails._id; 

    if (!productId) {
      return res.status(400).json({ message: 'Không tìm thấy ID Sản phẩm' });
    }

    const existingItem = await Wishlist.findOne({
      where: { userId, productId }
    });

    if (existingItem) {
      return res.status(400).json({ message: 'Sản phẩm đã có trong Wishlist' });
    }

    await Wishlist.create({
      userId,
      productId
    });

    // Lấy wishlist đã "làm phẳng"
    const newWishlist = await getFormattedWishlist(userId);

    res.status(200).json({
      status: 'ok',
      user: {
        wishlist: newWishlist
      }
    });

  } catch (error) {
    console.error("LỖI KHI THÊM WISHLIST:", error);
    res.status(500).json({ message: 'Lỗi server', error: error.message });
  }
};

// --- DELETE /api/wishlist/:id (Xóa khỏi Wishlist) ---
exports.removeItemFromWishlist = async (req, res) => {
  try {
    const userId = req.userId;
    const productId = req.params.id; 

    await Wishlist.destroy({
      where: {
        userId,
        productId
      }
    });

    // Lấy wishlist đã "làm phẳng"
    const newWishlist = await getFormattedWishlist(userId);

    res.status(200).json({
      status: 'ok',
      user: {
        wishlist: newWishlist
      }
    });

  } catch (error) {
    console.error("LỖI KHI XÓA WISHLIST:", error);
    res.status(500).json({ message: 'Lỗi server', error: error.message });
  }
};