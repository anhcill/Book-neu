const { GoogleGenerativeAI } = require("@google/generative-ai");

// Khởi tạo Gemini AI
const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);

// System prompt cho chatbot
const SYSTEM_PROMPT = `Bạn là trợ lý AI thông minh của Bookztron - cửa hàng sách trực tuyến hàng đầu Việt Nam.

THÔNG TIN CỬA HÀNG:
- Tên: Bookztron E-Commerce Book Store
- Chuyên: Bán sách online với hàng ngàn đầu sách đa dạng
- Đặc điểm: Giao diện thân thiện, thanh toán an toàn (VNPay), giao hàng nhanh

CÁC TÍNH NĂNG CHÍNH:
1. Tìm kiếm & lọc sách theo thể loại (Fiction, Non-Fiction, Science, History, Biography, Children...)
2. Giỏ hàng & Wishlist (Yêu thích)
3. Thanh toán: VNPay Gateway hoặc COD (tiền mặt)
4. Theo dõi đơn hàng real-time: pending → confirmed → shipped → delivered
5. Lịch sử giao hàng
6. Hệ thống thông báo đơn hàng
7. Trang Admin quản lý sản phẩm & đơn hàng

VAI TRÒ CỦA BẠN:
✅ Tư vấn sách (thể loại, tác giả, nội dung)
✅ Hướng dẫn sử dụng website (tìm sách, đặt hàng, thanh toán)
✅ Giải đáp thắc mắc (giao hàng, thanh toán, đổi trả)
✅ Gợi ý sách theo sở thích
✅ Hỗ trợ kỹ thuật đơn giản (reset password, cập nhật thông tin)

PHONG CÁCH GIAO TIẾP:
- Thân thiện, nhiệt tình, chuyên nghiệp
- Trả lời ngắn gọn, dễ hiểu (2-4 câu)
- Dùng emoji phù hợp 📚 📖 ✨ 🎁
- Luôn đề xuất hành động cụ thể

CHÚ Ý:
- KHÔNG bịa đặt thông tin sách/giá cả không có trong database
- Nếu không biết thông tin cụ thể, hướng dẫn user tìm trên web hoặc liên hệ admin
- Ưu tiên giải pháp tự phục vụ (self-service)`;

// @route   POST api/chatbot/message
// @desc    Gửi tin nhắn và nhận phản hồi từ Gemini AI
// @access  Public
exports.sendMessage = async (req, res) => {
  try {
    const { message, conversationHistory = [] } = req.body;

    if (!message || message.trim() === "") {
      return res.status(400).json({
        status: "error",
        message: "Tin nhắn không được để trống"
      });
    }

    // Kiểm tra API key và thử Gemini API
    if (process.env.GEMINI_API_KEY) {
      try {
        // Khởi tạo model
        const model = genAI.getGenerativeModel({ model: "gemini-pro" });

        // Xây dựng context ngắn gọn
        let conversationContext = SYSTEM_PROMPT + "\n\n";
        conversationContext += `Khách hàng: ${message}\nBạn:`;

        // Gọi Gemini API với timeout
        const result = await Promise.race([
          model.generateContent(conversationContext),
          new Promise((_, reject) => 
            setTimeout(() => reject(new Error('Timeout')), 8000)
          )
        ]);
        
        const response = await result.response;
        const botReply = response.text();

        return res.json({
          status: "ok",
          reply: botReply,
          timestamp: new Date().toISOString()
        });

      } catch (apiError) {
        console.log("⚠️ Gemini API không khả dụng, sử dụng fallback response");
      }
    }

    // Fallback responses khi Gemini không hoạt động
    const fallbackResponses = {
      "xin chào": "Xin chào! 👋 Tôi là trợ lý AI của Bookztron. Tôi có thể giúp bạn:\n\n📚 Tư vấn chọn sách\n🔍 Tìm sách theo thể loại\n📦 Kiểm tra đơn hàng\n💳 Hướng dẫn thanh toán\n\nBạn cần hỗ trợ gì?",
      "hello": "Hello! 👋 Welcome to Bookztron! I can help you with:\n\n📚 Book recommendations\n🔍 Finding books by category\n📦 Order tracking\n💳 Payment support\n\nHow can I assist you?",
      "sách": "📚 Bookztron có hàng ngàn đầu sách thuộc các thể loại:\n\n• Fiction - Tiểu thuyết hay\n• Non-Fiction - Sách thiết thực\n• Science - Khoa học công nghệ\n• Children - Sách thiếu nhi\n• Business - Kinh doanh\n\nBạn quan tâm thể loại nào?",
      "đơn hàng": "📦 Để kiểm tra đơn hàng:\n\n1. Đăng nhập tài khoản\n2. Vào mục 'Orders'\n3. Xem trạng thái real-time\n\nHoặc cung cấp mã đơn hàng để tôi hỗ trợ!",
      "thanh toán": "💳 Bookztron hỗ trợ:\n\n✅ VNPay - ATM/Visa/MasterCard\n✅ COD - Tiền mặt khi nhận\n\n🔒 An toàn 100% - Bảo mật tuyệt đối"
    };

    // Tìm response phù hợp
    const lowerMessage = message.toLowerCase();
    let reply = "Xin chào! 👋 Tôi là trợ lý AI của Bookztron. Hiện tại tôi đang trong chế độ bảo trì nhẹ, nhưng vẫn có thể hỗ trợ bạn:\n\n📚 Duyệt sách trong Shop\n🔍 Tìm kiếm theo thể loại\n📦 Kiểm tra đơn hàng\n💬 Sử dụng các nút quick reply bên dưới\n\nCảm ơn bạn đã kiên nhẫn! 😊";

    for (const [key, value] of Object.entries(fallbackResponses)) {
      if (lowerMessage.includes(key)) {
        reply = value;
        break;
      }
    }

    res.json({
      status: "ok",
      reply: reply,
      timestamp: new Date().toISOString()
    });

  } catch (error) {
    console.error("❌ CHATBOT CONTROLLER ERROR:", error);
    
    res.json({
      status: "ok",
      reply: "Xin lỗi, tôi gặp chút vấn đề kỹ thuật. Nhưng bạn vẫn có thể:\n\n📚 Duyệt sách trong Shop\n🔍 Sử dụng tìm kiếm\n📞 Liên hệ support nếu cần gấp\n\nCảm ơn bạn! 🙏",
      timestamp: new Date().toISOString()
    });
  }
};

// @route   POST api/chatbot/quick-reply
// @desc    Xử lý các câu trả lời nhanh (quick replies)
// @access  Public
exports.handleQuickReply = async (req, res) => {
  try {
    const { action } = req.body;

    const quickReplies = {
      "recommend_books": {
        reply: "📚 Để tìm sách phù hợp, hãy cho tôi biết:\n\n1. Bạn thích thể loại gì? (Fiction, Non-Fiction, Science, History...)\n2. Tác giả yêu thích?\n3. Độ tuổi đọc?\n\nTôi sẽ gợi ý những cuốn hay nhất! ✨"
      },
      "track_order": {
        reply: "📦 Để tra cứu đơn hàng:\n\n1. Đăng nhập vào tài khoản\n2. Vào mục 'Orders' (Đơn hàng)\n3. Xem chi tiết: pending → confirmed → shipped → delivered\n\nHoặc nhập mã đơn hàng để tôi kiểm tra giúp bạn! 🔍"
      },
      "shipping_policy": {
        reply: "🚚 CHÍNH SÁCH GIAO HÀNG:\n\n- **Nội thành HN/HCM**: 1-2 ngày\n- **Tỉnh thành khác**: 3-5 ngày\n- **Miễn phí ship** đơn từ 200k\n- **Fast delivery** cho sách có sẵn\n\n📍 Tracking real-time qua SMS/Email!"
      },
      "payment_methods": {
        reply: "💳 PHƯƠNG THỨC THANH TOÁN:\n\n✅ **VNPay Gateway** - ATM/Visa/MasterCard\n✅ **COD** - Tiền mặt khi nhận hàng\n\n🔒 Bảo mật 100% - An toàn tuyệt đối\n💰 Không phí giao dịch cho VNPay"
      },
      "return_policy": {
        reply: "🔄 CHÍNH SÁCH ĐỔI TRẢ:\n\n✅ **7 ngày** đổi trả nếu sách lỗi\n✅ **Hoàn tiền 100%** nếu giao sai\n✅ **Miễn phí ship** đổi trả\n\n📞 Hotline: 1900-xxxx\n✉️ Email: support@bookztron.com"
      },
      "bestsellers": {
        reply: "🔥 TOP SÁCH BÁN CHẠY TUẦN NÀY:\n\n📖 Fiction: Bestseller novels\n🔬 Science: Latest discoveries\n💼 Business: Success stories\n👶 Children: Educational & fun\n\n👉 Xem full list tại mục 'Shop' hoặc 'New Arrivals'!"
      }
    };

    const response = quickReplies[action];

    if (!response) {
      return res.status(400).json({
        status: "error",
        message: "Quick reply không hợp lệ"
      });
    }

    res.json({
      status: "ok",
      reply: response.reply,
      timestamp: new Date().toISOString()
    });

  } catch (error) {
    console.error("❌ LỖI QUICK REPLY:", error);
    res.status(500).json({
      status: "error",
      message: "Có lỗi xảy ra",
      error: error.message
    });
  }
};
