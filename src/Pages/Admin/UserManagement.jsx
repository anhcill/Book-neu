import React, { useState, useEffect } from 'react'
import axios from 'axios'
import './UserManagement.css'
import { useToast } from '../../Context/toast-context'

const UserManagement = () => {
  const [users, setUsers] = useState([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState('')
  const [page, setPage] = useState(1)
  const [totalPages, setTotalPages] = useState(1)
  const [stats, setStats] = useState(null)
  const [selectedUser, setSelectedUser] = useState(null)
  const [showModal, setShowModal] = useState(false)
  const { showToast } = useToast()

  useEffect(() => {
    fetchUsers()
    fetchStats()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [page, search])

  const fetchUsers = async () => {
    try {
      setLoading(true)
      const token = localStorage.getItem('token')
      const response = await axios.get('http://localhost:5000/api/admin/users', {
        params: { search, page, limit: 10 },
        headers: { 'x-access-token': token }
      })
      setUsers(response.data.users || [])
      setTotalPages(response.data.pages || 1)
    } catch (error) {
      showToast('error', '', 'Lỗi khi tải danh sách users')
      console.error(error)
      setUsers([])
    } finally {
      setLoading(false)
    }
  }

  const fetchStats = async () => {
    try {
      const token = localStorage.getItem('token')
      const response = await axios.get('http://localhost:5000/api/admin/users/stats/overview', {
        headers: { 'x-access-token': token }
      })
      setStats(response.data.stats)
    } catch (error) {
      console.error('Lỗi khi tải stats:', error)
    }
  }

  const handleBanUser = async (userId) => {
    if (!window.confirm('Bạn chắc chắn muốn ban user này?')) return

    try {
      const token = localStorage.getItem('token')
      await axios.patch(`http://localhost:5000/api/admin/users/${userId}/ban`, {}, {
        headers: { 'x-access-token': token }
      })
      showToast('success', '', 'Đã ban user thành công')
      fetchUsers()
    } catch (error) {
      showToast('error', '', error.response?.data?.message || 'Lỗi khi ban user')
    }
  }

  const handleUnbanUser = async (userId) => {
    try {
      const token = localStorage.getItem('token')
      await axios.patch(`http://localhost:5000/api/admin/users/${userId}/unban`, {}, {
        headers: { 'x-access-token': token }
      })
      showToast('success', '', 'Đã unban user thành công')
      fetchUsers()
    } catch (error) {
      showToast('error', '', error.response?.data?.message || 'Lỗi khi unban user')
    }
  }

  const handleDeleteUser = async (userId) => {
    if (!window.confirm('Bạn chắc chắn muốn xóa user này? Không thể khôi phục!')) return

    try {
      const token = localStorage.getItem('token')
      await axios.delete(`http://localhost:5000/api/admin/users/${userId}`, {
        headers: { 'x-access-token': token }
      })
      showToast('success', '', 'Đã xóa user thành công')
      fetchUsers()
    } catch (error) {
      showToast('error', '', error.response?.data?.message || 'Lỗi khi xóa user')
    }
  }

  const handleViewUser = async (userId) => {
    try {
      const token = localStorage.getItem('token')
      const response = await axios.get(`http://localhost:5000/api/admin/users/${userId}`, {
        headers: { 'x-access-token': token }
      })
      setSelectedUser(response.data.user)
      setShowModal(true)
    } catch (error) {
      showToast('error', '', 'Lỗi khi tải chi tiết user')
    }
  }

  return (
    <div className="user-management-container">
      <h1>👥 Quản lý Người dùng</h1>

      {/* Stats Cards */}
      {stats && (
        <div className="stats-grid">
          <div className="stat-card">
            <h3>{stats.totalUsers}</h3>
            <p>Tổng Users</p>
          </div>
          <div className="stat-card active">
            <h3>{stats.activeUsers}</h3>
            <p>Users Hoạt động</p>
          </div>
          <div className="stat-card warning">
            <h3>{stats.bannedUsers}</h3>
            <p>Users Bị Ban</p>
          </div>
          <div className="stat-card">
            <h3>{stats.newUsersThisMonth}</h3>
            <p>Users Mới (Tháng này)</p>
          </div>
        </div>
      )}

      {/* Search */}
      <div className="search-bar">
        <input
          type="text"
          placeholder="Tìm kiếm theo tên hoặc email..."
          value={search}
          onChange={(e) => {
            setSearch(e.target.value)
            setPage(1)
          }}
        />
      </div>

      {/* Users Table */}
      {loading ? (
        <p className="loading">Đang tải...</p>
      ) : users.length === 0 ? (
        <p className="no-data">Không tìm thấy user nào</p>
      ) : (
        <>
          <div className="users-table-wrapper">
            <table className="users-table">
              <thead>
                <tr>
                  <th>ID</th>
                  <th>Tên đăng nhập</th>
                  <th>Email</th>
                  <th>Role</th>
                  <th>Trạng thái</th>
                  <th>Ngày tạo</th>
                  <th>Hành động</th>
                </tr>
              </thead>
              <tbody>
                {users.map(user => (
                  <tr key={user.id} className={user.isBanned ? 'banned' : ''}>
                    <td>#{user.id}</td>
                    <td className="username">{user.username}</td>
                    <td>{user.email}</td>
                    <td>
                      <span className={`role-badge ${user.role}`}>
                        {user.role === 'admin' ? '⚙️ Admin' : '👤 User'}
                      </span>
                    </td>
                    <td>
                      <span className={`status-badge ${user.isBanned ? 'banned' : 'active'}`}>
                        {user.isBanned ? '🚫 Bị Ban' : '✅ Hoạt động'}
                      </span>
                    </td>
                    <td className="date">{new Date(user.createdAt).toLocaleDateString('vi-VN')}</td>
                    <td className="actions">
                      <button 
                        className="btn-view"
                        onClick={() => handleViewUser(user.id)}
                        title="Xem chi tiết"
                      >
                        👁️
                      </button>
                      {user.isBanned ? (
                        <button
                          className="btn-unban"
                          onClick={() => handleUnbanUser(user.id)}
                          title="Unban"
                        >
                          ✅
                        </button>
                      ) : (
                        <button
                          className="btn-ban"
                          onClick={() => handleBanUser(user.id)}
                          title="Ban"
                        >
                          🚫
                        </button>
                      )}
                      <button
                        className="btn-delete"
                        onClick={() => handleDeleteUser(user.id)}
                        title="Xóa"
                      >
                        🗑️
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Pagination */}
          <div className="pagination">
            <button 
              disabled={page === 1}
              onClick={() => setPage(page - 1)}
            >
              ← Trước
            </button>
            <span>Trang {page} / {totalPages}</span>
            <button
              disabled={page === totalPages}
              onClick={() => setPage(page + 1)}
            >
              Tiếp →
            </button>
          </div>
        </>
      )}

      {/* User Detail Modal */}
      {showModal && selectedUser && (
        <div className="modal-overlay" onClick={() => setShowModal(false)}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h2>Chi tiết User</h2>
              <button className="btn-close" onClick={() => setShowModal(false)}>✕</button>
            </div>

            <div className="user-detail">
              <div className="detail-row">
                <span className="label">ID:</span>
                <span>{selectedUser.id}</span>
              </div>
              <div className="detail-row">
                <span className="label">Tên đăng nhập:</span>
                <span>{selectedUser.username}</span>
              </div>
              <div className="detail-row">
                <span className="label">Email:</span>
                <span>{selectedUser.email}</span>
              </div>
              <div className="detail-row">
                <span className="label">Role:</span>
                <span>{selectedUser.role}</span>
              </div>
              <div className="detail-row">
                <span className="label">Trạng thái:</span>
                <span className={selectedUser.isBanned ? 'text-danger' : 'text-success'}>
                  {selectedUser.isBanned ? '🚫 Bị Ban' : '✅ Hoạt động'}
                </span>
              </div>
              <div className="detail-row">
                <span className="label">Ngày tạo:</span>
                <span>{new Date(selectedUser.createdAt).toLocaleDateString('vi-VN')}</span>
              </div>
            </div>

            {/* Recent Orders */}
            {selectedUser.Orders && selectedUser.Orders.length > 0 && (
              <div className="recent-orders">
                <h3>Đơn hàng gần đây</h3>
                <table className="orders-mini-table">
                  <thead>
                    <tr>
                      <th>ID Đơn</th>
                      <th>Trạng thái</th>
                      <th>Tổng tiền</th>
                      <th>Ngày</th>
                    </tr>
                  </thead>
                  <tbody>
                    {selectedUser.Orders.map(order => (
                      <tr key={order.id}>
                        <td>#{order.id}</td>
                        <td>{order.status}</td>
                        <td>{order.totalAmount.toLocaleString('vi-VN')} đ</td>
                        <td>{new Date(order.createdAt).toLocaleDateString('vi-VN')}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}

            <div className="modal-actions">
              <button className="btn-cancel" onClick={() => setShowModal(false)}>Đóng</button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

export default UserManagement
