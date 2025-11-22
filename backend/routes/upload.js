const express = require('express');
const router = express.Router();
const multer = require('multer');
const path = require('path');
const { adminMiddleware } = require('../middleware/adminMiddleware');

// Cấu hình nơi lưu trữ file
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, 'public/images/'); // Thư mục lưu ảnh
  },
  filename: function (req, file, cb) {
    // Tạo tên file unique: timestamp + tên gốc
    const uniqueName = Date.now() + '-' + Math.round(Math.random() * 1E9) + path.extname(file.originalname);
    cb(null, uniqueName);
  }
});

// Kiểm tra định dạng file
const fileFilter = (req, file, cb) => {
  const allowedTypes = /jpeg|jpg|png|gif|webp/;
  const extname = allowedTypes.test(path.extname(file.originalname).toLowerCase());
  const mimetype = allowedTypes.test(file.mimetype);

  if (mimetype && extname) {
    return cb(null, true);
  } else {
    cb(new Error('Chỉ chấp nhận file ảnh (jpeg, jpg, png, gif, webp)'));
  }
};

// Giới hạn kích thước file: 5MB
const upload = multer({
  storage: storage,
  limits: { fileSize: 5 * 1024 * 1024 },
  fileFilter: fileFilter
});

// @route   POST api/admin/upload
// @desc    Upload ảnh sản phẩm
// @access  Admin only
router.post('/', adminMiddleware, upload.single('image'), (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ message: 'Không có file nào được tải lên' });
    }

    // Trả về đường dẫn ảnh
    const imageUrl = `/images/${req.file.filename}`;
    res.status(200).json({
      message: 'Tải ảnh lên thành công',
      imageUrl: imageUrl
    });
  } catch (error) {
    console.error('LỖI KHI UPLOAD ẢNH:', error);
    res.status(500).json({ message: 'Lỗi server khi tải ảnh', error: error.message });
  }
});

module.exports = router;
