import React, { useState, useEffect } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { AdminRoute } from '../../Components/AdminRoute'
import axios from 'axios'
import { useToast } from '../../index'
import './Admin.css'

function OrderManager() {
  const navigate = useNavigate()
  const { orderId } = useParams()
  const { showToast } = useToast()
  const isDetailPage = !!orderId
  const [orders, setOrders] = useState([])
  const [orderDetail, setOrderDetail] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [filterStatus, setFilterStatus] = useState('all')
  const [searchTerm, setSearchTerm] = useState('')
  const [currentPage, setCurrentPage] = useState(1)
  const [updatingStatus, setUpdatingStatus] = useState(false)
  const itemsPerPage = 10

  useEffect(() => {
    if (isDetailPage) {
      fetchOrderDetail()
    } else {
      fetchOrders()
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [orderId])

  const fetchOrders = async () => {
    try {
      setLoading(true)
      const token = localStorage.getItem('token')
      const res = await axios.get('http://localhost:5000/api/admin/orders', {
        headers: { 'x-access-token': token }
      })
      
      if (res.data.status === 'ok') {
        setOrders(res.data.orders)
      }
      setError(null)
    } catch (err) {
      console.error('Lỗi khi tải đơn hàng:', err)
      setError('Không thể tải danh sách đơn hàng')
    } finally {
      setLoading(false)
    }
  }

  const fetchOrderDetail = async () => {
    try {
      setLoading(true)
      const token = localStorage.getItem('token')
      const res = await axios.get(`http://localhost:5000/api/admin/orders/${orderId}`, {
        headers: { 'x-access-token': token }
      })
      
      if (res.data.status === 'ok') {
        setOrderDetail(res.data.order)
      }
      setError(null)
    } catch (err) {
      console.error('Lỗi khi tải chi tiết đơn hàng:', err)
      setError('Không thể tải thông tin đơn hàng')
    } finally {
      setLoading(false)
    }
  }

  const updateOrderStatus = async (newStatus) => {
    try {
      setUpdatingStatus(true)
      const token = localStorage.getItem('token')
      
      // Use specific endpoints that create notifications
      let endpoint = `http://localhost:5000/api/admin/orders/${orderId}`
      let method = 'put'
      
      if (newStatus === 'confirmed') {
        endpoint = `http://localhost:5000/api/admin/orders/${orderId}/confirm`
        method = 'patch'
      } else if (newStatus === 'shipped') {
        endpoint = `http://localhost:5000/api/admin/orders/${orderId}/shipping`
        method = 'patch'
      } else if (newStatus === 'delivered') {
        endpoint = `http://localhost:5000/api/admin/orders/${orderId}/delivered`
        method = 'patch'
      } else if (newStatus === 'cancelled') {
        endpoint = `http://localhost:5000/api/admin/orders/${orderId}/cancel`
        method = 'patch'
      }
      
      const res = method === 'patch' 
        ? await axios.patch(endpoint, {}, { headers: { 'x-access-token': token } })
        : await axios.put(endpoint, { status: newStatus }, { headers: { 'x-access-token': token } })

      if (res.data.status === 'ok') {
        // Backend returns 'shipping' but frontend expects 'shipped'
        const displayStatus = res.data.order?.status === 'shipping' ? 'shipped' : res.data.order?.status || newStatus
        setOrderDetail(prev => ({ ...prev, status: displayStatus }))
        showToast('success', '', 'Cập nhật trạng thái đơn hàng thành công')
      }
    } catch (err) {
      console.error('Lỗi khi cập nhật trạng thái:', err)
      showToast('error', '', 'Không thể cập nhật trạng thái đơn hàng')
    } finally {
      setUpdatingStatus(false)
    }
  }

  // === ORDER LIST PAGE ===
  if (!isDetailPage) {
    let filteredOrders = orders.filter(order => {
      const matchSearch = order.orderId.includes(searchTerm) || 
                          order.customerName?.toLowerCase().includes(searchTerm.toLowerCase())
      const matchStatus = filterStatus === 'all' || order.status === filterStatus
      return matchSearch && matchStatus
    })

    const totalPages = Math.ceil(filteredOrders.length / itemsPerPage)
    const startIdx = (currentPage - 1) * itemsPerPage
    const paginatedOrders = filteredOrders.slice(startIdx, startIdx + itemsPerPage)

    if (loading) {
      return (
        <div className="admin-page-container">
          <div className="loader">
            <div className="spinner"></div>
            <p>Đang tải đơn hàng...</p>
          </div>
        </div>
      )
    }

    return (
      <AdminRoute>
        <div className="admin-page-container">
          {/* === HEADER === */}
          <div className="admin-header">
            <h1 className="admin-title">📦 QUẢN LÝ ĐƠN HÀNG</h1>
          </div>

          {/* === ERROR MESSAGE === */}
          {error && (
            <div className="admin-error-banner">
              <span>{error}</span>
              <button onClick={fetchOrders} className="admin-retry-btn">Thử lại</button>
            </div>
          )}

          {/* === FILTERS === */}
          <div className="admin-filters-section">
            <div className="filter-group">
              <input 
                type="text"
                placeholder="🔍 Tìm kiếm mã đơn hàng, khách hàng..."
                className="filter-input"
                value={searchTerm}
                onChange={(e) => {
                  setSearchTerm(e.target.value)
                  setCurrentPage(1)
                }}
              />
            </div>

            <div className="filter-group">
              <label>Trạng Thái:</label>
              <select 
                className="filter-select"
                value={filterStatus}
                onChange={(e) => {
                  setFilterStatus(e.target.value)
                  setCurrentPage(1)
                }}
              >
                <option value="all">Tất cả</option>
                <option value="pending">Chờ Xác Nhận</option>
                <option value="confirmed">Đã Xác Nhận</option>
                <option value="shipped">Đang Giao</option>
                <option value="delivered">Đã Giao</option>
                <option value="cancelled">Đã Huỷ</option>
              </select>
            </div>
          </div>

          {/* === ORDERS TABLE === */}
          {paginatedOrders.length > 0 ? (
            <>
              <div className="admin-table-container">
                <table className="admin-table">
                  <thead>
                    <tr>
                      <th>Mã Đơn Hàng</th>
                      <th>Khách Hàng</th>
                      <th>Tổng Tiền</th>
                      <th>Trạng Thái</th>
                      <th>Phương Thức Thanh Toán</th>
                      <th>Ngày Đặt</th>
                      <th>Hành Động</th>
                    </tr>
                  </thead>
                  <tbody>
                    {paginatedOrders.map((order) => (
                      <tr key={order.id} className="table-row">
                        <td className="table-id">{order.orderId}</td>
                        <td>{order.customerName}</td>
                        <td className="table-amount">{order.totalAmount?.toLocaleString('vi-VN')}đ</td>
                        <td>
                          <span className={`status-badge status-${order.status}`}>
                            {order.status}
                          </span>
                        </td>
                        <td>{order.paymentMethod}</td>
                        <td>{new Date(order.createdAt).toLocaleDateString('vi-VN')}</td>
                        <td>
                          <button 
                            className="table-action-btn view-btn"
                            onClick={() => navigate(`/admin/orders/${order.id}`)}
                          >
                            📋 Chi Tiết
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
                  Trang {currentPage} / {totalPages} (Tổng: {filteredOrders.length} đơn hàng)
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
              <p>📭 Không tìm thấy đơn hàng nào</p>
            </div>
          )}
        </div>
      </AdminRoute>
    )
  }

  // === ORDER DETAIL PAGE ===
  if (loading) {
    return (
      <div className="admin-page-container">
        <div className="loader">
          <div className="spinner"></div>
          <p>Đang tải chi tiết đơn hàng...</p>
        </div>
      </div>
    )
  }

  if (!orderDetail) {
    return (
      <AdminRoute>
        <div className="admin-page-container">
          <div className="admin-header">
            <h1 className="admin-title">📦 CHI TIẾT ĐƠN HÀNG</h1>
            <button 
              className="admin-secondary-btn"
              onClick={() => navigate('/admin/orders')}
            >
              ← Quay Lại
            </button>
          </div>
          <div className="empty-state">
            <p>❌ Không tìm thấy đơn hàng</p>
          </div>
        </div>
      </AdminRoute>
    )
  }

  return (
    <AdminRoute>
      <div className="admin-page-container">
        {/* === HEADER === */}
        <div className="admin-header">
          <div>
            <h1 className="admin-title">📦 CHI TIẾT ĐƠN HÀNG</h1>
            <p className="order-id">Mã: {orderDetail.orderId}</p>
          </div>
          <button 
            className="admin-secondary-btn"
            onClick={() => navigate('/admin/orders')}
          >
            ← Quay Lại Danh Sách
          </button>
        </div>

        {/* === ERROR MESSAGE === */}
        {error && (
          <div className="admin-error-banner">
            <span>{error}</span>
            <button onClick={fetchOrderDetail} className="admin-retry-btn">Thử lại</button>
          </div>
        )}

        <div className="order-detail-grid">
          {/* === LEFT: ORDER INFO === */}
          <div className="order-detail-section">
            <h2 className="section-title">ℹ️ THÔNG TIN ĐƠN HÀNG</h2>
            
            <div className="info-box">
              <div className="info-row">
                <span className="info-label">Khách Hàng:</span>
                <span className="info-value">{orderDetail.customerName}</span>
              </div>
              <div className="info-row">
                <span className="info-label">Email:</span>
                <span className="info-value">{orderDetail.customerEmail}</span>
              </div>
              <div className="info-row">
                <span className="info-label">Điện Thoại:</span>
                <span className="info-value">{orderDetail.customerPhone}</span>
              </div>
              <div className="info-row">
                <span className="info-label">Địa Chỉ Giao Hàng:</span>
                <span className="info-value">{orderDetail.shippingAddress}</span>
              </div>
              <div className="info-row">
                <span className="info-label">Ngày Đặt:</span>
                <span className="info-value">{new Date(orderDetail.createdAt).toLocaleDateString('vi-VN')}</span>
              </div>
              <div className="info-row">
                <span className="info-label">Phương Thức Thanh Toán:</span>
                <span className="info-value">{orderDetail.paymentMethod}</span>
              </div>
            </div>

            {/* === STATUS UPDATE === */}
            <div className="status-update-box">
              <h3>🔄 Cập Nhật Trạng Thái</h3>
              <div className="status-buttons">
                {['pending', 'confirmed', 'shipped', 'delivered', 'cancelled'].map(status => (
                  <button
                    key={status}
                    className={`status-btn ${orderDetail.status === status ? 'active' : ''}`}
                    onClick={() => updateOrderStatus(status)}
                    disabled={updatingStatus || orderDetail.status === status}
                  >
                    {status === 'pending' && '⏳'}
                    {status === 'confirmed' && '✅'}
                    {status === 'shipped' && '🚚'}
                    {status === 'delivered' && '📦'}
                    {status === 'cancelled' && '❌'}
                    {' '}
                    {status.charAt(0).toUpperCase() + status.slice(1)}
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* === RIGHT: ORDER ITEMS & SUMMARY === */}
          <div className="order-detail-section">
            <h2 className="section-title">📚 SẢN PHẨM ĐÃ ĐẶT</h2>
            
            <div className="order-items">
              {orderDetail.items && orderDetail.items.length > 0 ? (
                orderDetail.items.map((item, idx) => (
                  <div key={idx} className="order-item-card">
                    <img src={item.bookImage} alt={item.bookName} className="item-image" />
                    <div className="item-info">
                      <h4>{item.bookName}</h4>
                      <p className="item-author">{item.author}</p>
                      <div className="item-pricing">
                        <span className="item-quantity">x{item.quantity}</span>
                        <span className="item-price">{item.price?.toLocaleString('vi-VN')}đ</span>
                      </div>
                    </div>
                  </div>
                ))
              ) : (
                <p className="empty-items">Chưa có sản phẩm</p>
              )}
            </div>

            {/* === ORDER SUMMARY === */}
            <div className="order-summary">
              <h2 className="section-title">💰 TỔNG HỢP ĐƠN HÀNG</h2>
              <div className="summary-row">
                <span>Tạm Tính:</span>
                <span>{orderDetail.subtotal?.toLocaleString('vi-VN')}đ</span>
              </div>
              <div className="summary-row">
                <span>Phí Vận Chuyển:</span>
                <span>{orderDetail.shippingFee?.toLocaleString('vi-VN')}đ</span>
              </div>
              {orderDetail.discount && (
                <div className="summary-row discount">
                  <span>Giảm Giá:</span>
                  <span>-{orderDetail.discount?.toLocaleString('vi-VN')}đ</span>
                </div>
              )}
              <div className="summary-row total">
                <span>Tổng Cộng:</span>
                <span>{orderDetail.totalAmount?.toLocaleString('vi-VN')}đ</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </AdminRoute>
  )
}

export default OrderManager
