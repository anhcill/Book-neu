import React, { useState, useEffect } from 'react'
import axios from 'axios'
import './OrderTracking.css'
import { useToast } from '../../index'

const OrderTracking = () => {
  const [order, setOrder] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [showCancelModal, setShowCancelModal] = useState(false)
  const [cancellationReason, setCancellationReason] = useState('')
  const [cancelling, setCancelling] = useState(false)
  const { showToast } = useToast()
  const orderId = new URLSearchParams(window.location.search).get('id')

  useEffect(() => {
    if (!orderId) {
      setError('Không tìm thấy ID đơn hàng')
      setLoading(false)
      return
    }

    const fetchOrder = async () => {
      try {
        const token = localStorage.getItem('token')
        const response = await axios.get(`http://localhost:5000/api/orders/${orderId}`, {
          headers: { 'x-access-token': token }
        })
        setOrder(response.data.order)
        setLoading(false)
      } catch (err) {
        setError(err.response?.data?.message || 'Lỗi khi tải đơn hàng')
        setLoading(false)
      }
    }

    fetchOrder()
  }, [orderId])

  const getStatusColor = (status) => {
    switch (status) {
      case 'pending': return '#FFA500'
      case 'confirmed': return '#4CAF50'
      case 'shipping': return '#2196F3'
      case 'delivered': return '#4CAF50'
      case 'cancelled': return '#F44336'
      default: return '#999'
    }
  }

  const getStatusLabel = (status) => {
    const labels = {
      pending: 'Chờ xác nhận',
      confirmed: 'Đã xác nhận',
      shipping: 'Đang giao',
      delivered: 'Đã giao',
      cancelled: 'Đã hủy'
    }
    return labels[status] || status
  }

  const isCompleted = (status, currentStatus) => {
    const order_map = ['pending', 'confirmed', 'shipping', 'delivered']
    return order_map.indexOf(status) <= order_map.indexOf(currentStatus)
  }

  const handleCancelOrder = async () => {
    if (!cancellationReason.trim()) {
      showToast('error', '', 'Vui lòng nhập lý do hủy đơn')
      return
    }

    setCancelling(true)
    try {
      const token = localStorage.getItem('token')
      const response = await axios.patch(`http://localhost:5000/api/orders/${orderId}/cancel`, {
        reason: cancellationReason
      }, {
        headers: { 'x-access-token': token }
      })

      setOrder(response.data.order)
      setShowCancelModal(false)
      setCancellationReason('')
      showToast('success', '', 'Hủy đơn hàng thành công')
    } catch (err) {
      showToast('error', '', err.response?.data?.message || 'Lỗi khi hủy đơn hàng')
    } finally {
      setCancelling(false)
    }
  }

  // Prevent scroll when modal is open
  React.useEffect(() => {
    if (showCancelModal) {
      document.body.style.overflow = 'hidden'
    } else {
      document.body.style.overflow = 'auto'
    }
    return () => {
      document.body.style.overflow = 'auto'
    }
  }, [showCancelModal])

  if (loading) return <div className="tracking-container"><p>Đang tải...</p></div>
  if (error) return <div className="tracking-container"><p className="error">{error}</p></div>
  if (!order) return <div className="tracking-container"><p>Không tìm thấy đơn hàng</p></div>

  return (
    <div className="tracking-container">
      <div className="tracking-card">
        <h1>📦 Theo dõi đơn hàng #{order.id}</h1>
        <p className="order-date">Ngày đặt: {new Date(order.orderDate).toLocaleDateString('vi-VN')}</p>

        {/* Timeline */}
        <div className="tracking-timeline">
          {['pending', 'confirmed', 'shipping', 'delivered'].map((status, index) => (
            <div key={status} className="timeline-item">
              <div className={`timeline-dot ${isCompleted(status, order.status) ? 'completed' : ''}`}
                   style={{ borderColor: getStatusColor(status) }}>
                {isCompleted(status, order.status) && '✓'}
              </div>
              <div className="timeline-content">
                <h3>{getStatusLabel(status)}</h3>
                <p className="timeline-date">
                  {status === 'pending' && order.orderDate && new Date(order.orderDate).toLocaleDateString('vi-VN')}
                  {status === 'confirmed' && order.confirmedDate && new Date(order.confirmedDate).toLocaleDateString('vi-VN')}
                  {status === 'shipping' && order.shippingDate && new Date(order.shippingDate).toLocaleDateString('vi-VN')}
                  {status === 'delivered' && order.deliveredDate && new Date(order.deliveredDate).toLocaleDateString('vi-VN')}
                </p>
              </div>
              {index < 3 && <div className={`timeline-line ${isCompleted(status, order.status) ? 'completed' : ''}`}></div>}
            </div>
          ))}
        </div>

        {/* Order Details */}
        <div className="order-details">
          <h2>Chi tiết đơn hàng</h2>
          <p><strong>Trạng thái:</strong> <span style={{ color: getStatusColor(order.status) }}>{getStatusLabel(order.status)}</span></p>
          <p><strong>Tổng tiền:</strong> {order.totalAmount.toLocaleString('vi-VN')} đ</p>
          <p><strong>Phương thức thanh toán:</strong> {order.paymentMethod}</p>
          <p><strong>Địa chỉ giao:</strong> {order.shippingAddress}</p>
          {order.cancellationReason && (
            <p><strong>Lý do hủy:</strong> {order.cancellationReason}</p>
          )}
        </div>

        {/* Cancel Button */}
        {['pending', 'confirmed'].includes(order.status) && (
          <div className="cancel-button-container">
            <button className="cancel-btn" onClick={() => setShowCancelModal(true)}>
              ❌ Hủy đơn hàng
            </button>
          </div>
        )}

        {/* Cancel Modal */}
        {showCancelModal && (
          <div className="modal-overlay" onClick={() => setShowCancelModal(false)}>
            <div className="modal-content" onClick={(e) => e.stopPropagation()}>
              <h2>Hủy đơn hàng</h2>
              <p>Vui lòng cho chúng tôi biết lý do bạn muốn hủy đơn hàng này:</p>
              
              <div className="reason-options">
                {[
                  'Tôi muốn thay đổi địa chỉ giao',
                  'Tôi muốn thay đổi số lượng sản phẩm',
                  'Giá quá cao',
                  'Tôi tìm thấy sản phẩm ở nơi khác rẻ hơn',
                  'Tôi không còn cần sản phẩm này',
                  'Khác'
                ].map((option) => (
                  <button
                    key={option}
                    className={`reason-btn ${cancellationReason === option ? 'selected' : ''}`}
                    onClick={() => setCancellationReason(option)}
                  >
                    {option}
                  </button>
                ))}
              </div>

              <textarea
                className="custom-reason"
                placeholder="Nếu chọn 'Khác', vui lòng nhập lý do của bạn..."
                value={cancellationReason === 'Khác' ? '' : cancellationReason}
                onChange={(e) => setCancellationReason(e.target.value)}
                style={{ display: cancellationReason === 'Khác' ? 'block' : 'none' }}
              />

              <div className="modal-actions">
                <button className="btn-cancel" onClick={() => setShowCancelModal(false)}>
                  Huỷ
                </button>
                <button 
                  className="btn-confirm" 
                  onClick={handleCancelOrder}
                  disabled={!cancellationReason.trim() || cancelling}
                >
                  {cancelling ? 'Đang xử lý...' : 'Xác nhận hủy'}
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Items */}
        <div className="order-items">
          <h2>Sản phẩm</h2>
          {order.orderItems && order.orderItems.map(item => (
            <div key={item.id} className="item-row">
              <img src={item.Product?.imageUrl} alt={item.Product?.title} />
              <div className="item-info">
                <p className="item-title">{item.Product?.title}</p>
                <p className="item-author">Tác giả: {item.Product?.author}</p>
              </div>
              <p className="item-qty">Số lượng: {item.quantity}</p>
              <p className="item-price">{item.price.toLocaleString('vi-VN')} đ</p>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}

export default OrderTracking
