import React, { useState, useEffect } from 'react'
import './Analytics.css'
import axios from 'axios'
import { FaBox, FaDollarSign, FaUsers, FaChartLine, FaTrophy, FaExclamationTriangle } from 'react-icons/fa'

function Analytics() {
    const [analytics, setAnalytics] = useState(null)
    const [loading, setLoading] = useState(true)
    const [activeTab, setActiveTab] = useState('products') // products, revenue, customers

    useEffect(() => {
        fetchAnalytics()
    }, [activeTab])

    const fetchAnalytics = async () => {
        try {
            setLoading(true)
            const token = localStorage.getItem('token')
            const response = await axios.get(
                `http://localhost:5000/api/admin/analytics/${activeTab}`,
                { headers: { 'x-access-token': token } }
            )
            setAnalytics(response.data.analytics)
            setLoading(false)
        } catch (error) {
            console.error('Lỗi khi tải phân tích:', error)
            setLoading(false)
        }
    }

    const formatCurrency = (amount) => {
        return new Intl.NumberFormat('vi-VN', {
            style: 'currency',
            currency: 'VND'
        }).format(amount)
    }

    if (loading) {
        return (
            <div className="analytics-loading">
                <div className="spinner-large"></div>
                <p>Đang tải dữ liệu phân tích...</p>
            </div>
        )
    }

    return (
        <div className="analytics-container">
            <div className="analytics-header">
                <h1><FaChartLine /> Phân Tích & Thống Kê</h1>
                <div className="analytics-tabs">
                    <button 
                        className={`tab-btn ${activeTab === 'products' ? 'active' : ''}`}
                        onClick={() => setActiveTab('products')}
                    >
                        <FaBox /> Sản phẩm
                    </button>
                    <button 
                        className={`tab-btn ${activeTab === 'revenue' ? 'active' : ''}`}
                        onClick={() => setActiveTab('revenue')}
                    >
                        <FaDollarSign /> Doanh thu
                    </button>
                    <button 
                        className={`tab-btn ${activeTab === 'customers' ? 'active' : ''}`}
                        onClick={() => setActiveTab('customers')}
                    >
                        <FaUsers /> Khách hàng
                    </button>
                </div>
            </div>

            {/* Products Analytics */}
            {activeTab === 'products' && analytics && (
                <div className="analytics-content">
                    {/* Overview Cards */}
                    <div className="stats-grid">
                        <div className="stat-card primary">
                            <FaBox className="stat-icon" />
                            <div className="stat-info">
                                <h3>{analytics.overview?.totalProducts || 0}</h3>
                                <p>Tổng sản phẩm</p>
                            </div>
                        </div>
                        <div className="stat-card success">
                            <FaDollarSign className="stat-icon" />
                            <div className="stat-info">
                                <h3>{formatCurrency(analytics.overview?.totalRevenue || 0)}</h3>
                                <p>Tổng doanh thu</p>
                            </div>
                        </div>
                        <div className="stat-card warning">
                            <FaExclamationTriangle className="stat-icon" />
                            <div className="stat-info">
                                <h3>{analytics.overview?.unsoldProductsCount || 0}</h3>
                                <p>Sản phẩm chưa bán</p>
                            </div>
                        </div>
                    </div>

                    {/* Best Sellers */}
                    <div className="analytics-section">
                        <h2><FaTrophy /> Top 10 Sản Phẩm Bán Chạy</h2>
                        <div className="product-list">
                            {analytics.bestSellers?.map((item, index) => (
                                <div key={item.product.id} className="product-item">
                                    <div className="rank">{index + 1}</div>
                                    <img src={item.product.imageUrl} alt={item.product.title} />
                                    <div className="product-info">
                                        <h4>{item.product.title}</h4>
                                        <p>{item.product.author}</p>
                                        <span className="category">{item.product.category}</span>
                                    </div>
                                    <div className="product-stats">
                                        <div className="stat">
                                            <span className="label">Đã bán</span>
                                            <span className="value">{item.totalSold}</span>
                                        </div>
                                        <div className="stat">
                                            <span className="label">Doanh thu</span>
                                            <span className="value success">{formatCurrency(item.totalRevenue)}</span>
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>

                    {/* Revenue by Category */}
                    <div className="analytics-section">
                        <h2>Doanh Thu Theo Danh Mục</h2>
                        <div className="category-revenue">
                            {analytics.revenueByCategory?.map((cat) => (
                                <div key={cat.category} className="category-item">
                                    <div className="category-header">
                                        <h4>{cat.category}</h4>
                                        <span className="revenue">{formatCurrency(cat.revenue)}</span>
                                    </div>
                                    <div className="category-stats">
                                        <span>Đã bán: {cat.totalSold} sản phẩm</span>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>

                    {/* Unsold Products */}
                    {analytics.unsoldProducts?.length > 0 && (
                        <div className="analytics-section">
                            <h2><FaExclamationTriangle /> Sản Phẩm Chưa Bán ({analytics.unsoldProducts.length})</h2>
                            <div className="unsold-grid">
                                {analytics.unsoldProducts.slice(0, 12).map((product) => (
                                    <div key={product.id} className="unsold-card">
                                        <img src={product.imageUrl} alt={product.title} />
                                        <h5>{product.title}</h5>
                                        <p>{product.author}</p>
                                        <span className="price">{formatCurrency(product.discountedPrice)}</span>
                                    </div>
                                ))}
                            </div>
                        </div>
                    )}

                    {/* Sales Trend */}
                    {analytics.salesTrend?.length > 0 && (
                        <div className="analytics-section">
                            <h2>Xu Hướng Bán Hàng (30 Ngày Gần Đây)</h2>
                            <div className="trend-chart">
                                {analytics.salesTrend.map((day) => (
                                    <div key={day.date} className="trend-bar">
                                        <div 
                                            className="bar" 
                                            style={{height: `${(day.revenue / Math.max(...analytics.salesTrend.map(d => d.revenue))) * 100}%`}}
                                        ></div>
                                        <span className="date">{new Date(day.date).toLocaleDateString('vi-VN', {month: 'short', day: 'numeric'})}</span>
                                    </div>
                                ))}
                            </div>
                        </div>
                    )}
                </div>
            )}

            {/* Revenue Analytics */}
            {activeTab === 'revenue' && analytics && (
                <div className="analytics-content">
                    <div className="analytics-section">
                        <h2>Doanh Thu Theo Tháng</h2>
                        <table className="analytics-table">
                            <thead>
                                <tr>
                                    <th>Tháng/Năm</th>
                                    <th>Số đơn hàng</th>
                                    <th>Doanh thu</th>
                                </tr>
                            </thead>
                            <tbody>
                                {analytics.monthlyRevenue?.map((month) => (
                                    <tr key={`${month.year}-${month.month}`}>
                                        <td>{month.month}/{month.year}</td>
                                        <td>{month.orderCount}</td>
                                        <td className="revenue">{formatCurrency(month.revenue)}</td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>

                    <div className="analytics-section">
                        <h2>Doanh Thu Theo Phương Thức Thanh Toán</h2>
                        <div className="payment-methods">
                            {analytics.revenueByPaymentMethod?.map((method) => {
                                let paymentLabel = 'Khác';
                                if (method.paymentMethod === 'COD') paymentLabel = 'Thanh toán khi nhận hàng';
                                else if (method.paymentMethod === 'VNPAY') paymentLabel = 'VNPay';
                                else if (method.paymentMethod === 'STRIPE') paymentLabel = 'Stripe';
                                
                                return (
                                    <div key={method.paymentMethod} className="payment-card">
                                        <h3>{paymentLabel}</h3>
                                        <div className="payment-stats">
                                            <div>
                                                <span className="label">Số đơn</span>
                                                <span className="value">{method.orderCount}</span>
                                            </div>
                                            <div>
                                                <span className="label">Doanh thu</span>
                                                <span className="value success">{formatCurrency(method.revenue)}</span>
                                            </div>
                                        </div>
                                    </div>
                                );
                            })}
                        </div>
                    </div>
                </div>
            )}

            {/* Customer Analytics */}
            {activeTab === 'customers' && analytics && (
                <div className="analytics-content">
                    <div className="stats-grid">
                        <div className="stat-card info">
                            <FaUsers className="stat-icon" />
                            <div className="stat-info">
                                <h3>{analytics.newCustomers || 0}</h3>
                                <p>Khách hàng mới (30 ngày)</p>
                            </div>
                        </div>
                    </div>

                    <div className="analytics-section">
                        <h2><FaTrophy /> Top 10 Khách Hàng VIP</h2>
                        <table className="analytics-table">
                            <thead>
                                <tr>
                                    <th>Hạng</th>
                                    <th>Tên</th>
                                    <th>Email</th>
                                    <th>Số đơn hàng</th>
                                    <th>Tổng chi tiêu</th>
                                </tr>
                            </thead>
                            <tbody>
                                {analytics.topCustomers?.map((customer, index) => (
                                    <tr key={customer.user.id}>
                                        <td className="rank">{index + 1}</td>
                                        <td>{customer.user.username}</td>
                                        <td>{customer.user.email}</td>
                                        <td>{customer.orderCount}</td>
                                        <td className="revenue">{formatCurrency(customer.totalSpent)}</td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </div>
            )}
        </div>
    )
}

export default Analytics
