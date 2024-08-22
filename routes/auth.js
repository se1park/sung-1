const express = require('express');
const passport = require('passport');  // passport 불러오기
const { signup, login } = require('../controllers/authController');
const router = express.Router();

// 로컬 회원가입
router.post('/signup', signup);
// 로컬 로그인
router.post('/login', login);

// 카카오 로그인 라우트
router.get('/kakao', passport.authenticate('kakao'));

// 카카오 로그인 콜백 라우트
router.get('/kakao/callback', passport.authenticate('kakao', {
  successRedirect: '/dashboard',  // 성공 시 리다이렉트할 경로
  failureRedirect: '/'            // 실패 시 리다이렉트할 경로
}));

// 구글 로그인 라우트
router.get('/google', passport.authenticate('google', { scope: ['profile', 'email'] }));

// 구글 로그인 콜백 라우트
router.get('/google/callback', passport.authenticate('google', {
  successRedirect: '/dashboard',  // 성공 시 리다이렉트할 경로
  failureRedirect: '/'            // 실패 시 리다이렉트할 경로
}));

// 네이버 로그인 라우트
router.get('/naver', passport.authenticate('naver', { scope: ['email']}));

// 네이버 로그인 콜백 라우트
router.get('/naver/callback', passport.authenticate('naver',{
    successRedirect: '/dashboard', // 성공 시 리다이렉트할 경로
    failureRedirect: '/'           // 실패 시 리다이렉트할 경로           
}))

module.exports = router;