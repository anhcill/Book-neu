const express = require('express');
const router = express.Router();
const paymentController = require('../controllers/paymentController');
const { authenticateToken: authMiddleware } = require('../middleware/authMiddleware'); // Middleware bảo vệ

// @route   POST /api/payment/create-order
// @desc    Tạo đơn hàng (Xử lý COD, VNPay hoặc Stripe)
// @access  Private (Bắt buộc đăng nhập)
router.post('/create-order', authMiddleware, paymentController.createOrder);

// === VNPAY ROUTES ===
// @route   POST /api/payment/vnpay-return
// @desc    Frontend gọi để xác thực thanh toán (Sau khi VNPay chuyển hướng về)
// @access  Private (Bắt buộc đăng nhập)
router.post('/vnpay-return', authMiddleware, paymentController.vnpayReturn);

// @route   GET /api/payment/vnpay-return
// @desc    VNPay redirect về (GET request từ VNPay)
// @access  Public (VNPay gọi trực tiếp)
router.get('/vnpay-return', paymentController.vnpayReturn);

// @route   GET /api/payment/vnpay-ipn
// @desc    Lắng nghe VNPay gọi về (Server-to-Server)
// @access  Public (Không cần authMiddleware)
router.get('/vnpay-ipn', paymentController.vnpayIPNHandler);

// === STRIPE ROUTES ===
// @route   POST /api/payment/stripe-confirm
// @desc    Frontend gọi để xác nhận thanh toán Stripe
// @access  Private (Bắt buộc đăng nhập)
router.post('/stripe-confirm', authMiddleware, paymentController.stripeConfirmPayment);

// @route   POST /api/payment/stripe-webhook
// @desc    Stripe webhook để xác nhận thanh toán (Server-to-Server)
// @access  Public (Stripe gọi trực tiếp)
router.post('/stripe-webhook', express.raw({ type: 'application/json' }), paymentController.stripeWebhook);

// === VNPAY DEBUG ROUTES ===
// @route   GET /api/payment/vnpay-debug
// @desc    Kiểm tra cấu hình VNPay
// @access  Public (để debug)
router.get('/vnpay-debug', paymentController.vnpayDebug);

// @route   POST /api/payment/vnpay-test
// @desc    Test tạo URL VNPay
// @access  Private
router.post('/vnpay-test', authMiddleware, paymentController.vnpayTest);


module.exports = router;