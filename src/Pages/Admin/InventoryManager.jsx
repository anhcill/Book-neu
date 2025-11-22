import React, { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import axios from 'axios'
import { FaExclamationTriangle, FaBoxes, FaArrowUp, FaArrowDown, FaEdit } from 'react-icons/fa'
import './InventoryManager.css'

function InventoryManager() {
    const navigate = useNavigate()
    const [alerts, setAlerts] = useState({ lowStock: [], outOfStock: [] })
    const [stats, setStats] = useState({})
    const [loading, setLoading] = useState(true)
    const [threshold, setThreshold] = useState(10)
    const [editingStock, setEditingStock] = useState({})

    useEffect(() => {
        fetchInventoryData()
    }, [threshold])

    const fetchInventoryData = async () => {
        try {
            const token = localStorage.getItem('token')
            
            const [alertsRes, statsRes] = await Promise.all([
                axios.get(`http://localhost:5000/api/inventory/alerts?threshold=${threshold}`, {
                    headers: { 'x-access-token': token }
                }),
                axios.get('http://localhost:5000/api/inventory/stats', {
                    headers: { 'x-access-token': token }
                })
            ])

            setAlerts(alertsRes.data)
            setStats(statsRes.data.stats)
            setLoading(false)
        } catch (error) {
            console.error('Error fetching inventory:', error)
            setLoading(false)
        }
    }

    const handleStockUpdate = async (productId, newStock, action = 'set') => {
        try {
            const token = localStorage.getItem('token')
            await axios.put(
                `http://localhost:5000/api/inventory/${productId}/stock`,
                { stock: newStock, action },
                { headers: { 'x-access-token': token } }
            )
            
            alert('Cập nhật tồn kho thành công!')
            fetchInventoryData()
            setEditingStock({})
        } catch (error) {
            alert('Lỗi khi cập nhật tồn kho')
        }
    }

    const formatCurrency = (amount) => {
        return new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(amount)
    }

    if (loading) {
        return <div className="loading">Đang tải dữ liệu tồn kho...</div>
    }

    return (
        <div className="inventory-container">
            <div className="inventory-header">
                <button className="btn-back" onClick={() => navigate('/admin')}>
                    ← Quay lại
                </button>
                <h1><FaBoxes /> Quản Lý Tồn Kho</h1>
                <div className="threshold-control">
                    <label>Ngưỡng cảnh báo:</label>
                    <select
                        value={threshold}
                        onChange={(e) => setThreshold(parseInt(e.target.value))}
                    >
                        <option value="5">≤ 5 sản phẩm</option>
                        <option value="10">≤ 10 sản phẩm</option>
                        <option value="20">≤ 20 sản phẩm</option>
                        <option value="50">≤ 50 sản phẩm</option>
                    </select>
                </div>
            </div>

            {/* Stats Overview */}
            <div className="inventory-stats">
                <div className="stat-card total">
                    <FaBoxes className="stat-icon" />
                    <div>
                        <h3>{stats.totalProducts}</h3>
                        <p>Tổng sản phẩm</p>
                    </div>
                </div>
                <div className="stat-card in-stock">
                    <div className="stat-icon">✅</div>
                    <div>
                        <h3>{stats.inStockProducts}</h3>
                        <p>Còn hàng</p>
                    </div>
                </div>
                <div className="stat-card low-stock">
                    <FaExclamationTriangle className="stat-icon" />
                    <div>
                        <h3>{alerts.alerts?.lowStockCount || 0}</h3>
                        <p>Tồn kho thấp</p>
                    </div>
                </div>
                <div className="stat-card out-stock">
                    <div className="stat-icon">❌</div>
                    <div>
                        <h3>{alerts.alerts?.outOfStockCount || 0}</h3>
                        <p>Hết hàng</p>
                    </div>
                </div>
            </div>

            {/* Stock Distribution Chart */}
            <div className="stock-distribution">
                <h2>Phân Bố Tồn Kho</h2>
                <div className="distribution-bars">
                    {stats.stockRanges && (
                        <>
                            <div className="bar-item">
                                <span className="label">Hết hàng</span>
                                <div className="bar out-of-stock">
                                    <div 
                                        className="bar-fill" 
                                        style={{ width: `${(stats.stockRanges.outOfStock / stats.totalProducts) * 100}%` }}
                                    ></div>
                                </div>
                                <span>{stats.stockRanges.outOfStock}</span>
                            </div>
                            <div className="bar-item">
                                <span className="label">Thấp (1-10)</span>
                                <div className="bar low-stock">
                                    <div 
                                        className="bar-fill" 
                                        style={{ width: `${(stats.stockRanges.lowStock / stats.totalProducts) * 100}%` }}
                                    ></div>
                                </div>
                                <span>{stats.stockRanges.lowStock}</span>
                            </div>
                            <div className="bar-item">
                                <span className="label">Trung bình (11-50)</span>
                                <div className="bar medium-stock">
                                    <div 
                                        className="bar-fill" 
                                        style={{ width: `${(stats.stockRanges.mediumStock / stats.totalProducts) * 100}%` }}
                                    ></div>
                                </div>
                                <span>{stats.stockRanges.mediumStock}</span>
                            </div>
                            <div className="bar-item">
                                <span className="label">Cao (>50)</span>
                                <div className="bar high-stock">
                                    <div 
                                        className="bar-fill" 
                                        style={{ width: `${(stats.stockRanges.highStock / stats.totalProducts) * 100}%` }}
                                    ></div>
                                </div>
                                <span>{stats.stockRanges.highStock}</span>
                            </div>
                        </>
                    )}
                </div>
            </div>

            {/* Out of Stock Alert */}
            {alerts.outOfStock?.length > 0 && (
                <div className="alert-section critical">
                    <h2><FaExclamationTriangle /> Sản Phẩm Hết Hàng ({alerts.outOfStock.length})</h2>
                    <div className="product-grid">
                        {alerts.outOfStock.map(product => (
                            <div key={product.id} className="product-alert-card critical">
                                <img src={product.imageUrl} alt={product.title} />
                                <div className="product-info">
                                    <h4>{product.title}</h4>
                                    <p>{product.author}</p>
                                    <span className="category">{product.category}</span>
                                </div>
                                <div className="stock-info">
                                    <span className="stock-count critical">0 sản phẩm</span>
                                    <span className="price">{formatCurrency(product.discountedPrice)}</span>
                                </div>
                                <div className="stock-actions">
                                    {editingStock[product.id] ? (
                                        <div className="edit-form">
                                            <input
                                                type="number"
                                                min="0"
                                                placeholder="Số lượng"
                                                onKeyPress={(e) => {
                                                    if (e.key === 'Enter') {
                                                        handleStockUpdate(product.id, e.target.value)
                                                    }
                                                }}
                                                autoFocus
                                            />
                                            <button onClick={() => setEditingStock({})}>✕</button>
                                        </div>
                                    ) : (
                                        <>
                                            <button 
                                                className="btn-quick-update"
                                                onClick={() => handleStockUpdate(product.id, 10, 'set')}
                                            >
                                                +10
                                            </button>
                                            <button 
                                                className="btn-edit-stock"
                                                onClick={() => setEditingStock({ [product.id]: true })}
                                            >
                                                <FaEdit />
                                            </button>
                                        </>
                                    )}
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            )}

            {/* Low Stock Alert */}
            {alerts.lowStock?.length > 0 && (
                <div className="alert-section warning">
                    <h2><FaExclamationTriangle /> Tồn Kho Thấp ({alerts.lowStock.length})</h2>
                    <div className="product-grid">
                        {alerts.lowStock.map(product => (
                            <div key={product.id} className="product-alert-card warning">
                                <img src={product.imageUrl} alt={product.title} />
                                <div className="product-info">
                                    <h4>{product.title}</h4>
                                    <p>{product.author}</p>
                                    <span className="category">{product.category}</span>
                                </div>
                                <div className="stock-info">
                                    <span className="stock-count warning">{product.stock} sản phẩm</span>
                                    <span className="price">{formatCurrency(product.discountedPrice)}</span>
                                </div>
                                <div className="stock-actions">
                                    {editingStock[product.id] ? (
                                        <div className="edit-form">
                                            <input
                                                type="number"
                                                min="0"
                                                defaultValue={product.stock}
                                                onKeyPress={(e) => {
                                                    if (e.key === 'Enter') {
                                                        handleStockUpdate(product.id, e.target.value)
                                                    }
                                                }}
                                                autoFocus
                                            />
                                            <button onClick={() => setEditingStock({})}>✕</button>
                                        </div>
                                    ) : (
                                        <>
                                            <button 
                                                className="btn-increase"
                                                onClick={() => handleStockUpdate(product.id, 10, 'increase')}
                                            >
                                                <FaArrowUp />
                                            </button>
                                            <button 
                                                className="btn-decrease"
                                                onClick={() => handleStockUpdate(product.id, 5, 'decrease')}
                                            >
                                                <FaArrowDown />
                                            </button>
                                            <button 
                                                className="btn-edit-stock"
                                                onClick={() => setEditingStock({ [product.id]: true })}
                                            >
                                                <FaEdit />
                                            </button>
                                        </>
                                    )}
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            )}

            {alerts.lowStock?.length === 0 && alerts.outOfStock?.length === 0 && (
                <div className="no-alerts">
                    <div className="no-alerts-content">
                        <FaBoxes className="no-alerts-icon" />
                        <h3>Không có cảnh báo tồn kho</h3>
                        <p>Tất cả sản phẩm đều có đủ tồn kho theo ngưỡng hiện tại</p>
                    </div>
                </div>
            )}
        </div>
    )
}

export default InventoryManager