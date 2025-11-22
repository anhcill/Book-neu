const jwt = require('jsonwebtoken');
const { User } = require('../config/db');
require('dotenv').config();

// Middleware kiểm tra quyền Admin
const adminMiddleware = async (req, res, next) => {
  try {
    const token = req.headers['x-access-token'];

    if (!token) {
      return res.status(401).json({ message: 'Không tìm thấy token, xác thực thất bại.' });
    }

    const decodedToken = jwt.verify(token, process.env.JWT_SECRET);
    req.userId = decodedToken.userId;

    // Lấy thông tin user từ database để kiểm tra role
    const user = await User.findByPk(req.userId);

    if (!user) {
      return res.status(404).json({ message: 'Không tìm thấy người dùng.' });
    }

    if (user.role !== 'admin') {
      return res.status(403).json({ message: 'Bạn không có quyền truy cập. Chỉ Admin mới được phép.' });
    }

    req.user = user;
    next(); 
    
  } catch (error) {
    res.status(401).json({ message: 'Token không hợp lệ.' });
  }
};

module.exports = { adminMiddleware };
// Keep backward compatibility
module.exports.default = adminMiddleware;
