import "./Orders.css";
import { useEffect } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { ProductOrderCard, useOrders, useToast } from "../../index";
import Lottie from 'react-lottie';
import GuyWithBookLottie from "../../Assets/Icons/guy_with_book.json";
import LoadingLottie from "../../Assets/Lottie/loading-0.json";
import { useTranslation } from 'react-i18next';

function Orders() {
    const { userOrders, getOrders } = useOrders();
    const { t } = useTranslation();
    const { pathname } = useLocation();
    const navigate = useNavigate();
    const { showToast } = useToast();

    const guyWithBookObj = {
        loop: true,
        autoplay: true,
        animationData: GuyWithBookLottie,
        rendererSettings: {
          preserveAspectRatio: 'xMidYMid slice'
        }
    };

    const loadingObj = {
        loop: true,
        autoplay: true,
        animationData: LoadingLottie,
        rendererSettings: {
          preserveAspectRatio: 'xMidYMid slice'
        }
    };
 
    useEffect(() => {
      window.scrollTo(0, 0);
    }, [pathname]);

    // Lấy danh sách đơn hàng khi component được mount
    useEffect(() => {
        const token = localStorage.getItem('token');
        if (!token) {
            showToast("error", "", t("Vui lòng đăng nhập để xem đơn hàng"));
            navigate('/login');
            return;
        }
        getOrders();
        
        // Poll for updates every 10 seconds to show real-time status changes
        const intervalId = setInterval(() => {
            const currentToken = localStorage.getItem('token');
            if (currentToken) {
                getOrders();
            }
        }, 10000);
        
        return () => clearInterval(intervalId);
    }, [getOrders, navigate, showToast, t]); // getOrders được bọc trong useCallback nên sẽ không gây vòng lặp

    const renderContent = () => {
        if (userOrders.loading) {
            return (
                <div className="center-message-container">
                    <Lottie options={loadingObj} height={200} width={200} />
                    <h2>{t('Đang tải đơn hàng...')}</h2>
                </div>
            );
        }

        if (userOrders.error) {
            return (
                <div className="center-message-container">
                    <h2>{t('Lỗi khi tải đơn hàng')}</h2>
                    <p>{userOrders.error}</p>
                    <button className="solid-primary-btn" onClick={getOrders}>{t('Thử lại')}</button>
                </div>
            );
        }

        // Filter out delivered orders (they should be in delivery history)
        const activeOrders = userOrders.data.filter(order => order.status !== 'delivered');

        if (activeOrders.length === 0) {
            return (
                <div className="center-message-container">
                    <Lottie options={guyWithBookObj} height={350} width={350} />
                    <h2>{t('Bạn chưa có đơn hàng đang xử lý')}</h2>
                    <p>{t('Các đơn hàng đã giao thành công được lưu trong Lịch sử giao hàng')}</p>
                    <div style={{display: 'flex', gap: '10px', justifyContent: 'center'}}>
                        <Link to="/shop">
                            <button className="solid-primary-btn">{t('Bắt đầu mua sắm')}</button>
                        </Link>
                        <Link to="/delivery-history">
                            <button className="solid-secondary-btn">{t('Xem lịch sử giao hàng')}</button>
                        </Link>
                    </div>
                </div>
            );
        }

        return (
            <>
                <h2>{t('Đơn hàng đang xử lý')} ({activeOrders.length})</h2>
                <div className="orders-container">
                    {activeOrders.map(order => (
                        <ProductOrderCard key={order.id} orderDetails={order} />
                    ))}
                </div>
                {userOrders.data.length > activeOrders.length && (
                    <div style={{textAlign: 'center', marginTop: '20px', padding: '15px', background: '#f0f0f0', borderRadius: '8px'}}>
                        <p>📦 {t('Bạn có')} {userOrders.data.length - activeOrders.length} {t('đơn hàng đã giao thành công')}</p>
                        <Link to="/delivery-history">
                            <button className="solid-secondary-btn" style={{marginTop: '10px'}}>{t('Xem lịch sử giao hàng')} →</button>
                        </Link>
                    </div>
                )}
            </>
        );
    };

    return (
        <div className="orders-content-container">
            {renderContent()}
        </div>
    );
}

export { Orders };