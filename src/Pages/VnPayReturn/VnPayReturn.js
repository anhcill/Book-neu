import React, { useEffect, useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { useUserLogin } from '../../Context/user-login-context';
import { useToast } from '../../Context/toast-context';
import { useTranslation } from 'react-i18next';
import './VnPayReturn.css';

const VnPayReturn = () => {
  const [status, setStatus] = useState('processing'); // processing, success, failed
  const [paymentInfo, setPaymentInfo] = useState(null);
  const location = useLocation();
  const navigate = useNavigate();
  const { userToken } = useUserLogin();
  const { showToast } = useToast();
  const { t } = useTranslation();

  useEffect(() => {
    const urlParams = new URLSearchParams(location.search);
    const vnp_ResponseCode = urlParams.get('vnp_ResponseCode');
    const vnp_TransactionStatus = urlParams.get('vnp_TransactionStatus');
    const vnp_Amount = urlParams.get('vnp_Amount');
    const vnp_OrderInfo = urlParams.get('vnp_OrderInfo');
    const vnp_TxnRef = urlParams.get('vnp_TxnRef');
    const vnp_BankCode = urlParams.get('vnp_BankCode');

    // Log thông tin để debug
    console.log('VNPay Return Parameters:', {
      vnp_ResponseCode,
      vnp_TransactionStatus, 
      vnp_Amount,
      vnp_OrderInfo,
      vnp_TxnRef,
      vnp_BankCode
    });

    const info = {
      responseCode: vnp_ResponseCode,
      transactionStatus: vnp_TransactionStatus,
      amount: vnp_Amount ? parseInt(vnp_Amount) / 100 : 0, // VNPay trả về amount * 100
      orderInfo: vnp_OrderInfo,
      transactionRef: vnp_TxnRef,
      bankCode: vnp_BankCode
    };
    
    setPaymentInfo(info);

    // Kiểm tra kết quả thanh toán
    if (vnp_ResponseCode === '00' && vnp_TransactionStatus === '00') {
      setStatus('success');
      
      // Xác nhận thanh toán với backend
      if (userToken && vnp_TxnRef) {
        confirmPayment(vnp_TxnRef, info);
      } else {
        // Redirect sau 3 giây nếu không có token
        setTimeout(() => {
          navigate('/orders', { replace: true });
        }, 3000);
      }
    } else {
      setStatus('failed');
      
      // Hiển thị thông báo lỗi
      const errorMessage = getErrorMessage(vnp_ResponseCode);
      showToast('error', t('paymentFailed') || 'Thanh toán thất bại', errorMessage);

      // Redirect về trang orders sau 5 giây
      setTimeout(() => {
        navigate('/orders', { replace: true });
      }, 5000);
    }
  }, [location.search, userToken, navigate, showToast, t]);

  const confirmPayment = async (txnRef, info) => {
    try {
      const response = await fetch(`http://localhost:5000/api/payment/vnpay-return${location.search}`, {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${userToken}`,
          'Content-Type': 'application/json'
        }
      });

      const data = await response.json();
      
      if (response.ok && data.success) {
        console.log('Xác nhận thanh toán thành công:', data);
        showToast('success', t('paymentSuccessful') || 'Thanh toán thành công!', 'Đơn hàng đã được xử lý thành công');
        
        // Redirect về trang orders sau 3 giây
        setTimeout(() => {
          navigate('/orders', { replace: true });
        }, 3000);
      } else {
        console.error('Lỗi xác nhận thanh toán:', data);
        setStatus('failed');
        showToast('error', t('paymentVerificationFailed') || 'Xác thực thất bại', data.message || 'Có lỗi xảy ra khi xác thực thanh toán');
        
        setTimeout(() => {
          navigate('/orders', { replace: true });
        }, 5000);
      }
    } catch (error) {
      console.error('Lỗi network khi xác nhận thanh toán:', error);
      setStatus('failed');
      showToast('error', t('networkError') || 'Lỗi kết nối', 'Không thể kết nối đến server');
      
      setTimeout(() => {
        navigate('/orders', { replace: true });
      }, 5000);
    }
  };

  const getErrorMessage = (responseCode) => {
    const errorCodes = {
      '01': 'Giao dịch chưa hoàn tất',
      '02': 'Giao dịch bị lỗi', 
      '04': 'Giao dịch đảo (Khách hàng đã bị trừ tiền tại Ngân hàng nhưng GD chưa thành công ở VNPAY)',
      '05': 'VNPAY đang xử lý giao dịch này (GD hoàn tiền)',
      '06': 'VNPAY đã gửi yêu cầu hoàn tiền sang Ngân hàng (GD hoàn tiền)',
      '07': 'Giao dịch bị nghi ngờ gian lận',
      '09': 'GD Hoàn trả bị từ chối',
      '10': 'Đã giao hàng',
      '11': 'Đã hủy',
      '12': 'Đã hoàn tiền',
      '13': 'Tạm giữ (Dành cho tích hợp với VNPAY-GTGT)',
      '99': 'Người dùng hủy giao dịch'
    };
    
    return errorCodes[responseCode] || 'Giao dịch thất bại';
  };

  return (
    <div className="vnpay-return-container">
      <div className="vnpay-return-content">
        {status === 'processing' && (
          <div className="payment-processing">
            <div className="loading-spinner"></div>
            <h2>{t('processingPayment') || 'Đang xử lý thanh toán...'}</h2>
            <p>{t('pleaseWait') || 'Vui lòng đợi trong giây lát'}</p>
          </div>
        )}

        {status === 'success' && paymentInfo && (
          <div className="payment-success">
            <div className="success-icon">✓</div>
            <h2>{t('paymentSuccessful') || 'Thanh toán thành công!'}</h2>
            <div className="payment-details">
              <p><strong>{t('amount') || 'Số tiền'}:</strong> {paymentInfo.amount?.toLocaleString('vi-VN')} VND</p>
              <p><strong>{t('transactionRef') || 'Mã giao dịch'}:</strong> {paymentInfo.transactionRef}</p>
              <p><strong>{t('bankCode') || 'Ngân hàng'}:</strong> {paymentInfo.bankCode}</p>
            </div>
            <p className="redirect-info">{t('redirectingToOrders') || 'Đang chuyển hướng đến trang đơn hàng...'}</p>
          </div>
        )}

        {status === 'failed' && paymentInfo && (
          <div className="payment-failed">
            <div className="error-icon">✗</div>
            <h2>{t('paymentFailed') || 'Thanh toán thất bại!'}</h2>
            <div className="error-details">
              <p><strong>{t('errorCode') || 'Mã lỗi'}:</strong> {paymentInfo.responseCode}</p>
              <p><strong>{t('reason') || 'Lý do'}:</strong> {getErrorMessage(paymentInfo.responseCode)}</p>
              {paymentInfo.transactionRef && (
                <p><strong>{t('transactionRef') || 'Mã giao dịch'}:</strong> {paymentInfo.transactionRef}</p>
              )}
            </div>
            <p className="redirect-info">{t('redirectingToOrders') || 'Đang chuyển hướng đến trang đơn hàng...'}</p>
          </div>
        )}

        <div className="manual-navigation">
          <button 
            className="btn-primary"
            onClick={() => navigate('/orders', { replace: true })}
          >
            {t('goToOrders') || 'Đến trang đơn hàng'}
          </button>
          <button 
            className="btn-secondary"
            onClick={() => navigate('/shop', { replace: true })}
          >
            {t('continueShopping') || 'Tiếp tục mua hàng'}
          </button>
        </div>
      </div>
    </div>
  );
};

export default VnPayReturn;
export { VnPayReturn };