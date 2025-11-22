const express = require('express');
const cors = require('cors');
const path = require('path');
const { connectDB } = require('./config/db'); // CHỈ import từ db.js
require('dotenv').config();

const app = express();
connectDB(); // Hàm này sẽ lo mọi thứ

// === MIDDLEWARES ===
app.use(cors());
app.use(express.json());

// Serve static files (ảnh upload)
app.use('/images', express.static(path.join(__dirname, 'public/images')));

// === API ROUTES ===
app.use('/api', require('./routes/auth')); 
app.use('/api', require('./routes/user'));
app.use('/api', require('./routes/product'));
app.use('/api/wishlist', require('./routes/wishlist'));
app.use('/api/cart', require('./routes/cart'));
app.use('/api/payment', require('./routes/payment')); 
app.use('/api/orders', require('./routes/order')); 

// === ADMIN ROUTES ===
app.use('/api/admin/upload', require('./routes/upload'));
app.use('/api/admin/products', require('./routes/adminProduct'));
app.use('/api/admin/orders', require('./routes/adminOrder'));
app.use('/api/admin/users', require('./routes/adminUser'));
app.use('/api/admin/analytics', require('./routes/adminAnalytics'));

// === NOTIFICATION ROUTES ===
app.use('/api/notifications', require('./routes/notification'));

// === CHATBOT ROUTES ===
app.use('/api/chatbot', require('./routes/chatbot'));

// === REVIEW ROUTES ===
app.use('/api/reviews', require('./routes/review'));

// === COUPON ROUTES ===
app.use('/api/coupons', require('./routes/coupon'));

// === INVENTORY ROUTES ===
app.use('/api/inventory', require('./routes/inventory'));

app.get('/', (req, res) => {
  res.send('Neu Book API đang chạy...');
});

// === KHỞI CHẠY SERVER ===
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`Server đang chạy trên http://localhost:${PORT}`);
});