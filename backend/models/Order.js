const { DataTypes } = require('sequelize');

// Export ra một hàm nhận 'sequelize' làm tham số
module.exports = (sequelize) => {
  const Order = sequelize.define('Order', {
    id: {
      type: DataTypes.INTEGER,
      autoIncrement: true,
      primaryKey: true
    },
    userId: {
      type: DataTypes.INTEGER,
      allowNull: false
    },

    // === THÊM 2 CỘT MỚI CHO NÂNG CẤP ===
    paymentMethod: { // Sẽ lưu 'COD' hoặc 'VNPAY'
      type: DataTypes.STRING,
      allowNull: false 
    },
    shippingAddress: { // Sẽ lưu địa chỉ (Tên, SĐT, Địa chỉ)
      type: DataTypes.TEXT, // Dùng TEXT cho địa chỉ dài
      allowNull: false
    },
    // === KẾT THÚC THÊM CỘT ===

    gatewayPaymentId: { // ID của VNPay (ví dụ: transId)
      type: DataTypes.STRING,
      allowNull: true, // Phải là 'true' (vì COD không có)
    },
    gatewayOrderId: { // ID của VNPay (ví dụ: TxnRef)
        type: DataTypes.STRING,
        allowNull: true // SỬA LỖI: Phải là 'true' (vì COD không có)
    },
    gatewaySignature: {
        type: DataTypes.STRING,
        allowNull: true
    },
    totalAmount: {
      type: DataTypes.FLOAT,
      allowNull: false
    },
    status: {
      type: DataTypes.ENUM('pending', 'confirmed', 'shipping', 'delivered', 'cancelled'),
      defaultValue: 'pending' // pending (Chờ xác nhận) → confirmed (Đã xác nhận) → shipping (Đang giao) → delivered (Đã giao)
    },
    cancellationReason: {
      type: DataTypes.STRING,
      allowNull: true // Lý do hủy đơn (nếu hủy)
    }
  }, {
    tableName: 'orders',
    timestamps: true
  });

  return Order;
};