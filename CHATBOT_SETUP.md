# 🚀 HƯỚNG DẪN CÀI ĐẶT CHATBOT

## ✅ ĐÃ HOÀN THÀNH

Code chatbot đã được tích hợp vào project! Bây giờ bạn chỉ cần:

1. Lấy Gemini API key (MIỄN PHÍ)
2. Thêm vào file `.env`
3. Restart server
4. Test chatbot!

---

## 📋 BƯỚC 1: LẤY GEMINI API KEY (2 PHÚT)

### Cách lấy:

1. **Truy cập:** https://makersuite.google.com/app/apikey
2. **Đăng nhập** bằng Gmail của bạn

3. **Click "Create API Key"**

   - Chọn project hoặc tạo project mới
   - Click "Create API key in existing project" (hoặc Create new project)

4. **Copy API key** (dạng: `AIzaSy...`)

---

## 📋 BƯỚC 2: THÊM VÀO FILE .ENV

### Mở file `.env` trong thư mục `backend/`:

```bash
# Mở file
cd backend
notepad .env   # hoặc code .env
```

### Thêm dòng này vào cuối file:

```env
# Gemini AI Chatbot
GEMINI_API_KEY=AIzaSy...YOUR_KEY_HERE...
```

**Thay `AIzaSy...YOUR_KEY_HERE...` bằng key bạn vừa copy!**

**Ví dụ file `.env` đầy đủ:**

```env
PORT=5000
DB_HOST=localhost
DB_USER=root
DB_PASSWORD=yourpassword
DB_NAME=bookztron
JWT_SECRET=your_jwt_secret_key_here

# VNPay (nếu có)
VNPAY_TMN_CODE=your_vnpay_code
VNPAY_HASH_SECRET=your_vnpay_secret

# Gemini AI Chatbot
GEMINI_API_KEY=AIzaSyAbCd1234567890EfGhIjKlMnOpQrStUvWxYz
```

**Lưu file và đóng lại!**

---

## 📋 BƯỚC 3: RESTART SERVER

### Terminal backend (Ctrl+C để stop, rồi chạy lại):

```powershell
cd backend
npm start
```

**Bạn sẽ thấy:**

```
Server đang chạy trên http://localhost:5000
```

### Terminal frontend (nếu chưa chạy):

```powershell
# Từ thư mục gốc project
npm start
```

---

## 📋 BƯỚC 4: TEST CHATBOT

1. **Mở trình duyệt:** http://localhost:3000

2. **Tìm nút chat** ở góc phải màn hình (nút tròn màu tím với icon 💬)

3. **Click vào nút** → Chat window mở ra

4. **Thử hỏi:**

   - "Tư vấn sách cho tôi"
   - "Chính sách giao hàng như thế nào?"
   - "Tôi muốn mua sách về lập trình"
   - "Có sách nào hay không?"

5. **Hoặc click Quick Reply buttons:**
   - 📚 Tư vấn sách
   - 📦 Tra đơn hàng
   - 🚚 Giao hàng
   - 💳 Thanh toán
   - 🔄 Đổi trả
   - 🔥 Sách hot

---

## 🎨 TÍNH NĂNG CHATBOT

### ✅ Đã có:

- 💬 Chat trực tiếp với AI (Gemini)
- 🤖 Tư vấn sách thông minh
- 📚 Giải đáp chính sách (giao hàng, thanh toán, đổi trả)
- ⚡ Quick reply buttons (6 options)
- 💾 Lưu lịch sử chat (localStorage)
- ⌨️ Enter để gửi tin nhắn
- 🎯 Typing indicator
- 🗑️ Xóa lịch sử chat
- 📱 Responsive mobile
- 🔔 Unread badge
- ✨ Animation đẹp

### 🔮 Có thể mở rộng sau:

- Tra cứu đơn hàng từ chat
- Gợi ý sách từ database
- Tích hợp RAG (search sách thông minh)
- Admin dashboard: xem lịch sử chat khách hàng

---

## 🐛 TROUBLESHOOTING

### ❌ Lỗi: "Chatbot chưa được cấu hình"

**Nguyên nhân:** Chưa có `GEMINI_API_KEY` trong `.env`

**Giải pháp:**

1. Kiểm tra file `backend/.env` có dòng `GEMINI_API_KEY=...`
2. Restart backend server

---

### ❌ Lỗi: "API key không hợp lệ"

**Nguyên nhân:** API key sai hoặc đã hết hạn

**Giải pháp:**

1. Kiểm tra copy đúng key chưa (không có khoảng trắng thừa)
2. Thử tạo key mới: https://makersuite.google.com/app/apikey

---

### ❌ Lỗi: "Chatbot tạm thời quá tải"

**Nguyên nhân:** Hết quota miễn phí (60 requests/phút)

**Giải pháp:**

- Đợi 1 phút rồi thử lại
- Quota reset mỗi phút

---

### ❌ Widget không hiện

**Giải pháp:**

1. Clear cache trình duyệt (Ctrl+Shift+R)
2. Kiểm tra console (F12) có lỗi không
3. Đảm bảo frontend đã restart sau khi thêm code

---

## 💰 CHI PHÍ

### ✅ HOÀN TOÀN MIỄN PHÍ!

**Google Gemini Free Tier:**

- 60 requests/phút
- Không giới hạn số requests/ngày
- Không cần thẻ tín dụng
- Đủ cho shop nhỏ/vừa

**Nếu cần nhiều hơn:**

- Upgrade lên Pay-as-you-go (rất rẻ, ~$0.001/1K chars)
- Hoặc dùng OpenAI GPT ($2-5/tháng)

---

## 📞 HỖ TRỢ

**Nếu gặp lỗi, cung cấp:**

1. Screenshot lỗi
2. Console log (F12 → Console)
3. Terminal log (backend)

**Các file đã tạo:**

```
backend/
  controllers/chatbotController.js  ✅
  routes/chatbot.js                 ✅

src/
  Components/ChatbotWidget/
    ChatbotWidget.jsx               ✅
    ChatbotWidget.css               ✅
```

**Đã sửa:**

- `backend/server.js` → đăng ký route `/api/chatbot`
- `src/index.js` → export ChatbotWidget
- `src/App.js` → thêm <ChatbotWidget />

---

## 🎉 DONE!

**Giờ bạn có chatbot AI hoạt động 100%!**

Chỉ cần:

1. ✅ Lấy API key
2. ✅ Thêm vào .env
3. ✅ Restart server
4. ✅ Test thử!

**Good luck! 🚀**
