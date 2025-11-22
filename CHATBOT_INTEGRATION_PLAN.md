# 🤖 KẾ HOẠCH TÍCH HỢP CHATBOT CHO BOOKZTRON

## 📋 MỤC TIÊU

Tích hợp chatbot AI thông minh để:

- Hỗ trợ khách hàng 24/7
- Tư vấn sách phù hợp với nhu cầu
- Tra cứu đơn hàng, tình trạng giao hàng
- Giải đáp thắc mắc về sản phẩm, chính sách
- Tăng tỷ lệ chuyển đổi và trải nghiệm người dùng

---

## 🎯 PHƯƠNG ÁN TRIỂN KHAI

### **Phương án 1: Chatbot API Third-Party (Khuyến nghị - Nhanh & Hiệu quả)**

#### **Option 1A: OpenAI ChatGPT API**

**Ưu điểm:**

- ✅ Hiểu ngữ cảnh tốt, trả lời tự nhiên
- ✅ Dễ tích hợp (thư viện `openai` cho Node.js)
- ✅ Hỗ trợ tiếng Việt tốt
- ✅ Có thể tùy chỉnh prompt cho domain sách

**Nhược điểm:**

- ❌ Chi phí API (khoảng $0.002/1K tokens - GPT-3.5-turbo)
- ❌ Cần API key và quản lý quota

**Chi phí ước tính:**

- 1000 tin nhắn/ngày ≈ $2-5/tháng (GPT-3.5)
- Dùng GPT-4o-mini giá rẻ hơn: ~$1/tháng

**Cài đặt:**

```bash
npm install openai
```

**Implementation:**

```javascript
// backend/controllers/chatbotController.js
const OpenAI = require("openai");
const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

exports.chatCompletion = async (req, res) => {
  const { message, conversationHistory } = req.body;

  const systemPrompt = `Bạn là trợ lý AI của Bookztron - cửa hàng sách trực tuyến.
  Nhiệm vụ:
  - Tư vấn sách phù hợp với nhu cầu khách hàng
  - Giải đáp về chính sách đổi trả, giao hàng, thanh toán
  - Hướng dẫn tra cứu đơn hàng
  - Giọng điệu thân thiện, chuyên nghiệp
  
  Thông tin cửa hàng:
  - Giao hàng toàn quốc 2-5 ngày
  - Thanh toán: COD, VNPay
  - Chính sách đổi trả trong 7 ngày`;

  try {
    const completion = await openai.chat.completions.create({
      model: "gpt-3.5-turbo",
      messages: [
        { role: "system", content: systemPrompt },
        ...conversationHistory,
        { role: "user", content: message },
      ],
      temperature: 0.7,
      max_tokens: 500,
    });

    res.json({
      status: "ok",
      reply: completion.choices[0].message.content,
    });
  } catch (error) {
    res.status(500).json({ status: "error", message: error.message });
  }
};
```

---

#### **Option 1B: Google Gemini API (Miễn phí!)**

**Ưu điểm:**

- ✅ **MIỄN PHÍ** với quota 60 requests/phút
- ✅ Hiệu suất tương đương ChatGPT
- ✅ Dễ tích hợp
- ✅ Hỗ trợ tiếng Việt tốt

**Cài đặt:**

```bash
npm install @google/generative-ai
```

**Implementation:**

```javascript
const { GoogleGenerativeAI } = require("@google/generative-ai");
const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);

exports.chatCompletion = async (req, res) => {
  const { message } = req.body;
  const model = genAI.getGenerativeModel({ model: "gemini-pro" });

  const prompt = `Bạn là trợ lý AI của Bookztron...
  
  Câu hỏi của khách: ${message}`;

  try {
    const result = await model.generateContent(prompt);
    res.json({ status: "ok", reply: result.response.text() });
  } catch (error) {
    res.status(500).json({ status: "error", message: error.message });
  }
};
```

---

#### **Option 1C: Facebook Messenger Bot**

**Ưu điểm:**

- ✅ Miễn phí
- ✅ Khách hàng quen thuộc với Messenger
- ✅ Tích hợp dễ qua Webhook

**Nhược điểm:**

- ❌ Cần fanpage Facebook
- ❌ NLP cơ bản (trừ khi kết hợp Wit.ai)

---

### **Phương án 2: Chatbot Widget Có Sẵn (Dễ & Nhanh)**

#### **Option 2A: Tawk.to (Miễn phí)**

**Ưu điểm:**

- ✅ 100% miễn phí
- ✅ Live chat + chatbot tự động
- ✅ Tích hợp 5 phút (chèn script)
- ✅ Có app mobile để admin trả lời real-time

**Cài đặt:**

```html
<!-- Thêm vào public/index.html -->
<script type="text/javascript">
  var Tawk_API = Tawk_API || {},
    Tawk_LoadStart = new Date();
  (function () {
    var s1 = document.createElement("script"),
      s0 = document.getElementsByTagName("script")[0];
    s1.async = true;
    s1.src = "https://embed.tawk.to/YOUR_TAWK_ID/default";
    s1.charset = "UTF-8";
    s1.setAttribute("crossorigin", "*");
    s0.parentNode.insertBefore(s1, s0);
  })();
</script>
```

---

#### **Option 2B: Tidio**

- Live chat + chatbot rules-based
- Freemium (50 conversations/tháng miễn phí)

---

### **Phương án 3: Custom AI Chatbot với RAG (Nâng cao)**

**Công nghệ:**

- Vector Database (Pinecone/Weaviate) lưu thông tin sách
- OpenAI Embeddings để tìm kiếm semantic
- LangChain để orchestrate

**Ưu điểm:**

- ✅ Trả lời chính xác dựa trên data thực
- ✅ Tư vấn sách dựa trên mô tả, tác giả, thể loại
- ✅ Không bịa đặt thông tin (hallucination)

**Nhược điểm:**

- ❌ Phức tạp, cần 1-2 tuần dev
- ❌ Chi phí cao hơn (embedding + vector DB)

**Kiến trúc:**

```
User question
  → Embedding (OpenAI)
  → Vector search (tìm sách liên quan)
  → LLM (GPT) tổng hợp trả lời
  → Response
```

---

## 🚀 KHUYẾN NGHỊ TRIỂN KHAI THEO GIAI ĐOẠN

### **Giai đoạn 1: Quick Win (1-2 ngày)**

**→ Tích hợp Tawk.to hoặc Tidio**

- Zero code, chỉ cần chèn script
- Admin trả lời live chat qua app
- Cài rules đơn giản: "Xin chào", "Giờ mở cửa", "Chính sách"

**Ước tính:** 2 giờ setup

---

### **Giai đoạn 2: AI Chatbot Cơ Bản (3-5 ngày)**

**→ Tích hợp Google Gemini API (miễn phí)**

**Backend:**

```
backend/
  controllers/
    chatbotController.js  (NEW)
  routes/
    chatbot.js           (NEW)
```

**Frontend:**

```
src/
  Components/
    ChatbotWidget/
      ChatbotWidget.jsx  (NEW)
      ChatbotWidget.css  (NEW)
```

**Features:**

- Widget chat góc phải màn hình
- Lịch sử conversation (localStorage)
- Typing indicator
- Quick replies: "Tư vấn sách", "Tra đơn hàng", "Chính sách"
- Kết nối Gemini API từ backend

**API Endpoints:**

```javascript
POST /api/chatbot/message
Body: { message: "Tôi muốn mua sách về lập trình", conversationId: "xyz" }
Response: { reply: "Bookztron có nhiều...", conversationId: "xyz" }
```

**Ước tính:** 3-4 ngày dev + test

---

### **Giai đoạn 3: Advanced Features (1-2 tuần)**

**→ RAG + Order Lookup + Recommendations**

**Tính năng:**

1. **Order Lookup:**

   - User: "Đơn hàng của tôi đến đâu rồi?"
   - Bot: "Cho tôi xin mã đơn hoặc email đặt hàng"
   - → Query database → Trả kết quả

2. **Smart Recommendations:**

   - Phân tích câu hỏi → Search sách phù hợp trong DB
   - "Tôi thích sách trinh thám" → Gợi ý 5 cuốn

3. **FAQs:**
   - Train bot với Q&A về shipping, payment, returns

**Kiến trúc:**

```
User → Frontend Widget → Backend API
                          ↓
        Gemini/GPT + Function calling
                ↓                    ↓
        Vector DB (sách)    MySQL (orders, users)
```

**Ước tính:** 1-2 tuần

---

## 💰 SO SÁNH CHI PHÍ

| Giải pháp      | Chi phí tháng | Thời gian triển khai | Khả năng mở rộng   |
| -------------- | ------------- | -------------------- | ------------------ |
| Tawk.to        | **$0**        | 2 giờ                | Thấp (rules-based) |
| Tidio          | $0-19         | 3 giờ                | Thấp               |
| Google Gemini  | **$0**        | 3-5 ngày             | Cao                |
| OpenAI GPT-3.5 | $2-10         | 3-5 ngày             | Cao                |
| RAG + Gemini   | $5-20         | 1-2 tuần             | Rất cao            |

---

## 📦 FILES CẦN TẠO (Giai đoạn 2)

### Backend:

```
backend/
  controllers/
    chatbotController.js
  routes/
    chatbot.js
  .env (thêm GEMINI_API_KEY hoặc OPENAI_API_KEY)
```

### Frontend:

```
src/
  Components/
    ChatbotWidget/
      ChatbotWidget.jsx
      ChatbotWidget.css
  Assets/
    Icons/
      chatbot-icon.svg
```

### Dependencies:

```json
// backend/package.json
{
  "dependencies": {
    "@google/generative-ai": "^0.1.0"  // hoặc
    "openai": "^4.0.0"
  }
}
```

---

## 🎨 UI/UX MOCKUP

```
┌─────────────────────────────────────┐
│   Bookztron                    🔔👤│
├─────────────────────────────────────┤
│                                     │
│   [Sản phẩm]                        │
│                                     │
│                     ┌─────────────┐ │
│                     │ 💬 Chat Bot │ ← Widget góc phải
│                     └─────────────┘ │
└─────────────────────────────────────┘

Khi click vào:
┌──────────────────────────┐
│ Bookztron Bot       ✕    │
├──────────────────────────┤
│ Bot: Xin chào! Tôi có   │
│ thể giúp gì cho bạn?     │
│                          │
│ [Tư vấn sách]           │
│ [Tra đơn hàng]          │
│ [Chính sách]            │
├──────────────────────────┤
│ You: [Nhập tin nhắn...] │
│                      [→] │
└──────────────────────────┘
```

---

## 🔐 BẢO MẬT & BEST PRACTICES

1. **API Key Security:**

   - Lưu trong `.env`, không commit
   - Backend call API, không expose key ra frontend

2. **Rate Limiting:**

   - Giới hạn 10 messages/phút/user
   - Tránh spam/abuse

3. **Data Privacy:**

   - Không log thông tin nhạy cảm (email, SĐT)
   - GDPR compliance nếu có user EU

4. **Fallback:**
   - Nếu API lỗi → "Xin lỗi, bot tạm thời gián đoạn. Vui lòng liên hệ admin@bookztron.com"

---

## ✅ CHECKLIST TRIỂN KHAI

### **Giai đoạn 1 (Quick Win):**

- [ ] Đăng ký Tawk.to
- [ ] Chèn script vào `public/index.html`
- [ ] Cài app Tawk.to mobile
- [ ] Test chat

### **Giai đoạn 2 (AI Bot):**

- [ ] Chọn API (Gemini hoặc OpenAI)
- [ ] Đăng ký API key
- [ ] Tạo `backend/controllers/chatbotController.js`
- [ ] Tạo `backend/routes/chatbot.js`
- [ ] Register route trong `server.js`
- [ ] Tạo `ChatbotWidget.jsx` component
- [ ] Design prompt system phù hợp Bookztron
- [ ] Test với các câu hỏi mẫu
- [ ] Deploy và monitor

---

## 📞 HỖ TRỢ & TÀI LIỆU

**Google Gemini:**

- Docs: https://ai.google.dev/docs
- Free tier: 60 requests/minute
- Get API key: https://makersuite.google.com/app/apikey

**OpenAI:**

- Docs: https://platform.openai.com/docs
- Pricing: https://openai.com/pricing
- Get API key: https://platform.openai.com/api-keys

**Tawk.to:**

- Website: https://www.tawk.to
- Docs: https://help.tawk.to

---

## 🎯 KẾT LUẬN & KHUYẾN NGHỊ

**Khuyến nghị ngắn hạn (tuần này):**
→ **Google Gemini API** (miễn phí, mạnh, dễ tích hợp)

**Roadmap dài hạn:**

1. Tuần 1: Tích hợp Gemini chatbot cơ bản
2. Tuần 2-3: Thêm order lookup & book recommendations
3. Tháng 2: Nâng cấp lên RAG với vector search
4. Tháng 3+: Analytics, A/B testing, fine-tune prompts

**ROI dự kiến:**

- ↑ 15-25% conversion rate
- ↓ 40% support tickets
- ↑ Customer satisfaction

---

**Bạn muốn bắt đầu với phương án nào?**

1. Quick win: Tawk.to (2 giờ)
2. AI Bot với Gemini (3-5 ngày)
3. Full RAG system (1-2 tuần)

Nếu chọn option 2, tôi có thể bắt đầu code ngay! 🚀
