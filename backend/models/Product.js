const { DataTypes } = require('sequelize');

// Export ra một hàm (Cách làm này đã đúng)
module.exports = (sequelize) => {
  const Product = sequelize.define('Product', {
    id: {
      type: DataTypes.INTEGER,
      autoIncrement: true,
      primaryKey: true
    },
    title: { // Sẽ được map (đổi tên) thành 'bookName'
      type: DataTypes.STRING,
      allowNull: false
    },
    author: {
      type: DataTypes.STRING
    },
    
    // === BỔ SUNG CỘT TỒN KHO ===
    stock: {
        type: DataTypes.INTEGER,
        allowNull: false,
        defaultValue: 100 // Giả sử mỗi sách ban đầu có 100 cuốn
    },
    // === KẾT THÚC BỔ SUNG ===

    originalPrice: {
      type: DataTypes.FLOAT,
      allowNull: false,
      defaultValue: 0
    },
    discountedPrice: {
      type: DataTypes.FLOAT,
      allowNull: false,
      defaultValue: 0
    },
    discountPercent: {
      type: DataTypes.INTEGER, // Ví dụ: 25 (cho 25%)
      allowNull: false,
      defaultValue: 0
    },
    imageUrl: { // Sẽ được map (đổi tên) thành 'imgSrc'
      type: DataTypes.STRING,
      defaultValue: "https://placehold.co/300x400/555/white?text=Book+Cover"
    },
    imgAlt: {
      type: DataTypes.STRING,
      defaultValue: "Bìa sách"
    },
    badgeText: { // Ví dụ: "New Arrival", "Best Seller"
      type: DataTypes.STRING
    },
    outOfStock: {
        type: DataTypes.BOOLEAN,
        defaultValue: false
    },
    rating: {
        type: DataTypes.FLOAT,
        defaultValue: 3.5
    },
    description: {
        type: DataTypes.TEXT,
        defaultValue: "Đây là mô tả mặc định cho sách. Bạn có thể cập nhật trong phpMyAdmin."
    },
    category: {
      type: DataTypes.STRING
    }
  }, {
    tableName: 'products',
    timestamps: true
  });

  return Product;
};