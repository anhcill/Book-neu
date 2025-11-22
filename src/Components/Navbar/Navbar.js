import React, { useEffect, useState, useRef } from 'react'
import './Navbar.css'
import { Link, useLocation } from "react-router-dom"
import jwt_decode from "jwt-decode";
import { useUserLogin, useToast, useWishlist, useCart, useOrders, useSearchBar, useTheme } from "../../index"
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
    const [lastUnreadCount, setLastUnreadCount] = useState(0)
    const [shouldPulse, setShouldPulse] = useState(false)
    const mountedRef = useRef(true)
    
    // Cleanup on unmount
    useEffect(() => {
        return () => {
            mountedRef.current = false
        }
    }, [])
    
    // Scroll effect for navbar
    useEffect(() => {
        const handleScroll = () => {
            setScrolled(window.scrollY > 50)
        }
        window.addEventListener('scroll', handleScroll)
        return () => window.removeEventListener('scroll', handleScroll)
    }, [])

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
                    setUserName('')
                }
                else
                {
                    setUserLoggedIn(true)
                    setUserName(user.username || user.name || 'User')
                    dispatchUserWishlist({type:"UPDATE_USER_WISHLIST",payload:user.wishlist || []})
                    dispatchUserCart({type:"UPDATE_USER_CART",payload:user.cart || []})
                }
            } catch (error) {
                localStorage.removeItem('token')
                setUserLoggedIn(false)
                setUserName('')
            }
        } else {
            setUserLoggedIn(false)
            setUserName('')
        }
    }, [setUserLoggedIn, dispatchUserWishlist, dispatchUserCart])

    // Fetch notifications periodically
    useEffect(() => {
        let isMounted = true;
        
        const fetchNotifications = async () => {
            const token = localStorage.getItem('token')
            if (!token || !isMounted) return

            try {
                const response = await axios.get('http://localhost:5000/api/notifications', {
                    headers: { 'x-access-token': token }
                })
                
                if (mountedRef.current && isMounted) {
                    setNotifications(response.data.notifications || [])
                    const newUnreadCount = response.data.unreadCount || 0
                    
                    // Only trigger pulse animation if unread count increased
                    if (newUnreadCount > lastUnreadCount && lastUnreadCount !== 0) {
                        setShouldPulse(true)
                        // Stop animation after 6 seconds (3 pulses * 2s each)
                        setTimeout(() => setShouldPulse(false), 6000)
                    }
                    
                    setUnreadCount(newUnreadCount)
                    setLastUnreadCount(newUnreadCount)
                }
            } catch (error) {
                console.log('Error fetching notifications:', error)
                // Clear token if unauthorized
                if (error.response && error.response.status === 401 && isMounted) {
                    localStorage.removeItem('token')
                    setUserLoggedIn(false)
                }
            }
        }

        if (localStorage.getItem('token')) {
            fetchNotifications()
            // Reduced frequency from 30s to 5 minutes to prevent jumping
            const interval = setInterval(fetchNotifications, 300000)
            return () => {
                isMounted = false;
                clearInterval(interval)
            }
        }
        
        return () => {
            isMounted = false;
        }
    }, [setUserLoggedIn])

    // Fetch orders periodically
    useEffect(() => {
        let isMounted = true;
        
        const fetchOrders = async () => {
            const token = localStorage.getItem('token')
            if (!token || !isMounted) return

            try {
                const response = await axios.get('http://localhost:5000/api/orders', {
                    headers: { 'x-access-token': token }
                })
                if (mountedRef.current && isMounted) {
                    dispatchUserOrders({type:"UPDATE_USER_ORDERS",payload: response.data.orders || []})
                }
            } catch (error) {
                console.log('Error fetching orders:', error)
                // Clear token if unauthorized
                if (error.response && error.response.status === 401 && isMounted) {
                    localStorage.removeItem('token')
                    setUserLoggedIn(false)
                }
            }
        }

        if (localStorage.getItem('token')) {
            fetchOrders()
            // Reduced frequency from 10s to 2 minutes to prevent excessive calls
            const interval = setInterval(fetchOrders, 120000)
            return () => {
                isMounted = false;
                clearInterval(interval)
            }
        }
        
        return () => {
            isMounted = false;
        }
    }, [dispatchUserOrders, setUserLoggedIn])

    // Handle click outside to close dropdowns
    useEffect(() => {
        const handleClickOutside = (event) => {
            if (!event.target.closest('.notification-container')) {
                setShowNotificationDropdown(false)
            }
            if (!event.target.closest('.profile-dropdown-container')) {
                setShowProfileDropdown(false)
            }
        }

        document.addEventListener('mousedown', handleClickOutside)
        return () => document.removeEventListener('mousedown', handleClickOutside)
    }, [])

    function logoutUser() {
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
            {/* Left Section - Brand */}
            <div className="left-topbar-container">
                <Link to="/">
                    <h2 className="top-bar-brand-name">📚 Bookztron</h2>
                </Link>
                {
                    location.pathname==="/shop" && 
                    (
                        <div className="search-bar">
                            <input 
                                className="search-bar-input" 
                                placeholder="Tìm kiếm sách, tác giả, thể loại..."
                                value={searchBarTerm}
                                onChange={event=>setSearchBarTerm(event.target.value)}
                                onKeyPress={(e) => {
                                    if(e.key === 'Enter' && searchBarTerm.trim().length !== 0) {
                                        window.location.assign(`/shop?search=${searchBarTerm}`)
                                    }
                                }}
                            />
                        </div>
                    )
                }
            </div>

            {/* Right Section - Actions */}
            <div className="navbar-right">
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
                                        {userName && userName.charAt(0).toUpperCase()}
                                    </div>
                                    <span className="profile-name">{userName || 'User'}</span>
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
                  <button className="nav-action-btn" onClick={(e) => {
                    e.preventDefault();
                    e.stopPropagation();
                    setShowNotificationDropdown(!showNotificationDropdown);
                    // Stop pulse animation when notification is opened
                    if (!showNotificationDropdown) {
                      setShouldPulse(false);
                    }
                  }}>
                    <div className="nav-btn-content">
                      <i className="fa fa-bell nav-icon"></i>
                      <span className="nav-text">Thông báo</span>
                      {unreadCount > 0 && <span className={`count-badge ${shouldPulse ? 'has-unread' : ''}`}>{unreadCount}</span>}
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

                {/* Theme Toggle Button */}
                <button 
                    className="theme-toggle-btn"
                    onClick={toggleTheme}
                    title={isDarkMode ? 'Chế độ sáng' : 'Chế độ tối'}
                >
                    {isDarkMode ? <FaSun className="theme-icon" /> : <FaMoon className="theme-icon" />}
                </button>
            </div>
        </div>
    )
}

// === SỬA LỖI BIÊN DỊCH: Đổi thành "named export" ===
export {Navbar};