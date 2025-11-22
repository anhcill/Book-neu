# 💳 Tổng Quan Phương Thức Thanh Toán - Bookztron

Hệ thống hỗ trợ **3 phương thức thanh toán**:

## 1. 💵 COD (Cash on Delivery)

**Thanh toán khi nhận hàng**

### Đặc điểm:

- ✅ Không cần tài khoản ngân hàng
- ✅ Không cần cấu hình gì
- ✅ Đơn giản nhất cho khách hàng
- ⚠️ Rủi ro cao cho người bán (hoàn trả)

### Flow:

```
Khách hàng chọn COD → Đơn hàng được tạo ngay
→ Status: "processing" → Giao hàng → Thu tiền
```

---

## 2. 🇻🇳 VNPay

**Cổng thanh toán Việt Nam - QR/Thẻ nội địa**

### Đặc điểm:

- ✅ Hỗ trợ QR Code, thẻ ATM, Internet Banking
- ✅ Phổ biến tại Việt Nam
- ⚠️ Cần đăng ký tài khoản merchant
- ⚠️ Có phí giao dịch (~2-3%)

### Test Mode:

```env
VNP_TMNCODE=2QXUI4B4
VNP_HASHSECRET=SEKDH2VGZV6LT6ZD0XXJJ13GDQO60ZOZ
VNP_URL=https://sandbox.vnpayment.vn/paymentv2/vpcpay.html
VNP_RETURN_URL=http://localhost:3000/vnpay_return
```

### Tài khoản test:

- Ngân hàng: NCB
- Số thẻ: `9704198526191432198`
- Tên: `NGUYEN VAN A`
- Ngày hết hạn: `07/15`
- Mật khẩu OTP: `123456`

### Flow:

```
Chọn VNPay → Redirect đến VNPay
→ Quét QR/Nhập thẻ → Xác thực
→ Redirect về website → Webhook xác nhận
→ Order status: "completed"
```

### Docs:

📚 Xem chi tiết: [VNPAY_SETUP.md](./VNPAY_SETUP.md) _(nếu có)_

---

## 3. 💳 Stripe

**Cổng thanh toán quốc tế - Thẻ Visa/Mastercard**

### Đặc điểm:

- ✅ API đơn giản, document rõ ràng
- ✅ Test mode hoàn toàn miễn phí
- ✅ Không cần merchant verification cho test
- ✅ Hỗ trợ localhost ngay
- ✅ Bảo mật PCI-compliant
- ⚠️ Phí giao dịch cao (~2.9% + $0.30)
- ⚠️ Yêu cầu thẻ quốc tế

### Test Mode:

```env
# Backend (.env)
STRIPE_SECRET_KEY=sk_test_51QRKqkP2xyJlD9KI...
STRIPE_PUBLISHABLE_KEY=pk_test_51QRKqkP2xyJlD9KI...

# Frontend (root .env)
REACT_APP_STRIPE_PUBLISHABLE_KEY=pk_test_51QRKqkP2xyJlD9KI...
```

### Thẻ test:

```
✅ Thành công:
Số thẻ: 4242 4242 4242 4242
MM/YY: 12/34
CVC: 123

❌ Thất bại:
Số thẻ: 4000 0000 0000 0002
```

### Flow:

```
Chọn Stripe → Nhập thông tin thẻ (CardElement)
→ Frontend confirm với Stripe
→ Backend tạo PaymentIntent
→ Status: "succeeded" → Gọi API confirm
→ Order status: "completed"
```

### Docs:

📚 Xem chi tiết: [STRIPE_SETUP.md](./STRIPE_SETUP.md)

---

## 📊 So Sánh

| Tiêu chí          | COD        | VNPay      | Stripe        |
| ----------------- | ---------- | ---------- | ------------- |
| **Dễ test**       | ⭐⭐⭐⭐⭐ | ⭐⭐⭐⭐   | ⭐⭐⭐⭐⭐    |
| **Dễ tích hợp**   | ⭐⭐⭐⭐⭐ | ⭐⭐⭐     | ⭐⭐⭐⭐⭐    |
| **Phổ biến VN**   | ⭐⭐⭐⭐⭐ | ⭐⭐⭐⭐⭐ | ⭐⭐          |
| **Quốc tế**       | ⭐         | ⭐         | ⭐⭐⭐⭐⭐    |
| **Phí giao dịch** | 0%         | ~2-3%      | ~2.9% + $0.30 |
| **Bảo mật**       | ⭐⭐       | ⭐⭐⭐⭐   | ⭐⭐⭐⭐⭐    |

---

## 🏗️ Kiến Trúc Backend

### Controller: `paymentController.js`

```javascript
exports.createOrder = async (req, res) => {
  const { paymentMethod, shippingAddress } = req.body;

  if (paymentMethod === "COD") {
    // Tạo order với status "processing"
    const order = await Order.create({ status: "processing" });
    await finalizeOrder(order); // Trừ kho, xóa cart
    return res.json({ status: "ok", paymentMethod: "COD" });
  }

  if (paymentMethod === "VNPAY") {
    // Tạo order với status "pending"
    const order = await Order.create({ status: "pending" });
    // Tạo URL VNPay
    const vnpayUrl = createVNPayUrl(order);
    return res.json({ paymentMethod: "VNPAY", payUrl: vnpayUrl });
  }

  if (paymentMethod === "STRIPE") {
    // Tạo order với status "pending"
    const order = await Order.create({ status: "pending" });
    // Tạo Stripe PaymentIntent
    const paymentIntent = await stripe.paymentIntents.create({
      amount: order.totalAmount * 23500, // VND -> USD cent
      currency: "usd",
    });
    return res.json({
      paymentMethod: "STRIPE",
      clientSecret: paymentIntent.client_secret,
    });
  }
};
```

### Routes: `routes/payment.js`

```javascript
// COD/VNPay/Stripe - Tạo đơn hàng
router.post(
  "/payment/create-order",
  authMiddleware,
  paymentController.createOrder
);

// VNPay - Xác nhận thanh toán
router.get("/payment/vnpay-return", paymentController.vnpayReturn);
router.post(
  "/payment/vnpay-return",
  authMiddleware,
  paymentController.vnpayReturn
);

// Stripe - Xác nhận thanh toán
router.post(
  "/payment/stripe-confirm",
  authMiddleware,
  paymentController.stripeConfirmPayment
);
router.post("/payment/stripe-webhook", paymentController.stripeWebhook);
```

---

## 🖥️ Kiến Trúc Frontend

### Component: `Checkout.js`

```jsx
<fieldset>
  <legend>Phương thức Thanh toán</legend>

  {/* COD */}
  <input type="radio" value="COD" checked={paymentMethod === "COD"} />
  <label>Thanh toán khi nhận hàng (COD)</label>

  {/* VNPay */}
  <input type="radio" value="VNPAY" checked={paymentMethod === "VNPAY"} />
  <label>Thanh toán bằng VNPay (Thẻ/QR)</label>

  {/* Stripe */}
  <input type="radio" value="STRIPE" checked={paymentMethod === "STRIPE"} />
  <label>Thanh toán bằng Stripe (Thẻ Quốc tế)</label>
</fieldset>;

{
  /* Hiển thị form Stripe nếu chọn Stripe */
}
{
  paymentMethod === "STRIPE" ? (
    <Elements stripe={stripePromise}>
      <StripeCheckoutForm />
    </Elements>
  ) : (
    <button type="submit">Xác nhận Đặt hàng</button>
  );
}
```

---

## 📈 Admin Panel

Trang **Analytics** hiển thị:

```javascript
// Doanh thu theo phương thức thanh toán
revenueByPaymentMethod: [
  { paymentMethod: "COD", orderCount: 45, revenue: 12500000 },
  { paymentMethod: "VNPAY", orderCount: 30, revenue: 8900000 },
  { paymentMethod: "STRIPE", orderCount: 15, revenue: 5400000 },
];
```

---

## 🚀 Quick Start

### 1. Cài đặt Dependencies

```bash
# Backend
cd backend
npm install stripe

# Frontend (đã có sẵn)
npm install @stripe/stripe-js @stripe/react-stripe-js
```

### 2. Cấu hình Environment

**Backend** (`backend/.env`):

```env
# VNPay
VNP_TMNCODE=2QXUI4B4
VNP_HASHSECRET=SEKDH2VGZV6LT6ZD0XXJJ13GDQO60ZOZ
VNP_URL=https://sandbox.vnpayment.vn/paymentv2/vpcpay.html
VNP_RETURN_URL=http://localhost:3000/vnpay_return

# Stripe
STRIPE_SECRET_KEY=sk_test_51QRKqkP2xyJlD9KI...
STRIPE_PUBLISHABLE_KEY=pk_test_51QRKqkP2xyJlD9KI...
```

**Frontend** (`.env` ở root):

```env
REACT_APP_STRIPE_PUBLISHABLE_KEY=pk_test_51QRKqkP2xyJlD9KI...
```

### 3. Khởi động Server

```bash
# Terminal 1 - Backend
cd backend
npm start

# Terminal 2 - Frontend
npm start
```

### 4. Test Thanh Toán

1. Truy cập: http://localhost:3000
2. Thêm sản phẩm vào giỏ
3. Chọn phương thức thanh toán
4. Hoàn tất đơn hàng

---

## 🔧 Troubleshooting

### COD không hoạt động

- ✅ Không cần cấu hình gì, kiểm tra database connection

### VNPay lỗi chữ ký

- ❌ Kiểm tra `VNP_HASHSECRET` trong `.env`
- ❌ Xem console log ở backend

### Stripe không hiển thị form

- ❌ Kiểm tra `REACT_APP_STRIPE_PUBLISHABLE_KEY` trong `.env` (root)
- ❌ Restart frontend server

---

## 📚 Tài Liệu Chi Tiết

- 📄 [Stripe Setup Guide](./STRIPE_SETUP.md) - Hướng dẫn chi tiết Stripe
- 📄 [VNPay Documentation](https://sandbox.vnpayment.vn/apis/) - API docs VNPay
- 📄 [Stripe Docs](https://stripe.com/docs) - Stripe official docs

---

## 🎯 Recommendations

### Cho Việt Nam:

1. **COD** - Phổ biến nhất, dễ nhất
2. **VNPay** - Cho khách có thẻ/QR
3. **Stripe** - Backup cho khách quốc tế

### Cho Quốc tế:

1. **Stripe** - Standard global
2. **COD** - Backup
3. **VNPay** - Không cần thiết

---

**🎉 Hoàn tất!** Hệ thống đã có đầy đủ 3 phương thức thanh toán chuyên nghiệp!
