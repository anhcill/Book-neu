import React, { useState, useEffect, useRef } from 'react';
import axios from 'axios';
import './ChatbotWidget.css';

function ChatbotWidget() {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState([]);
  const [inputValue, setInputValue] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const [hasUnread, setHasUnread] = useState(false);
  const messagesEndRef = useRef(null);

  console.log('ChatbotWidget rendered'); // Debug log

  // Quick reply buttons
  const quickReplies = [
    { id: 'recommend_books', label: '📚 Tư vấn sách', icon: '📚' },
    { id: 'track_order', label: '📦 Tra đơn hàng', icon: '📦' },
    { id: 'shipping_policy', label: '🚚 Giao hàng', icon: '🚚' },
    { id: 'payment_methods', label: '💳 Thanh toán', icon: '💳' },
    { id: 'return_policy', label: '🔄 Đổi trả', icon: '🔄' },
    { id: 'bestsellers', label: '🔥 Sách hot', icon: '🔥' }
  ];

  // Load chat history từ localStorage
  useEffect(() => {
    const savedMessages = localStorage.getItem('bookztron_chat_history');
    if (savedMessages) {
      try {
        setMessages(JSON.parse(savedMessages));
      } catch (e) {
        console.error('Lỗi load chat history:', e);
      }
    } else {
      // Welcome message
      setMessages([{
        role: 'bot',
        content: 'Xin chào! 👋 Tôi là trợ lý AI của Bookztron. Tôi có thể giúp gì cho bạn hôm nay?',
        timestamp: new Date().toISOString()
      }]);
    }
  }, []);

  // Save chat history
  useEffect(() => {
    if (messages.length > 0) {
      localStorage.setItem('bookztron_chat_history', JSON.stringify(messages));
    }
  }, [messages]);

  // Auto scroll to bottom
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  // Unread indicator
  useEffect(() => {
    if (!isOpen && messages.length > 0 && messages[messages.length - 1].role === 'bot') {
      setHasUnread(true);
    }
  }, [messages, isOpen]);

  const handleToggle = () => {
    setIsOpen(!isOpen);
    if (!isOpen) {
      setHasUnread(false);
    }
  };

  const handleSendMessage = async () => {
    if (!inputValue.trim()) return;

    const userMessage = {
      role: 'user',
      content: inputValue.trim(),
      timestamp: new Date().toISOString()
    };

    setMessages(prev => [...prev, userMessage]);
    setInputValue('');
    setIsTyping(true);

    try {
      const conversationHistory = messages.slice(-10).map(msg => ({
        role: msg.role,
        content: msg.content
      }));

      const response = await axios.post('http://localhost:5000/api/chatbot/message', {
        message: userMessage.content,
        conversationHistory
      });

      const botMessage = {
        role: 'bot',
        content: response.data.reply,
        timestamp: new Date().toISOString()
      };

      setMessages(prev => [...prev, botMessage]);
    } catch (error) {
      console.error('Lỗi gửi tin nhắn:', error);
      const errorMessage = {
        role: 'bot',
        content: 'Xin lỗi, tôi gặp sự cố kỹ thuật. Vui lòng thử lại sau! 🙏',
        timestamp: new Date().toISOString()
      };
      setMessages(prev => [...prev, errorMessage]);
    } finally {
      setIsTyping(false);
    }
  };

  const handleQuickReply = async (action) => {
    try {
      const response = await axios.post('http://localhost:5000/api/chatbot/quick-reply', {
        action
      });

      const botMessage = {
        role: 'bot',
        content: response.data.reply,
        timestamp: new Date().toISOString()
      };

      setMessages(prev => [...prev, botMessage]);
    } catch (error) {
      console.error('Lỗi quick reply:', error);
    }
  };

  const handleKeyPress = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  const clearChat = () => {
    if (window.confirm('Bạn có chắc muốn xóa lịch sử chat?')) {
      setMessages([{
        role: 'bot',
        content: 'Lịch sử đã được xóa. Tôi có thể giúp gì cho bạn? 😊',
        timestamp: new Date().toISOString()
      }]);
      localStorage.removeItem('bookztron_chat_history');
    }
  };

  return (
    <div className="chatbot-widget">
      {/* Floating Button */}
      <button 
        className={`chatbot-toggle-btn ${isOpen ? 'open' : ''}`}
        onClick={handleToggle}
        title="Chat với Bookztron"
      >
        {isOpen ? (
          <span className="close-icon">✕</span>
        ) : (
          <>
            <span className="chat-icon">💬</span>
            {hasUnread && <span className="unread-badge"></span>}
          </>
        )}
      </button>

      {/* Chat Window */}
      {isOpen && (
        <div className="chatbot-window">
          {/* Header */}
          <div className="chatbot-header">
            <div className="header-info">
              <div className="bot-avatar">🤖</div>
              <div>
                <h3>Bookztron Bot</h3>
                <p className="status">
                  <span className="status-dot"></span>
                  Trực tuyến
                </p>
              </div>
            </div>
            <button className="clear-btn" onClick={clearChat} title="Xóa lịch sử">
              🗑️
            </button>
          </div>

          {/* Messages */}
          <div className="chatbot-messages">
            {messages.map((msg, index) => (
              <div key={index} className={`message ${msg.role}`}>
                {msg.role === 'bot' && <div className="message-avatar">🤖</div>}
                <div className="message-bubble">
                  <div className="message-content">{msg.content}</div>
                  <div className="message-time">
                    {new Date(msg.timestamp).toLocaleTimeString('vi-VN', { 
                      hour: '2-digit', 
                      minute: '2-digit' 
                    })}
                  </div>
                </div>
                {msg.role === 'user' && <div className="message-avatar user-avatar">👤</div>}
              </div>
            ))}

            {isTyping && (
              <div className="message bot typing-indicator">
                <div className="message-avatar">🤖</div>
                <div className="message-bubble">
                  <div className="typing-dots">
                    <span></span>
                    <span></span>
                    <span></span>
                  </div>
                </div>
              </div>
            )}

            <div ref={messagesEndRef} />
          </div>

          {/* Quick Replies */}
          <div className="quick-replies">
            {quickReplies.map(reply => (
              <button
                key={reply.id}
                className="quick-reply-btn"
                onClick={() => handleQuickReply(reply.id)}
              >
                {reply.icon} {reply.label}
              </button>
            ))}
          </div>

          {/* Input */}
          <div className="chatbot-input">
            <textarea
              value={inputValue}
              onChange={(e) => setInputValue(e.target.value)}
              onKeyPress={handleKeyPress}
              placeholder="Nhập tin nhắn..."
              rows="1"
              disabled={isTyping}
            />
            <button 
              className="send-btn"
              onClick={handleSendMessage}
              disabled={!inputValue.trim() || isTyping}
            >
              ➤
            </button>
          </div>

          {/* Footer */}
          <div className="chatbot-footer">
            <small>Powered by Gemini AI ✨</small>
          </div>
        </div>
      )}
    </div>
  );
}

export { ChatbotWidget };
