const { DataTypes } = require('sequelize');

// Export ra một hàm nhận 'sequelize' làm tham số
module.exports = (sequelize) => {
  const { DataTypes } = require('sequelize');

// Export ra một hàm nhận 'sequelize' làm tham số
module.exports = (sequelize) => {
  const OrderItem = sequelize.define('OrderItem', {
    id: {
      type: DataTypes.INTEGER,
      autoIncrement: true,
      primaryKey: true
    },
    orderId: {
      type: DataTypes.INTEGER,
      allowNull: false
    },
    productId: {
      type: DataTypes.INTEGER,
      allowNull: false
    },
    quantity: {
      type: DataTypes.INTEGER,
      allowNull: false
    },
    // Giá tại thời điểm mua
    price: {
      type: DataTypes.FLOAT,
      allowNull: false
    }
  }, {
    tableName: 'order_items',
    timestamps: true // Tự động thêm createdAt, updatedAt
  });

  return OrderItem;
};const OrderItem = sequelize.define('OrderItem', {
    id: {
      type: DataTypes.INTEGER,
      autoIncrement: true,
      primaryKey: true
    },
    orderId: {
      type: DataTypes.INTEGER,
      allowNull: false
    },
    productId: {
      type: DataTypes.INTEGER,
      allowNull: false
    },
    quantity: {
      type: DataTypes.INTEGER,
      allowNull: false
    },
    // Giá tại thời điểm mua
    price: {
      type: DataTypes.FLOAT,
      allowNull: false
    }
  }, {
    tableName: 'order_items',
    timestamps: true // Tự động thêm createdAt, updatedAt
  });

  return OrderItem;
};