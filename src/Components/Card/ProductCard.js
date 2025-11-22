import React,{ useEffect, useState} from 'react'
import { Link, useNavigate } from "react-router-dom"
import axios from "axios"
import jwt_decode from "jwt-decode";
import './ProductCard.css'
import { useToast } from '../../Context/toast-context';
import { useWishlist } from '../../Context/wishlist-context';
import { useCart } from '../../Context/cart-context';
import { useTranslation } from 'react-i18next';

export default function ProductCard({ productdetails }) 
{
    const navigate = useNavigate()

    const { userWishlist, dispatchUserWishlist } = useWishlist()
    const { userCart, dispatchUserCart } = useCart()
    const { showToast } = useToast()
    const { t } = useTranslation();

    // === SỬA LỖI: Đọc đúng tên biến mà backend gửi về ===
    // Code cũ của bạn đang đọc 'id' và 'title', gây ra lỗi 'undefined'
    // Chúng ta sửa thành '_id' và 'bookName'
    const {
        _id, 
        bookName, // <-- Đã sửa (từ 'title')
        author,
        originalPrice,
        discountedPrice,
        discountPercent,
        imgSrc, 
        imgAlt,
        badgeText, 
        outOfStock
    } = productdetails
    // === KẾT THÚC SỬA LỖI ===

    const [wishlistHeartIcon, setWishlistHeartIcon] = useState("fa-heart-o")
    const [wishlistBtn, setWishlistBtn]             = useState("add-to-wishlist-btn")
    const [cartBtnText, setCartBtnText] = useState(t('Thêm vào giỏ hàng')) // Dịch

    useEffect(()=>{
        // Kiểm tra xem sản phẩm có trong Wishlist không
        const indexInWishlist = userWishlist.findIndex(product => product._id === productdetails._id)

        if(indexInWishlist!==-1)
        {
            setWishlistHeartIcon("fa-heart")
            setWishlistBtn("added-to-wishlist-btn")
        }
        else
        {
            setWishlistHeartIcon("fa-heart-o")
            setWishlistBtn("add-to-wishlist-btn")
        }

        // Kiểm tra xem sản phẩm có trong Giỏ hàng không
        const indexInCart = userCart.findIndex(product => product._id === productdetails._id)

        if(indexInCart !== -1)
        {
            setCartBtnText(t('Đi đến giỏ hàng')) // Dịch
        }
        else
        {
            setCartBtnText(t('Thêm vào giỏ hàng')) // Dịch
        }

    },[userWishlist, userCart, productdetails._id, setWishlistHeartIcon, setWishlistBtn, t])

    async function addOrRemoveItemToWishlist()
    {
        if(wishlistHeartIcon==="fa-heart-o" && wishlistBtn ==="add-to-wishlist-btn")
        {
            // === THÊM VÀO YÊU THÍCH ===
            const token=localStorage.getItem('token')

            if(token)
            {
                // Kiểm tra token hợp lệ
                try {
                    jwt_decode(token);
                } catch(e) {
                    localStorage.removeItem('token');
                    showToast("warning","", t("Vui lòng đăng nhập lại"));
                    navigate('/login');
                    return;
                }

                let wishlistUpdateResponse = await axios.patch(
                    "http://localhost:5000/api/wishlist", // URL ĐÚNG
                    {
                        productdetails // Backend đã được thiết kế để nhận cả object
                    },
                    {
                        headers:
                        {
                            'x-access-token': localStorage.getItem('token'),
                        }
                    }
                )
        
                if(wishlistUpdateResponse.data.status==="ok")
                {
                    setWishlistHeartIcon("fa-heart")
                    setWishlistBtn("added-to-wishlist-btn")
                    dispatchUserWishlist({type: "UPDATE_USER_WISHLIST",payload: wishlistUpdateResponse.data.user.wishlist})
                    showToast("success","", t("Đã thêm vào Yêu thích")) // Dịch
                }
            }
            else
            {
                showToast("warning","", t("Vui lòng đăng nhập")) // Dịch
            }   
        }
        else
        {
            // === XÓA KHỎI YÊU THÍCH ===
            const token=localStorage.getItem('token')

            if(token)
            {
                // Kiểm tra token hợp lệ
                try {
                    jwt_decode(token);
                } catch(e) {
                    localStorage.removeItem('token');
                    showToast("warning","", t("Vui lòng đăng nhập lại"));
                    navigate('/login');
                    return;
                }
                
                let wishlistUpdateResponse = await axios.delete(
                    `http://localhost:5000/api/wishlist/${productdetails._id}`, // URL ĐÚNG
                    {
                        headers:
                        {
                            'x-access-token': localStorage.getItem('token'),
                        }
                    }
                )
                if(wishlistUpdateResponse.data.status==="ok")
                {
                    setWishlistHeartIcon("fa-heart-o")
                    setWishlistBtn("add-to-wishlist-btn")
                    dispatchUserWishlist({type: "UPDATE_USER_WISHLIST",payload: wishlistUpdateResponse.data.user.wishlist})
                    showToast("success","", t("Đã xóa khỏi Yêu thích")) // Dịch
                }
            }
            else
            {
                showToast("warning","", t("Vui lòng đăng nhập")) // Dịch
            }   
        }     
    }

    async function addItemToCart()
    {
        // === THÊM VÀO GIỎ HÀNG ===
        const token=localStorage.getItem('token')

        if(token)
        {
            // Kiểm tra token hợp lệ
            try {
                jwt_decode(token);
            } catch(e) {
                localStorage.removeItem('token');
                showToast("warning","", t("Vui lòng đăng nhập lại"));
                navigate('/login');
                return;
            }

            let cartUpdateResponse = await axios.patch(
                "http://localhost:5000/api/cart", // URL ĐÚNG
                {
                    productdetails
                },
                {
                    headers:
                    {
                        'x-access-token': localStorage.getItem('token'),
                    }
                }
            )
    
            if(cartUpdateResponse.data.status==="ok")
            {
                dispatchUserCart({type: "UPDATE_USER_CART",payload: cartUpdateResponse.data.user.cart})
                showToast("success","", t("Đã thêm vào giỏ hàng")) // Dịch
                setCartBtnText(t('Đi đến giỏ hàng')) // Dịch
            }
        }
        else
        {
            showToast("warning","", t("Vui lòng đăng nhập")) // Dịch
        }   
    }
    
    return (
        <div 
            className="card-basic"
        >
            <Link
                to={`/shop/${_id}`}
                onClick={() => localStorage.setItem(`${_id}`, JSON.stringify(productdetails))}
            >
                <img src={imgSrc} alt={imgAlt}/>
            </Link>
            <div className="card-item-details">
                <div className="item-title">
                    <h4>{bookName}</h4> {/* Đã sửa thành bookName */}
                </div>
                <h5 className="item-author">- {t('Tác giả')}   &nbsp;{author}</h5> {/* Dịch */}
                <p><b>{discountedPrice}đ   &nbsp;&nbsp;</b><del>{originalPrice}đ</del> &nbsp;&nbsp; {/* Dịch */}
                    <span className="discount-on-card">({discountPercent}{t('% giảm')})</span> {/* Dịch */}
                </p>
                <div className="card-button">
                    <button 
                        className="card-primary-btn"
                        onClick={(event)=>{
                            event.preventDefault();
                            event.stopPropagation();
                            if(cartBtnText === t('Thêm vào giỏ hàng')) // Dịch
                            {
                                addItemToCart()
                            }
                            else
                            {
                                navigate('/cart')
                            }
                        }} 
                    >
                        {cartBtnText}
                    </button>
                    <button 
                        onClick={(event)=>{
                            event.preventDefault();
                            event.stopPropagation();
                            addOrRemoveItemToWishlist()
                        }} 
                        className={`card-icon-btn ${wishlistBtn} outline-card-secondary-btn`}>
                            <i className={`fa fa-x ${wishlistHeartIcon}`} aria-hidden="true"></i>
                    </button>
                </div>
                <div className="badge-on-card">
                    {badgeText}
                </div>
                {
                    outOfStock && (
                        <div className="card-text-overlay-container">
                                <p>{t('Hết hàng')}</p> {/* Dịch */}
                        </div>
                    )
                }
            </div>
        </div>
    )
}

export { ProductCard };