import React, { useState, useEffect } from 'react'
import axios from 'axios'
import './OrderAnalytics.css'
import { useToast } from '../../Context/toast-context'

const OrderAnalytics = () => {
  const [analytics, setAnalytics] = useState(null)
  const [loading, setLoading] = useState(true)
  const [chartData, setChartData] = useState(null)
  const [dateRange, setDateRange] = useState('month') // week, month, year
  const [selectedMetric, setSelectedMetric] = useState('revenue') // revenue, orders, growth
  const { showToast } = useToast()

  useEffect(() => {
    fetchAnalytics()
  }, [dateRange])

  const fetchAnalytics = async () => {
    try {
      setLoading(true)
      const token = localStorage.getItem('token')
      const response = await axios.get('http://localhost:5000/api/admin/orders/analytics', {
        params: { range: dateRange },
        headers: { 'x-access-token': token }
      })
      
      if (response.data.status === 'ok') {
        setAnalytics(response.data.analytics)
        prepareChartData(response.data.analytics)
      }
    } catch (error) {
      showToast('error', '', 'Lỗi khi tải dữ liệu phân tích')
      console.error(error)
    } finally {
      setLoading(false)
    }
  }

  const prepareChartData = (data) => {
    // Create simple data structures for visualization
    setChartData({
      ordersByStatus: data.ordersByStatus,
      revenueByDay: data.revenueByDay || [],
      topProducts: data.topProducts || [],
      customerMetrics: data.customerMetrics || {}
    })
  }

  const renderChart = () => {
    if (!chartData) return null

    const maxValue = Math.max(...chartData.revenueByDay.map(d => d.revenue || 0))

    return (
      <div className="chart-container">
        <h3>Doanh thu theo ngày</h3>
        <div className="bar-chart">
          {chartData.revenueByDay.slice(0, 7).map((item, idx) => (
            <div key={idx} className="bar-item">
              <div className="bar-wrapper">
                <div 
                  className="bar"
                  style={{ height: `${(item.revenue / maxValue) * 100}%` }}
                  title={`${item.revenue?.toLocaleString('vi-VN')}đ`}
                />
              </div>
              <span className="bar-label">{new Date(item.date).toLocaleDateString('vi-VN', {month: '2-digit', day: '2-digit'})}</span>
            </div>
          ))}
        </div>
      </div>
    )
  }

  const renderOrderStatus = () => {
    if (!chartData || !chartData.ordersByStatus) return null

    return (
      <div className="status-breakdown">
        <h3>Phân bổ theo trạng thái</h3>
        <div className="status-grid">
          {Object.entries(chartData.ordersByStatus).map(([status, count]) => (
            <div key={status} className="status-item">
              <div className={`status-bar status-${status}`}>
                <span className="status-count">{count}</span>
              </div>
              <span className="status-name">{status}</span>
            </div>
          ))}
        </div>
      </div>
    )
  }

  const renderTopProducts = () => {
    if (!chartData || !chartData.topProducts || chartData.topProducts.length === 0) {
      return null
    }

    return (
      <div className="top-products-container">
        <h3>📚 Top Sản phẩm bán chạy</h3>
        <table className="top-products-table">
          <thead>
            <tr>
              <th>Sản phẩm</th>
              <th>Số lượng bán</th>
              <th>Doanh thu</th>
              <th>% Tổng</th>
            </tr>
          </thead>
          <tbody>
            {chartData.topProducts.map((product, idx) => {
              const percentage = analytics?.totalRevenue 
                ? ((product.totalRevenue / analytics.totalRevenue) * 100).toFixed(1)
                : 0
              return (
                <tr key={idx}>
                  <td className="product-name">{product.productName}</td>
                  <td className="quantity">{product.quantity}</td>
                  <td className="revenue">{product.totalRevenue?.toLocaleString('vi-VN')}đ</td>
                  <td className="percentage">{percentage}%</td>
                </tr>
              )
            })}
          </tbody>
        </table>
      </div>
    )
  }

  if (loading) {
    return (
      <div className="analytics-container">
        <div className="loader">
          <div className="spinner"></div>
          <p>Đang tải dữ liệu phân tích...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="analytics-container">
      <div className="analytics-header">
        <h1>📊 Phân tích Đơn hàng</h1>
        <div className="date-range-selector">
          <button 
            className={`range-btn ${dateRange === 'week' ? 'active' : ''}`}
            onClick={() => setDateRange('week')}
          >
            Tuần
          </button>
          <button 
            className={`range-btn ${dateRange === 'month' ? 'active' : ''}`}
            onClick={() => setDateRange('month')}
          >
            Tháng
          </button>
          <button 
            className={`range-btn ${dateRange === 'year' ? 'active' : ''}`}
            onClick={() => setDateRange('year')}
          >
            Năm
          </button>
        </div>
      </div>

      {/* Main Stats */}
      {analytics && (
        <>
          <div className="main-stats-grid">
            <div className="stat-card primary">
              <div className="stat-label">💰 Doanh thu</div>
              <div className="stat-value">{analytics.totalRevenue?.toLocaleString('vi-VN')}đ</div>
              <div className="stat-change positive">
                ↑ {analytics.revenueGrowth?.toFixed(1) || 0}% so với kỳ trước
              </div>
            </div>

            <div className="stat-card secondary">
              <div className="stat-label">📦 Tổng đơn hàng</div>
              <div className="stat-value">{analytics.totalOrders}</div>
              <div className="stat-change">
                {analytics.ordersThisPeriod} đơn trong kỳ này
              </div>
            </div>

            <div className="stat-card">
              <div className="stat-label">👥 Khách hàng</div>
              <div className="stat-value">{analytics.uniqueCustomers}</div>
              <div className="stat-change">
                +{analytics.newCustomersThisPeriod} khách hàng mới
              </div>
            </div>

            <div className="stat-card">
              <div className="stat-label">📊 AOV</div>
              <div className="stat-value">{(analytics.averageOrderValue)?.toLocaleString('vi-VN')}đ</div>
              <div className="stat-change">Giá trị trung bình/đơn</div>
            </div>
          </div>

          {/* Charts Section */}
          <div className="charts-section">
            <div className="chart-grid">
              {renderChart()}
              {renderOrderStatus()}
            </div>

            {/* Top Products */}
            {renderTopProducts()}
          </div>

          {/* Customer Metrics */}
          {chartData.customerMetrics && (
            <div className="customer-metrics">
              <h3>👥 Chỉ số khách hàng</h3>
              <div className="metrics-grid">
                <div className="metric-item">
                  <span className="metric-label">Repeat customers</span>
                  <span className="metric-value">{chartData.customerMetrics.repeatCustomers || 0}</span>
                </div>
                <div className="metric-item">
                  <span className="metric-label">One-time customers</span>
                  <span className="metric-value">{chartData.customerMetrics.oneTimeCustomers || 0}</span>
                </div>
                <div className="metric-item">
                  <span className="metric-label">Avg orders/customer</span>
                  <span className="metric-value">{(chartData.customerMetrics.avgOrdersPerCustomer || 0).toFixed(1)}</span>
                </div>
                <div className="metric-item">
                  <span className="metric-label">Retention rate</span>
                  <span className="metric-value">{((chartData.customerMetrics.retentionRate || 0) * 100).toFixed(1)}%</span>
                </div>
              </div>
            </div>
          )}

          {/* Summary Stats */}
          <div className="summary-stats">
            <h3>📈 Tóm tắt</h3>
            <div className="summary-grid">
              <div className="summary-item">
                <span className="label">Pending</span>
                <span className="value">{analytics.ordersByStatus?.pending || 0}</span>
              </div>
              <div className="summary-item">
                <span className="label">Confirmed</span>
                <span className="value">{analytics.ordersByStatus?.confirmed || 0}</span>
              </div>
              <div className="summary-item">
                <span className="label">Shipping</span>
                <span className="value">{analytics.ordersByStatus?.shipping || 0}</span>
              </div>
              <div className="summary-item">
                <span className="label">Delivered</span>
                <span className="value">{analytics.ordersByStatus?.delivered || 0}</span>
              </div>
              <div className="summary-item danger">
                <span className="label">Cancelled</span>
                <span className="value">{analytics.ordersByStatus?.cancelled || 0}</span>
              </div>
            </div>
          </div>
        </>
      )}
    </div>
  )
}

export default OrderAnalytics
