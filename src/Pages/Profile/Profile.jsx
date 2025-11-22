import React, { useState, useEffect } from 'react'
import './Profile.css'
import { useNavigate } from 'react-router-dom'
import axios from 'axios'
import { useToast } from '../../index'
import { FaUser, FaEnvelope, FaPhone, FaMapMarkerAlt, FaEdit, FaSave, FaTimes, FaBox, FaHeart, FaShoppingCart } from 'react-icons/fa'

function Profile() {
    const navigate = useNavigate()
    const { showToast } = useToast()
    const [user, setUser] = useState(null)
    const [loading, setLoading] = useState(true)
    const [isEditing, setIsEditing] = useState(false)
    const [formData, setFormData] = useState({
        name: '',
        email: '',
        phone: '',
        address: ''
    })
    const [orderStats, setOrderStats] = useState({
        total: 0,
        pending: 0,
        completed: 0
    })

    useEffect(() => {
        const token = localStorage.getItem('token')
        if (!token) {
            navigate('/login')
            return
        }

        fetchUserProfile(token)
        fetchOrderStats(token)
    // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [navigate])

    const fetchUserProfile = async (token) => {
        try {
            const response = await axios.get('http://localhost:5000/api/user', {
                headers: { 'x-access-token': token }
            })

            if (response.data.status === 'ok') {
                const userData = response.data.user
                setUser(userData)
                setFormData({
                    name: userData.name || '',
                    email: userData.email || '',
                    phone: userData.phone || '',
                    address: userData.address || ''
                })
                setLoading(false)
            }
        } catch (error) {
            console.error('Error fetching profile:', error)
            showToast('error', '', 'Không thể tải thông tin người dùng')
            setLoading(false)
        }
    }

    const fetchOrderStats = async (token) => {
        try {
            const response = await axios.get('http://localhost:5000/api/orders', {
                headers: { 'x-access-token': token }
            })
            
            if (response.data.status === 'ok') {
                const orders = response.data.orders || []
                setOrderStats({
                    total: orders.length,
                    pending: orders.filter(o => o.status === 'pending').length,
                    completed: orders.filter(o => o.status === 'completed').length
                })
            }
        } catch (error) {
            console.error('Error fetching orders:', error)
        }
    }

    const handleInputChange = (e) => {
        setFormData({
            ...formData,
            [e.target.name]: e.target.value
        })
    }

    const handleSave = async () => {
        try {
            const token = localStorage.getItem('token')
            const response = await axios.patch(
                'http://localhost:5000/api/user/profile',
                formData,
                { headers: { 'x-access-token': token } }
            )

            if (response.data.status === 'ok') {
                setUser({ ...user, ...formData })
                setIsEditing(false)
                showToast('success', '', 'Cập nhật thông tin thành công!')
            }
        } catch (error) {
            showToast('error', '', error.response?.data?.message || 'Không thể cập nhật thông tin')
        }
    }

    const handleCancel = () => {
        setFormData({
            name: user.name || '',
            email: user.email || '',
            phone: user.phone || '',
            address: user.address || ''
        })
        setIsEditing(false)
    }

    if (loading) {
        return (
            <div className="profile-loading">
                <div className="spinner-large"></div>
                <p>Đang tải...</p>
            </div>
        )
    }

    return (
        <div className="profile-container">
            <div className="profile-wrapper">
                {/* Profile Header */}
                <div className="profile-header">
                    <div className="profile-avatar-section">
                        <div className="profile-avatar-xl">
                            {user?.name?.charAt(0).toUpperCase() || 'U'}
                        </div>
                        <div className="profile-header-info">
                            <h2>{user?.name || 'Người dùng'}</h2>
                            <p className="profile-join-date">
                                Tham gia: {new Date(user?.createdAt).toLocaleDateString('vi-VN')}
                            </p>
                        </div>
                    </div>
                    {!isEditing && (
                        <button className="edit-profile-btn" onClick={() => setIsEditing(true)}>
                            <FaEdit /> Chỉnh sửa
                        </button>
                    )}
                </div>

                {/* Stats Cards */}
                <div className="profile-stats">
                    <div className="stat-card" onClick={() => navigate('/orders')}>
                        <FaBox className="stat-icon" />
                        <div className="stat-info">
                            <h3>{orderStats.total}</h3>
                            <p>Đơn hàng</p>
                        </div>
                    </div>
                    <div className="stat-card" onClick={() => navigate('/wishlist')}>
                        <FaHeart className="stat-icon heart" />
                        <div className="stat-info">
                            <h3>{user?.wishlist?.length || 0}</h3>
                            <p>Yêu thích</p>
                        </div>
                    </div>
                    <div className="stat-card" onClick={() => navigate('/cart')}>
                        <FaShoppingCart className="stat-icon cart" />
                        <div className="stat-info">
                            <h3>{user?.cart?.length || 0}</h3>
                            <p>Giỏ hàng</p>
                        </div>
                    </div>
                </div>

                {/* Profile Details */}
                <div className="profile-details">
                    <h3 className="section-title">Thông tin cá nhân</h3>
                    
                    <div className="profile-form">
                        <div className="form-group">
                            <label><FaUser /> Họ và tên</label>
                            {isEditing ? (
                                <input
                                    type="text"
                                    name="name"
                                    value={formData.name}
                                    onChange={handleInputChange}
                                    className="profile-input"
                                />
                            ) : (
                                <p className="profile-value">{user?.name || 'Chưa cập nhật'}</p>
                            )}
                        </div>

                        <div className="form-group">
                            <label><FaEnvelope /> Email</label>
                            <p className="profile-value">{user?.email}</p>
                            <small className="text-muted">Email không thể thay đổi</small>
                        </div>

                        <div className="form-group">
                            <label><FaPhone /> Số điện thoại</label>
                            {isEditing ? (
                                <input
                                    type="tel"
                                    name="phone"
                                    value={formData.phone}
                                    onChange={handleInputChange}
                                    className="profile-input"
                                    placeholder="Nhập số điện thoại"
                                />
                            ) : (
                                <p className="profile-value">{user?.phone || 'Chưa cập nhật'}</p>
                            )}
                        </div>

                        <div className="form-group">
                            <label><FaMapMarkerAlt /> Địa chỉ</label>
                            {isEditing ? (
                                <textarea
                                    name="address"
                                    value={formData.address}
                                    onChange={handleInputChange}
                                    className="profile-input"
                                    rows="3"
                                    placeholder="Nhập địa chỉ"
                                />
                            ) : (
                                <p className="profile-value">{user?.address || 'Chưa cập nhật'}</p>
                            )}
                        </div>

                        {isEditing && (
                            <div className="form-actions">
                                <button className="save-btn" onClick={handleSave}>
                                    <FaSave /> Lưu thay đổi
                                </button>
                                <button className="cancel-btn" onClick={handleCancel}>
                                    <FaTimes /> Hủy
                                </button>
                            </div>
                        )}
                    </div>
                </div>

                {/* Order History Preview */}
                <div className="profile-orders-preview">
                    <div className="section-header">
                        <h3 className="section-title">Đơn hàng gần đây</h3>
                        <button className="view-all-btn" onClick={() => navigate('/orders')}>
                            Xem tất cả →
                        </button>
                    </div>
                    <div className="order-stats-row">
                        <div className="order-stat-item">
                            <span className="stat-label">Đang xử lý</span>
                            <span className="stat-number pending">{orderStats.pending}</span>
                        </div>
                        <div className="order-stat-item">
                            <span className="stat-label">Hoàn thành</span>
                            <span className="stat-number completed">{orderStats.completed}</span>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    )
}

export { Profile }
