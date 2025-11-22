const express = require('express');
const router = express.Router();
const reviewController = require('../controllers/reviewController');
const { authenticateToken } = require('../middleware/authMiddleware');

// Public routes
router.get('/product/:productId', reviewController.getProductReviews);

// Protected routes (require login)
router.post('/', authenticateToken, reviewController.createReview);
router.post('/:reviewId/helpful', reviewController.markReviewHelpful);
router.delete('/:reviewId', authenticateToken, reviewController.deleteReview);

module.exports = router;
