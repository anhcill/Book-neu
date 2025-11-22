import React, { useEffect, useState } from 'react'
import './Navbar.css'
import { Link, useLocation } from "react-router-dom"
import jwt_decode from "jwt-decode";
import { useUserLogin, useToast, useWishlist, useCart, useOrders, useSearchBar, useTheme } from "../../index"
import { BsShopWindow, BsFillBagFill } from "react-icons/bs"
import { FaMoon, FaSun } from 'react-icons/fa'
import axios from 'axios'

function Navbar() {

    const { userWishlist, dispatchUserWishlist } = useWishlist()
    const { userCart, dispatchUserCart } = useCart()
    const { userOrders, dispatchUserOrders } = useOrders()
    const { setUserLoggedIn, userRole, setUserRole } = useUserLogin(false)
    const { showToast } = useToast()
    const { isDarkMode, toggleTheme } = useTheme()
    const location = useLocation()
    const { searchBarTerm, setSearchBarTerm } = useSearchBar()
    const [notifications, setNotifications] = useState([])
    const [showNotificationDropdown, setShowNotificationDropdown] = useState(false)
    const [showProfileDropdown, setShowProfileDropdown] = useState(false)
    const [unreadCount, setUnreadCount] = useState(0)
    const [scrolled, setScrolled] = useState(false)
    const [userName, setUserName] = useState('')
    
    // Scroll effect for navbar
    useEffect(() => {
        const handleScroll = () => {
            setScrolled(window.scrollY > 50)
        }
        window.addEventListener('scroll', handleScroll)
        return () => window.removeEventListener('scroll', handleScroll)
    }, [])

    // Khối useEffect này đã an toàn (vì nó kiểm tra 'if (token)')
    useEffect(()=>{
        const token=localStorage.getItem('token')
        if(token)
        {
            try {
                const user = jwt_decode(token) 
                if(!user)
                {
                    localStorage.removeItem('token')
                    setUserLoggedIn(false)
                }
                else
                {
                    setUserLoggedIn(true)
                    setUserName(user.name || user.email || 'User')
                    // Fetch notifications
                    fetchNotifications(token)
                }
            } catch (e) {
                // Xử lý trường hợp token bị hỏng hoặc không hợp lệ
                localStorage.removeItem('token');
                setUserLoggedIn(false);
            }
        }
    },[setUserLoggedIn]) // Đã thêm dependency

    // Fetch notifications from API
    const fetchNotifications = async (token) => {
      try {
        const response = await axios.get('http://localhost:5000/api/notifications', {
          headers: { 'x-access-token': token }
        })
        setNotifications(response.data.notifications || [])
        setUnreadCount(response.data.unreadCount || 0)
      } catch (error) {
        console.error('Lỗi khi tải thông báo:', error)
      }
    }

    // Periodic fetch notifications every 30 seconds
    useEffect(() => {
      const token = localStorage.getItem('token')
      if (token) {
        const interval = setInterval(() => {
          fetchNotifications(token)
        }, 30000)
        return () => clearInterval(interval)
      }
    }, [])

    useEffect(()=>{
        function handleInvalidToken() {
            if(localStorage.getItem('token')!==null)
            {
                setUserLoggedIn(true)
            }
            else
            {
                setUserLoggedIn(false)
                dispatchUserWishlist({type:"UPDATE_USER_WISHLIST",payload:[]})
                dispatchUserCart({type:"UPDATE_USER_CART",payload:[]})
                dispatchUserOrders({type:"UPDATE_USER_ORDERS",payload:[]})
            }
        }
        window.addEventListener("storage",handleInvalidToken)

        return function cleanup() {
            window.removeEventListener('storage', handleInvalidToken)
        }
    },[dispatchUserCart, dispatchUserWishlist, dispatchUserOrders, setUserLoggedIn]) // Đã thêm dependencies

    // Close dropdowns when clicking outside
    useEffect(() => {
        const handleClickOutside = (event) => {
            if (!event.target.closest('.profile-dropdown-container')) {
                setShowProfileDropdown(false)
            }
            if (!event.target.closest('.notification-container')) {
                setShowNotificationDropdown(false)
            }
        }
        document.addEventListener('mousedown', handleClickOutside)
        return () => document.removeEventListener('mousedown', handleClickOutside)
    }, [])

    function logoutUser()
    {
        localStorage.removeItem('token')
        dispatchUserWishlist({type:"UPDATE_USER_WISHLIST",payload:[]})
        dispatchUserCart({type:"UPDATE_USER_CART",payload:[]})
        dispatchUserOrders({type:"UPDATE_USER_ORDERS",payload:[]})
        setUserLoggedIn(false)
        localStorage.clear()
        showToast("success","","Đã đăng xuất thành công")
    }

    function switchRole() {
        const newRole = userRole === 'admin' ? 'user' : 'admin'
        setUserRole(newRole)
        setShowProfileDropdown(false)
        showToast('success', '', `Chuyển sang chế độ ${newRole === 'admin' ? 'Admin' : 'Khách hàng'}`)
    }
    
    return (
        <div className={`top-bar ${scrolled ? 'scrolled' : ''}`}>
            <div className="left-topbar-container">
                <Link to="/">
                    <h2 className="top-bar-brand-name">Bookztron</h2>
                </Link>
                {
                    location.pathname==="/shop" && 
                    (
                        <div className="search-bar">
                            <input 
                                className="search-bar-input" 
                                placeholder="Tìm kiếm" // Dịch
                                value={searchBarTerm}
                                onChange={event=>setSearchBarTerm(event.target.value)}
                            />
                        </div>
                    )
                }
            </div>
            <div className="navbar-right">
                {/* Action Buttons */}
                <Link to="/shop" className="nav-action-btn">
                    <div className="nav-btn-content">
                        <i className="fa fa-book nav-icon"></i>
                        <span className="nav-text">Cửa hàng</span>
                    </div>
                </Link>
                
                {/* Notification Bell */}
                {localStorage.getItem('token') && (
                  <div className="notification-container">
                  <button className="nav-action-btn" onClick={() => setShowNotificationDropdown(!showNotificationDropdown)}>
                    <div className="nav-btn-content">
                      <i className="fa fa-bell nav-icon"></i>
                      <span className="nav-text">Thông báo</span>
                      {unreadCount > 0 && <span className="count-badge">{unreadCount}</span>}
                    </div>

                {
                    localStorage.getItem('token')!==null
                    ? (
                        <>
                            {/* Profile Dropdown */}
                            <div className="profile-dropdown-container">
                                <button 
                                    className="profile-btn"
                                    onClick={() => setShowProfileDropdown(!showProfileDropdown)}
                                >
                                    <div className="profile-avatar">
                                        {userName.charAt(0).toUpperCase()}
                                    </div>
                                    <span className="profile-name">{userName}</span>
                                    <i className={`fa fa-chevron-${showProfileDropdown ? 'up' : 'down'}`}></i>
                                </button>
                                {showProfileDropdown && (
                                    <div className="profile-dropdown">
                                        <div className="profile-dropdown-header">
                                            <div className="profile-avatar-large">
                                                {userName.charAt(0).toUpperCase()}
                                            </div>
                                            <div className="profile-info">
                                                <h4>{userName}</h4>
                                                <p>{userRole === 'admin' ? 'Quản trị viên' : 'Khách hàng'}</p>
                                            </div>
                                        </div>
                                        <div className="profile-dropdown-divider"></div>
                                        <Link to="/profile" onClick={() => setShowProfileDropdown(false)}>
                                            <button className="profile-dropdown-item">
                                                <i className="fa fa-user"></i>
                                                Trang cá nhân
                                            </button>
                                        </Link>
                                        <button 
                                            className="profile-dropdown-item"
                                            onClick={() => {
                                                switchRole()
                                                setShowProfileDropdown(false)
                                            }}
                                        >
                                            <i className="fa fa-refresh"></i>
                                            Chuyển chế độ
                                        </button>
                                        <div className="profile-dropdown-divider"></div>
                                        <button 
                                            className="profile-dropdown-item logout-item"
                                            onClick={() => {
                                                logoutUser()
                                                setShowProfileDropdown(false)
                                            }}
                                        >
                                            <i className="fa fa-sign-out"></i>
                                            Đăng xuất
                                        </button>
                                    </div>
                                )}
                            </div>
                        </>
                    )
                    : (
                        <Link to="/login">
                            <button className="navbar-login-btn solid-primary-btn">Đăng nhập</button>
                        </Link>
                    )
                }
                {/* Action Buttons */}
                <Link to="/shop" className="nav-action-btn">
                    <div className="nav-btn-content">
                        <i className="fa fa-book nav-icon"></i>
                        <span className="nav-text">Cửa hàng</span>
                    </div>
                </Link>
                
                {/* Notification Bell */}
                {localStorage.getItem('token') && (
                  <div className="notification-container">
                  <button className="nav-action-btn" onClick={() => setShowNotificationDropdown(!showNotificationDropdown)}>
                    <div className="nav-btn-content">
                      <i className="fa fa-bell nav-icon"></i>
                      <span className="nav-text">Thông báo</span>
                      {unreadCount > 0 && <span className="count-badge">{unreadCount}</span>}
                    </div>
                  </button>
                  {/* Notification Dropdown */}
                  {showNotificationDropdown && (
                  <div className="notification-dropdown">
                    <h3>Thông báo</h3>
                    {notifications.length === 0 ? (
                      <p className="no-notifications">Không có thông báo nào</p>
                    ) : (
                      <div className="notifications-list">
                        {notifications.slice(0, 5).map(notif => (
                          <div key={notif.id} className={`notification-item ${notif.isRead ? 'read' : 'unread'}`}>
                            <p className="notif-title">{notif.title}</p>
                            <p className="notif-message">{notif.message}</p>
                            <small>{new Date(notif.createdAt).toLocaleDateString('vi-VN')}</small>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                  )}
                  </div>
                )}
                <Link to="/wishlist" className="nav-action-btn">
                    <div className="nav-btn-content">
                        <i className="fa fa-heart nav-icon"></i>
                        <span className="nav-text">Yêu thích</span>
                        {
                            userWishlist.length!==0
                            && (<span className="count-badge">{userWishlist.length}</span>)
                        }
                    </div>
                </Link>
                
                <Link to="/cart" className="nav-action-btn cart-btn">
                    <div className="nav-btn-content">
                        <i className="fa fa-shopping-cart nav-icon"></i>
                        <span className="nav-text">Giỏ hàng</span>
                        {
                            userCart.length!==0
                            && (<span className="count-badge cart-count">{userCart.length}</span>)
                        }
                    </div>
                </Link>
                
                <Link to="/delivery-history" className="nav-action-btn">
                    <div className="nav-btn-content">
                        <i className="fa fa-truck nav-icon"></i>
                        <span className="nav-text">Giao hàng</span>
                    </div>
                </Link>
                
                <Link to="/orders" className="nav-action-btn">
                    <div className="nav-btn-content">
                        <i className="fa fa-list-alt nav-icon"></i>
                        <span className="nav-text">Đơn hàng</span>
                        {
                            userOrders.length!==0
                            && (<span className="count-badge">{userOrders.length}</span>)
                        }
                    </div>
                </Link>
            </div>
        </div>
    )
}

// === SỬA LỖI BIÊN DỊCH: Đổi thành "named export" ===
export {Navbar};