import React, { useEffect, useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import axios from 'axios';
import { useToast, useCart, useOrders } from '../../index';
import { useTranslation } from 'react-i18next';
import Lottie from 'react-lottie';
import LoadingLottie from "../../Assets/Lottie/loading-0.json";

function VnPayReturn() {
    const { t } = useTranslation();
    const [message, setMessage] = useState(t('Đang xác thực thanh toán...'));
    const location = useLocation();
    const navigate = useNavigate();
    const { showToast } = useToast();
    const { dispatchUserCart } = useCart();
    const { getOrders } = useOrders(); // Lấy hàm getOrders

    const loadingObj = {
        loop: true,
        autoplay: true,
        animationData: LoadingLottie,
        rendererSettings: {
          preserveAspectRatio: 'xMidYMid slice'
        }
    };

    useEffect(() => {
        const verifyPayment = async () => {
            const token = localStorage.getItem('token');
            if (!token) {
                showToast("error", "", t("Phiên đăng nhập hết hạn, vui lòng thử lại."));
                navigate('/login');
                return;
            }

            console.log('=== DEBUG FRONTEND ===');
            console.log('Raw search:', location.search);
            console.log('Full URL:', window.location.href);

            // Kiểm tra nếu không có params (có thể là lỗi VNPay)
            if (!location.search) {
                showToast("error", "", t("Không nhận được thông tin thanh toán từ VNPay"));
                setMessage(t("Lỗi thanh toán. Đang chuyển hướng về giỏ hàng..."));
                setTimeout(() => navigate('/cart'), 3000);
                return;
            }

            try {
                // Thêm timeout cho request
                const controller = new AbortController();
                const timeoutId = setTimeout(() => controller.abort(), 10000); // 10 seconds timeout

                // Gửi GET request với query params từ VNPay (VNPay redirect với GET)
                const verificationResponse = await axios.get(
                    `http://localhost:5000/api/payment/vnpay-return${location.search}`,
                    {
                        headers: { 'x-access-token': token },
                        signal: controller.signal
                    }
                );

                clearTimeout(timeoutId);

                if (verificationResponse.data.status === "ok") {
                    showToast("success", "", t("Thanh toán thành công!"));
                    setMessage(t("Thanh toán thành công! Đang chuyển hướng..."));
                    
                    // Xóa giỏ hàng
                    dispatchUserCart({ type: "UPDATE_USER_CART", payload: [] });

                    // Kiểm tra lại token trước khi navigate
                    setTimeout(() => {
                        const currentToken = localStorage.getItem('token');
                        if (currentToken) {
                            navigate('/orders');
                        } else {
                            showToast("error", "", t("Phiên đăng nhập hết hạn, vui lòng đăng nhập lại."));
                            navigate('/login');
                        }
                    }, 2000);
                } else {
                    const errorMsg = verificationResponse.data.message || t("Thanh toán thất bại.");
                    showToast("error", "", errorMsg);
                    setMessage(t("Thanh toán thất bại. Đang chuyển hướng về giỏ hàng..."));
                    setTimeout(() => {
                        navigate('/cart');
                    }, 3000);
                }
            } catch (error) {
                let errorMessage;
                
                if (error.name === 'AbortError') {
                    errorMessage = t("Timeout khi xác thực thanh toán. Vui lòng thử lại.");
                } else if (error.response?.status === 400) {
                    errorMessage = error.response.data?.message || t("Dữ liệu thanh toán không hợp lệ.");
                } else if (error.response?.status === 500) {
                    errorMessage = t("Lỗi server. Vui lòng liên hệ hỗ trợ.");
                } else {
                    errorMessage = error.response?.data?.message || t("Lỗi xác thực. Vui lòng liên hệ hỗ trợ.");
                }
                
                console.error('VNPay verification error:', error);
                showToast("error", "", errorMessage);
                setMessage(t("Lỗi xác thực. Đang chuyển hướng về giỏ hàng..."));
                setTimeout(() => {
                    navigate('/cart');
                }, 3000);
            }
        };

        verifyPayment();
    // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [location, navigate]);

    return (
        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', minHeight: '80vh' }}>
            <Lottie options={loadingObj}
                height={150}
                width={150}
            />
            <h2>{message}</h2>
        </div>
    );
}

export { VnPayReturn };