import React, { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { AdminRoute } from '../../Components/AdminRoute'
import axios from 'axios'
import { useToast } from '../../index'
import './Admin.css'

function ProductManager() {
  const navigate = useNavigate()
  const { showToast } = useToast()
  const [products, setProducts] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [searchTerm, setSearchTerm] = useState('')
  const [filterCategory, setFilterCategory] = useState('all')
  const [sortBy, setSortBy] = useState('newest')
  const [currentPage, setCurrentPage] = useState(1)
  const itemsPerPage = 10

  useEffect(() => {
    fetchProducts()
  }, [])

  const fetchProducts = async () => {
    try {
      setLoading(true)
      const token = localStorage.getItem('token')
      const res = await axios.get('http://localhost:5000/api/admin/products', {
        headers: { 'x-access-token': token }
      })
      
      if (res.data.status === 'ok') {
        setProducts(res.data.products)
      }
      setError(null)
    } catch (err) {
      console.error('Lỗi khi tải sản phẩm:', err)
      setError('Không thể tải danh sách sản phẩm')
    } finally {
      setLoading(false)
    }
  }

  const deleteProduct = async (productId) => {
    if (!window.confirm('Bạn chắc chắn muốn xoá sản phẩm này?')) return

    try {
      const token = localStorage.getItem('token')
      const res = await axios.delete(`http://localhost:5000/api/admin/products/${productId}`, {
        headers: { 'x-access-token': token }
      })

      if (res.data.status === 'ok') {
        setProducts(products.filter(p => p.id !== productId))
        showToast('success', '', 'Xoá sản phẩm thành công')
      }
    } catch (err) {
      console.error('Lỗi khi xoá sản phẩm:', err)
      showToast('error', '', 'Không thể xoá sản phẩm')
    }
  }

  // Filter & Search Logic
  let filteredProducts = products.filter(product => {
    const matchSearch = product.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                        product.author.toLowerCase().includes(searchTerm.toLowerCase())
    const matchCategory = filterCategory === 'all' || product.category === filterCategory
    return matchSearch && matchCategory
  })

  // Sort Logic
  if (sortBy === 'newest') {
    filteredProducts.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt))
  } else if (sortBy === 'price-low') {
    filteredProducts.sort((a, b) => a.discountedPrice - b.discountedPrice)
  } else if (sortBy === 'price-high') {
    filteredProducts.sort((a, b) => b.discountedPrice - a.discountedPrice)
  } else if (sortBy === 'name') {
    filteredProducts.sort((a, b) => a.title.localeCompare(b.title))
  }

  const totalPages = Math.ceil(filteredProducts.length / itemsPerPage)
  const startIdx = (currentPage - 1) * itemsPerPage
  const paginatedProducts = filteredProducts.slice(startIdx, startIdx + itemsPerPage)

  const categories = [...new Set(products.map(p => p.category))]

  if (loading) {
    return (
      <div className="admin-page-container">
        <div className="loader">
          <div className="spinner"></div>
          <p>Đang tải sản phẩm...</p>
        </div>
      </div>
    )
  }

  return (
    <AdminRoute>
      <div className="admin-page-container">
        {/* === HEADER === */}
        <div className="admin-header">
          <h1 className="admin-title">📚 QUẢN LÝ SẢN PHẨM</h1>
          <button 
            className="admin-primary-btn"
            onClick={() => navigate('/admin/products/new')}
          >
            ➕ Thêm Sản Phẩm Mới
          </button>
        </div>

        {/* === ERROR MESSAGE === */}
        {error && (
          <div className="admin-error-banner">
            <span>{error}</span>
            <button onClick={fetchProducts} className="admin-retry-btn">Thử lại</button>
          </div>
        )}

        {/* === FILTERS & SEARCH === */}
        <div className="admin-filters-section">
          <div className="filter-group">
            <input 
              type="text"
              placeholder="🔍 Tìm kiếm sản phẩm, tác giả..."
              className="filter-input"
              value={searchTerm}
              onChange={(e) => {
                setSearchTerm(e.target.value)
                setCurrentPage(1)
              }}
            />
          </div>

          <div className="filter-group">
            <label>Thể loại:</label>
            <select 
              className="filter-select"
              value={filterCategory}
              onChange={(e) => {
                setFilterCategory(e.target.value)
                setCurrentPage(1)
              }}
            >
              <option value="all">Tất cả</option>
              {categories.map(cat => (
                <option key={cat} value={cat}>{cat}</option>
              ))}
            </select>
          </div>

          <div className="filter-group">
            <label>Sắp xếp:</label>
            <select 
              className="filter-select"
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value)}
            >
              <option value="newest">Mới nhất</option>
              <option value="name">Tên A-Z</option>
              <option value="price-low">Giá: Thấp → Cao</option>
              <option value="price-high">Giá: Cao → Thấp</option>
            </select>
          </div>
        </div>

        {/* === PRODUCTS TABLE === */}
        {paginatedProducts.length > 0 ? (
          <>
            <div className="admin-table-container">
              <table className="admin-table">
                <thead>
                  <tr>
                    <th>Hình Ảnh</th>
                    <th>Tên Sản Phẩm</th>
                    <th>Tác Giả</th>
                    <th>Thể Loại</th>
                    <th>Giá</th>
                    <th>Giảm Giá</th>
                    <th>Kho</th>
                    <th>Hành Động</th>
                  </tr>
                </thead>
                <tbody>
                  {paginatedProducts.map((product) => (
                    <tr key={product.id} className="table-row">
                      <td>
                        <img 
                          src={product.imageUrl} 
                          alt={product.title}
                          className="product-thumbnail"
                        />
                      </td>
                      <td className="table-bold">{product.title}</td>
                      <td>{product.author}</td>
                      <td><span className="category-badge">{product.category}</span></td>
                      <td className="table-amount">{product.discountedPrice?.toLocaleString('vi-VN')}đ</td>
                      <td>{product.discountPercent}%</td>
                      <td className="table-stock">{product.stock}</td>
                      <td className="table-actions">
                        <button 
                          className="table-action-btn edit-btn"
                          onClick={() => navigate(`/admin/products/${product.id}/edit`)}
                        >
                          ✏️ Sửa
                        </button>
                        <button 
                          className="table-action-btn delete-btn"
                          onClick={() => deleteProduct(product.id)}
                        >
                          🗑️ Xoá
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* === PAGINATION === */}
            <div className="pagination-container">
              <button 
                className="pagination-btn"
                onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
                disabled={currentPage === 1}
              >
                ← Trước
              </button>
              
              <div className="pagination-info">
                Trang {currentPage} / {totalPages} (Tổng: {filteredProducts.length} sản phẩm)
              </div>

              <button 
                className="pagination-btn"
                onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
                disabled={currentPage === totalPages}
              >
                Sau →
              </button>
            </div>
          </>
        ) : (
          <div className="empty-state">
            <p>📭 Không tìm thấy sản phẩm nào</p>
            <button 
              className="admin-primary-btn"
              onClick={() => navigate('/admin/products/new')}
            >
              ➕ Thêm Sản Phẩm Đầu Tiên
            </button>
          </div>
        )}
      </div>
    </AdminRoute>
  )
}

export default ProductManager
