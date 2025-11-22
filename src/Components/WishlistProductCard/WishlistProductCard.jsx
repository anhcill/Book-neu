import React,{ useEffect, useState} from 'react'
import { Link, useNavigate } from "react-router-dom"
import axios from "axios"
import jwt_decode from "jwt-decode";
import './WishlistProductCard.css'
import {
    useToast,
    useWishlist,
    useCart
} from '../../index'
import { useTranslation } from 'react-i18next'; // Import t

export default function WishlistProductCard({ productdetails }) 
{
    const navigate = useNavigate()
    const { t } = useTranslation(); // Khởi tạo t

    const { userWishlist, dispatchUserWishlist } = useWishlist()
    const { dispatchUserCart } = useCart()
    const { showToast } = useToast()
    const {
        _id, 
        bookName,
        author,
        originalPrice,
        discountedPrice,
        discountPercent,
        imgSrc, 
        imgAlt,
        badgeText, 
        outOfStock
    } = productdetails
    const [wishlistHeartIcon, setWishlistHeartIcon] = useState("fa-heart-o")
    const [wishlistBtn, setWishlistBtn]             = useState("add-to-wishlist-btn")

    useEffect(()=>{
        // Logic này kiểm tra xem sản phẩm có trong wishlist không để hiển thị tim (Heart)
        const index = userWishlist.findIndex(product=> {
            // Dữ liệu 'userWishlist' đã được "làm phẳng" (flattened)
            return product._id === productdetails._id
        })

        if(index!==-1)
        {
            setWishlistHeartIcon("fa-heart") // Tim đầy
            setWishlistBtn("added-to-wishlist-btn")
        }
        else
        {
            setWishlistHeartIcon("fa-heart-o") // Tim rỗng
            setWishlistBtn("add-to-wishlist-btn")
        }
    },[userWishlist, productdetails._id, setWishlistHeartIcon, setWishlistBtn])

    async function addOrRemoveItemToWishlist()
    {
        // Logic này chủ yếu sẽ chạy vào 'else' để XÓA, vì đây là trang Wishlist

        if(wishlistHeartIcon==="fa-heart-o" && wishlistBtn ==="add-to-wishlist-btn")
        {
            // THÊM VÀO YÊU THÍCH (Trường hợp này ít khi xảy ra ở đây)
            const token=localStorage.getItem('token')

            if(token)
            {
                const user = jwt_decode(token)
                
                if(!user)
                {
                    localStorage.removeItem('token')
                    showToast("warning","", t("Vui lòng đăng nhập"))
                    navigate('/login')
                }
                else
                {
                    // --- SỬA URL ---
                    let wishlistUpdateResponse = await axios.patch(
                        "http://localhost:5000/api/wishlist", // URL MỚI
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
            
                    if(wishlistUpdateResponse.data.status==="ok")
                    {
                        setWishlistHeartIcon("fa-heart")
                        setWishlistBtn("added-to-wishlist-btn")
                        dispatchUserWishlist({type: "UPDATE_USER_WISHLIST",payload: wishlistUpdateResponse.data.user.wishlist})
                        showToast("success","", t("Đã thêm vào danh sách yêu thích"))
                    }
                }
            }
            else
            {
                showToast("warning","", t("Vui lòng đăng nhập"))
            }   
        }
        else
        {
            // XÓA KHỎI YÊU THÍCH (Logic chính)
            const token=localStorage.getItem('token')

            if(token)
            {
                const user = jwt_decode(token)
                
                if(!user)
                {
                    localStorage.removeItem('token')
                    showToast("warning","", t("Vui lòng đăng nhập"))
                    navigate('/login')
                }
                else
                {
                    // --- SỬA URL ---
                    let wishlistUpdateResponse = await axios.delete(
                        `http://localhost:5000/api/wishlist/${productdetails._id}`, // URL MỚI
                        {
                            headers:
                            {
                                'x-access-token': localStorage.getItem('token'),
                            }
                        }
                        // Xóa phần body thừa
                    )
                    if(wishlistUpdateResponse.data.status==="ok")
                    {
                        setWishlistHeartIcon("fa-heart-o")
                        setWishlistBtn("add-to-wishlist-btn")
                        dispatchUserWishlist({type: "UPDATE_USER_WISHLIST",payload: wishlistUpdateResponse.data.user.wishlist})
                        showToast("success","", t("Đã xóa khỏi danh sách yêu thích"))
                    }
                }
            }
            else
            {
                showToast("warning","", t("Vui lòng đăng nhập"))
            }   
        }     
    }

    // --- HÀM THÊM VÀO GIỎ HÀNG ---
    async function addItemToCart()
    {
        const token=localStorage.getItem('token')

        if(token)
        {
            const user = jwt_decode(token)
            
            if(!user)
            {
                localStorage.removeItem('token')
                showToast("warning","", t("Vui lòng đăng nhập"))
                navigate('/login')
            }
            else
            {
                // --- SỬA URL ---
                let cartUpdateResponse = await axios.patch(
                    "http://localhost:5000/api/cart", // URL MỚI
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
                    showToast("success","", t("Đã thêm vào giỏ hàng thành công"))
                }
            }
        }
        else
        {
            showToast("warning","", t("Vui lòng đăng nhập"))
        } 
    }
    
    return (
        <Link
            to={`/shop/${_id}`}
            onClick={() => localStorage.setItem(`${_id}`, JSON.stringify(productdetails))}
        >
            <div className="card-basic wishlist-card">
                <img src={imgSrc} alt={imgAlt}/>
                <div className="card-item-details">
                    <div className="item-title">
                        <h4>{bookName}</h4>
                    </div>
                    {/* === DỊCH === */}
                    <h5 className="item-author">- {t('Tác giả')}  &nbsp;{author}</h5>
                    <p><b>{discountedPrice}đ   &nbsp;&nbsp;</b><del>{originalPrice}đ</del> &nbsp;&nbsp;
                        <span className="discount-on-card">({discountPercent}% {t('giảm')})</span>
                    </p>
                    <div className="card-button">
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
                                    <p>{t('Hết hàng')}</p>
                            </div>
                        )
                    }
                </div>
                <button 
                        className="solid-primary-btn add-wishlist-item-to-cart-btn"
                        onClick={event=>{
                            event.preventDefault()
                            event.stopPropagation()
                            addItemToCart(event) // Đã sửa
                        }}
                >
                        {t('Thêm vào giỏ hàng')}
                </button>
            </div>
        </Link>
    )
}

export { WishlistProductCard };