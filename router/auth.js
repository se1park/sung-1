const express = require('express');
const passport = require('passport');
const authController = require('../controllers/authController');
const User = require('../models/User'); // 사용자 모델
const protect = require('../middleware/auth');
const { body } = require('express-validator');
const router = express.Router();


// 회원가입 라우트
router.post('/signup', [
  body('username').notEmpty().withMessage('사용자 이름을 입력하세요'),
  body('email').isEmail().withMessage('유효한 이메일을 입력하세요'),
  body('password').isLength({ min: 6 }).withMessage('비밀번호는 최소 6자 이상이어야 합니다'),
], authController.signup);

// 로그인 라우트
router.post('/login', authController.login);

// 현재 로그인된 사용자 정보 반환
router.get('/user', protect, authController.checkLoginStatus); 

// 이메일로 사용자 이름 찾기
router.post('/find-username', authController.findUsername);

// 비밀번호 재설정 요청
router.post('/reset-password-request', authController.resetPasswordRequest);

// 비밀번호 재설정 처리
router.post('/reset-password', authController.resetPassword);


// 카카오 로그인 라우트
router.get('/kakao', passport.authenticate('kakao'));

// 카카오 로그인 콜백 라우트
router.get('/kakao/callback', passport.authenticate('kakao', {
  successRedirect: '/',  // 성공 시 리다이렉트할 경로
  failureRedirect: '/'   // 실패 시 리다이렉트할 경로
}));

// 구글 로그인 라우트
router.get('/google', passport.authenticate('google', { scope: ['profile', 'email'] }));

// 구글 로그인 콜백 라우트
router.get('/google/callback', passport.authenticate('google', {
  successRedirect: '/',  // 성공 시 리다이렉트할 경로
  failureRedirect: '/'   // 실패 시 리다이렉트할 경로
}));

// 네이버 로그인 라우트
router.get('/naver', passport.authenticate('naver', { scope: ['email'] }));

// 네이버 로그인 콜백 라우트
router.get('/naver/callback', passport.authenticate('naver', {
  successRedirect: '/', // 성공 시 리다이렉트할 경로
  failureRedirect: '/'  // 실패 시 리다이렉트할 경로           
}));

module.exports = router;
