const express = require('express');
const router = express.Router();
const authController = require('../controllers/authController');

// @route   POST /api/signup
// @desc    Đăng ký user mới
router.post('/signup', authController.signup);

// @route   POST /api/login
// @desc    Đăng nhập user
router.post('/login', authController.login);

module.exports = router;