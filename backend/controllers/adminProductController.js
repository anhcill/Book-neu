const { Product } = require('../config/db');

// @route   POST api/admin/products
// @desc    Tạo sản phẩm mới
// @access  Admin only
exports.createProduct = async (req, res) => {
  try {
    const {
      title,
      author,
      description,
      category,
      originalPrice,
      discountedPrice,
      discountPercent,
      stock,
      imageUrl,
      imgAlt,
      isbn,
      publisher,
      publicationDate
    } = req.body;

    // Validation
    if (!title || !author || !originalPrice || !discountedPrice || !category || !imageUrl) {
      return res.status(400).json({ 
        status: 'error',
        message: 'Vui lòng điền đầy đủ thông tin bắt buộc (title, author, prices, category, imageUrl)' 
      });
    }

    const newProduct = await Product.create({
      title,
      author,
      description: description || '',
      category,
      originalPrice: parseFloat(originalPrice),
      discountedPrice: parseFloat(discountedPrice),
      discountPercent: parseInt(discountPercent) || 0,
      stock: parseInt(stock) || 100,
      imageUrl,
      imgAlt: imgAlt || title,
      isbn: isbn || null,
      publisher: publisher || null,
      publicationDate: publicationDate || null
    });

    res.status(201).json({
      status: 'ok',
      message: 'Tạo sản phẩm thành công',
      product: newProduct
    });
  } catch (error) {
    console.error('LỖI KHI TẠO SẢN PHẨM:', error);
    res.status(500).json({ 
      status: 'error',
      message: 'Lỗi server', 
      error: error.message 
    });
  }
};

// @route   GET api/admin/products
// @desc    Lấy tất cả sản phẩm (có phân trang)
// @access  Admin only
exports.getAllProducts = async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 20;
    const offset = (page - 1) * limit;

    const { count, rows } = await Product.findAndCountAll({
      limit,
      offset,
      order: [['createdAt', 'DESC']]
    });

    res.status(200).json({
      status: 'ok',
      totalProducts: count,
      totalPages: Math.ceil(count / limit),
      currentPage: page,
      products: rows
    });
  } catch (error) {
    console.error('LỖI KHI LẤY DANH SÁCH SẢN PHẨM:', error);
    res.status(500).json({ 
      status: 'error',
      message: 'Lỗi server', 
      error: error.message 
    });
  }
};

// @route   GET api/admin/products/:id
// @desc    Lấy thông tin chi tiết sản phẩm
// @access  Admin only
exports.getProductById = async (req, res) => {
  try {
    const { id } = req.params;

    const product = await Product.findByPk(id);

    if (!product) {
      return res.status(404).json({ 
        status: 'error',
        message: 'Không tìm thấy sản phẩm' 
      });
    }

    res.status(200).json({
      status: 'ok',
      product: product
    });
  } catch (error) {
    console.error('LỖI KHI LẤY SẢN PHẨM:', error);
    res.status(500).json({ 
      status: 'error',
      message: 'Lỗi server', 
      error: error.message 
    });
  }
};

// @route   PUT api/admin/products/:id
// @desc    Cập nhật sản phẩm
// @access  Admin only
exports.updateProduct = async (req, res) => {
  try {
    const { id } = req.params;
    const updateData = req.body;

    const product = await Product.findByPk(id);

    if (!product) {
      return res.status(404).json({ 
        status: 'error',
        message: 'Không tìm thấy sản phẩm' 
      });
    }

    await product.update(updateData);

    res.status(200).json({
      status: 'ok',
      message: 'Cập nhật sản phẩm thành công',
      product: product
    });
  } catch (error) {
    console.error('LỖI KHI CẬP NHẬT SẢN PHẨM:', error);
    res.status(500).json({ 
      status: 'error',
      message: 'Lỗi server', 
      error: error.message 
    });
  }
};

// @route   DELETE api/admin/products/:id
// @desc    Xóa sản phẩm
// @access  Admin only
exports.deleteProduct = async (req, res) => {
  try {
    const { id } = req.params;

    const product = await Product.findByPk(id);

    if (!product) {
      return res.status(404).json({ 
        status: 'error',
        message: 'Không tìm thấy sản phẩm' 
      });
    }

    await product.destroy();

    res.status(200).json({ 
      status: 'ok',
      message: 'Xóa sản phẩm thành công' 
    });
  } catch (error) {
    console.error('LỖI KHI XÓA SẢN PHẨM:', error);
    res.status(500).json({ 
      status: 'error',
      message: 'Lỗi server', 
      error: error.message 
    });
  }
};
