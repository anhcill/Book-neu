import { useEffect } from "react";
import "./ProductPage.css"
import axios from "axios";
import jwt_decode from "jwt-decode";
import { useNavigate } from "react-router-dom"
import { useParams } from "react-router-dom";
import { useToast, useWishlist, useCart, useUserLogin } from "../../index"
import { useTranslation } from 'react-i18next';
import ReviewSection from '../../Components/ReviewSection/ReviewSection';

function ProductPage()
{
    const navigate = useNavigate()

    const { dispatchUserWishlist } = useWishlist()
    const { dispatchUserCart }     = useCart()
    const { showToast } = useToast()
    const { userInfo } = useUserLogin()
    const { t } = useTranslation();
    const { id } = useParams()
    const productDetailsOnStorage = localStorage.getItem(`${id}`)
    const productdetails = JSON.parse(productDetailsOnStorage)
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
        outOfStock,
        rating, 
        description
    } = productdetails

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
    },[])

    async function addItemToWishlist()
    {
        const token=localStorage.getItem('token')

        if(token)
        {
            const user = jwt_decode(token)
            
            if(!user)
            {
                localStorage.removeItem('token')
                showToast("warning","","Kindly Login")
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
                    dispatchUserWishlist({type: "UPDATE_USER_WISHLIST",payload: wishlistUpdateResponse.data.user.wishlist})
                    showToast("success","","Item successfully added to wishlist")
                }
            }
        }
        else
        {
            showToast("warning","","Kindly Login")
        } 
    }

    async function addItemToCart()
    {
        const token=localStorage.getItem('token')

        if(token)
        {
            const user = jwt_decode(token)
            
            if(!user)
            {
                localStorage.removeItem('token')
                showToast("warning","","Kindly Login")
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
                    showToast("success","","Item successfully added to cart")
                }
            }
        }
        else
        {
            showToast("warning","","Kindly Login")
        } 
    }

    return (
        <div className="product-page-container">
            <div className="product-page-item">
                <img className="bookcover-image" src={imgSrc} alt={imgAlt}></img>
                <div className="item-details">
                    <h2>{bookName}</h2>
                    <hr></hr>
                    <p><b>{t('author')} : </b> &nbsp;&nbsp; <span>{author}</span> </p>
                    <p className="item-description"><b>{t('description')} : </b> &nbsp;&nbsp; <span>{description}</span> </p>
                    <p className="item-rating"><b>{t('rating')} : </b> &nbsp;&nbsp; <span>{rating}</span> </p>
                    <h3 className="item-price-details">{t('rs')} {discountedPrice} &nbsp;&nbsp;<del>{t('rs')} {originalPrice}</del> &nbsp;&nbsp;
                        <span className="discount-on-item">({discountPercent}{t('off')})</span>
                    </h3>
                    {
                        outOfStock === true && (
                            <p className="out-of-stock-text">{t('itemOutOfStock')}</p>
                        )
                    }
                    {
                        outOfStock === true 
                        ? (
                            <div className="item-buttons">
                                <button className="item-notify-me-btn solid-primary-btn">{t('notifyMe')}</button>
                            </div>
                        )
                        : (
                            <div className="item-buttons">
                                <button
                                    onClick={(event)=>{
                                        event.preventDefault();
                                        addItemToWishlist()
                                    }}  
                                    className="solid-primary-btn">
                                        {t('addToWishlist')}
                                </button>
                                <button 
                                    onClick={()=>{
                                        addItemToCart()
                                    }}
                                    className="solid-warning-btn">
                                        {t('addToCart')}
                                </button>
                            </div>
                        )
                    }
                    
                </div>
            </div>

            {/* Review Section */}
            <ReviewSection 
                productId={_id} 
                userInfo={userInfo}
            />
        </div>
    )
}

export { ProductPage }