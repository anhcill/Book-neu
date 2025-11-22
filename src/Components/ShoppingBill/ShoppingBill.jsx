import "./ShoppingBill.css"
import { useState } from "react"
import { useNavigate } from "react-router-dom"
import { useCart, useToast, useOrders, useUserLogin } from "../../index" 
// import axios from "axios" // Không cần gọi API ở đây nữa
import { useTranslation } from 'react-i18next';

function ShoppingBill()
{
    const navigate = useNavigate()
    const { userCart, dispatchUserCart } = useCart()
    const { showToast } = useToast()
    const { dispatchUserOrders }= useOrders()
    const { user } = useUserLogin();
    const [ couponName, setCouponName ] = useState("")
    const { t } = useTranslation();
    // const [isLoading, setIsLoading] = useState(false); // Không cần nữa

    // === LOGIC TÍNH TIỀN (Chỉ để hiển thị) ===
    let totalDiscount = 0, totalBill = 0, finalBill = 0;
    userCart.forEach(product=>{
        let originalPrice = product.originalPrice || (product.discountedPrice / (1 - (product.discountPercent || 0) / 100));
        let discountOnCurrentProduct = ( (originalPrice - product.discountedPrice) * product.quantity )
        totalDiscount = totalDiscount + discountOnCurrentProduct
        totalBill = totalBill + ( product.discountedPrice * product.quantity )
    });

    // === TÍNH PHÍ GIAO HÀNG ===
    let deliveryCharge = 0;
    if (totalBill >= 200000) {
        deliveryCharge = 0;          // Miễn phí ship
    } else if (totalBill > 0) { // Chỉ tính ship nếu có hàng
        deliveryCharge = 25000;      // Ship 25k
    }

    totalBill += deliveryCharge;      // Cộng ship vào tổng

    // === ÁP DỤNG COUPON ===
    if(couponName==="BOOKS200") {
        finalBill = totalBill - 200;
        if (finalBill < 0) finalBill = 0;
    } else {
        finalBill = totalBill;
    }
    // === KẾT THÚC LOGIC TÍNH TIỀN ===


    // === SỬA HÀM NÀY ===
    // (Hàm này giờ sẽ chuyển hướng, không gọi API nữa)
    function handleGoToCheckout()
    {
        if (userCart.length === 0) {
            showToast("error","", "Giỏ hàng trống!");
            return;
        }
        // Chuyển hướng đến trang Checkout mới
        navigate('/checkout');
    }
    // === KẾT THÚC SỬA HÀM ===

    return (
        <div className="cart-bill">
            <h2 className="bill-heading">{t('Chi tiết Hóa đơn')}</h2>
            <hr></hr>
            {
                userCart.map(product=>(
                    <div key={product._id} className="cart-price-container">
                        <div className="cart-item-bookname">
                            <p>{product.bookName}</p>
                        </div>
                        <div className="cart-item-quantity">
                            <p>X {product.quantity}</p>
                        </div>
                        <div className="cart-item-total-price" id="price-sum">
                            <p>{product.discountedPrice * product.quantity}đ</p>
                        </div>
                    </div>
                ))
            }
            <hr></hr>
            <div className="cart-discount-container">
                <div className="cart-item-total-discount">
                    <p>{t('Giảm giá')}</p>
                </div>
                <div className="cart-item-total-discount-amount" id="price-sum">
                    <p>-{totalDiscount}đ</p>
                </div>
            </div>
            <div className="cart-delivery-charges-container">
                <div className="cart-item-total-delivery-charges">
                    <p>{t('Phí giao hàng')}</p>
                </div>
                <div className="cart-item-total-delivery-charges-amount" id="price-sum">
                    <p id="delivery-charges">{deliveryCharge}đ</p>
                </div>
            </div>
            <hr></hr>
            <div className="cart-total-charges-container">
                <div className="cart-item-total-delivery-charges">
                    <p><b>{t('Tổng thanh toán')}</b></p>
                </div>
                <div className="cart-item-total-delivery-charges-amount" id="price-sum">
                    <p id="total-charges"><b>{finalBill}đ</b></p>
                </div>
            </div>
            <hr></hr>
            <div className="apply-coupon-container">
                <p>{t('Mã giảm giá')}</p>
                <input
                    value={couponName}
                    onChange={(event)=>setCouponName(event.target.value)}
                    placeholder={t('Thử BOOKS200')}
                ></input>
            </div>

            <button 
                className="place-order-btn solid-secondary-btn"
                onClick={handleGoToCheckout} // Sửa tên hàm
                disabled={userCart.length === 0} // Chỉ cấm khi giỏ hàng trống
            >
                {/* Dịch và Sửa tên nút */}
                {t('Tiến hành Đặt hàng')} 
            </button>
        </div>
    )
}

export { ShoppingBill }