import React from 'react';
import { useTranslation } from 'react-i18next';
import './VNPayErrorHandler.css';

function VNPayErrorHandler({ error, onRetry, onCancel }) {
    const { t } = useTranslation();

    const getErrorMessage = (error) => {
        if (error.includes('timer is not defined')) {
            return {
                title: 'Lỗi JavaScript trên trang VNPay',
                description: 'Đây là lỗi từ phía VNPay sandbox, không ảnh hưởng đến giao dịch của bạn.',
                suggestion: 'Bạn có thể tiếp tục thanh toán hoặc thử lại sau.'
            };
        }
        if (error.includes('jQuery')) {
            return {
                title: 'Lỗi thư viện JavaScript',
                description: 'VNPay sandbox đang gặp vấn đề kỹ thuật nhỏ.',
                suggestion: 'Giao dịch vẫn có thể hoàn tất bình thường.'
            };
        }
        return {
            title: 'Lỗi không xác định',
            description: 'Đã xảy ra lỗi trong quá trình xử lý.',
            suggestion: 'Vui lòng thử lại hoặc liên hệ hỗ trợ.'
        };
    };

    const errorInfo = getErrorMessage(error);

    return (
        <div className="vnpay-error-handler">
            <div className="error-container">
                <div className="error-icon">⚠️</div>
                <h2>{errorInfo.title}</h2>
                <p className="error-description">{errorInfo.description}</p>
                <p className="error-suggestion">{errorInfo.suggestion}</p>
                
                <div className="error-actions">
                    <button className="btn-retry" onClick={onRetry}>
                        Thử lại
                    </button>
                    <button className="btn-cancel" onClick={onCancel}>
                        Quay về giỏ hàng
                    </button>
                </div>
                
                <details className="error-details">
                    <summary>Chi tiết lỗi (dành cho developer)</summary>
                    <pre>{error}</pre>
                </details>
            </div>
        </div>
    );
}

export default VNPayErrorHandler;