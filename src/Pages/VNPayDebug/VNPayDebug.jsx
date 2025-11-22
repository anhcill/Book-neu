import React, { useState } from 'react';
import axios from 'axios';
import './VNPayDebug.css';

function VNPayDebug() {
    const [debugInfo, setDebugInfo] = useState(null);
    const [loading, setLoading] = useState(false);

    const checkVNPayConfig = async () => {
        setLoading(true);
        try {
            // Gọi API backend để lấy config
            const response = await axios.get('http://localhost:5000/api/payment/vnpay-debug');
            setDebugInfo(response.data);
        } catch (error) {
            setDebugInfo({
                error: true,
                message: error.message,
                details: error.response?.data
            });
        } finally {
            setLoading(false);
        }
    };

    const testVNPayURL = async () => {
        setLoading(true);
        try {
            const token = localStorage.getItem('token');
            const response = await axios.post(
                'http://localhost:5000/api/payment/vnpay-test',
                {
                    shippingAddress: {
                        name: 'Test User',
                        phone: '0123456789',
                        address: 'Test Address'
                    }
                },
                {
                    headers: { 'x-access-token': token }
                }
            );
            
            setDebugInfo({
                ...debugInfo,
                testResult: response.data
            });
        } catch (error) {
            setDebugInfo({
                ...debugInfo,
                testResult: {
                    error: true,
                    message: error.message,
                    details: error.response?.data
                }
            });
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="vnpay-debug-container">
            <h1>🔍 VNPay Debug Tool</h1>
            
            <div className="button-group">
                <button onClick={checkVNPayConfig} disabled={loading}>
                    {loading ? 'Đang kiểm tra...' : 'Kiểm Tra Config VNPay'}
                </button>
                <button onClick={testVNPayURL} disabled={loading}>
                    {loading ? 'Đang test...' : 'Test Tạo URL VNPay'}
                </button>
            </div>

            {debugInfo && (
                <div className="debug-result">
                    <h2>📊 Kết Quả:</h2>
                    <pre>{JSON.stringify(debugInfo, null, 2)}</pre>
                    
                    {debugInfo.vnpayUrl && (
                        <div className="url-test">
                            <h3>🔗 VNPay URL:</h3>
                            <a href={debugInfo.vnpayUrl} target="_blank" rel="noopener noreferrer">
                                Click để test URL
                            </a>
                            <textarea 
                                readOnly 
                                value={debugInfo.vnpayUrl}
                                rows={5}
                            />
                        </div>
                    )}

                    {debugInfo.recommendations && (
                        <div className="recommendations">
                            <h3>💡 Khuyến Nghị:</h3>
                            <ul>
                                {debugInfo.recommendations.map((rec, idx) => (
                                    <li key={idx}>{rec}</li>
                                ))}
                            </ul>
                        </div>
                    )}
                </div>
            )}

            <div className="info-box">
                <h3>📝 Checklist Debug VNPay:</h3>
                <ol>
                    <li>✅ Kiểm tra backend/.env có đầy đủ: VNP_TMNCODE, VNP_HASHSECRET, VNP_URL</li>
                    <li>✅ VNP_RETURN_URL phải là public URL (không được localhost)</li>
                    <li>✅ Nếu dùng localhost, cần dùng ngrok</li>
                    <li>✅ Kiểm tra backend đang chạy ở port 5000</li>
                    <li>✅ Test với tài khoản VNPay sandbox hợp lệ</li>
                </ol>
            </div>

            <div className="error-codes">
                <h3>🚨 Mã Lỗi VNPay Thường Gặp:</h3>
                <table>
                    <thead>
                        <tr>
                            <th>Mã Lỗi</th>
                            <th>Ý Nghĩa</th>
                            <th>Giải Pháp</th>
                        </tr>
                    </thead>
                    <tbody>
                        <tr>
                            <td>72</td>
                            <td>Không tìm thấy website</td>
                            <td>VNP_RETURN_URL phải là public URL, dùng ngrok</td>
                        </tr>
                        <tr>
                            <td>97</td>
                            <td>Chữ ký không hợp lệ</td>
                            <td>Kiểm tra VNP_HASHSECRET</td>
                        </tr>
                        <tr>
                            <td>99</td>
                            <td>Lỗi khác</td>
                            <td>Kiểm tra format tham số</td>
                        </tr>
                    </tbody>
                </table>
            </div>
        </div>
    );
}

export default VNPayDebug;
