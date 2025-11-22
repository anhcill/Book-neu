import React from 'react';

function StripeDebug() {
    const checkStripeSetup = () => {
        console.log('=== STRIPE DEBUG INFO ===');
        console.log('1. Environment variable:', process.env.REACT_APP_STRIPE_PUBLISHABLE_KEY);
        console.log('2. All env vars:', process.env);
        console.log('3. Window location:', window.location.href);
        console.log('4. Ad blocker test: Trying to load Stripe...');
        
        // Test load Stripe
        const script = document.createElement('script');
        script.src = 'https://js.stripe.com/v3/';
        script.onload = () => {
            console.log('✅ Stripe script loaded successfully!');
            if (window.Stripe) {
                console.log('✅ Stripe object available');
            } else {
                console.log('❌ Stripe object NOT available');
            }
        };
        script.onerror = (error) => {
            console.log('❌ Failed to load Stripe script:', error);
            console.log('⚠️ This is likely blocked by ad blocker!');
        };
        document.head.appendChild(script);
    };

    return (
        <div style={{ padding: '2rem', fontFamily: 'monospace' }}>
            <h1>🔍 Stripe Debug Tool</h1>
            
            <button 
                onClick={checkStripeSetup}
                style={{
                    padding: '1rem 2rem',
                    fontSize: '1rem',
                    background: '#5469d4',
                    color: 'white',
                    border: 'none',
                    borderRadius: '4px',
                    cursor: 'pointer'
                }}
            >
                Kiểm Tra Stripe Setup
            </button>

            <div style={{ marginTop: '2rem', background: '#f0f0f0', padding: '1rem', borderRadius: '4px' }}>
                <h3>📝 Checklist:</h3>
                <ul>
                    <li>✅ Đã tạo file <code>.env</code> ở root folder (cùng cấp package.json)?</li>
                    <li>✅ Đã thêm <code>REACT_APP_STRIPE_PUBLISHABLE_KEY=pk_test_...</code>?</li>
                    <li>✅ Đã restart frontend server (Ctrl+C rồi npm start)?</li>
                    <li>✅ Đã tắt Ad Blocker (uBlock, AdBlock, etc)?</li>
                    <li>✅ Đã thử Incognito mode?</li>
                </ul>
            </div>

            <div style={{ marginTop: '2rem', background: '#fff3cd', padding: '1rem', borderRadius: '4px' }}>
                <h3>⚠️ Lưu Ý:</h3>
                <p><strong>File .env phải ở đúng vị trí:</strong></p>
                <pre style={{ background: '#333', color: '#0f0', padding: '1rem', borderRadius: '4px' }}>
{`Bookztron-E-Commerce_Book_Store-development/
├── .env                    ← Ở ĐÂY (cùng cấp package.json)
├── package.json
├── src/
├── backend/
│   ├── .env                ← Cái này cho backend
│   └── package.json
└── ...`}
                </pre>
            </div>

            <div style={{ marginTop: '2rem', background: '#d1ecf1', padding: '1rem', borderRadius: '4px' }}>
                <h3>🔧 Nếu vẫn lỗi:</h3>
                <ol>
                    <li>Mở Console (F12) → Tab Console</li>
                    <li>Click nút "Kiểm Tra Stripe Setup" ở trên</li>
                    <li>Xem kết quả in ra</li>
                    <li>Screenshot và báo lại</li>
                </ol>
            </div>
        </div>
    );
}

export default StripeDebug;
