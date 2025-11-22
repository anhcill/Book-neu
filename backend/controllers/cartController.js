// Import các model đã được khởi tạo từ file db.js
const { Cart, Product, sequelize } = require('../config/db');

// --- HÀM HỖ TRỢ: Để "làm phẳng" dữ liệu giỏ hàng ---
// (Chúng ta sẽ dùng hàm này ở mọi nơi)
const getFormattedCart = async (userId) => {
    const cartItemsRaw = await Cart.findAll({
        where: { userId },
        include: [Product] // Lấy cả thông tin sản phẩm
    });

    // Biến đổi (map) dữ liệu lồng nhau thành dữ liệu phẳng
    const formattedCart = cartItemsRaw.map(item => ({
        // Lấy thông tin từ Product
        _id: item.Product.id, // ID của Sản phẩm (quan trọng)
        bookName: item.Product.title,
        author: item.Product.author,
         originalPrice: item.Product.originalPrice,
        discountedPrice: item.Product.discountedPrice,
        discountPercent: item.Product.discountPercent,
        imgSrc: item.Product.imageUrl,
        imgAlt: item.Product.title,
        
        // Lấy thông tin từ Cart
        cartItemId: item.id, // ID của Hàng trong giỏ
        quantity: item.quantity
    }));
    return formattedCart;
};

// --- PATCH /api/cart (Thêm vào giỏ hàng - Đã có) ---
exports.addItemToCart = async (req, res) => {
  try {
    const userId = req.userId; 
    const { productdetails } = req.body;
    const productId = productdetails._id; 

    if (!productId) {
      return res.status(400).json({ message: 'Không tìm thấy ID Sản phẩm' });
    }

    const existingItem = await Cart.findOne({
      where: { userId, productId }
    });

    if (existingItem) {
      existingItem.quantity += 1;
      await existingItem.save();
    } else {
      await Cart.create({
        userId,
        productId,
        quantity: 1
      });
    }

    // Lấy giỏ hàng đã "làm phẳng"
    const newCart = await getFormattedCart(userId);

    res.status(200).json({
      status: 'ok',
      user: {
        cart: newCart
      }
    });

  } catch (error) {
    console.error("LỖI KHI THÊM CART:", error);
    res.status(500).json({ message: 'Lỗi server', error: error.message });
  }
};

// --- HÀM MỚI: PATCH /api/cart/:id (Cập nhật số lượng) ---
exports.updateCartItemQuantity = async (req, res) => {
    const MAX_RETRIES = 3;
    let retries = 0;

    while (retries < MAX_RETRIES) {
        try {
            const userId = req.userId; // Từ middleware
            const productId = req.params.id; // Đây là Product ID
            const { newQuantity } = req.body; // Số lượng mới

            // Validate input
            if (newQuantity < 0) {
                return res.status(400).json({
                    status: 'error',
                    message: 'Số lượng không thể âm'
                });
            }

            if (newQuantity === 0) {
                // Xóa sản phẩm khỏi giỏ hàng
                await Cart.destroy({
                    where: { userId, productId }
                });
            } else {
                // Cập nhật số lượng với transaction và row lock
                await sequelize.transaction(async (t) => {
                    const cartItem = await Cart.findOne({
                        where: { userId, productId },
                        transaction: t,
                        lock: t.LOCK.UPDATE // Sử dụng row lock
                    });

                    if (!cartItem) {
                        throw new Error('Sản phẩm không có trong giỏ hàng');
                    }

                    await cartItem.update(
                        { quantity: newQuantity },
                        { transaction: t }
                    );
                });
            }

            // Lấy lại toàn bộ giỏ hàng đã "làm phẳng"
            const newCart = await getFormattedCart(userId);

            return res.status(200).json({
                status: 'ok',
                user: { cart: newCart }
            });

        } catch (error) {
            console.error(`LỖI CẬP NHẬT SỐ LƯỢNG CART (attempt ${retries + 1}):`, error);
            
            // Kiểm tra nếu là deadlock error và còn retry
            if (error.original && error.original.code === 'ER_LOCK_DEADLOCK' && retries < MAX_RETRIES - 1) {
                retries++;
                console.log(`🔄 Retry ${retries}/${MAX_RETRIES} do deadlock...`);
                
                // Đợi một chút trước khi retry (exponential backoff)
                await new Promise(resolve => setTimeout(resolve, Math.pow(2, retries) * 100));
                continue;
            }

            // Nếu không phải deadlock hoặc đã hết retry
            return res.status(500).json({
                status: 'error',
                message: 'Lỗi cập nhật giỏ hàng',
                error: error.message
            });
        }
    }
};

// --- HÀM MỚI: DELETE /api/cart/:id (Xóa khỏi giỏ hàng) ---
exports.removeItemFromCart = async (req, res) => {
    try {
        const userId = req.userId; // Từ middleware
        const productId = req.params.id; // Đây là Product ID

        await Cart.destroy({
            where: {
                userId,
                productId
            }
        });

        // Lấy lại toàn bộ giỏ hàng đã "làm phẳng"
        const newCart = await getFormattedCart(userId);

        res.status(200).json({
            status: 'ok',
            user: { cart: newCart }
        });

    } catch (error) {
        console.error("LỖI KHI XÓA CART:", error);
        res.status(500).json({ message: 'Lỗi server', error: error.message });
    }
};