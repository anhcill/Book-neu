# 📚 HƯỚNG DẪN SỬ DỤNG API ADMIN - NEU BOOK

## 🔐 Xác thực
Tất cả các API Admin yêu cầu:
- Header: `x-access-token: <your-jwt-token>`
- User phải có `role: 'admin'` trong database

## 🎯 CÁC BƯỚC THIẾT LẬP BAN ĐẦU

### 1. Tạo thư mục lưu ảnh
```bash
mkdir backend/public
mkdir backend/public/images
```

### 2. Cập nhật role cho Admin
Vào phpMyAdmin → Bảng `users` → Chọn user bạn muốn làm Admin → Sửa cột `role` từ `'user'` thành `'admin'`

### 3. Khởi động server
```bash
cd backend
npm start
```

---

## 📤 API UPLOAD ẢNH

### POST `/api/admin/upload`
**Mô tả:** Upload ảnh sản phẩm

**Headers:**
```
x-access-token: your-jwt-token
Content-Type: multipart/form-data
```

**Body (Form Data):**
- `image`: File ảnh (jpeg, jpg, png, gif, webp)
- Giới hạn: 5MB

**Response thành công (200):**
```json
{
  "message": "Tải ảnh lên thành công",
  "imageUrl": "/images/1234567890-book.jpg"
}
```

**Lưu ý:** Lưu `imageUrl` này để sử dụng khi tạo sản phẩm

---

## 📦 API QUẢN LÝ SẢN PHẨM

### 1. Tạo sản phẩm mới
**POST** `/api/admin/products`

**Headers:**
```
x-access-token: your-jwt-token
Content-Type: application/json
```

**Body:**
```json
{
  "bookName": "Dế Mèn Phiêu Lưu Ký",
  "author": "Tô Hoài",
  "price": 45000,
  "categoryName": "fiction",
  "imageUrl": "/images/1234567890-book.jpg",
  "rating": 4.5,
  "inStock": true,
  "fastDelivery": false,
  "originalPrice": 50000,
  "discount": 10
}
```

**Trường bắt buộc:** `bookName`, `author`, `price`, `categoryName`, `imageUrl`

**Response (201):**
```json
{
  "message": "Tạo sản phẩm thành công",
  "product": { ... }
}
```

---

### 2. Lấy danh sách tất cả sản phẩm
**GET** `/api/admin/products?page=1&limit=20`

**Query Parameters:**
- `page`: Trang số (mặc định: 1)
- `limit`: Số sản phẩm mỗi trang (mặc định: 20)

**Response (200):**
```json
{
  "totalProducts": 150,
  "totalPages": 8,
  "currentPage": 1,
  "products": [...]
}
```

---

### 3. Lấy chi tiết sản phẩm
**GET** `/api/admin/products/:id`

**Response (200):**
```json
{
  "id": 1,
  "bookName": "Dế Mèn Phiêu Lưu Ký",
  "author": "Tô Hoài",
  ...
}
```

---

### 4. Cập nhật sản phẩm
**PUT** `/api/admin/products/:id`

**Body:** (Chỉ gửi các trường cần update)
```json
{
  "price": 40000,
  "inStock": false
}
```

**Response (200):**
```json
{
  "message": "Cập nhật sản phẩm thành công",
  "product": { ... }
}
```

---

### 5. Xóa sản phẩm
**DELETE** `/api/admin/products/:id`

**Response (200):**
```json
{
  "message": "Xóa sản phẩm thành công"
}
```

---

## 📋 API QUẢN LÝ ĐƠN HÀNG

### 1. Lấy tất cả đơn hàng
**GET** `/api/admin/orders?page=1&limit=20&status=completed`

**Query Parameters:**
- `page`: Trang số (mặc định: 1)
- `limit`: Số đơn hàng mỗi trang (mặc định: 20)
- `status`: Lọc theo trạng thái (optional)
  - Giá trị: `pending`, `processing`, `shipped`, `completed`, `cancelled`, `failed`

**Response (200):**
```json
{
  "totalOrders": 500,
  "totalPages": 25,
  "currentPage": 1,
  "orders": [
    {
      "id": 1,
      "userId": 5,
      "totalAmount": 150000,
      "status": "completed",
      "paymentMethod": "VNPAY",
      "shippingAddress": "...",
      "createdAt": "2024-01-15T10:30:00.000Z",
      "User": {
        "id": 5,
        "username": "nguoidung1",
        "email": "user@example.com"
      },
      "orderItems": [...]
    }
  ]
}
```

---

### 2. Lấy chi tiết đơn hàng
**GET** `/api/admin/orders/:id`

**Response (200):**
```json
{
  "id": 1,
  "userId": 5,
  "totalAmount": 150000,
  "status": "completed",
  "User": { ... },
  "orderItems": [ ... ]
}
```

---

### 3. Cập nhật trạng thái đơn hàng
**PUT** `/api/admin/orders/:id`

**Body:**
```json
{
  "status": "shipped"
}
```

**Trạng thái hợp lệ:**
- `pending` - Chờ xử lý
- `processing` - Đang xử lý
- `shipped` - Đã giao cho vận chuyển
- `completed` - Hoàn thành
- `cancelled` - Đã hủy
- `failed` - Thất bại

**Response (200):**
```json
{
  "message": "Cập nhật trạng thái đơn hàng thành công",
  "order": { ... }
}
```

---

### 4. Lấy thống kê tổng quan
**GET** `/api/admin/orders/stats/summary`

**Response (200):**
```json
{
  "totalOrders": 500,
  "totalRevenue": 75000000,
  "ordersByStatus": [
    { "status": "completed", "count": "350" },
    { "status": "processing", "count": "100" },
    { "status": "pending", "count": "50" }
  ],
  "topProducts": [
    {
      "productId": 12,
      "totalSold": "250",
      "Product": {
        "bookName": "Đắc Nhân Tâm",
        "author": "Dale Carnegie",
        "imageUrl": "/images/..."
      }
    }
  ]
}
```

---

## 🧪 TEST API BẰNG POSTMAN

### 1. Đăng nhập để lấy token
```
POST http://localhost:5000/api/login
Body: { "userEmail": "admin@example.com", "userPassword": "123456" }
```
→ Copy `token` từ response

### 2. Test upload ảnh
```
POST http://localhost:5000/api/admin/upload
Headers: x-access-token: <token>
Body (form-data): image: [Chọn file]
```

### 3. Test tạo sản phẩm
```
POST http://localhost:5000/api/admin/products
Headers: 
  x-access-token: <token>
  Content-Type: application/json
Body: { ... }
```

---

## ⚠️ LƯU Ý QUAN TRỌNG

1. **Phân quyền:** Chỉ user có `role = 'admin'` mới được truy cập
2. **Bảo mật:** Không để lộ JWT token
3. **Upload ảnh:**
   - Chỉ chấp nhận: jpeg, jpg, png, gif, webp
   - Giới hạn: 5MB
   - Ảnh được lưu vào: `backend/public/images/`
4. **Xóa sản phẩm:** Cẩn thận khi xóa, không thể khôi phục
5. **Cập nhật đơn hàng:** Chỉ thay đổi trạng thái, không thay đổi thông tin khác

---

## 🐛 XỬ LÝ LỖI THƯỜNG GẶP

**403 - Không có quyền:**
→ Kiểm tra `role` trong database đã là `'admin'` chưa

**401 - Token không hợp lệ:**
→ Đăng nhập lại để lấy token mới

**400 - Thiếu thông tin:**
→ Kiểm tra các trường bắt buộc trong body

**500 - Lỗi server:**
→ Xem log trong terminal backend để biết chi tiết

---

🎉 **Hoàn thành Giai đoạn 1!** Tiếp theo sẽ là xây dựng Frontend Admin.
