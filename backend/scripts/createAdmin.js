const bcrypt = require('bcryptjs');
const { User, sequelize } = require('../config/db');
require('dotenv').config();

async function createAdminUser() {
  try {
    // Kết nối database
    await sequelize.authenticate();
    console.log('✓ Đã kết nối database');

    // Kiểm tra xem admin đã tồn tại chưa
    const existingAdmin = await User.findOne({ where: { email: 'admin@bookztron.com' } });
    
    if (existingAdmin) {
      console.log('⚠ Admin đã tồn tại!');
      console.log('Email:', existingAdmin.email);
      console.log('Role:', existingAdmin.role);
      
      // Nếu role không phải admin, cập nhật
      if (existingAdmin.role !== 'admin') {
        await existingAdmin.update({ role: 'admin' });
        console.log('✓ Đã cập nhật role thành admin');
      }
    } else {
      // Tạo admin mới
      const salt = await bcrypt.genSalt(10);
      const hashedPassword = await bcrypt.hash('admin123', salt);
      
      const admin = await User.create({
        username: 'Admin',
        email: 'admin@bookztron.com',
        password: hashedPassword,
        role: 'admin'
      });
      
      console.log('✓ Đã tạo tài khoản admin thành công!');
      console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
      console.log('📧 Email: admin@bookztron.com');
      console.log('🔑 Password: admin123');
      console.log('👤 Role: admin');
      console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    }
    
    await sequelize.close();
    process.exit(0);
  } catch (error) {
    console.error('❌ Lỗi:', error);
    process.exit(1);
  }
}

createAdminUser();
