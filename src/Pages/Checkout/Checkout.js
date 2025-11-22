import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { useToast, useCart } from '../../index';
import { useTranslation } from 'react-i18next';
import { loadStripe } from '@stripe/stripe-js';
import { Elements, CardElement, useStripe, useElements } from '@stripe/react-stripe-js';
import './Checkout.css'; 

// Khởi tạo Stripe với publishable key và error handling
const stripePromise = loadStripe(
    process.env.REACT_APP_STRIPE_PUBLISHABLE_KEY || 'pk_test_51QRKqkP2xyJlD9KI1uZ9fYsXo4gYXPiOwZ3RsHNGYwTHlLjnSiIbPAqJWgxH0ywGwq6sEMDwI9BYt6K19h2R7EFB00gy7NQxnZ'
).catch((error) => {
    console.error('Stripe loading error:', error);
    return null; // Return null nếu load fail
});

// Component con xử lý Stripe form
function StripeCheckoutForm({ shippingAddress, onSuccess, onError }) {
    const stripe = useStripe();
    const elements = useElements();
    const [isProcessing, setIsProcessing] = useState(false);
    const { t } = useTranslation();

    const handleStripePayment = async (e) => {
        e.preventDefault();
        if (!stripe || !elements) return;

        setIsProcessing(true);
        const token = localStorage.getItem('token');

        try {
            // 1. Tạo order và lấy clientSecret từ backend
            const response = await axios.post(
                "http://localhost:5000/api/payment/create-order",
                {
                    paymentMethod: 'STRIPE',
                    shippingAddress,
                },
                { headers: { 'x-access-token': token } }
            );

            const { clientSecret, orderId } = response.data;

            // 2. Confirm payment với Stripe
            const { error, paymentIntent } = await stripe.confirmCardPayment(clientSecret, {
                payment_method: {
                    card: elements.getElement(CardElement),
                    billing_details: {
                        name: shippingAddress.name,
                        phone: shippingAddress.phone,
                    }
                }
            });

            if (error) {
                throw new Error(error.message);
            }

            if (paymentIntent.status === 'succeeded') {
                // 3. Xác nhận với backend
                await axios.post(
                    "http://localhost:5000/api/payment/stripe-confirm",
                    { paymentIntentId: paymentIntent.id },
                    { headers: { 'x-access-token': token } }
                );

                onSuccess(orderId);
            }
        } catch (error) {
            console.error('Stripe payment error:', error);
            onError(error.message || 'Lỗi thanh toán Stripe');
        } finally {
            setIsProcessing(false);
        }
    };

    return (
        <form onSubmit={handleStripePayment} className="stripe-form">
            <div className="card-element-container">
                <CardElement
                    options={{
                        style: {
                            base: {
                                fontSize: '16px',
                                color: '#424770',
                                '::placeholder': {
                                    color: '#aab7c4',
                                },
                            },
                            invalid: {
                                color: '#9e2146',
                            },
                        },
                    }}
                />
            </div>
            <button 
                type="submit" 
                className="checkout-submit-btn" 
                disabled={!stripe || isProcessing}
            >
                {isProcessing ? t('Đang xử lý...') : t('Thanh toán bằng Stripe')}
            </button>
        </form>
    );
}

function Checkout() {
    const { t } = useTranslation();
    const navigate = useNavigate();
    const { showToast } = useToast();
    const { userCart, dispatchUserCart } = useCart();
    const [stripeLoadError, setStripeLoadError] = useState(false);

    // Check Stripe loading status
    useEffect(() => {
        stripePromise.then((stripe) => {
            if (!stripe) {
                setStripeLoadError(true);
            }
        });
    }, []);

    // Try to obtain token from opener (if this tab was opened from another tab)
    useEffect(() => {
        try {
            const existingToken = localStorage.getItem('token')
            if (!existingToken && window.opener) {
                function handleParentMessage(e) {
                    try {
                        if (e.origin !== window.location.origin) return
                        if (e.data && e.data.type === 'TOKEN') {
                            const token = e.data.token
                            if (token) {
                                // Persist to sessionStorage so the app's storage shim will read it
                                sessionStorage.setItem('token', token)
                            }
                            window.removeEventListener('message', handleParentMessage)
                        }
                    } catch (err) {}
                }

                window.addEventListener('message', handleParentMessage)
                // Request token from opener
                try {
                    window.opener.postMessage({ type: 'REQUEST_TOKEN' }, window.location.origin)
                } catch (err) {
                    // ignore
                }
            }
        } catch (err) {}
    }, [])

    // State cho Form Địa chỉ
    const [shippingAddress, setShippingAddress] = useState({
        name: '',
        phone: '',
        address: ''
    });
    // State cho Phương thức Thanh toán
    const [paymentMethod, setPaymentMethod] = useState('COD'); // Mặc định là COD
    const [isLoading, setIsLoading] = useState(false);

    // Hàm cập nhật Form
    const handleAddressChange = (e) => {
        setShippingAddress({
            ...shippingAddress,
            [e.target.name]: e.target.value
        });
    };

    // Hàm XÁC NHẬN ĐẶT HÀNG (gọi API mới)
    const handlePlaceOrder = async (e) => {
        e.preventDefault();
        setIsLoading(true);
        const token = localStorage.getItem('token');

        if (!token) {
            showToast("warning","", "Vui lòng đăng nhập để đặt hàng.");
            navigate('/login');
            setIsLoading(false);
            return;
        }
        if (!shippingAddress.name || !shippingAddress.phone || !shippingAddress.address) {
            showToast("error","", "Vui lòng điền đầy đủ thông tin giao hàng.");
            setIsLoading(false);
            return;
        }

        try {
            // 2. Gọi API TẠO ĐƠN HÀNG
            const response = await axios.post(
                "http://localhost:5000/api/payment/create-order",
                {
                    paymentMethod,
                    shippingAddress,
                    // couponName: "" // (Bỏ qua coupon)
                },
                {
                    headers: { 'x-access-token': token }
                }
            );

            const data = response.data;

            // 3. Xử lý 2 trường hợp
            if (data.paymentMethod === 'COD') {
                // === XỬ LÝ COD ===
                showToast("success","", "Đặt hàng COD thành công!");
                // Xóa giỏ hàng ở local
                dispatchUserCart({type: "UPDATE_USER_CART", payload: []}); 
                // Chuyển đến trang Đơn hàng, trang này sẽ tự động tải dữ liệu mới
                navigate('/orders'); 
            
            } else if (data.paymentMethod === 'VNPAY' && data.payUrl) {
                // === XỬ LÝ VNPAY ===
                window.location.href = data.payUrl; // Chuyển hướng đến VNPay
            } else if (data.paymentMethod === 'STRIPE') {
                // === XỬ LÝ STRIPE ===
                // Không làm gì ở đây vì StripeCheckoutForm sẽ xử lý
            }

        } catch (error) {
            console.error("Lỗi khi đặt hàng:", error);
            showToast("error","", "Lỗi khi tạo đơn hàng. Vui lòng thử lại.");
            setIsLoading(false);
        }
    };

    // Handler khi Stripe thanh toán thành công
    const handleStripeSuccess = (orderId) => {
        showToast("success","", "Thanh toán Stripe thành công!");
        dispatchUserCart({type: "UPDATE_USER_CART", payload: []});
        navigate('/orders');
    };

    // Handler khi Stripe thanh toán thất bại
    const handleStripeError = (errorMessage) => {
        showToast("error","", errorMessage);
    };

    return (
        <div className="checkout-container">
            <div className="checkout-card">
                <h2 className="checkout-title">{t('Thông tin Thanh toán')}</h2>
                
                <form onSubmit={handlePlaceOrder}>
                    {/* === PHẦN 1: ĐỊA CHỈ GIAO HÀNG === */}
                    <fieldset className="checkout-fieldset">
                        <legend>{t('Địa chỉ Giao hàng')}</legend>
                        <div className="form-group">
                            <label htmlFor="name">{t('Họ và Tên')}</label>
                            <input
                                type="text"
                                id="name"
                                name="name"
                                value={shippingAddress.name}
                                onChange={handleAddressChange}
                                placeholder="Nguyễn Văn A"
                                required
                            />
                        </div>
                        <div className="form-group">
                            <label htmlFor="phone">{t('Số điện thoại')}</label>
                            <input
                                type="tel"
                                id="phone"
                                name="phone"
                                value={shippingAddress.phone}
                                onChange={handleAddressChange}
                                placeholder="09xxxxxxxx"
                                required
                            />
                        </div>
                        <div className="form-group">
                            <label htmlFor="address">{t('Địa chỉ chi tiết')}</label>
                            <textarea
                                id="address"
                                name="address"
                                value={shippingAddress.address}
                                onChange={handleAddressChange}
                                placeholder="Số nhà, đường, phường/xã, quận/huyện, tỉnh/thành phố"
                                rows="3"
                                required
                            ></textarea>
                        </div>
                    </fieldset>

                    {/* === PHẦN 2: CHỌN THANH TOÁN === */}
                    <fieldset className="checkout-fieldset">
                        <legend>{t('Phương thức Thanh toán')}</legend>
                        <div className="payment-method">
                            <input
                                type="radio"
                                id="cod"
                                name="paymentMethod"
                                value="COD"
                                checked={paymentMethod === 'COD'}
                                onChange={(e) => setPaymentMethod(e.target.value)}
                            />
                            <label htmlFor="cod">{t('Thanh toán khi nhận hàng (COD)')}</label>
                        </div>
                        <div className="payment-method">
                            <input
                                type="radio"
                                id="vnpay"
                                name="paymentMethod"
                                value="VNPAY"
                                checked={paymentMethod === 'VNPAY'}
                                onChange={(e) => setPaymentMethod(e.target.value)}
                            />
                            <label htmlFor="vnpay">{t('Thanh toán bằng VNPay (Thẻ/QR)')}</label>
                        </div>
                        <div className="payment-method">
                            <input
                                type="radio"
                                id="stripe"
                                name="paymentMethod"
                                value="STRIPE"
                                checked={paymentMethod === 'STRIPE'}
                                onChange={(e) => setPaymentMethod(e.target.value)}
                            />
                            <label htmlFor="stripe">{t('Thanh toán bằng Stripe (Thẻ Quốc tế)')}</label>
                        </div>
                    </fieldset>

                    {/* === PHẦN 3: NÚT XÁC NHẬN hoặc FORM STRIPE === */}
                    {paymentMethod === 'STRIPE' ? (
                        stripeLoadError ? (
                            <div style={{
                                padding: '20px',
                                backgroundColor: '#fff3cd',
                                border: '1px solid #ffc107',
                                borderRadius: '8px',
                                marginTop: '15px'
                            }}>
                                <h4 style={{color: '#856404', marginBottom: '10px'}}>
                                    ⚠️ {t('Không thể tải Stripe')}
                                </h4>
                                <p style={{color: '#856404', marginBottom: '10px'}}>
                                    {t('Stripe bị chặn bởi Ad Blocker hoặc Extension. Vui lòng:')}
                                </p>
                                <ul style={{color: '#856404', marginLeft: '20px', marginBottom: '10px'}}>
                                    <li>{t('Tắt Ad Blocker cho trang này')}</li>
                                    <li>{t('Hoặc dùng chế độ ẩn danh (Incognito)')}</li>
                                    <li>{t('Hoặc chọn phương thức thanh toán khác (VNPay/COD)')}</li>
                                </ul>
                                <button 
                                    onClick={() => window.location.reload()} 
                                    style={{
                                        padding: '10px 20px',
                                        backgroundColor: '#007bff',
                                        color: 'white',
                                        border: 'none',
                                        borderRadius: '5px',
                                        cursor: 'pointer'
                                    }}
                                >
                                    {t('Tải lại trang')}
                                </button>
                            </div>
                        ) : (
                            <Elements stripe={stripePromise}>
                                <StripeCheckoutForm
                                    shippingAddress={shippingAddress}
                                    onSuccess={handleStripeSuccess}
                                    onError={handleStripeError}
                                />
                            </Elements>
                        )
                    ) : (
                        <button 
                            type="submit" 
                            className="checkout-submit-btn" 
                            disabled={isLoading || userCart.length === 0}
                        >
                            {isLoading ? t('Đang xử lý...') : t('Xác nhận Đặt hàng')}
                        </button>
                    )}
                    {userCart.length === 0 && (
                        <p style={{color: 'red', textAlign: 'center'}}>{t('Giỏ hàng trống!')}</p>
                    )}
                </form>
            </div>
        </div>
    );
}

export { Checkout }; // Dùng "named export"