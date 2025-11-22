const express = require('express');
const router = express.Router();
const adminProductController = require('../controllers/adminProductController');
const { adminMiddleware } = require('../middleware/adminMiddleware');

// @route   POST api/admin/products
// @desc    Tạo sản phẩm mới
// @access  Admin only
router.post('/', adminMiddleware, adminProductController.createProduct);

// @route   GET api/admin/products
// @desc    Lấy tất cả sản phẩm (có phân trang)
// @access  Admin only
router.get('/', adminMiddleware, adminProductController.getAllProducts);

// @route   GET api/admin/products/:id
// @desc    Lấy thông tin chi tiết sản phẩm
// @access  Admin only
router.get('/:id', adminMiddleware, adminProductController.getProductById);

// @route   PUT api/admin/products/:id
// @desc    Cập nhật sản phẩm
// @access  Admin only
router.put('/:id', adminMiddleware, adminProductController.updateProduct);

// @route   DELETE api/admin/products/:id
// @desc    Xóa sản phẩm
// @access  Admin only
router.delete('/:id', adminMiddleware, adminProductController.deleteProduct);

module.exports = router;
