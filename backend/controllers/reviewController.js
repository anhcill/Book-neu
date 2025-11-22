const { User, Product, Order, OrderItem, Review } = require('../config/db').sequelize.models;
const { Op } = require('sequelize');

// Create a review
exports.createReview = async (req, res) => {
  try {
    const { productId, rating, comment } = req.body;
    const userId = req.userId;

    // Check if product exists
    const product = await Product.findByPk(productId);
    if (!product) {
      return res.status(404).json({ status: 'error', message: 'Không tìm thấy sản phẩm' });
    }

    // Check if user has purchased this product
    const hasPurchased = await OrderItem.findOne({
      include: [{
        model: Order,
        where: { userId, status: 'Delivered' }
      }],
      where: { productId }
    });

    // Check if user already reviewed this product
    const existingReview = await Review.findOne({ where: { userId, productId } });
    if (existingReview) {
      return res.status(400).json({ status: 'error', message: 'Bạn đã đánh giá sản phẩm này rồi' });
    }

    // Create review
    const review = await Review.create({
      userId,
      productId,
      rating,
      comment,
      isVerifiedPurchase: !!hasPurchased
    });

    // Update product rating
    await updateProductRating(productId);

    const reviewWithUser = await Review.findByPk(review.id, {
      include: [{ model: User, attributes: ['id', 'username', 'email'] }]
    });

    res.json({
      status: 'ok',
      message: 'Đánh giá thành công',
      review: reviewWithUser
    });
  } catch (error) {
    console.error('Error creating review:', error);
    res.status(500).json({ status: 'error', message: 'Lỗi khi tạo đánh giá' });
  }
};

// Get reviews for a product
exports.getProductReviews = async (req, res) => {
  try {
    const { productId } = req.params;
    const { page = 1, limit = 10, sort = 'recent' } = req.query;

    const offset = (page - 1) * limit;

    let order = [['createdAt', 'DESC']];
    if (sort === 'helpful') {
      order = [['helpful', 'DESC'], ['createdAt', 'DESC']];
    } else if (sort === 'rating_high') {
      order = [['rating', 'DESC'], ['createdAt', 'DESC']];
    } else if (sort === 'rating_low') {
      order = [['rating', 'ASC'], ['createdAt', 'DESC']];
    }

    const { count, rows: reviews } = await Review.findAndCountAll({
      where: { productId },
      include: [{ model: User, attributes: ['id', 'username'] }],
      order,
      limit: parseInt(limit),
      offset: parseInt(offset)
    });

    // Calculate rating distribution
    const ratingDistribution = await Review.findAll({
      where: { productId },
      attributes: [
        'rating',
        [Review.sequelize.fn('COUNT', Review.sequelize.col('rating')), 'count']
      ],
      group: ['rating']
    });

    const distribution = { 1: 0, 2: 0, 3: 0, 4: 0, 5: 0 };
    ratingDistribution.forEach(item => {
      distribution[item.rating] = parseInt(item.get('count'));
    });

    res.json({
      status: 'ok',
      reviews,
      pagination: {
        total: count,
        page: parseInt(page),
        pages: Math.ceil(count / limit)
      },
      ratingDistribution: distribution
    });
  } catch (error) {
    console.error('Error fetching reviews:', error);
    res.status(500).json({ status: 'error', message: 'Lỗi khi tải đánh giá' });
  }
};

// Update review helpful count
exports.markReviewHelpful = async (req, res) => {
  try {
    const { reviewId } = req.params;
    
    const review = await Review.findByPk(reviewId);
    if (!review) {
      return res.status(404).json({ status: 'error', message: 'Không tìm thấy đánh giá' });
    }

    review.helpful += 1;
    await review.save();

    res.json({
      status: 'ok',
      message: 'Đã đánh dấu hữu ích',
      helpful: review.helpful
    });
  } catch (error) {
    console.error('Error marking review helpful:', error);
    res.status(500).json({ status: 'error', message: 'Lỗi khi cập nhật' });
  }
};

// Delete review (user can delete own review)
exports.deleteReview = async (req, res) => {
  try {
    const { reviewId } = req.params;
    const userId = req.userId;

    const review = await Review.findByPk(reviewId);
    if (!review) {
      return res.status(404).json({ status: 'error', message: 'Không tìm thấy đánh giá' });
    }

    if (review.userId !== userId) {
      return res.status(403).json({ status: 'error', message: 'Bạn không có quyền xóa đánh giá này' });
    }

    const productId = review.productId;
    await review.destroy();

    // Update product rating
    await updateProductRating(productId);

    res.json({
      status: 'ok',
      message: 'Đã xóa đánh giá'
    });
  } catch (error) {
    console.error('Error deleting review:', error);
    res.status(500).json({ status: 'error', message: 'Lỗi khi xóa đánh giá' });
  }
};

// Helper function to update product rating
async function updateProductRating(productId) {
  const reviews = await Review.findAll({ where: { productId } });
  
  if (reviews.length === 0) {
    await Product.update({ rating: 0 }, { where: { id: productId } });
    return;
  }

  const avgRating = reviews.reduce((sum, r) => sum + r.rating, 0) / reviews.length;
  await Product.update({ rating: avgRating.toFixed(1) }, { where: { id: productId } });
}
