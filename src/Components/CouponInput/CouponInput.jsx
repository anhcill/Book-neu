import React, { useState } from 'react'
import axios from 'axios'
import { FaTicketAlt, FaCheck, FaTimes } from 'react-icons/fa'
import './CouponInput.css'

function CouponInput({ cartTotal, cartItems, onCouponApplied }) {
    const [couponCode, setCouponCode] = useState('')
    const [loading, setLoading] = useState(false)
    const [appliedCoupon, setAppliedCoupon] = useState(null)
    const [error, setError] = useState('')

    const handleValidateCoupon = async () => {
        if (!couponCode.trim()) {
            setError('Vui lòng nhập mã giảm giá')
            return
        }

        setLoading(true)
        setError('')

        try {
            const token = localStorage.getItem('token')
            const response = await axios.post(
                'http://localhost:5000/api/coupons/validate',
                {
                    code: couponCode.toUpperCase(),
                    orderValue: cartTotal,
                    cartItems: cartItems.map(item => ({
                        category: item.category
                    }))
                },
                { headers: { 'x-access-token': token } }
            )

            const { coupon, discount, finalAmount } = response.data
            setAppliedCoupon({ ...coupon, discount, finalAmount })
            onCouponApplied({ code: coupon.code, discount, finalAmount })
            setError('')
        } catch (err) {
            setError(err.response?.data?.message || 'Mã giảm giá không hợp lệ')
            setAppliedCoupon(null)
            onCouponApplied(null)
        } finally {
            setLoading(false)
        }
    }

    const handleRemoveCoupon = () => {
        setCouponCode('')
        setAppliedCoupon(null)
        setError('')
        onCouponApplied(null)
    }

    return (
        <div className="coupon-input-container">
            <div className="coupon-input-header">
                <FaTicketAlt />
                <span>Mã giảm giá</span>
            </div>

            {!appliedCoupon ? (
                <div className="coupon-input-form">
                    <input
                        type="text"
                        placeholder="Nhập mã giảm giá"
                        value={couponCode}
                        onChange={(e) => setCouponCode(e.target.value.toUpperCase())}
                        disabled={loading}
                    />
                    <button
                        type="button"
                        onClick={handleValidateCoupon}
                        disabled={loading || !couponCode.trim()}
                        className="btn-apply-coupon"
                    >
                        {loading ? 'Đang kiểm tra...' : 'Áp dụng'}
                    </button>
                </div>
            ) : (
                <div className="coupon-applied">
                    <div className="coupon-info">
                        <div className="coupon-code">
                            <FaCheck className="check-icon" />
                            <strong>{appliedCoupon.code}</strong>
                        </div>
                        <p className="coupon-description">{appliedCoupon.description}</p>
                        <div className="coupon-discount">
                            Giảm: <span className="discount-amount">
                                {new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(appliedCoupon.discount)}
                            </span>
                        </div>
                    </div>
                    <button
                        type="button"
                        onClick={handleRemoveCoupon}
                        className="btn-remove-coupon"
                    >
                        <FaTimes />
                    </button>
                </div>
            )}

            {error && (
                <div className="coupon-error">
                    <FaTimes /> {error}
                </div>
            )}
        </div>
    )
}

export default CouponInput
