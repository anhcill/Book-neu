import React, { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import axios from 'axios'
import { FaPlus, FaEdit, FaTrash, FaToggleOn, FaToggleOff, FaTicketAlt } from 'react-icons/fa'
import './CouponManager.css'

function CouponManager() {
    const navigate = useNavigate()
    const [coupons, setCoupons] = useState([])
    const [loading, setLoading] = useState(true)
    const [showForm, setShowForm] = useState(false)
    const [editingCoupon, setEditingCoupon] = useState(null)
    const [formData, setFormData] = useState({
        code: '',
        description: '',
        discountType: 'percentage',
        discountValue: '',
        minOrderValue: '',
        maxDiscount: '',
        usageLimit: '',
        startDate: '',
        endDate: '',
        applicableCategories: []
    })

    const categories = ['Viễn tưởng', 'Kinh dị', 'Công nghệ', 'Triết học', 'Lãng mạn', 'Manga']

    useEffect(() => {
        fetchCoupons()
    }, [])

    const fetchCoupons = async () => {
        try {
            const token = localStorage.getItem('token')
            const response = await axios.get('http://localhost:5000/api/coupons', {
                headers: { 'x-access-token': token }
            })
            setCoupons(response.data.coupons)
            setLoading(false)
        } catch (error) {
            console.error('Error fetching coupons:', error)
            setLoading(false)
        }
    }

    const handleSubmit = async (e) => {
        e.preventDefault()
        const token = localStorage.getItem('token')

        try {
            if (editingCoupon) {
                await axios.put(
                    `http://localhost:5000/api/coupons/${editingCoupon.id}`,
                    formData,
                    { headers: { 'x-access-token': token } }
                )
                alert('Cập nhật mã giảm giá thành công!')
            } else {
                await axios.post('http://localhost:5000/api/coupons', formData, {
                    headers: { 'x-access-token': token }
                })
                alert('Tạo mã giảm giá thành công!')
            }
            resetForm()
            fetchCoupons()
        } catch (error) {
            alert(error.response?.data?.message || 'Lỗi khi lưu mã giảm giá')
        }
    }

    const handleEdit = (coupon) => {
        setEditingCoupon(coupon)
        setFormData({
            code: coupon.code,
            description: coupon.description,
            discountType: coupon.discountType,
            discountValue: coupon.discountValue,
            minOrderValue: coupon.minOrderValue,
            maxDiscount: coupon.maxDiscount || '',
            usageLimit: coupon.usageLimit || '',
            startDate: coupon.startDate.split('T')[0],
            endDate: coupon.endDate.split('T')[0],
            applicableCategories: coupon.applicableCategories || []
        })
        setShowForm(true)
    }

    const handleDelete = async (id) => {
        if (!window.confirm('Bạn có chắc muốn xóa mã giảm giá này?')) return

        try {
            const token = localStorage.getItem('token')
            await axios.delete(`http://localhost:5000/api/coupons/${id}`, {
                headers: { 'x-access-token': token }
            })
            alert('Đã xóa mã giảm giá')
            fetchCoupons()
        } catch (error) {
            alert('Lỗi khi xóa mã giảm giá')
        }
    }

    const handleToggleStatus = async (id) => {
        try {
            const token = localStorage.getItem('token')
            await axios.patch(`http://localhost:5000/api/coupons/${id}/toggle`, {}, {
                headers: { 'x-access-token': token }
            })
            fetchCoupons()
        } catch (error) {
            alert('Lỗi khi cập nhật trạng thái')
        }
    }

    const resetForm = () => {
        setFormData({
            code: '',
            description: '',
            discountType: 'percentage',
            discountValue: '',
            minOrderValue: '',
            maxDiscount: '',
            usageLimit: '',
            startDate: '',
            endDate: '',
            applicableCategories: []
        })
        setEditingCoupon(null)
        setShowForm(false)
    }

    const formatCurrency = (amount) => {
        return new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(amount)
    }

    if (loading) {
        return <div className="loading">Đang tải...</div>
    }

    return (
        <div className="coupon-manager-container">
            <div className="manager-header">
                <button className="btn-back" onClick={() => navigate('/admin')}>
                    ← Quay lại
                </button>
                <h1><FaTicketAlt /> Quản Lý Mã Giảm Giá</h1>
                <button className="btn-add" onClick={() => setShowForm(!showForm)}>
                    <FaPlus /> Tạo mã mới
                </button>
            </div>

            {showForm && (
                <div className="coupon-form-container">
                    <h2>{editingCoupon ? 'Chỉnh Sửa Mã Giảm Giá' : 'Tạo Mã Giảm Giá Mới'}</h2>
                    <form onSubmit={handleSubmit}>
                        <div className="form-grid">
                            <div className="form-group">
                                <label>Mã giảm giá *</label>
                                <input
                                    type="text"
                                    value={formData.code}
                                    onChange={(e) => setFormData({ ...formData, code: e.target.value.toUpperCase() })}
                                    required
                                    disabled={!!editingCoupon}
                                />
                            </div>

                            <div className="form-group">
                                <label>Mô tả</label>
                                <input
                                    type="text"
                                    value={formData.description}
                                    onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                                />
                            </div>

                            <div className="form-group">
                                <label>Loại giảm giá *</label>
                                <select
                                    value={formData.discountType}
                                    onChange={(e) => setFormData({ ...formData, discountType: e.target.value })}
                                >
                                    <option value="percentage">Phần trăm (%)</option>
                                    <option value="fixed">Số tiền cố định (VNĐ)</option>
                                </select>
                            </div>

                            <div className="form-group">
                                <label>Giá trị giảm *</label>
                                <input
                                    type="number"
                                    value={formData.discountValue}
                                    onChange={(e) => setFormData({ ...formData, discountValue: e.target.value })}
                                    required
                                    min="0"
                                />
                            </div>

                            <div className="form-group">
                                <label>Đơn hàng tối thiểu (VNĐ)</label>
                                <input
                                    type="number"
                                    value={formData.minOrderValue}
                                    onChange={(e) => setFormData({ ...formData, minOrderValue: e.target.value })}
                                    min="0"
                                />
                            </div>

                            <div className="form-group">
                                <label>Giảm tối đa (VNĐ)</label>
                                <input
                                    type="number"
                                    value={formData.maxDiscount}
                                    onChange={(e) => setFormData({ ...formData, maxDiscount: e.target.value })}
                                    min="0"
                                />
                            </div>

                            <div className="form-group">
                                <label>Giới hạn sử dụng</label>
                                <input
                                    type="number"
                                    value={formData.usageLimit}
                                    onChange={(e) => setFormData({ ...formData, usageLimit: e.target.value })}
                                    min="0"
                                />
                            </div>

                            <div className="form-group">
                                <label>Ngày bắt đầu *</label>
                                <input
                                    type="date"
                                    value={formData.startDate}
                                    onChange={(e) => setFormData({ ...formData, startDate: e.target.value })}
                                    required
                                />
                            </div>

                            <div className="form-group">
                                <label>Ngày kết thúc *</label>
                                <input
                                    type="date"
                                    value={formData.endDate}
                                    onChange={(e) => setFormData({ ...formData, endDate: e.target.value })}
                                    required
                                />
                            </div>
                        </div>

                        <div className="form-group">
                            <label>Áp dụng cho danh mục (để trống = tất cả)</label>
                            <div className="category-checkboxes">
                                {categories.map(cat => (
                                    <label key={cat} className="checkbox-label">
                                        <input
                                            type="checkbox"
                                            checked={formData.applicableCategories.includes(cat)}
                                            onChange={(e) => {
                                                if (e.target.checked) {
                                                    setFormData({
                                                        ...formData,
                                                        applicableCategories: [...formData.applicableCategories, cat]
                                                    })
                                                } else {
                                                    setFormData({
                                                        ...formData,
                                                        applicableCategories: formData.applicableCategories.filter(c => c !== cat)
                                                    })
                                                }
                                            }}
                                        />
                                        {cat}
                                    </label>
                                ))}
                            </div>
                        </div>

                        <div className="form-actions">
                            <button type="button" className="btn-cancel" onClick={resetForm}>
                                Hủy
                            </button>
                            <button type="submit" className="btn-save">
                                {editingCoupon ? 'Cập nhật' : 'Tạo mã'}
                            </button>
                        </div>
                    </form>
                </div>
            )}

            <div className="coupons-table">
                <table>
                    <thead>
                        <tr>
                            <th>Mã</th>
                            <th>Mô tả</th>
                            <th>Loại</th>
                            <th>Giá trị</th>
                            <th>Sử dụng</th>
                            <th>Thời hạn</th>
                            <th>Trạng thái</th>
                            <th>Hành động</th>
                        </tr>
                    </thead>
                    <tbody>
                        {coupons.map(coupon => {
                            const now = new Date()
                            const isExpired = new Date(coupon.endDate) < now
                            const isNotStarted = new Date(coupon.startDate) > now

                            return (
                                <tr key={coupon.id}>
                                    <td><strong>{coupon.code}</strong></td>
                                    <td>{coupon.description}</td>
                                    <td>
                                        {coupon.discountType === 'percentage'
                                            ? `${coupon.discountValue}%`
                                            : formatCurrency(coupon.discountValue)
                                        }
                                    </td>
                                    <td>
                                        {coupon.minOrderValue > 0 && (
                                            <div>Tối thiểu: {formatCurrency(coupon.minOrderValue)}</div>
                                        )}
                                        {coupon.maxDiscount && (
                                            <div>Tối đa: {formatCurrency(coupon.maxDiscount)}</div>
                                        )}
                                    </td>
                                    <td>
                                        {coupon.usedCount} / {coupon.usageLimit || '∞'}
                                    </td>
                                    <td>
                                        <div>{new Date(coupon.startDate).toLocaleDateString('vi-VN')}</div>
                                        <div>{new Date(coupon.endDate).toLocaleDateString('vi-VN')}</div>
                                        {isExpired && <span className="badge expired">Hết hạn</span>}
                                        {isNotStarted && <span className="badge not-started">Chưa bắt đầu</span>}
                                    </td>
                                    <td>
                                        <button
                                            className={`btn-toggle ${coupon.isActive ? 'active' : 'inactive'}`}
                                            onClick={() => handleToggleStatus(coupon.id)}
                                        >
                                            {coupon.isActive ? <FaToggleOn /> : <FaToggleOff />}
                                            {coupon.isActive ? 'Hoạt động' : 'Tắt'}
                                        </button>
                                    </td>
                                    <td>
                                        <div className="action-buttons">
                                            <button
                                                className="btn-edit"
                                                onClick={() => handleEdit(coupon)}
                                            >
                                                <FaEdit />
                                            </button>
                                            <button
                                                className="btn-delete"
                                                onClick={() => handleDelete(coupon.id)}
                                            >
                                                <FaTrash />
                                            </button>
                                        </div>
                                    </td>
                                </tr>
                            )
                        })}
                    </tbody>
                </table>
            </div>
        </div>
    )
}

export default CouponManager
