const { Sequelize } = require('sequelize');
require('dotenv').config();

// === 1. TẠO KẾT NỐI (INSTANCE) ===
const sequelize = new Sequelize(
  process.env.DB_NAME,
  process.env.DB_USER,
  process.env.DB_PASSWORD,
  {
    host: process.env.DB_HOST,
    dialect: 'mysql',
    logging: false // Tắt log query rườm rà
  }
);

// === 2. IMPORT & KHỞI TẠO MODEL ===
const User = require('../models/User')(sequelize);
const Product = require('../models/Product')(sequelize); 
const Cart = require('../models/Cart')(sequelize);
const Wishlist = require('../models/Wishlist')(sequelize);
const Order = require('../models/Order')(sequelize);
const OrderItem = require('../models/OrderItem')(sequelize);
const Notification = require('../models/Notification')(sequelize);
const Review = require('../models/Review')(sequelize);
const Coupon = require('../models/Coupon')(sequelize);

// === 3. ĐỊNH NGHĨA MỐI QUAN HỆ ===
User.hasMany(Cart, { foreignKey: 'userId', onDelete: 'CASCADE' });
Cart.belongsTo(User, { foreignKey: 'userId' });
Product.hasMany(Cart, { foreignKey: 'productId', onDelete: 'CASCADE' });
Cart.belongsTo(Product, { foreignKey: 'productId' });
User.hasMany(Wishlist, { foreignKey: 'userId', onDelete: 'CASCADE' });
Wishlist.belongsTo(User, { foreignKey: 'userId' });
Product.hasMany(Wishlist, { foreignKey: 'productId', onDelete: 'CASCADE' });
Wishlist.belongsTo(Product, { foreignKey: 'productId' });
User.hasMany(Order, { foreignKey: 'userId', onDelete: 'CASCADE' });
Order.belongsTo(User, { foreignKey: 'userId' });
Order.hasMany(OrderItem, { as: 'orderItems', foreignKey: 'orderId', onDelete: 'CASCADE' });
OrderItem.belongsTo(Order, { foreignKey: 'orderId' });
Product.hasMany(OrderItem, { foreignKey: 'productId', onDelete: 'CASCADE' });
OrderItem.belongsTo(Product, { foreignKey: 'productId' });

// Notification associations
User.hasMany(Notification, { foreignKey: 'userId', onDelete: 'CASCADE' });
Notification.belongsTo(User, { foreignKey: 'userId' });
Order.hasMany(Notification, { foreignKey: 'orderId', onDelete: 'CASCADE' });
Notification.belongsTo(Order, { foreignKey: 'orderId' });

// Review associations
User.hasMany(Review, { foreignKey: 'userId', onDelete: 'CASCADE' });
Review.belongsTo(User, { foreignKey: 'userId' });
Product.hasMany(Review, { foreignKey: 'productId', onDelete: 'CASCADE' });
Review.belongsTo(Product, { foreignKey: 'productId' });

// === 4. HÀM KẾT NỐI (ĐÃ CHUYỂN SANG CHẾ ĐỘ AN TOÀN) ===
const connectDB = async () => {
  try {
    await sequelize.authenticate();
    console.log('✅ MySQL connected successfully using Sequelize!');

    // 🚀 SỬ DỤNG 'alter: true' TỪ BÂY GIỜ
    try {
      await sequelize.sync({ alter: true });
      console.log('🧩 Tất cả model đã được đồng bộ hóa (ALTERED - An toàn).');
    } catch (alterErr) {
      // Handle MySQL 'Too many keys' error gracefully and fallback
      const errCode = alterErr && (alterErr.errno || (alterErr.original && alterErr.original.errno));
      if (errCode === 1069) {
        console.error('--- ❗ MySQL ALTER failed: Too many keys (errno 1069) ---');
        console.error('Full error:', alterErr);
        console.error('\nIt looks like the users table (or another table) already has many indexes and adding a UNIQUE/index would exceed MySQL\'s limit (64).');
        console.error('Falling back to safe sync without `alter`. No schema changes will be applied automatically.');
        try {
          await sequelize.sync();
          console.log('🧩 Fallback: synced models without ALTER.');
        } catch (fallbackErr) {
          console.error('--- ❌ Fallback sync failed ---');
          console.error(fallbackErr);
          process.exit(1);
        }
        console.error('\nRecommended next steps:');
        console.error('- Inspect existing indexes on the problematic table(s): run `SHOW INDEX FROM users;` in MySQL.');
        console.error('- Remove duplicate or unnecessary indexes, or drop conflicting indexes before re-running with ALTER.');
        console.error('- Example to drop an index: `ALTER TABLE users DROP INDEX index_name;`');
      } else {
        throw alterErr; // rethrow other errors
      }
    }

  } catch (error) {
    // Sửa lỗi log
    console.error('--- ❌ DATABASE CONNECTION OR SYNC FAILED! ---');
    console.error('🔻 LỖI ĐẦY ĐỦ (Full Error):', error); 
    process.exit(1);
  }
};

// === 5. EXPORT MỌI THỨ ===
module.exports = { 
  sequelize, 
  connectDB,
  User,
  Product,
  Cart,
  Wishlist,
  Order,
  OrderItem,
  Notification,
  Review,
  Coupon
};