import React, { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { AdminRoute } from '../../Components/AdminRoute'
import { useUserLogin } from '../../index'
import axios from 'axios'
import './Admin.css'

function AdminDashboard() {
  const navigate = useNavigate()
  const { userInfo, setUserLoggedIn } = useUserLogin()
  const [dashboardStats, setDashboardStats] = useState({
    totalUsers: 0,
    totalProducts: 0,
    totalOrders: 0,
    totalRevenue: 0
  })
  const [recentOrders, setRecentOrders] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  useEffect(() => {
    fetchDashboardData()
  }, [])

  const fetchDashboardData = async () => {
    try {
      setLoading(true)
      const token = localStorage.getItem('token')
      
      // Fetch stats
      const statsRes = await axios.get('http://localhost:5000/api/admin/orders/stats', {
        headers: { 'x-access-token': token }
      })
      
      if (statsRes.data.status === 'ok') {
        setDashboardStats(statsRes.data.stats)
      }

      // Fetch recent orders
      const ordersRes = await axios.get('http://localhost:5000/api/admin/orders/recent', {
        headers: { 'x-access-token': token }
      })
      
      if (ordersRes.data.status === 'ok') {
        setRecentOrders(ordersRes.data.orders.slice(0, 5))
      }

      setError(null)
    } catch (err) {
      console.error('Lỗi khi tải dữ liệu dashboard:', err)
      setError('Không thể tải dữ liệu dashboard. Vui lòng thử lại.')
    } finally {
      setLoading(false)
    }
  }

  const handleLogout = () => {
    localStorage.removeItem('token')
    localStorage.removeItem('userRole')
    localStorage.removeItem('userInfo')
    setUserLoggedIn(false)
    navigate('/login')
  }

  if (loading) {
    return (
      <div className="admin-page-container">
        <div className="loader">
          <div className="spinner"></div>
          <p>Đang tải dữ liệu...</p>
        </div>
      </div>
    )
  }

  return (
    <AdminRoute>
      <div className="admin-page-container">
        {/* === HEADER === */}
        <div className="admin-header">
          <div className="admin-header-left">
            <h1 className="admin-title">📊 BẢNG ĐIỀU KHIỂN QUẢN TRỊ</h1>
            <p className="admin-subtitle">Chào mừng, {userInfo?.username || 'Quản trị viên'}</p>
          </div>
          <button className="admin-logout-btn" onClick={handleLogout}>
            Đăng xuất
          </button>
        </div>

        {/* === ERROR MESSAGE === */}
        {error && (
          <div className="admin-error-banner">
            <span>⚠️ {error}</span>
            <button onClick={fetchDashboardData} className="admin-retry-btn">Thử lại</button>
          </div>
        )}

        {/* === STATS GRID === */}
        <div className="admin-stats-grid">
          <div className="stat-card stat-users">
            <div className="stat-icon">👥</div>
            <div className="stat-content">
              <h3>Tổng Người Dùng</h3>
              <p className="stat-number">{dashboardStats.totalUsers}</p>
            </div>
          </div>

          <div className="stat-card stat-products">
            <div className="stat-icon">📚</div>
            <div className="stat-content">
              <h3>Tổng Sản Phẩm</h3>
              <p className="stat-number">{dashboardStats.totalProducts}</p>
            </div>
          </div>

          <div className="stat-card stat-orders">
            <div className="stat-icon">📦</div>
            <div className="stat-content">
              <h3>Tổng Đơn Hàng</h3>
              <p className="stat-number">{dashboardStats.totalOrders}</p>
            </div>
          </div>

          <div className="stat-card stat-revenue">
            <div className="stat-icon">💰</div>
            <div className="stat-content">
              <h3>Tổng Doanh Thu</h3>
              <p className="stat-number">{dashboardStats.totalRevenue?.toLocaleString('vi-VN')}đ</p>
            </div>
          </div>
        </div>

        {/* === QUICK ACTIONS === */}
        <div className="admin-actions-section">
          <h2 className="section-title">🚀 HÀNH ĐỘNG NHANH</h2>
          <div className="admin-actions-grid">
            <button 
              className="action-btn action-products"
              onClick={() => navigate('/admin/products')}
            >
              <span className="action-icon">📚</span>
              <span>Quản Lý Sản Phẩm</span>
            </button>
            <button 
              className="action-btn action-orders"
              onClick={() => navigate('/admin/orders')}
            >
              <span className="action-icon">📦</span>
              <span>Quản Lý Đơn Hàng</span>
            </button>
            <button 
              className="action-btn action-users"
              onClick={() => navigate('/admin/users')}
            >
              <span className="action-icon">👥</span>
              <span>Quản Lý Người Dùng</span>
            </button>
            <button 
              className="action-btn action-analytics"
              onClick={() => navigate('/admin/analytics')}
            >
              <span className="action-icon">📈</span>
              <span>Thống Kê & Phân Tích</span>
            </button>
            <button 
              className="action-btn action-coupons"
              onClick={() => navigate('/admin/coupons')}
            >
              <span className="action-icon">🎫</span>
              <span>Mã Giảm Giá</span>
            </button>
            <button 
              className="action-btn action-inventory"
              onClick={() => navigate('/admin/inventory')}
            >
              <span className="action-icon">📦</span>
              <span>Quản Lý Tồn Kho</span>
            </button>
          </div>
        </div>

        {/* === RECENT ORDERS TABLE === */}
        <div className="admin-recent-section">
          <h2 className="section-title">📋 ĐƠN HÀNG GẦN ĐÂY</h2>
          {recentOrders.length > 0 ? (
            <div className="admin-table-container">
              <table className="admin-table">
                <thead>
                  <tr>
                    <th>Mã Đơn Hàng</th>
                    <th>Khách Hàng</th>
                    <th>Tổng Tiền</th>
                    <th>Trạng Thái</th>
                    <th>Ngày Đặt</th>
                    <th>Hành Động</th>
                  </tr>
                </thead>
                <tbody>
                  {recentOrders.map((order) => (
                    <tr key={order.id} className="table-row">
                      <td className="table-id">{order.orderId}</td>
                      <td>{order.customerName}</td>
                      <td className="table-amount">{order.totalAmount?.toLocaleString('vi-VN')}đ</td>
                      <td>
                        <span className={`status-badge status-${order.status}`}>
                          {order.status}
                        </span>
                      </td>
                      <td>{new Date(order.createdAt).toLocaleDateString('vi-VN')}</td>
                      <td>
                        <button 
                          className="table-action-btn view-btn"
                          onClick={() => navigate(`/admin/orders/${order.id}`)}
                        >
                          Xem Chi Tiết
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ) : (
            <div className="empty-state">
              <p>📭 Chưa có đơn hàng nào</p>
            </div>
          )}
        </div>
      </div>
    </AdminRoute>
  )
}

export default AdminDashboard
