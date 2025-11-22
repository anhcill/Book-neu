const express = require('express');
const router = express.Router();
const productController = require('../controllers/productController');

// @route   GET /api/home/products
// @desc    Lấy tất cả sản phẩm
// @access  Public
router.get('/home/products', productController.getProducts);

module.exports = router;