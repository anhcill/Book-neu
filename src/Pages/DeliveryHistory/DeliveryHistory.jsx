import React, { useState, useEffect } from 'react'
import axios from 'axios'
import { useNavigate } from 'react-router-dom'
import './DeliveryHistory.css'

const DeliveryHistory = () => {
  const [orders, setOrders] = useState([])
  const [loading, setLoading] = useState(true)
  const navigate = useNavigate()

  useEffect(() => {
    const fetchOrders = async () => {
      try {
        const token = localStorage.getItem('token')
        const response = await axios.get('http://localhost:5000/api/orders', {
          headers: { 'x-access-token': token }
        })
        // Filter only delivered orders - response is array directly
        const allOrders = Array.isArray(response.data) ? response.data : response.data.orders || []
        const deliveredOrders = allOrders.filter(order => order.status === 'delivered')
        setOrders(deliveredOrders)
      } catch (error) {
        console.error('Lỗi khi tải lịch sử:', error)
      } finally {
        setLoading(false)
      }
    }

    fetchOrders()
  }, [])

  const handleTrackOrder = (orderId) => {
    navigate(`/order-tracking?id=${orderId}`)
  }

  if (loading) return <div className="history-container"><p>Đang tải...</p></div>

  return (
    <div className="history-container">
      <h1>📦 Lịch sử giao hàng thành công</h1>
      
      {orders.length === 0 ? (
        <div className="empty-state">
          <p>Bạn chưa có đơn hàng nào giao thành công</p>
        </div>
      ) : (
        <div className="history-grid">
          {orders.map(order => (
            <div key={order.id} className="history-card">
              <div className="card-header">
                <h3>Đơn hàng #{order.id}</h3>
                <span className="badge-delivered">✓ Đã giao</span>
              </div>
              
              <div className="card-body">
                <p><strong>Ngày giao:</strong> {new Date(order.deliveredDate).toLocaleDateString('vi-VN')}</p>
                <p><strong>Tổng tiền:</strong> <span className="price">{order.totalAmount.toLocaleString('vi-VN')} đ</span></p>
                <p><strong>Số sản phẩm:</strong> {order.orderItems?.length || 0}</p>
              </div>

              <div className="card-items">
                {order.orderItems && order.orderItems.slice(0, 2).map(item => (
                  <div key={item.id} className="mini-item">
                    <img src={item.Product?.imageUrl} alt={item.Product?.title} />
                    <div>
                      <p className="mini-title">{item.Product?.title}</p>
                      <p className="mini-qty">x{item.quantity}</p>
                    </div>
                  </div>
                ))}
                {order.orderItems?.length > 2 && (
                  <p className="more-items">+{order.orderItems.length - 2} sản phẩm khác</p>
                )}
              </div>

              <button className="track-btn" onClick={() => handleTrackOrder(order.id)}>
                Xem chi tiết →
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}

export default DeliveryHistory
