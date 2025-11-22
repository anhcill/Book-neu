# 🚨 Sửa Lỗi VNPay "Không Tìm Thấy Website" (Error Code 72)

## ❌ Nguyên Nhân

VNPay Sandbox **KHÔNG CHẤP NHẬN** `localhost` trong môi trường test thực tế. Bạn cần **public URL**.

## ✅ Giải Pháp: Dùng Ngrok

### Bước 1: Cài Đặt Ngrok

```powershell
# Tải ngrok từ: https://ngrok.com/download
# Hoặc dùng chocolatey:
choco install ngrok

# Đăng ký tài khoản miễn phí tại: https://dashboard.ngrok.com/signup
```

### Bước 2: Kết Nối Ngrok với Frontend

```powershell
# Mở terminal mới, chạy:
ngrok http 3000
```

Bạn sẽ nhận được URL như:

```
Forwarding  https://abc-123-456.ngrok-free.app -> http://localhost:3000
```

### Bước 3: Cập Nhật `.env` Backend

Mở `backend/.env`, sửa:

```env
# Thay URL localhost bằng ngrok URL
VNP_RETURN_URL=https://abc-123-456.ngrok-free.app/vnpay_return

# Giữ nguyên các cấu hình khác
VNP_TMNCODE=2QXUI4B4
VNP_HASHSECRET=SEKDH2VGZV6LT6ZD0XXJJ13GDQO60ZOZ
VNP_URL=https://sandbox.vnpayment.vn/paymentv2/vpcpay.html
```

### Bước 4: Restart Backend

```powershell
cd backend
# Ctrl+C để dừng
npm start
```

### Bước 5: Truy Cập Qua Ngrok URL

Thay vì `http://localhost:3000`, dùng:

```
https://abc-123-456.ngrok-free.app
```

### Bước 6: Test VNPay

1. Thêm sản phẩm vào giỏ
2. Chọn VNPay
3. Thanh toán với thẻ test

---

## 🎯 Cách Nhanh Hơn: Test COD hoặc Stripe Trước

### COD - Không Cần Cấu Hình Gì

✅ Hoạt động ngay với localhost

### Stripe - Chấp Nhận Localhost

✅ Test ngay không cần ngrok

### VNPay - Cần Public URL

⚠️ Chỉ hoạt động qua ngrok hoặc domain thật

---

## 📝 Chi Tiết Lỗi Code 72

VNPay trả về mã lỗi 72 nghĩa là:

- **Không tìm thấy website** - `vnp_ReturnUrl` không hợp lệ
- Có thể do:
  - URL không public (localhost)
  - URL không đúng định dạng
  - URL bị firewall chặn

---

## 🔧 Debug Steps

### 1. Kiểm Tra Ngrok Đang Chạy

```powershell
# Trong terminal ngrok, bạn phải thấy:
Forwarding  https://xxx.ngrok-free.app -> http://localhost:3000
```

### 2. Kiểm Tra Backend Log

```powershell
# Terminal backend sẽ in ra:
Final VNPay URL: https://sandbox.vnpayment.vn/...
```

Copy URL này, kiểm tra tham số `vnp_ReturnUrl` có đúng là ngrok URL không.

### 3. Nếu Vẫn Lỗi

Đăng ký tài khoản VNPay sandbox mới tại:
https://sandbox.vnpayment.vn/devreg/

Sau đó cập nhật `VNP_TMNCODE` và `VNP_HASHSECRET` mới.

---

## 💡 Khuyến Nghị

**Để test nhanh, dùng thứ tự này:**

1. ✅ **COD** - Test đầu tiên (không cần config)
2. ✅ **Stripe** - Test thứ 2 (chấp nhận localhost)
3. ⚠️ **VNPay** - Test cuối (cần ngrok)

---

## 🚀 Quick Commands

```powershell
# Terminal 1: Backend
cd backend
npm start

# Terminal 2: Frontend
npm start

# Terminal 3: Ngrok (chỉ cần khi test VNPay)
ngrok http 3000

# Sau đó truy cập: https://YOUR-NGROK-URL.ngrok-free.app
```

---

## ❓ Câu Hỏi Thường Gặp

**Q: Ngrok free có giới hạn gì không?**
A: Free plan đủ để test, nhưng URL sẽ thay đổi mỗi lần restart ngrok.

**Q: Có cách nào không dùng ngrok?**
A: Có, nhưng cần:

- Deploy lên server thật (Heroku, Vercel, Railway...)
- Hoặc dùng VPS có domain

**Q: Tại sao Stripe không cần ngrok?**
A: Stripe được thiết kế cho developer, hỗ trợ localhost ngay từ đầu.

---

**Liên hệ nếu cần hỗ trợ thêm!** 🎉
