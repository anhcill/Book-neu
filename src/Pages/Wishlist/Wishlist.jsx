import "./Wishlist.css"
import jwt_decode from "jwt-decode";
import axios from "axios"
import { Link } from "react-router-dom"
// import { } from "../../Context/wishlist-context" // Dòng này trống, có thể xóa
import { 
    WishlistProductCard,
    useWishlist,
    useCart 
} from "../../index"
import Lottie from 'react-lottie';
import HeartLottie from "../../Assets/Icons/heart.json"
import { useEffect } from "react";
import { useTranslation } from 'react-i18next'; // Thêm t

function Wishlist()
{
    const { userWishlist, dispatchUserWishlist } = useWishlist()
    const { dispatchUserCart } = useCart()
    const { t } = useTranslation(); // Khởi tạo t

    let heartObj = {
        loop: true,
        autoplay: true,
        animationData : HeartLottie,
        rendererSettings: {
          preserveAspectRatio: 'xMidYMid slice'
        }
    }

    useEffect(()=>{
        const token=localStorage.getItem('token')

        // === SỬA LỖI: Thêm "if (token)" để tránh crash ===
        if(token)
        {
            // Kiểm tra token hợp lệ
            try {
                const user = jwt_decode(token);
                if(!user)
                {
                    localStorage.removeItem('token');
                }
                else
                {
                    (async function getUpdatedWishlistAndCart()
                    {
                        // --- SỬA URL ---
                        let updatedUserInfo = await axios.get(
                        "http://localhost:5000/api/user", // URL MỚI
                        {
                            headers:
                            {
                            'x-access-token': localStorage.getItem('token'),
                            }
                        })

                        if(updatedUserInfo.data.status==="ok")
                        {
                            dispatchUserWishlist({type: "UPDATE_USER_WISHLIST",payload: updatedUserInfo.data.user.wishlist})
                            dispatchUserCart({type: "UPDATE_USER_CART",payload: updatedUserInfo.data.user.cart})
                        }
                    })()
                }
            } catch (e) {
                // Nếu token bị hỏng, xóa nó
                localStorage.removeItem('token');
            }
        }   
    },[dispatchUserCart, dispatchUserWishlist]) // Thêm dependencies

    return (
        <div className="wishlist-container">
            {/* === DỊCH === */}
            <h2>{userWishlist.length} {userWishlist.length===1 ? t("sản phẩm") : t("sản phẩm")} {t('trong Danh sách Yêu thích')}</h2>
            <div className="products-card-grid">
                {
                    JSON.stringify(userWishlist)!==JSON.stringify([]) 
                    ? (
                        userWishlist.map(productdetails => (
                            <WishlistProductCard key={productdetails._id} productdetails={productdetails} />
                        ))
                    )
                    : (
                        <div className="empty-wishlist-message-container">
                            <Lottie options={heartObj}
                                height={150}
                                width={150}
                                isStopped={false}
                                isPaused={false}
                            />
                            {/* === DỊCH === */}
                            <h2>{t('Danh sách yêu thích của bạn đang trống')} 🙃</h2>
                            <Link to="/shop">
                                <button className=" solid-primary-btn">{t('Đến cửa hàng')}</button>
                            </Link>
                        </div>
                    )
                }
            </div>
        </div>
    )
}

export { Wishlist }