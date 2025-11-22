import "./Cart.css"
import { useEffect } from "react";
import jwt_decode from "jwt-decode"
import axios from "axios";
import { Link } from "react-router-dom"
import { 
    useWishlist, 
    useCart, 
    HorizontalProductCard,
    ShoppingBill 
} from "../../index"
import Lottie from 'react-lottie';
import { useTranslation } from 'react-i18next';
import CartLottie from "../../Assets/Icons/cart.json"

function Cart()
{
    const { t } = useTranslation();
    const { userWishlist, dispatchUserWishlist } = useWishlist()
    const { userCart, dispatchUserCart } = useCart()
    let cartObj = {
        loop: true,
        autoplay: true,
        animationData : CartLottie,
        rendererSettings: {
          preserveAspectRatio: 'xMidYMid slice'
        }
    }

    useEffect(()=>{
        const token=localStorage.getItem('token')

        if(token)
        {
            const user = jwt_decode(token)
            if(!user)
            {
                localStorage.removeItem('token')
            }
            else
            {
                if(userCart.length===0 || userWishlist.length===0)
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
            }
        }
        else
        {
            dispatchUserWishlist({type: "UPDATE_USER_WISHLIST",payload: []})
            dispatchUserCart({type: "UPDATE_USER_CART",payload: []})
        }   
    },[])

    return (
        <div className="cart-content-container">
            {/* Dịch sang Tiếng Việt */}
            <h2>{userCart.length} {t('sản phẩm trong Giỏ hàng')}</h2>
            {
                userCart.length === 0
                ? (
                    <div className="empty-cart-message-container">
                            <Lottie options={cartObj}
                                height={150}
                                width={150}
                                isStopped={false}
                                isPaused={false}
                            />
                            {/* Dịch sang Tiếng Việt */}
                            <h2>{t('Giỏ hàng của bạn đang trống')} 🙃</h2>
                            <Link to="/shop">
                                {/* Dịch sang Tiếng Việt */}
                                <button className=" solid-primary-btn">{t('Đến cửa hàng')}</button>
                            </Link>
                    </div>
                )
                : (
                    <div className="cart-grid">
                        <div className="cart-items-grid">
                            {
                                userCart.map( (productDetails, index)=>    
                                    <HorizontalProductCard key={index} productDetails={productDetails}/>
                                )
                            }
                        </div>
                        <ShoppingBill/>
                    </div>
                )
            }
        </div>
    )
}

export { Cart }