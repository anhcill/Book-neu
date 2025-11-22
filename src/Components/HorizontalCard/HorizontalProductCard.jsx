import "./HorizontalProductCard.css"
import { useState } from "react"
import axios from "axios";
import jwt_decode from "jwt-decode";
import { useNavigate } from "react-router-dom"
import { useToast, useCart, useWishlist } from "../../index"
import { useEffect } from "react";

function HorizontalProductCard({productDetails})
{
    const navigate = useNavigate()

    const { showToast } = useToast()
    const { dispatchUserWishlist } = useWishlist()
    const { dispatchUserCart } = useCart()
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
        // outOfStock, // Tạm thời không dùng
        quantity
    } = productDetails;
    const productdetails = productDetails; // Giữ lại để gửi cho wishlist

    // State cho số lượng
    const [productQuantity, setProductQuantity] = useState(Number(quantity))
    // State để kiểm tra xem component đã mount (tải) xong chưa
    const [isMounted, setIsMounted] = useState(false)

    // Dùng 1 useEffect riêng để đánh dấu là component đã tải xong
    // Việc này để ngăn useEffect 'onQuantityChange' chạy khi vừa tải trang
    useEffect(() => {
        setIsMounted(true);
    }, []);

    // useEffect này CHỈ chạy khi 'productQuantity' thay đổi (và component đã tải xong)
    useEffect(()=>{
        // Nếu component chưa tải xong, không làm gì cả (tránh lỗi chạy khi mount)
        if (!isMounted) {
            return;
        }

        (async function onQuantityChange()
        {
            const token = localStorage.getItem('token');
            if (!token) return; // Không có token thì không làm gì

            // Nếu số lượng là 0, hãy gọi API Xóa
            if (productQuantity <= 0) {
                removeItemFromCart(); // Gọi hàm xóa
                return; // Dừng lại
            }
            
            // Nếu không, gọi API Cập nhật
            try {
                let newQuantity = productQuantity
                let quantityUpdateResponse = await axios.patch(
                    `http://localhost:5000/api/cart/${_id}`, // URL MỚI (dùng _id là productId)
                    {
                        newQuantity // Gửi số lượng mới
                    },
                    {
                        headers:
                        {
                            'x-access-token': localStorage.getItem('token'),
                        }
                    }
                )

                if(quantityUpdateResponse.data.status==="ok")
                {
                    dispatchUserCart({type: "UPDATE_USER_CART",payload: quantityUpdateResponse.data.user.cart})
                    // Không cần toast khi tăng giảm
                }
            } catch (error) {
                showToast("error","","Đã xảy ra lỗi khi cập nhật số lượng!")
            }
        })()
    // eslint-disable-next-line react-hooks/exhaustive-deps
    },[productQuantity, isMounted]) // Phụ thuộc vào 'productQuantity' và 'isMounted'
    

    // --- HÀM XÓA KHỎI GIỎ HÀNG ---
    async function removeItemFromCart()
    {
        const token=localStorage.getItem('token')

        if(token)
        {
            const user = jwt_decode(token)
                
            if(!user)
            {
                localStorage.removeItem('token')
                showToast("warning","","Vui lòng đăng nhập")
                navigate('/login')
            }
            else
            {
                try {
                    let cartUpdateResponse = await axios.delete(
                        `http://localhost:5000/api/cart/${productDetails._id}`, // URL MỚI
                        {
                            headers:
                            {
                                'x-access-token': localStorage.getItem('token'),
                            }
                        }
                        // Xóa phần body thừa
                    )
                    if(cartUpdateResponse.data.status==="ok")
                    {
                        dispatchUserCart({type: "UPDATE_USER_CART",payload: cartUpdateResponse.data.user.cart})
                        showToast("success","","Đã xóa sản phẩm khỏi giỏ hàng")
                    }
                } catch (error) {
                    showToast("error","","Lỗi khi xóa sản phẩm")
                }
            }
        }
        else
        {
            showToast("warning","","Vui lòng đăng nhập")
        } 
    }

    // --- HÀM THÊM VÀO YÊU THÍCH ---
    async function addItemToWishlist()
    {
        const token=localStorage.getItem('token')

        if(token)
        {
            const user = jwt_decode(token)
            
            if(!user)
            {
                localStorage.removeItem('token')
                showToast("warning","","Vui lòng đăng nhập")
                navigate('/login')
            }
            else
            {
                try {
                    const wishlistUpdateResponse = await axios.patch(
                        "http://localhost:5000/api/wishlist", // URL MỚI
                        {
                            productdetails // Gửi object productdetails
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
                        dispatchUserWishlist({type: "UPDATE_USER_WISHLIST",payload: wishlistUpdateResponse.data.user.wishlist})
                        showToast("success","","Đã thêm vào danh sách yêu thích")
                    }
                } catch (error) {
                    // Có thể sản phẩm đã tồn tại
                    showToast("info","","Sản phẩm đã có trong danh sách yêu thích")
                }
            }
        }
        else
        {
            showToast("warning","","Vui lòng đăng nhập")
        } 
    }

    return (
        <div className="card-basic-horizontal">
            <img className="cart-item-book-img" src={imgSrc} alt={imgAlt}/>
            <div id="cart-item-detail" className="card-item-details">

                <h4 id="item-title">{bookName}</h4>
                <p className="item-author">- Tác giả &nbsp;{author}</p>
                <p className="price-details">
                            {/* Đơn vị tiền tệ (Nếu cần) */}
                            {discountedPrice}đ &nbsp;&nbsp;<del>{originalPrice}đ</del> &nbsp;&nbsp;
                    <span className="discount-on-card">Giảm {discountPercent}%</span>
                </p>
    
                <div className="item-cart-quantity">
                    <p className="cart-quantity-para">Số lượng : &nbsp;&nbsp;</p>
                    <div className="quantity-manage-container">
                        <div className="quantity-change" onClick={()=>{
                            // Giảm (không bao giờ < 0)
                            setProductQuantity(prevQuantity => Math.max(0, Number(prevQuantity)-1));
                        }}>-</div>
                        <input 
                            className="cart-item-quantity-input" 
                            value={productQuantity}
                            onChange={(event)=>{
                                // Cập nhật state khi gõ
                                setProductQuantity(Number(event.target.value));
                            }}
                            type="text" 
                            maxLength="3" 
                            autoComplete="off"/>
                        <div className="quantity-change" onClick={()=>{
                            // Tăng
                            setProductQuantity(prevQuantity=>Number(prevQuantity)+1);
                        }}>+</div>
                    </div>
                </div>
    
                <div className="cart-horizontal-card-btns card-button">
                    <button 
                        className="solid-primary-btn"
                        onClick={removeItemFromCart} // Không cần event
                    >
                        Xóa khỏi giỏ hàng
                    </button>
                    <button 
                        className="outline-primary-btn"
                        onClick={addItemToWishlist}
                    >
                        Thêm vào Yêu thích
                    </button>
                </div>
                <div className="badge-on-card">
                    {badgeText}
                </div>
            </div>
        </div>
    )
}

export { HorizontalProductCard }