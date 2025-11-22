import React, { useState, useEffect } from 'react'
import axios from 'axios'
import { FaStar, FaRegStar, FaThumbsUp, FaTrash } from 'react-icons/fa'
import './ReviewSection.css'

function ReviewSection({ productId, userInfo }) {
    const [reviews, setReviews] = useState([])
    const [loading, setLoading] = useState(true)
    const [showReviewForm, setShowReviewForm] = useState(false)
    const [ratingDistribution, setRatingDistribution] = useState({})
    const [newReview, setNewReview] = useState({ rating: 5, comment: '' })
    const [sortBy, setSortBy] = useState('recent')
    const [page, setPage] = useState(1)
    const [totalPages, setTotalPages] = useState(1)

    useEffect(() => {
        fetchReviews()
    }, [productId, sortBy, page])

    const fetchReviews = async () => {
        try {
            setLoading(true)
            const response = await axios.get(
                `http://localhost:5000/api/reviews/product/${productId}?page=${page}&sort=${sortBy}`
            )
            setReviews(response.data.reviews)
            setRatingDistribution(response.data.ratingDistribution)
            setTotalPages(response.data.pagination.pages)
            setLoading(false)
        } catch (error) {
            console.error('Error fetching reviews:', error)
            setLoading(false)
        }
    }

    const handleSubmitReview = async (e) => {
        e.preventDefault()
        if (!userInfo) {
            alert('Vui lòng đăng nhập để đánh giá')
            return
        }

        try {
            const token = localStorage.getItem('token')
            await axios.post(
                'http://localhost:5000/api/reviews',
                { productId, ...newReview },
                { headers: { 'x-access-token': token } }
            )
            alert('Đánh giá thành công!')
            setNewReview({ rating: 5, comment: '' })
            setShowReviewForm(false)
            fetchReviews()
        } catch (error) {
            alert(error.response?.data?.message || 'Lỗi khi gửi đánh giá')
        }
    }

    const handleMarkHelpful = async (reviewId) => {
        try {
            await axios.post(`http://localhost:5000/api/reviews/${reviewId}/helpful`)
            fetchReviews()
        } catch (error) {
            console.error('Error marking helpful:', error)
        }
    }

    const handleDeleteReview = async (reviewId) => {
        if (!window.confirm('Bạn có chắc muốn xóa đánh giá này?')) return

        try {
            const token = localStorage.getItem('token')
            await axios.delete(`http://localhost:5000/api/reviews/${reviewId}`, {
                headers: { 'x-access-token': token }
            })
            alert('Đã xóa đánh giá')
            fetchReviews()
        } catch (error) {
            alert(error.response?.data?.message || 'Lỗi khi xóa đánh giá')
        }
    }

    const renderStars = (rating) => {
        return [...Array(5)].map((_, index) => (
            index < rating ? <FaStar key={index} className="star filled" /> : <FaRegStar key={index} className="star" />
        ))
    }

    const avgRating = reviews.length > 0
        ? (reviews.reduce((sum, r) => sum + r.rating, 0) / reviews.length).toFixed(1)
        : 0

    if (loading) {
        return <div className="reviews-loading">Đang tải đánh giá...</div>
    }

    return (
        <div className="review-section">
            <div className="review-header">
                <h2>Đánh Giá Sản Phẩm</h2>
                {userInfo && (
                    <button className="btn-write-review" onClick={() => setShowReviewForm(!showReviewForm)}>
                        ✍️ Viết đánh giá
                    </button>
                )}
            </div>

            {/* Rating Summary */}
            <div className="rating-summary">
                <div className="average-rating">
                    <div className="rating-number">{avgRating}</div>
                    <div className="stars">{renderStars(Math.round(avgRating))}</div>
                    <div className="review-count">{reviews.length} đánh giá</div>
                </div>
                <div className="rating-bars">
                    {[5, 4, 3, 2, 1].map(star => {
                        const count = ratingDistribution[star] || 0
                        const percentage = reviews.length > 0 ? (count / reviews.length) * 100 : 0
                        return (
                            <div key={star} className="rating-bar-row">
                                <span>{star} ⭐</span>
                                <div className="rating-bar">
                                    <div className="rating-bar-fill" style={{ width: `${percentage}%` }}></div>
                                </div>
                                <span>{count}</span>
                            </div>
                        )
                    })}
                </div>
            </div>

            {/* Review Form */}
            {showReviewForm && (
                <form className="review-form" onSubmit={handleSubmitReview}>
                    <div className="form-group">
                        <label>Đánh giá của bạn:</label>
                        <div className="star-input">
                            {[1, 2, 3, 4, 5].map(star => (
                                <span
                                    key={star}
                                    className={`star-btn ${newReview.rating >= star ? 'active' : ''}`}
                                    onClick={() => setNewReview({ ...newReview, rating: star })}
                                >
                                    {newReview.rating >= star ? <FaStar /> : <FaRegStar />}
                                </span>
                            ))}
                        </div>
                    </div>
                    <div className="form-group">
                        <label>Nhận xét:</label>
                        <textarea
                            value={newReview.comment}
                            onChange={(e) => setNewReview({ ...newReview, comment: e.target.value })}
                            placeholder="Chia sẻ trải nghiệm của bạn về sản phẩm này..."
                            rows="4"
                        />
                    </div>
                    <div className="form-actions">
                        <button type="button" className="btn-cancel" onClick={() => setShowReviewForm(false)}>
                            Hủy
                        </button>
                        <button type="submit" className="btn-submit">
                            Gửi đánh giá
                        </button>
                    </div>
                </form>
            )}

            {/* Sort Options */}
            <div className="review-controls">
                <select value={sortBy} onChange={(e) => setSortBy(e.target.value)}>
                    <option value="recent">Mới nhất</option>
                    <option value="helpful">Hữu ích nhất</option>
                    <option value="rating_high">Đánh giá cao</option>
                    <option value="rating_low">Đánh giá thấp</option>
                </select>
            </div>

            {/* Reviews List */}
            <div className="reviews-list">
                {reviews.length === 0 ? (
                    <div className="no-reviews">
                        <p>Chưa có đánh giá nào. Hãy là người đầu tiên đánh giá sản phẩm này!</p>
                    </div>
                ) : (
                    reviews.map(review => (
                        <div key={review.id} className="review-item">
                            <div className="review-header-item">
                                <div className="reviewer-info">
                                    <div className="reviewer-avatar">
                                        {review.User.username.charAt(0).toUpperCase()}
                                    </div>
                                    <div>
                                        <div className="reviewer-name">{review.User.username}</div>
                                        <div className="review-date">
                                            {new Date(review.createdAt).toLocaleDateString('vi-VN')}
                                            {review.isVerifiedPurchase && (
                                                <span className="verified-badge">✓ Đã mua hàng</span>
                                            )}
                                        </div>
                                    </div>
                                </div>
                                {userInfo && userInfo.userId === review.userId && (
                                    <button
                                        className="btn-delete-review"
                                        onClick={() => handleDeleteReview(review.id)}
                                    >
                                        <FaTrash />
                                    </button>
                                )}
                            </div>
                            <div className="review-rating">{renderStars(review.rating)}</div>
                            <div className="review-comment">{review.comment}</div>
                            <button
                                className="btn-helpful"
                                onClick={() => handleMarkHelpful(review.id)}
                            >
                                <FaThumbsUp /> Hữu ích ({review.helpful})
                            </button>
                        </div>
                    ))
                )}
            </div>

            {/* Pagination */}
            {totalPages > 1 && (
                <div className="review-pagination">
                    <button
                        disabled={page === 1}
                        onClick={() => setPage(page - 1)}
                    >
                        Trước
                    </button>
                    <span>Trang {page} / {totalPages}</span>
                    <button
                        disabled={page === totalPages}
                        onClick={() => setPage(page + 1)}
                    >
                        Sau
                    </button>
                </div>
            )}
        </div>
    )
}

export default ReviewSection
