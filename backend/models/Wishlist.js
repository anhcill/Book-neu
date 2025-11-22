const { DataTypes } = require('sequelize');

// Sửa giống User.js: Export ra một hàm
module.exports = (sequelize) => {
  const Wishlist = sequelize.define('Wishlist', {
    id: {
      type: DataTypes.INTEGER,
      autoIncrement: true,
      primaryKey: true
    },
    userId: {
      type: DataTypes.INTEGER,
      allowNull: false
    },
    productId: {
      type: DataTypes.INTEGER,
      allowNull: false
    }
  }, {
    tableName: 'wishlist_items',
    timestamps: true
  });

  return Wishlist;
};