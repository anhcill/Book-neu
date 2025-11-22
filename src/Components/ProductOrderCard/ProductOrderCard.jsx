import "./ProductOrderCard.css";
import { useTranslation } from 'react-i18next';
import { useState } from 'react';
import axios from 'axios';
import { useToast } from '../../index';

// Helper để định dạng ngày
const formatDate = (dateString) => {
    const options = { year: 'numeric', month: 'long', day: 'numeric', hour: '2-digit', minute: '2-digit' };
    return new Date(dateString).toLocaleDateString('vi-VN', options);
};

// Helper để định dạng tiền tệ
const formatCurrency = (number) => {
    return new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(number);
};

function ProductOrderCard({ orderDetails }) {
    const { t } = useTranslation();
    const { showToast } = useToast();
    const [showCancelModal, setShowCancelModal] = useState(false);
    const [cancellationReason, setCancellationReason] = useState('');
    const [cancelling, setCancelling] = useState(false);

    const {
        id,
        status,
        totalAmount,
        paymentMethod,
        createdAt,
        orderItems,
        shippingAddress
    } = orderDetails;

    // Parse địa chỉ giao hàng
    let address = {};
    try {
        address = JSON.parse(shippingAddress);
    } catch (e) {
        console.error("Lỗi parse địa chỉ:", e)
    }

    const getStatusClass = (status) => {
        switch (status) {
            case 'delivered':
            case 'completed':
            case 'processing':
                return 'status-success';
            case 'pending':
            case 'confirmed':
            case 'shipping':
                return 'status-pending';
            case 'failed':
            case 'cancelled':
                return 'status-danger';
            default:
                return '';
        }
    };

    const getStatusLabel = (status) => {
        const labels = {
            'pending': 'Chờ xác nhận',
            'confirmed': 'Đã xác nhận',
            'shipping': 'Đang giao',
            'delivered': 'Đã giao',
            'cancelled': 'Đã hủy',
            'completed': 'Hoàn thành',
            'processing': 'Đang xử lý',
            'failed': 'Thất bại'
        };
        return labels[status] || status;
    };

    const handleCancelOrder = async () => {
        if (!cancellationReason.trim()) {
            showToast('error', '', 'Vui lòng nhập lý do hủy đơn');
            return;
        }

        setCancelling(true);
        try {
            const token = localStorage.getItem('token');
            await axios.patch(`http://localhost:5000/api/orders/${id}/cancel`, {
                reason: cancellationReason
            }, {
                headers: { 'x-access-token': token }
            });

            setShowCancelModal(false);
            setCancellationReason('');
            showToast('success', '', 'Hủy đơn hàng thành công');
            // Reload orders
            window.location.reload();
        } catch (err) {
            showToast('error', '', err.response?.data?.message || 'Lỗi khi hủy đơn hàng');
        } finally {
            setCancelling(false);
        }
    };

    return (
        <div className="order-card">
            <div className="order-header">
                <div>
                    <h4 className="order-id">{t('Đơn hàng')}: #{id}</h4>
                    <p className="order-date">{t('Ngày đặt')}: {formatDate(createdAt)}</p>
                </div>
                <div className="order-status-container">
                    <span className={`order-status ${getStatusClass(status)}`}>{getStatusLabel(status)}</span>
                </div>
            </div>

            <div className="order-body">
                {orderItems && orderItems.map(item => (
                    <div key={item.id} className="order-item-card">
                        <img className="order-item-book-img" src={item.Product.imageUrl} alt={item.Product.title} />
                        <div className="order-item-details">
                            <p className="item-title">{item.Product.title}</p>
                            <p className="item-author">{t('Số lượng')}: {item.quantity}</p>
                            <p className="item-price">{t('Giá')}: {formatCurrency(item.price)}</p>
                        </div>
                    </div>
                ))}
            </div>

            <div className="order-footer">
                <div className="order-shipping-info">
                    <h5>{t('Thông tin giao hàng')}</h5>
                    <p><strong>{t('Người nhận')}:</strong> {address.name}</p>
                    <p><strong>{t('SĐT')}:</strong> {address.phone}</p>
                    <p><strong>{t('Địa chỉ')}:</strong> {address.address}</p>
                </div>
                <div className="order-summary">
                    <p><strong>{t('Phương thức')}:</strong> {paymentMethod}</p>
                    <h4 className="order-total">{t('Tổng cộng')}: {formatCurrency(totalAmount)}</h4>
                </div>
            </div>

            {/* Cancel Button */}
            {['pending', 'confirmed'].includes(status) && (
                <div className="order-actions">
                    <button 
                        className="cancel-order-btn"
                        onClick={() => setShowCancelModal(true)}
                    >
                        ❌ {t('Hủy đơn hàng')}
                    </button>
                </div>
            )}

            {/* Cancel Modal */}
            {showCancelModal && (
                <div className="modal-overlay" onClick={() => setShowCancelModal(false)}>
                    <div className="modal-content" onClick={(e) => e.stopPropagation()}>
                        <h2>{t('Hủy đơn hàng')}</h2>
                        <p>{t('Vui lòng cho chúng tôi biết lý do bạn muốn hủy đơn hàng này')}:</p>
                        
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
                            <button 
                                className="btn-cancel" 
                                onClick={() => setShowCancelModal(false)}
                            >
                                {t('Huỷ')}
                            </button>
                            <button 
                                className="btn-confirm" 
                                onClick={handleCancelOrder}
                                disabled={!cancellationReason.trim() || cancelling}
                            >
                                {cancelling ? 'Đang xử lý...' : t('Xác nhận hủy')}
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}

export { ProductOrderCard };