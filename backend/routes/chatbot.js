const express = require('express');
const router = express.Router();
const chatbotController = require('../controllers/chatbotController');

// @route   POST api/chatbot/message
// @desc    Gửi tin nhắn và nhận phản hồi từ AI
// @access  Public (không cần auth)
router.post('/message', chatbotController.sendMessage);

// @route   POST api/chatbot/quick-reply
// @desc    Xử lý quick reply buttons
// @access  Public
router.post('/quick-reply', chatbotController.handleQuickReply);

module.exports = router;
