import React, { useState } from "react"
import "./UserAuth.css"
import { Link, useNavigate } from "react-router-dom"
import axios from "axios"
import { useToast } from "../../Context/toast-context"
import { FaEye, FaEyeSlash, FaEnvelope, FaLock, FaUserPlus } from 'react-icons/fa'

function Signup()
{
    const { showToast } = useToast()

    const [termsAndConditionsCheckbox, setTermsAndConditionsCheckbox] = useState(false)
    const [newUserName    , setNewUserName]    = useState('')
    const [newUserEmail   , setNewUserEmail]   = useState('')
    const [newUserPassword , setNewUserPassword] = useState('')
    const [showPassword, setShowPassword] = useState(false)
    const [isLoading, setIsLoading] = useState(false)
    const [errors, setErrors] = useState({})

    const navigate = useNavigate()

    const validateForm = () => {
        const newErrors = {}
        if (!newUserName) {
            newErrors.name = 'Tên không được để trống'
        } else if (newUserName.length < 3) {
            newErrors.name = 'Tên phải có ít nhất 3 ký tự'
        }
        if (!newUserEmail) {
            newErrors.email = 'Email không được để trống'
        } else if (!/\S+@\S+\.\S+/.test(newUserEmail)) {
            newErrors.email = 'Email không hợp lệ'
        }
        if (!newUserPassword) {
            newErrors.password = 'Mật khẩu không được để trống'
        } else if (newUserPassword.length < 6) {
            newErrors.password = 'Mật khẩu phải có ít nhất 6 ký tự'
        }
        setErrors(newErrors)
        return Object.keys(newErrors).length === 0
    }

    function signupUser(event)
    {
        event.preventDefault();
        
        if (!validateForm()) {
            showToast("error","","Vui lòng kiểm tra lại thông tin")
            return
        }
        
        setIsLoading(true)
        // --- SỬA URL ---
        axios.post(
            "http://localhost:5000/api/signup", // URL MỚI
            {
                newUserName: `${newUserName}`,
                newUserEmail: `${newUserEmail}`,
                newUserPassword : `${newUserPassword}`
            }
        )
        .then(res => {
            setIsLoading(false)
            // Backend mới trả về 'status: ok' khi thành công
            if(res.data.status==='ok')
            {
                //User created successfully, navigate to Login Page
                showToast("success","","Đăng ký thành công! Vui lòng đăng nhập")
                navigate('/login')
            }
            else
            {
                throw new Error("Error occured while creating new user")
            }
        })
        .catch(err=>{
            setIsLoading(false)
            const errorMsg = err.response?.data?.message || "Lỗi tạo tài khoản. Vui lòng thử lại"
            showToast("error","",errorMsg)
        })
    }

    return (
        <div className="user-auth-content-container">
            <form onSubmit={signupUser} className="user-auth-form modern-auth-form">
                <div className="auth-header">
                    <div className="auth-icon signup-icon">
                        <FaUserPlus />
                    </div>
                    <h2 className="auth-title">Đăng Ký</h2>
                    <p className="auth-subtitle">Tạo tài khoản mới để bắt đầu</p>
                </div>
                
                <div className="user-auth-input-container">
                    <label htmlFor="user-auth-input-name"><h4>Họ và tên</h4></label>
                    <div className={`input-wrapper ${errors.name ? 'error' : ''}`}>
                        <FaUserPlus className="input-icon" />
                        <input 
                            id="user-auth-input-name" 
                            className="user-auth-form-input" 
                            type="text" 
                            placeholder="Nguyễn Văn A" 
                            value={newUserName}
                            onChange={(event)=>{setNewUserName(event.target.value); setErrors({...errors, name: ''})}}
                        />
                    </div>
                    {errors.name && <span className="error-message">{errors.name}</span>}
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
                            value={newUserEmail}
                            onChange={(event)=>{setNewUserEmail(event.target.value); setErrors({...errors, email: ''})}}
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
                            value={newUserPassword}
                            onChange={(event)=>{setNewUserPassword(event.target.value); setErrors({...errors, password: ''})}}
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

                <div className="accept-terms-container">
                    <input 
                        type="checkbox" 
                        id="accept-terms" 
                        checked={termsAndConditionsCheckbox}
                        onChange={()=>setTermsAndConditionsCheckbox(prevState=>!prevState)}
                    />
                    <label htmlFor="accept-terms">Tôi đồng ý với <Link to="#" className="terms-link">điều khoản và điều kiện</Link></label>
                </div>

                <button 
                    type="submit" 
                    className="solid-success-btn form-user-auth-submit-btn modern-submit-btn" 
                    disabled={!termsAndConditionsCheckbox || isLoading}
                >
                    {isLoading ? (
                        <>
                            <span className="spinner"></span>
                            <span>Đang đăng ký...</span>
                        </>
                    ) : (
                        'Tạo tài khoản'
                    )}
                </button>

                <div className="auth-divider">
                    <span>hoặc</span>
                </div>

                <div className="existing-user-container">
                    <span>Đã có tài khoản? </span>
                    <Link to="/login" className="signup-link">
                        Đăng nhập ngay
                    </Link>
                </div>

            </form>
        </div>
    )
}

export { Signup }