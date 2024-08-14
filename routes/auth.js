// routes/auth.js
const express = require('express');
const { signup, login } = require('../controllers/authController');
const router = express.Router();

router.post('/signup', signup);  // 사용자 등록 라우트
router.post('/login', login);    // 로그인 라우트

module.exports = router;
