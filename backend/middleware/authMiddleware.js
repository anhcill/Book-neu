const jwt = require('jsonwebtoken');
const { User } = require('../config/db');
require('dotenv').config();

const authenticateToken = async (req, res, next) => {
  try {
    const token = req.headers['x-access-token'];

    if (!token) {
      return res.status(401).json({ message: 'Không tìm thấy token, xác thực thất bại.' });
    }

    const decodedToken = jwt.verify(token, process.env.JWT_SECRET);
    
    req.userId = decodedToken.userId;

    // Kiểm tra xem user có bị ban không
    const user = await User.findByPk(req.userId);
    
    if (!user) {
      return res.status(404).json({ message: 'Người dùng không tồn tại.' });
    }

    if (user.isBanned) {
      return res.status(403).json({ 
        message: 'Tài khoản của bạn đã bị khóa. Vui lòng liên hệ quản trị viên.',
        isBanned: true 
      });
    }

    req.user = user;
    next(); 
    
  } catch (error) {
    res.status(401).json({ message: 'Token không hợp lệ.' });
  }
};

module.exports = { authenticateToken };
// Keep backward compatibility 
module.exports.default = authenticateToken;