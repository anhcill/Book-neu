import React, { useState, useEffect } from "react"
import jwt_decode from "jwt-decode"
import "./UserAuth.css"
import { Link, useNavigate } from "react-router-dom"
import axios from "axios"
import { FaEye, FaEyeSlash, FaEnvelope, FaLock, FaUser } from 'react-icons/fa'
import { 
    useToast, 
    useUserLogin, 
    useWishlist,
    useCart,
    useOrders
} from "../../index"

function Login()
{
    const { setUserLoggedIn, setUserRole, setUserInfo }    = useUserLogin()
    const { showToast }          = useToast()
    const { dispatchUserWishlist } = useWishlist()
    const { dispatchUserCart }   = useCart()
    const { dispatchUserOrders } = useOrders()

    const [userEmail    , setUserEmail]    = useState('')
    const [userPassword , setUserPassword] = useState('')
    const [showPassword, setShowPassword] = useState(false)
    const [isLoading, setIsLoading] = useState(false)
    const [errors, setErrors] = useState({})

    useEffect(()=>{
        const token = localStorage.getItem('token')

        // === SỬA LỖI: Thêm "if (token)" để tránh crash khi token là null ===
        if(token)
        {
            try {
                const user = jwt_decode(token)
                if(!user)
                {
                    localStorage.removeItem('token')
                }
                else
                {
                    (async function getUpdatedWishlistAndCart()
                    {
                        let updatedUserInfo = await axios.get("http://localhost:5000/user", {
                            headers:
                            {
                            'x-access-token': localStorage.getItem('token'),
                            }
                        })

                        if(updatedUserInfo.data.status==="ok")
                        {
                            dispatchUserWishlist({type: "UPDATE_USER_WISHLIST",payload: updatedUserInfo.data.user.wishlist})
                            dispatchUserCart({type: "UPDATE_USER_CART",payload: updatedUserInfo.data.user.cart})
                            dispatchUserOrders({type: "UPDATE_USER_ORDERS",payload: updatedUserInfo.data.user.orders})
                        }
                    })()
                }
            } catch (error) {
                localStorage.removeItem('token');
            }
        }   
    },[dispatchUserWishlist, dispatchUserCart, dispatchUserOrders])

    const navigate = useNavigate()

    const validateForm = () => {
        const newErrors = {}
        if (!userEmail) {
            newErrors.email = 'Email không được để trống'
        } else if (!/\S+@\S+\.\S+/.test(userEmail)) {
            newErrors.email = 'Email không hợp lệ'
        }
        if (!userPassword) {
            newErrors.password = 'Mật khẩu không được để trống'
        } else if (userPassword.length < 6) {
            newErrors.password = 'Mật khẩu phải có ít nhất 6 ký tự'
        }
        setErrors(newErrors)
        return Object.keys(newErrors).length === 0
    }

    function loginUser(event)
    {
        event.preventDefault();
        
        if (!validateForm()) {
            showToast("error","","Vui lòng kiểm tra lại thông tin đăng nhập")
            return
        }
        
        setIsLoading(true)
        // --- SỬA URL ---
        axios.post(
            "http://localhost:5000/api/login", // URL MỚI
            {
                userEmail, // Backend mới đã được cập nhật để nhận 'userEmail'
                userPassword // và 'userPassword'
            }
        )
        .then(res => {
            
            if(res.data.token)
            {
                // default: write auth to sessionStorage via localStorage shim (per-tab)
                localStorage.setItem('token',res.data.token)
                showToast("success","","Đăng nhập thành công")
                setUserLoggedIn(true)
                setUserRole(res.data.user.role || 'user')
                setUserInfo(res.data.user)
                // If "remember me" checked, persist to real localStorage as well
                try {
                    const rememberEl = document.getElementById('remember-me')
                    if (rememberEl && rememberEl.checked && window.__origLocalSet) {
                        // persist token, role and userInfo to real localStorage
                        window.__origLocalSet('token', res.data.token)
                        window.__origLocalSet('userRole', res.data.user.role || 'user')
                        try { window.__origLocalSet('userInfo', JSON.stringify(res.data.user)) } catch (e) {}
                    }
                } catch (e) {
                    // ignore
                }
                dispatchUserWishlist({type: "UPDATE_USER_WISHLIST",payload: res.data.user.wishlist})
                dispatchUserCart({type: "UPDATE_USER_CART",payload: res.data.user.cart})
                dispatchUserOrders({type: "UPDATE_USER_ORDERS",payload: res.data.user.orders})
                
                // Nếu là admin, chuyển đến trang admin
                if(res.data.user.role === 'admin') {
                    navigate('/admin')
                } else {
                    navigate('/shop')
                }
            }
            else
            {
                throw new Error("Lỗi khi đăng nhập")
            }

        })
        .catch(err=>{
            setIsLoading(false)
            const errorMsg = err.response?.data?.message || "Lỗi đăng nhập. Vui lòng thử lại"
            showToast("error","",errorMsg)
        })
    }

    return (
        <div className="user-auth-content-container">
            <form onSubmit={loginUser} className="user-auth-form modern-auth-form">
                <div className="auth-header">
                    <div className="auth-icon">
                        <FaUser />
                    </div>
                    <h2 className="auth-title">Đăng Nhập</h2>
                    <p className="auth-subtitle">Chào mừng bạn trở lại!</p>
                </div>
                
                <div className="user-auth-input-container">
                    <label htmlFor="user-auth-input-email"><h4>Địa chỉ Email</h4></label>
                    <div className={`input-wrapper ${errors.email ? 'error' : ''}`}>
                        <FaEnvelope className="input-icon" />
                        <input 
                            id="user-auth-input-email" 
                            className="user-auth-form-input" 
                            type="email" 
                            placeholder="example@email.com" 
                            value={userEmail}
                            onChange={(event)=>{setUserEmail(event.target.value); setErrors({...errors, email: ''})}}
                        />
                    </div>
                    {errors.email && <span className="error-message">{errors.email}</span>}
                </div>

                <div className="user-auth-input-container">
                    <label htmlFor="user-auth-input-password"><h4>Mật khẩu</h4></label>
                    <div className={`input-wrapper ${errors.password ? 'error' : ''}`}>
                        <FaLock className="input-icon" />
                        <input 
                            id="user-auth-input-password" 
                            className="user-auth-form-input" 
                            type={showPassword ? "text" : "password"}
                            placeholder="••••••••" 
                            value={userPassword}
                            onChange={(event)=>{setUserPassword(event.target.value); setErrors({...errors, password: ''})}}
                        />
                        <button 
                            type="button"
                            className="password-toggle"
                            onClick={() => setShowPassword(!showPassword)}
                        >
                            {showPassword ? <FaEyeSlash /> : <FaEye />}
                        </button>
                    </div>
                    {errors.password && <span className="error-message">{errors.password}</span>}
                </div>

                <div className="user-options-container">
                    <div className="remember-me-container">
                        <input type="checkbox" id="remember-me"/>
                        <label htmlFor="remember-me">Ghi nhớ tôi</label>
                    </div>
                    <div>
                        <Link to="#" className="forgot-password-link">
                            Quên mật khẩu?
                        </Link>
                    </div>
                </div>

                <button 
                    type="submit" 
                    className="solid-success-btn form-user-auth-submit-btn modern-submit-btn"
                    disabled={isLoading}
                >
                    {isLoading ? (
                        <>
                            <span className="spinner"></span>
                            <span>Đang đăng nhập...</span>
                        </>
                    ) : (
                        'Đăng nhập'
                    )}
                </button>

                <div className="auth-divider">
                    <span>hoặc</span>
                </div>

                <div className="new-user-container">
                    <span>Chưa có tài khoản? </span>
                    <Link to="/signup" className="signup-link">
                        Đăng ký ngay
                    </Link>
                </div>

            </form>
        </div>
    )
}

export { Login }