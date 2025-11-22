// SỬA LỖI IMPORT: Tải Model đã khởi tạo từ db.js
const { Product } = require('../config/db');

// --- GET /api/home/products ---
exports.getProducts = async (req, res) => {
  try {
    // Dòng 7 (Lỗi cũ): Giờ 'Product.findAll' sẽ hoạt động
    const products = await Product.findAll(); 

    // SỬA LỖI MAP: "Làm phẳng" và đổi tên cho khớp frontend
    const productsList = products.map(product => {
      return {
        _id: product.id, 
        bookName: product.title, // Đổi tên
        author: product.author,
        originalPrice: product.originalPrice,
        discountedPrice: product.discountedPrice,
        discountPercent: product.discountPercent,
        imgSrc: product.imageUrl, // Đổi tên
        imgAlt: product.imgAlt,
        badgeText: product.badgeText,
        outOfStock: product.outOfStock,
        rating: product.rating,
        description: product.description,
        
        // === BỔ SUNG 2 TRƯỜNG CHO BỘ LỌC ===
        genre: product.category, // Map 'category' (từ DB) sang 'genre' (mà context cần)
        fastDeliveryAvailable: true, // Thêm dữ liệu giả (luôn luôn là true)
        // === KẾT THÚC BỔ SUNG ===

        createdAt: product.createdAt,
        updatedAt: product.updatedAt
      };
    });

    res.status(200).json({ productsList: productsList });

  } catch (error) {
    console.error("LỖI KHI LẤY SẢN PHẨM:", error);
    res.status(500).json({ message: 'Lỗi server', error: error.message });
  }
};