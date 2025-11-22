# 🔷 Hướng Dẫn Tích Hợp Stripe Thanh Toán

## 📋 Tổng Quan

Stripe đã được tích hợp thành công vào hệ thống như **phương thức thanh toán thứ 3** (bên cạnh COD và VNPay). Stripe hỗ trợ thanh toán bằng thẻ quốc tế, rất phù hợp để test và mở rộng quốc tế.

## ✅ Ưu Điểm Stripe

- ✨ API đơn giản, document rất rõ ràng
- 🔧 Test mode hoàn toàn miễn phí
- 🚀 Không cần merchant verification cho sandbox
- 💳 Hỗ trợ đầy đủ các loại thẻ quốc tế
- 🛡️ Bảo mật PCI-compliant sẵn
- 🌍 Hỗ trợ localhost ngay lập tức

## 🚀 Cài Đặt Nhanh

### 1. Đăng Ký Tài Khoản Stripe (Test Mode)

1. Truy cập: https://dashboard.stripe.com/register
2. Đăng ký tài khoản miễn phí
3. Chuyển sang **Test Mode** (toggle ở góc trái phía trên)

### 2. Lấy API Keys

1. Vào: https://dashboard.stripe.com/test/apikeys
2. Copy 2 keys:
   - **Publishable key** (bắt đầu bằng `pk_test_...`)
   - **Secret key** (bắt đầu bằng `sk_test_...`)

### 3. Cấu Hình Backend

Mở file `backend/.env` và thêm:

```env
# === STRIPE (Test Mode) ===
STRIPE_SECRET_KEY=sk_test_51QRKqkP2xyJlD9KI...  # Key của bạn
STRIPE_PUBLISHABLE_KEY=pk_test_51QRKqkP2xyJlD9KI...  # Key của bạn
STRIPE_WEBHOOK_SECRET=whsec_test_xxx  # (Optional - cho production)
```

### 4. Cấu Hình Frontend

Tạo file `.env` trong thư mục gốc project (cùng cấp với `package.json`):

```env
REACT_APP_STRIPE_PUBLISHABLE_KEY=pk_test_51QRKqkP2xyJlD9KI...
```

### 5. Khởi Động Lại Server

```bash
# Backend
cd backend
npm start

# Frontend (terminal mới)
cd ..
npm start
```

## 🧪 Test Thanh Toán

### Test Cards (Stripe Test Mode)

Stripe cung cấp các số thẻ test:

#### ✅ Thành Công

```
Số thẻ:    4242 4242 4242 4242
MM/YY:     12/34 (bất kỳ ngày trong tương lai)
CVC:       123 (bất kỳ 3 số)
ZIP:       12345 (bất kỳ)
```

#### ❌ Thẻ Bị Từ Chối

```
Số thẻ:    4000 0000 0000 0002
```

#### ⚠️ Yêu Cầu Xác Thực (3D Secure)

```
Số thẻ:    4000 0025 0000 3155
```

### Flow Test

1. Thêm sản phẩm vào giỏ hàng
2. Vào **Checkout**
3. Chọn **"Thanh toán bằng Stripe (Thẻ Quốc tế)"**
4. Nhập thông tin thẻ test
5. Click **"Thanh toán bằng Stripe"**
6. Đơn hàng sẽ được tạo và thanh toán ngay lập tức

## 🏗️ Kiến Trúc Hệ Thống

### Backend (`paymentController.js`)

```javascript
// 1. Tạo Payment Intent
if (paymentMethod === "STRIPE") {
  const paymentIntent = await stripe.paymentIntents.create({
    amount: Math.round(totalAmount * 23500), // VND -> USD cent
    currency: "usd",
    metadata: { orderId, userId },
  });
  return { clientSecret: paymentIntent.client_secret };
}
```

### Frontend (`Checkout.js`)

```javascript
// 2. Confirm Payment với Stripe Elements
const { error, paymentIntent } = await stripe.confirmCardPayment(clientSecret, {
  payment_method: {
    card: elements.getElement(CardElement),
    billing_details: { name, phone },
  },
});

// 3. Xác nhận với Backend
if (paymentIntent.status === "succeeded") {
  await axios.post("/api/payment/stripe-confirm", {
    paymentIntentId,
  });
}
```

## 📊 Admin Panel

Admin có thể xem:

- ✅ Đơn hàng thanh toán qua Stripe
- 💰 Doanh thu theo phương thức (COD/VNPay/Stripe)
- 📈 Thống kê chi tiết

## 🔐 Bảo Mật

### Production Checklist

- [ ] Thay đổi từ Test Mode sang Live Mode
- [ ] Cập nhật Live API Keys
- [ ] Cài đặt Webhook cho production
- [ ] Enable 3D Secure authentication
- [ ] Kiểm tra PCI compliance

### Webhook Setup (Optional)

1. Vào: https://dashboard.stripe.com/test/webhooks
2. Tạo endpoint mới: `https://yourdomain.com/api/payment/stripe-webhook`
3. Chọn events: `payment_intent.succeeded`, `payment_intent.payment_failed`
4. Copy webhook secret vào `.env`

## 🌍 Chuyển Đổi Tiền Tệ

Hiện tại: VND → USD (tỷ giá ~23,500)

```javascript
// Backend tự động convert
amount: Math.round(totalAmount * 23500); // VND -> USD cent
```

**Lưu ý**: Stripe test mode yêu cầu USD. Production có thể dùng VND nếu đăng ký.

## 🛠️ Troubleshooting

### Lỗi: "Invalid API Key"

- Kiểm tra lại `STRIPE_SECRET_KEY` trong `backend/.env`
- Đảm bảo key bắt đầu bằng `sk_test_`

### Lỗi: Stripe Elements không hiển thị

- Kiểm tra `REACT_APP_STRIPE_PUBLISHABLE_KEY` trong `.env` (root folder)
- Khởi động lại frontend

### Lỗi: Payment không hoàn tất

- Xem console log ở backend
- Kiểm tra Stripe Dashboard: https://dashboard.stripe.com/test/payments

## 📚 Tài Liệu Tham Khảo

- [Stripe API Docs](https://stripe.com/docs/api)
- [Stripe React Integration](https://stripe.com/docs/stripe-js/react)
- [Test Cards](https://stripe.com/docs/testing)
- [Webhooks Guide](https://stripe.com/docs/webhooks)

## 💡 Next Steps

- [ ] Thêm hỗ trợ Apple Pay / Google Pay
- [ ] Tích hợp Stripe Checkout (hosted payment page)
- [ ] Thêm subscription payment
- [ ] Multi-currency support

---

**🎉 Hoàn Tất!** Stripe đã được tích hợp thành công. Giờ bạn có 3 phương thức thanh toán:

1. 💵 COD (Thanh toán khi nhận hàng)
2. 🇻🇳 VNPay (QR/Thẻ nội địa)
3. 💳 Stripe (Thẻ quốc tế)
