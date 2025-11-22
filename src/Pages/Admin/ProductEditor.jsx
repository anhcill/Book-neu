import React, { useState, useEffect } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { AdminRoute } from '../../Components/AdminRoute'
import axios from 'axios'
import { useToast } from '../../index'
import './Admin.css'

function ProductEditor() {
  const navigate = useNavigate()
  const { productId } = useParams()
  const { showToast } = useToast()
  const isNewProduct = !productId
  const [loading, setLoading] = useState(!isNewProduct)
  const [submitting, setSubmitting] = useState(false)
  
  const [formData, setFormData] = useState({
    title: '',
    author: '',
    description: '',
    category: '',
    originalPrice: '',
    discountedPrice: '',
    discountPercent: '',
    stock: '',
    imageUrl: '',
    imgAlt: '',
    isbn: '',
    publisher: '',
    publicationDate: ''
  })

  const [errors, setErrors] = useState({})

  const fetchProduct = async () => {
    try {
      setLoading(true)
      const token = localStorage.getItem('token')
      const res = await axios.get(`http://localhost:5000/api/admin/products/${productId}`, {
        headers: { 'x-access-token': token }
      })

      if (res.data.status === 'ok') {
        setFormData(res.data.product)
      }
    } catch (err) {
      console.error('Lỗi khi tải sản phẩm:', err)
      showToast('error', '', 'Không thể tải thông tin sản phẩm')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    if (!isNewProduct) {
      fetchProduct()
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [productId])

  const validateForm = () => {
    const newErrors = {}

    if (!formData.title.trim()) newErrors.title = 'Tên sản phẩm là bắt buộc'
    if (!formData.author.trim()) newErrors.author = 'Tác giả là bắt buộc'
    if (!formData.description.trim()) newErrors.description = 'Mô tả là bắt buộc'
    if (!formData.category.trim()) newErrors.category = 'Thể loại là bắt buộc'
    if (!formData.originalPrice) newErrors.originalPrice = 'Giá gốc là bắt buộc'
    if (!formData.discountedPrice) newErrors.discountedPrice = 'Giá khuyến mại là bắt buộc'
    if (!formData.stock) newErrors.stock = 'Số lượng kho là bắt buộc'
    if (!formData.imageUrl.trim()) newErrors.imageUrl = 'URL hình ảnh là bắt buộc'

    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const handleInputChange = (e) => {
    const { name, value } = e.target
    setFormData(prev => ({
      ...prev,
      [name]: value
    }))
    // Clear error for this field
    if (errors[name]) {
      setErrors(prev => {
        const newErrors = { ...prev }
        delete newErrors[name]
        return newErrors
      })
    }
  }

  const handleImagePreview = (e) => {
    const file = e.target.files?.[0]
    if (file) {
      const reader = new FileReader()
      reader.onload = (event) => {
        setFormData(prev => ({
          ...prev,
          imageUrl: event.target?.result
        }))
      }
      reader.readAsDataURL(file)
    }
  }

  const handleSubmit = async (e) => {
    e.preventDefault()

    if (!validateForm()) {
      showToast('error', '', 'Vui lòng điền đầy đủ các trường bắt buộc')
      return
    }

    try {
      setSubmitting(true)
      const token = localStorage.getItem('token')

      if (isNewProduct) {
        const res = await axios.post('http://localhost:5000/api/admin/products', formData, {
          headers: { 'x-access-token': token }
        })
        if (res.data.status === 'ok') {
          showToast('success', '', 'Thêm sản phẩm thành công')
          navigate('/admin/products')
        }
      } else {
        const res = await axios.put(`http://localhost:5000/api/admin/products/${productId}`, formData, {
          headers: { 'x-access-token': token }
        })
        if (res.data.status === 'ok') {
          showToast('success', '', 'Cập nhật sản phẩm thành công')
          navigate('/admin/products')
        }
      }
    } catch (err) {
      console.error('Lỗi khi lưu sản phẩm:', err)
      showToast('error', '', 'Không thể lưu sản phẩm')
    } finally {
      setSubmitting(false)
    }
  }

  if (loading) {
    return (
      <div className="admin-page-container">
        <div className="loader">
          <div className="spinner"></div>
          <p>Đang tải...</p>
        </div>
      </div>
    )
  }

  return (
    <AdminRoute>
      <div className="admin-page-container">
        {/* === HEADER === */}
        <div className="admin-header">
          <h1 className="admin-title">
            {isNewProduct ? '➕ THÊM SẢN PHẨM MỚI' : '✏️ CHỈNH SỬA SẢN PHẨM'}
          </h1>
        </div>

        {/* === FORM CONTAINER === */}
        <div className="editor-form-container">
          <form onSubmit={handleSubmit} className="editor-form">
            
            {/* === LEFT COLUMN: MAIN INFO === */}
            <div className="editor-column">
              <div className="form-section">
                <h2 className="form-section-title">📋 Thông Tin Cơ Bản</h2>

                <div className="form-group">
                  <label className="form-label">Tên Sản Phẩm *</label>
                  <input
                    type="text"
                    name="title"
                    value={formData.title}
                    onChange={handleInputChange}
                    placeholder="Nhập tên sản phẩm"
                    className={`form-input ${errors.title ? 'input-error' : ''}`}
                  />
                  {errors.title && <span className="error-text">{errors.title}</span>}
                </div>

                <div className="form-group">
                  <label className="form-label">Tác Giả *</label>
                  <input
                    type="text"
                    name="author"
                    value={formData.author}
                    onChange={handleInputChange}
                    placeholder="Nhập tên tác giả"
                    className={`form-input ${errors.author ? 'input-error' : ''}`}
                  />
                  {errors.author && <span className="error-text">{errors.author}</span>}
                </div>

                <div className="form-group">
                  <label className="form-label">Nhà Xuất Bản</label>
                  <input
                    type="text"
                    name="publisher"
                    value={formData.publisher}
                    onChange={handleInputChange}
                    placeholder="Nhập tên nhà xuất bản"
                    className="form-input"
                  />
                </div>

                <div className="form-group">
                  <label className="form-label">ISBN</label>
                  <input
                    type="text"
                    name="isbn"
                    value={formData.isbn}
                    onChange={handleInputChange}
                    placeholder="Nhập ISBN"
                    className="form-input"
                  />
                </div>

                <div className="form-group">
                  <label className="form-label">Ngày Xuất Bản</label>
                  <input
                    type="date"
                    name="publicationDate"
                    value={formData.publicationDate}
                    onChange={handleInputChange}
                    className="form-input"
                  />
                </div>

                <div className="form-group">
                  <label className="form-label">Thể Loại *</label>
                  <input
                    type="text"
                    name="category"
                    value={formData.category}
                    onChange={handleInputChange}
                    placeholder="Ví dụ: Tiểu thuyết, Khoa học, v.v."
                    className={`form-input ${errors.category ? 'input-error' : ''}`}
                  />
                  {errors.category && <span className="error-text">{errors.category}</span>}
                </div>

                <div className="form-group">
                  <label className="form-label">Mô Tả Chi Tiết *</label>
                  <textarea
                    name="description"
                    value={formData.description}
                    onChange={handleInputChange}
                    placeholder="Nhập mô tả sản phẩm"
                    className={`form-textarea ${errors.description ? 'input-error' : ''}`}
                    rows={5}
                  />
                  {errors.description && <span className="error-text">{errors.description}</span>}
                </div>
              </div>

              {/* === PRICING SECTION === */}
              <div className="form-section">
                <h2 className="form-section-title">💰 Giá Cả</h2>

                <div className="form-row">
                  <div className="form-group">
                    <label className="form-label">Giá Gốc (đ) *</label>
                    <input
                      type="number"
                      name="originalPrice"
                      value={formData.originalPrice}
                      onChange={handleInputChange}
                      placeholder="0"
                      className={`form-input ${errors.originalPrice ? 'input-error' : ''}`}
                    />
                    {errors.originalPrice && <span className="error-text">{errors.originalPrice}</span>}
                  </div>

                  <div className="form-group">
                    <label className="form-label">Giá Khuyến Mại (đ) *</label>
                    <input
                      type="number"
                      name="discountedPrice"
                      value={formData.discountedPrice}
                      onChange={handleInputChange}
                      placeholder="0"
                      className={`form-input ${errors.discountedPrice ? 'input-error' : ''}`}
                    />
                    {errors.discountedPrice && <span className="error-text">{errors.discountedPrice}</span>}
                  </div>

                  <div className="form-group">
                    <label className="form-label">% Giảm Giá</label>
                    <input
                      type="number"
                      name="discountPercent"
                      value={formData.discountPercent}
                      onChange={handleInputChange}
                      placeholder="0"
                      className="form-input"
                    />
                  </div>
                </div>
              </div>

              {/* === INVENTORY SECTION === */}
              <div className="form-section">
                <h2 className="form-section-title">📦 Kho Hàng</h2>

                <div className="form-group">
                  <label className="form-label">Số Lượng Trong Kho *</label>
                  <input
                    type="number"
                    name="stock"
                    value={formData.stock}
                    onChange={handleInputChange}
                    placeholder="0"
                    className={`form-input ${errors.stock ? 'input-error' : ''}`}
                  />
                  {errors.stock && <span className="error-text">{errors.stock}</span>}
                </div>
              </div>
            </div>

            {/* === RIGHT COLUMN: IMAGE === */}
            <div className="editor-column">
              <div className="form-section">
                <h2 className="form-section-title">🖼️ Hình Ảnh Sản Phẩm</h2>

                <div className="image-upload-area">
                  {formData.imageUrl ? (
                    <div className="image-preview-container">
                      <img 
                        src={formData.imageUrl} 
                        alt="Preview"
                        className="image-preview"
                      />
                      <button
                        type="button"
                        className="remove-image-btn"
                        onClick={() => setFormData(prev => ({ ...prev, imageUrl: '' }))}
                      >
                        Xoá Hình
                      </button>
                    </div>
                  ) : (
                    <div className="upload-placeholder">
                      <p>📸 Chưa có hình ảnh</p>
                      <label className="upload-label">
                        Chọn Hình
                        <input
                          type="file"
                          accept="image/*"
                          onChange={handleImagePreview}
                          style={{ display: 'none' }}
                        />
                      </label>
                    </div>
                  )}
                </div>

                <div className="form-group">
                  <label className="form-label">URL Hình Ảnh *</label>
                  <input
                    type="text"
                    name="imageUrl"
                    value={formData.imageUrl}
                    onChange={handleInputChange}
                    placeholder="https://example.com/image.jpg"
                    className={`form-input ${errors.imageUrl ? 'input-error' : ''}`}
                  />
                  {errors.imageUrl && <span className="error-text">{errors.imageUrl}</span>}
                </div>

                <div className="form-group">
                  <label className="form-label">Alt Text (Mô Tả Hình)</label>
                  <input
                    type="text"
                    name="imgAlt"
                    value={formData.imgAlt}
                    onChange={handleInputChange}
                    placeholder="Nhập mô tả hình ảnh cho SEO"
                    className="form-input"
                  />
                </div>
              </div>

              {/* === FORM ACTIONS === */}
              <div className="form-actions">
                <button 
                  type="submit"
                  className="btn-primary"
                  disabled={submitting}
                >
                  {submitting ? '⏳ Đang lưu...' : (isNewProduct ? '✅ Thêm Sản Phẩm' : '✅ Cập Nhật')}
                </button>
                <button 
                  type="button"
                  className="btn-secondary"
                  onClick={() => navigate('/admin/products')}
                  disabled={submitting}
                >
                  ❌ Hủy
                </button>
              </div>
            </div>
          </form>
        </div>
      </div>
    </AdminRoute>
  )
}

export default ProductEditor
