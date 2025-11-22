const { Cart, Product, Order, OrderItem, sequelize } = require('../config/db'); // Sử dụng models đã được định nghĩa quan hệ
const crypto = require('crypto');
const qs = require('qs');
const { Op } = require('sequelize');
const stripe = require('stripe')(process.env.STRIPE_SECRET_KEY);

// === CÁC HÀM HỖ TRỢ VNPAY ===
function sortObject(obj) {
	let sorted = {};
	let str = [];
	let key;
	for (key in obj){
		if (obj.hasOwnProperty(key)) {
		str.push(encodeURIComponent(key));
		}
	}
	str.sort();
    for (key = 0; key < str.length; key++) {
        sorted[str[key]] = encodeURIComponent(obj[str[key]]).replace(/%20/g, "+");
    }
    return sorted;
}

// Hàm tạo query string cho VNPay (không encode)
function createVNPayQueryString(obj) {
    const sorted = {};
    const keys = Object.keys(obj).sort();
    
    keys.forEach(key => {
        // Chỉ lấy các giá trị không null/undefined
        if (obj[key] !== null && obj[key] !== undefined && obj[key] !== '') {
            sorted[key] = obj[key];
        }
    });
    
    return Object.keys(sorted)
        .map(key => `${key}=${sorted[key]}`)
        .join('&');
}

// Hàm validate VNPay params
function validateVNPayParams(params) {
    const required = ['vnp_TmnCode', 'vnp_Amount', 'vnp_TxnRef', 'vnp_OrderInfo', 'vnp_ReturnUrl'];
    for (let field of required) {
        if (!params[field]) {
            throw new Error(`Thiếu tham số bắt buộc: ${field}`);
        }
    }
    return true;
}

const VNP_TMNCODE = process.env.VNP_TMNCODE;
const VNP_HASHSECRET = process.env.VNP_HASHSECRET;
const VNP_URL = process.env.VNP_URL;
// Return URL từ .env (có thể là ngrok URL)
const VNP_RETURN_URL = process.env.VNP_RETURN_URL;
// Frontend base URL (extract từ return URL)
const FRONTEND_URL = VNP_RETURN_URL ? VNP_RETURN_URL.replace('/vnpay_return', '') : 'http://localhost:3000';
// === KẾT THÚC HÀM HỖ TRỢ VNPAY ===


// =====================================================================
// === HÀM TRUNG TÂM: XỬ LÝ HOÀN TẤT ĐƠN HÀNG (Lưu DB, Trừ kho, Xóa Cart) ===
// =====================================================================
async function finalizeOrder(order, transaction) {
    const userId = order.userId;

    // 1. Lấy giỏ hàng
    const cartItems = await Cart.findAll({
        where: { userId },
        include: [Product],
        transaction
    });
    if (cartItems.length === 0) {
        throw new Error("Giỏ hàng trống.");
    }

    // 2. CHUYỂN CART SANG ORDER_ITEMS VÀ CHUẨN BỊ TRỪ KHO
    const orderItemsData = [];
    const stockUpdates = [];

    for (const item of cartItems) {
        // Dữ liệu cho OrderItem
        orderItemsData.push({
            orderId: order.id,
            productId: item.productId,
            quantity: item.quantity,
            price: item.Product.discountedPrice // Lưu lại giá lúc mua
        });

        // Promise để cập nhật kho
        stockUpdates.push(
            Product.update(
                { stock: sequelize.literal(`stock - ${item.quantity}`) },
                {
                    where: {
                        id: item.productId,
                        stock: { [Op.gte]: item.quantity } // Điều kiện quan trọng: chỉ trừ khi kho còn đủ
                    },
                    transaction
                }
            )
        );
    }

    // 3. THỰC THI SONG SONG
    // Tạo tất cả OrderItem
    await OrderItem.bulkCreate(orderItemsData, { transaction });
    // Trừ kho cho tất cả sản phẩm
    const results = await Promise.all(stockUpdates);

    // KIỂM TRA KẾT QUẢ TRỪ KHO
    const failedUpdates = results.filter(result => result[0] === 0);
    if (failedUpdates.length > 0) {
        // Nếu có ít nhất 1 sản phẩm không trừ được kho (hết hàng)
        throw new Error("Một hoặc nhiều sản phẩm trong giỏ đã hết hàng.");
    }

    // 4. XÓA GIỎ HÀNG
    await Cart.destroy({ where: { userId }, transaction });

    return order;
}

// =====================================================================
// === HÀM TẠO ORDER ITEMS (Không trừ kho, không xóa cart) ===
// =====================================================================
async function createOrderItems(order, transaction) {
    const userId = order.userId;

    // Lấy giỏ hàng
    const cartItems = await Cart.findAll({
        where: { userId },
        include: [Product],
        transaction
    });
    
    if (cartItems.length === 0) {
        throw new Error("Giỏ hàng trống.");
    }

    // Tạo OrderItems từ Cart (chưa trừ kho)
    const orderItemsData = cartItems.map(item => ({
        orderId: order.id,
        productId: item.productId,
        quantity: item.quantity,
        price: item.Product.discountedPrice
    }));

    await OrderItem.bulkCreate(orderItemsData, { transaction });
    return order;
}

// =====================================================================
// === HÀM HOÀN TẤT THANH TOÁN (Trừ kho, xóa cart) ===
// =====================================================================
async function completePayment(order, transaction) {
    const userId = order.userId;

    // Lấy OrderItems
    const orderItems = await OrderItem.findAll({
        where: { orderId: order.id },
        include: [Product],
        transaction
    });

    // Trừ kho
    const stockUpdates = [];
    for (const item of orderItems) {
        stockUpdates.push(
            Product.update(
                { stock: sequelize.literal(`stock - ${item.quantity}`) },
                {
                    where: {
                        id: item.productId,
                        stock: { [Op.gte]: item.quantity }
                    },
                    transaction
                }
            )
        );
    }

    const results = await Promise.all(stockUpdates);
    const failedUpdates = results.filter(result => result[0] === 0);
    if (failedUpdates.length > 0) {
        throw new Error("Một hoặc nhiều sản phẩm trong giỏ đã hết hàng.");
    }

    // Xóa giỏ hàng
    await Cart.destroy({ where: { userId }, transaction });
    return order;
}


// =====================================================================
// ====================== API TẠO ĐƠN HÀNG (COD/STRIPE/VNPAY) ==================
// =====================================================================
exports.createOrder = async (req, res) => {
    const userId = req.userId;
    const { paymentMethod, shippingAddress, couponName } = req.body;

    if (!paymentMethod || !shippingAddress) {
        return res.status(400).json({ message: 'Vui lòng cung cấp phương thức thanh toán và địa chỉ.' });
    }

    const t = await sequelize.transaction();
    try {
        const cartItems = await Cart.findAll({
            where: { userId },
            include: [Product],
            transaction: t
        });

        if (cartItems.length === 0) {
            await t.rollback();
            return res.status(400).json({ message: "Giỏ hàng trống" });
        }

        let totalAmount = cartItems.reduce((sum, item) => sum + item.Product.discountedPrice * item.quantity, 0);
        totalAmount += 50; // Phí ship
        if (couponName === "BOOKS200") totalAmount -= 200;
        if (totalAmount < 0) totalAmount = 0;

        // ==========================================================
        // === TRƯỜNG HỢP 1: THANH TOÁN KHI NHẬN HÀNG (COD) ===
        // ==========================================================
        if (paymentMethod === 'COD') {
            const newOrder = await Order.create({
                userId,
                paymentMethod: 'COD',
                shippingAddress: JSON.stringify(shippingAddress),
                totalAmount,
                status: 'processing', // COD thì vào trạng thái đang xử lý luôn
            }, { transaction: t });

            // Gọi hàm hoàn tất đơn hàng
            await finalizeOrder(newOrder, t);

            await t.commit();
            return res.status(200).json({
                status: "ok",
                message: "Đặt hàng COD thành công!",
                paymentMethod: "COD",
                orderId: newOrder.id
            });
        }

        // ==========================================================
        // === TRƯỜNG HỢP 2: THANH TOÁN BẰNG STRIPE ===
        // ==========================================================
        if (paymentMethod === 'STRIPE') {
            // 1. Tạo Đơn hàng "Pending"
            const newOrder = await Order.create({
                userId,
                paymentMethod: 'STRIPE',
                shippingAddress: JSON.stringify(shippingAddress),
                totalAmount,
                status: "pending" // Trạng thái chờ thanh toán
            }, { transaction: t });

            // 2. Tạo OrderItems (KHÔNG trừ kho, KHÔNG xóa cart)
            await createOrderItems(newOrder, t);

            // 3. Tạo Stripe Payment Intent
            try {
                const paymentIntent = await stripe.paymentIntents.create({
                    amount: Math.round(totalAmount * 23500), // Chuyển VND sang USD cent (tỷ giá ~23,500)
                    currency: 'usd', // Stripe yêu cầu USD cho test mode
                    metadata: {
                        orderId: newOrder.id.toString(),
                        userId: userId.toString(),
                        gatewayOrderId: `STRIPE_${Date.now()}_${userId}`
                    },
                    description: `Order #${newOrder.id} - Bookztron`
                });

                // 4. Lưu clientSecret và paymentIntentId
                newOrder.gatewayOrderId = paymentIntent.id;
                await newOrder.save({ transaction: t });

                await t.commit();

                console.log('✅ Tạo Stripe Payment Intent thành công:', paymentIntent.id);
                
                return res.status(200).json({
                    status: "ok",
                    paymentMethod: "STRIPE",
                    clientSecret: paymentIntent.client_secret,
                    orderId: newOrder.id,
                    paymentIntentId: paymentIntent.id
                });
            } catch (stripeError) {
                throw new Error(`Stripe Error: ${stripeError.message}`);
            }
        }

        // ==========================================================
        // === TRƯỜNG HỢP 3: THANH TOÁN BẰNG VNPAY ===
        // ==========================================================
        if (paymentMethod === 'VNPAY') {
            const vnp_TxnRef = `${Date.now()}_${userId}`;
            
            // 1. Tạo Đơn hàng "Pending"
            const newOrder = await Order.create({
                userId,
                paymentMethod: 'VNPAY',
                shippingAddress: JSON.stringify(shippingAddress),
                gatewayOrderId: vnp_TxnRef, // Lưu mã giao dịch của chúng ta
                totalAmount,
                status: "pending" // Trạng thái chờ thanh toán
            }, { transaction: t });

            // 2. Tạo OrderItems (KHÔNG trừ kho, KHÔNG xóa cart)
            await createOrderItems(newOrder, t);

            // 3. Tạo URL VNPay
            const vnp_Amount = Math.max(totalAmount, 1000) * 100; // VNPay yêu cầu số tiền > 1000 VND
            const vnp_IpAddr = req.ip || req.connection.remoteAddress || '127.0.0.1';
            const createDate = new Date();
            const vnp_CreateDate = createDate.toISOString().replace(/[-:T.]/g, '').slice(0, 14);
            
            // Kiểm tra thông tin cần thiết
            if (!VNP_TMNCODE || !VNP_HASHSECRET || !VNP_URL) {
                throw new Error('Thông tin VNPay chưa được cấu hình');
            }
            
            let vnp_Params = {
                'vnp_Version': '2.1.0',
                'vnp_Command': 'pay',
                'vnp_TmnCode': VNP_TMNCODE,
                'vnp_Locale': 'vn',
                'vnp_CurrCode': 'VND',
                'vnp_TxnRef': vnp_TxnRef,
                'vnp_OrderInfo': `Thanh toan don hang ${newOrder.id}`,
                'vnp_OrderType': 'other',
                'vnp_Amount': vnp_Amount.toString(),
                'vnp_ReturnUrl': VNP_RETURN_URL,
                'vnp_IpAddr': vnp_IpAddr,
                'vnp_CreateDate': vnp_CreateDate
            };

            // Validate params
            validateVNPayParams(vnp_Params);

            // Tạo hash signature đúng cách
            const signData = createVNPayQueryString(vnp_Params);
            const hmac = crypto.createHmac("sha512", VNP_HASHSECRET);
            const vnp_SecureHash = hmac.update(signData, 'utf-8').digest("hex");
            
            console.log('=== DEBUG VNPAY CREATE ORDER ===');
            console.log('Order ID:', newOrder.id);
            console.log('TxnRef:', vnp_TxnRef);
            console.log('Amount:', vnp_Amount);
            console.log('Sign Data:', signData);
            console.log('Generated Hash:', vnp_SecureHash);
            
            vnp_Params['vnp_SecureHash'] = vnp_SecureHash;
            
            // Tạo URL cuối cùng
            const finalVnpUrl = VNP_URL + '?' + Object.keys(vnp_Params)
                .map(key => `${key}=${encodeURIComponent(vnp_Params[key])}`)
                .join('&');

            await t.commit(); // Lưu đơn hàng pending thành công
            
            console.log('Final VNPay URL:', finalVnpUrl);
            
            res.status(200).json({
                status: "ok",
                paymentMethod: "VNPAY",
                payUrl: finalVnpUrl,
                orderId: newOrder.id,
                txnRef: vnp_TxnRef
            });
        }

    } catch (error) {
        await t.rollback();
        console.error("LỖI KHI TẠO ĐƠN HÀNG:", error);
        res.status(500).json({ message: "Lỗi server", error: error.message });
    }
};

// =====================================================================
// ====================== VNPAY RETURN (XÁC THỰC) ======================
// =====================================================================
exports.vnpayReturn = async (req, res) => {
    try {
        console.log('=== DEBUG VNPAY RETURN ===');
        console.log('Method:', req.method);
        console.log('Query params:', req.query);
        console.log('Body:', req.body);

        let vnp_Params = {};
        
        // Xử lý cả GET và POST
        if (req.method === 'GET') {
            vnp_Params = req.query;
            console.log('Processing GET request from VNPay');
        } else {
            // Xử lý POST request từ frontend
            const { vnp_Params: vnp_Params_string } = req.body;
            if (!vnp_Params_string && Object.keys(req.query).length === 0) {
                return res.status(400).json({ 
                    success: false,
                    message: 'Không có dữ liệu thanh toán' 
                });
            }

            if (vnp_Params_string) {
                try {
                    const params = new URLSearchParams(vnp_Params_string);
                    params.forEach((value, key) => { 
                        vnp_Params[key] = value;
                    });
                } catch (error) {
                    console.error('Lỗi parse params:', error);
                    vnp_Params = req.query; // Fallback to query params
                }
            } else {
                vnp_Params = req.query;
            }
        }

        console.log('Parsed VNPay params:', vnp_Params);

        // Kiểm tra có đủ thông tin không
        if (!vnp_Params.vnp_TxnRef || !vnp_Params.vnp_ResponseCode) {
            console.error('Thiếu thông tin cần thiết từ VNPay');
            
            // Nếu là GET request từ VNPay, redirect về frontend với lỗi
            if (req.method === 'GET') {
                const errorUrl = `${FRONTEND_URL}/vnpay_return?error=missing_params`;
                return res.redirect(errorUrl);
            }
            
            return res.status(400).json({ 
                success: false,
                message: 'Thiếu thông tin cần thiết từ VNPay' 
            });
        }

        const secureHash = vnp_Params['vnp_SecureHash'];
        const vnp_Params_Copy = { ...vnp_Params };
        delete vnp_Params_Copy['vnp_SecureHash'];
        delete vnp_Params_Copy['vnp_SecureHashType'];

        // 1. XÁC THỰC CHỮ KÝ
        try {
            const signData = createVNPayQueryString(vnp_Params_Copy);
            const hmac = crypto.createHmac("sha512", VNP_HASHSECRET);
            const calculatedHash = hmac.update(signData, 'utf-8').digest("hex");

            console.log('=== DEBUG VNPAY SIGNATURE ===');
            console.log('Received Hash:', secureHash);
            console.log('Calculated Hash:', calculatedHash);
            console.log('Sign Data:', signData);

            if (secureHash !== calculatedHash) {
                console.error('Xác thực chữ ký thất bại!');
                
                // Nếu là GET request, redirect với lỗi
                if (req.method === 'GET') {
                    const errorUrl = `${FRONTEND_URL}/vnpay_return?error=invalid_signature&` + 
                                   Object.keys(vnp_Params).map(key => `${key}=${encodeURIComponent(vnp_Params[key])}`).join('&');
                    return res.redirect(errorUrl);
                }
                
                return res.status(400).json({ 
                    success: false,
                    message: 'Xác thực chữ ký thất bại',
                    debug: {
                        received: secureHash,
                        calculated: calculatedHash
                    }
                });
            }
        } catch (error) {
            console.error('Lỗi xác thực chữ ký:', error);
            
            if (req.method === 'GET') {
                const errorUrl = `${FRONTEND_URL}/vnpay_return?error=signature_error`;
                return res.redirect(errorUrl);
            }
            
            return res.status(500).json({ 
                success: false, 
                message: 'Lỗi xác thực' 
            });
        }

        const vnp_TxnRef = vnp_Params['vnp_TxnRef'];
        const vnp_ResponseCode = vnp_Params['vnp_ResponseCode'];
        const vnp_TransactionStatus = vnp_Params['vnp_TransactionStatus'];

        // Nếu là GET request từ VNPay, redirect về frontend với kết quả
        if (req.method === 'GET') {
            const redirectUrl = `${FRONTEND_URL}/vnpay_return?` + 
                              Object.keys(vnp_Params).map(key => `${key}=${encodeURIComponent(vnp_Params[key])}`).join('&');
            console.log('Redirecting to frontend:', redirectUrl);
            return res.redirect(redirectUrl);
        }

        // Xử lý POST request - cập nhật database
        const t = await sequelize.transaction();
        try {
            // 2. Tìm đơn hàng "pending"
            const order = await Order.findOne({
                where: { gatewayOrderId: vnp_TxnRef, status: "pending" },
                transaction: t
            });

            if (!order) {
                await t.rollback();
                // Nếu không tìm thấy, có thể đã được xử lý hoặc là request giả mạo
                return res.status(200).json({ 
                    success: true, 
                    message: "Đơn hàng đã được xử lý trước đó." 
                });
            }

            // 3. KIỂM TRA TRẠNG THÁI THANH TOÁN
            if (vnp_ResponseCode === '00' && vnp_TransactionStatus === '00') {
                // THÀNH CÔNG
                order.status = 'completed';
                order.gatewayPaymentId = vnp_Params['vnp_TransactionNo']; // Lưu mã giao dịch của VNPay
                await order.save({ transaction: t });

                // Trừ kho và xóa cart
                await completePayment(order, t);
                
                await t.commit();
                console.log('✅ Thanh toán VNPay thành công cho order:', order.id);
                return res.status(200).json({ 
                    success: true, 
                    message: "Thanh toán thành công!", 
                    orderId: order.id 
                });

            } else {
                // THẤT BẠI - hoàn nguyên stock và xóa đơn hàng
                console.log('❌ Thanh toán VNPay thất bại:', {
                    responseCode: vnp_ResponseCode,
                    transactionStatus: vnp_TransactionStatus
                });
                
                // Hoàn nguyên stock
                const orderItems = await OrderItem.findAll({
                    where: { orderId: order.id },
                    transaction: t
                });

                for (const item of orderItems) {
                    await Product.increment(
                        { stock: item.quantity },
                        { 
                            where: { id: item.productId },
                            transaction: t
                        }
                    );
                }

                // Xóa order và order items
                await OrderItem.destroy({ where: { orderId: order.id }, transaction: t });
                await order.destroy({ transaction: t });

                await t.commit();
                return res.status(400).json({ 
                    success: false, 
                    message: "Thanh toán thất bại từ phía VNPay",
                    responseCode: vnp_ResponseCode
                });
            }
        } catch (error) {
            await t.rollback();
            console.error("LỖI XỬ LÝ VNPAY RETURN:", error);
            return res.status(500).json({ 
                success: false,
                message: 'Lỗi server', 
                error: error.message 
            });
        }
    } catch (error) {
        console.error("LỖI VNPAY RETURN:", error);
        
        if (req.method === 'GET') {
            const errorUrl = `${FRONTEND_URL}/vnpay_return?error=server_error`;
            return res.redirect(errorUrl);
        }
        
        return res.status(500).json({
            success: false,
            message: 'Lỗi server',
            error: error.message
        });
    }
};

// VNPAY IPN (Instant Payment Notification) - Dùng để xác nhận cuối cùng từ server-to-server
// Hiện tại chỉ cần trả về mã thành công cho VNPay là đủ
exports.vnpayIPNHandler = async (req, res) => {
    // Logic xác thực tương tự vnpayReturn có thể được thêm vào đây để tăng cường bảo mật
    res.status(200).json({ RspCode: '00', Message: 'Confirm Success' });
};

// =====================================================================
// ====================== VNPAY DEBUG ENDPOINTS ========================
// =====================================================================
exports.vnpayDebug = async (req, res) => {
    try {
        const config = {
            VNP_TMNCODE: VNP_TMNCODE || 'NOT_SET',
            VNP_HASHSECRET: VNP_HASHSECRET ? '***' + VNP_HASHSECRET.slice(-4) : 'NOT_SET',
            VNP_URL: VNP_URL || 'NOT_SET',
            VNP_RETURN_URL: VNP_RETURN_URL || 'NOT_SET',
            FRONTEND_URL: FRONTEND_URL || 'NOT_SET'
        };

        const issues = [];
        const recommendations = [];

        // Kiểm tra các vấn đề
        if (!VNP_TMNCODE || VNP_TMNCODE === 'NOT_SET') {
            issues.push('VNP_TMNCODE chưa được cấu hình');
        }
        if (!VNP_HASHSECRET || VNP_HASHSECRET === 'NOT_SET') {
            issues.push('VNP_HASHSECRET chưa được cấu hình');
        }
        if (!VNP_URL || VNP_URL === 'NOT_SET') {
            issues.push('VNP_URL chưa được cấu hình');
        }
        if (!VNP_RETURN_URL || VNP_RETURN_URL === 'NOT_SET') {
            issues.push('VNP_RETURN_URL chưa được cấu hình');
        }

        // Kiểm tra localhost trong return URL
        if (VNP_RETURN_URL && VNP_RETURN_URL.includes('localhost')) {
            issues.push('VNP_RETURN_URL đang dùng localhost - VNPay sẽ không chấp nhận!');
            recommendations.push('Dùng ngrok: ngrok http 3000');
            recommendations.push('Cập nhật VNP_RETURN_URL trong backend/.env với URL ngrok');
            recommendations.push('Ví dụ: VNP_RETURN_URL=https://abc123.ngrok-free.app/vnpay_return');
        }

        if (VNP_RETURN_URL && !VNP_RETURN_URL.startsWith('http')) {
            issues.push('VNP_RETURN_URL không hợp lệ (phải bắt đầu bằng http/https)');
        }

        res.status(200).json({
            status: issues.length === 0 ? 'OK' : 'WARNING',
            config,
            issues,
            recommendations: recommendations.length > 0 ? recommendations : [
                'Config trông ổn!',
                'Nếu vẫn lỗi, hãy test URL VNPay bằng nút "Test Tạo URL VNPay"'
            ]
        });
    } catch (error) {
        res.status(500).json({
            status: 'ERROR',
            message: error.message
        });
    }
};

exports.vnpayTest = async (req, res) => {
    const { shippingAddress } = req.body;
    
    try {
        const vnp_TxnRef = `TEST_${Date.now()}`;
        const totalAmount = 100000; // Test với 100k VND
        const vnp_Amount = totalAmount * 100;
        const vnp_IpAddr = req.ip || '127.0.0.1';
        const createDate = new Date();
        const vnp_CreateDate = createDate.toISOString().replace(/[-:T.]/g, '').slice(0, 14);
        
        let vnp_Params = {
            'vnp_Version': '2.1.0',
            'vnp_Command': 'pay',
            'vnp_TmnCode': VNP_TMNCODE,
            'vnp_Locale': 'vn',
            'vnp_CurrCode': 'VND',
            'vnp_TxnRef': vnp_TxnRef,
            'vnp_OrderInfo': `Test order ${vnp_TxnRef}`,
            'vnp_OrderType': 'other',
            'vnp_Amount': vnp_Amount.toString(),
            'vnp_ReturnUrl': VNP_RETURN_URL,
            'vnp_IpAddr': vnp_IpAddr,
            'vnp_CreateDate': vnp_CreateDate
        };

        // Tạo hash signature
        const signData = createVNPayQueryString(vnp_Params);
        const hmac = crypto.createHmac("sha512", VNP_HASHSECRET);
        const vnp_SecureHash = hmac.update(signData, 'utf-8').digest("hex");
        
        vnp_Params['vnp_SecureHash'] = vnp_SecureHash;
        
        // Tạo URL cuối cùng
        const vnpayUrl = VNP_URL + '?' + Object.keys(vnp_Params)
            .map(key => `${key}=${encodeURIComponent(vnp_Params[key])}`)
            .join('&');

        res.status(200).json({
            status: 'OK',
            message: 'Test URL created successfully',
            vnpayUrl,
            params: vnp_Params,
            signData,
            testInfo: {
                amount: totalAmount,
                txnRef: vnp_TxnRef,
                returnUrl: VNP_RETURN_URL
            },
            instructions: [
                '1. Click vào vnpayUrl để test',
                '2. Nếu thấy trang VNPay → Config đúng!',
                '3. Nếu lỗi "Không tìm thấy website" → Dùng ngrok',
                '4. Nếu lỗi khác → Kiểm tra VNP_TMNCODE và VNP_HASHSECRET'
            ]
        });
    } catch (error) {
        res.status(500).json({
            status: 'ERROR',
            message: error.message,
            stack: error.stack
        });
    }
};

// =====================================================================
// ====================== STRIPE WEBHOOK HANDLER =======================
// =====================================================================
exports.stripeWebhook = async (req, res) => {
    const sig = req.headers['stripe-signature'];
    const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET;

    let event;

    try {
        // Xác thực webhook từ Stripe
        event = stripe.webhooks.constructEvent(req.body, sig, webhookSecret);
    } catch (err) {
        console.error('⚠️  Webhook signature verification failed:', err.message);
        return res.status(400).send(`Webhook Error: ${err.message}`);
    }

    // Xử lý các event từ Stripe
    const t = await sequelize.transaction();
    try {
        switch (event.type) {
            case 'payment_intent.succeeded':
                const paymentIntent = event.data.object;
                console.log('✅ PaymentIntent succeeded:', paymentIntent.id);

                // Tìm đơn hàng
                const order = await Order.findOne({
                    where: { 
                        gatewayOrderId: paymentIntent.id,
                        status: "pending" 
                    },
                    transaction: t
                });

                if (order) {
                    // Cập nhật trạng thái đơn hàng
                    order.status = 'completed';
                    order.gatewayPaymentId = paymentIntent.id;
                    await order.save({ transaction: t });

                    // Hoàn tất thanh toán (trừ kho, xóa giỏ hàng)
                    await completePayment(order, t);

                    await t.commit();
                    console.log('✅ Order completed successfully:', order.id);
                }
                break;

            case 'payment_intent.payment_failed':
                const failedIntent = event.data.object;
                console.log('❌ PaymentIntent failed:', failedIntent.id);

                // Tìm và xóa đơn hàng thất bại
                const failedOrder = await Order.findOne({
                    where: { 
                        gatewayOrderId: failedIntent.id,
                        status: "pending" 
                    },
                    transaction: t
                });

                if (failedOrder) {
                    // Xóa đơn hàng
                    await OrderItem.destroy({ 
                        where: { orderId: failedOrder.id }, 
                        transaction: t 
                    });
                    await failedOrder.destroy({ transaction: t });
                    await t.commit();
                    console.log('🗑️ Failed order removed:', failedOrder.id);
                }
                break;

            default:
                console.log(`Unhandled event type ${event.type}`);
        }

        res.json({ received: true });
    } catch (error) {
        await t.rollback();
        console.error('Error processing Stripe webhook:', error);
        res.status(500).json({ error: 'Webhook processing failed' });
    }
};

// =====================================================================
// =============== STRIPE CONFIRMATION (Frontend gọi) ==================
// =====================================================================
exports.stripeConfirmPayment = async (req, res) => {
    const { paymentIntentId } = req.body;

    if (!paymentIntentId) {
        return res.status(400).json({ 
            success: false, 
            message: 'Thiếu paymentIntentId' 
        });
    }

    const t = await sequelize.transaction();
    try {
        // Lấy thông tin từ Stripe
        const paymentIntent = await stripe.paymentIntents.retrieve(paymentIntentId);

        // Tìm đơn hàng
        const order = await Order.findOne({
            where: { 
                gatewayOrderId: paymentIntentId,
                status: "pending" 
            },
            transaction: t
        });

        if (!order) {
            await t.rollback();
            return res.status(404).json({ 
                success: false, 
                message: 'Không tìm thấy đơn hàng' 
            });
        }

        // Kiểm tra trạng thái thanh toán
        if (paymentIntent.status === 'succeeded') {
            order.status = 'completed';
            order.gatewayPaymentId = paymentIntentId;
            await order.save({ transaction: t });

            // Hoàn tất thanh toán (Trừ kho + Xóa cart)
            await completePayment(order, t);

            await t.commit();
            
            return res.status(200).json({ 
                success: true, 
                message: 'Thanh toán thành công!',
                orderId: order.id 
            });
        } else {
            await t.rollback();
            return res.status(400).json({ 
                success: false, 
                message: 'Thanh toán chưa hoàn tất',
                status: paymentIntent.status 
            });
        }
    } catch (error) {
        await t.rollback();
        console.error('Error confirming Stripe payment:', error);
        return res.status(500).json({ 
            success: false, 
            message: 'Lỗi xác nhận thanh toán',
            error: error.message 
        });
    }
};