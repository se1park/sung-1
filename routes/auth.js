const express = require('express');
const passport = require('passport');
const { signup, login, findUsername, resetPasswordRequest, resetPassword, getCurrentUser } = require('../controllers/authController'); // getCurrentUser 가져오기
const { check, validationResult } = require('express-validator');
const router = express.Router();

// 회원가입 처리
router.post('/signup', [
  check('username', 'Username is required').notEmpty(),
  check('email', 'Please provide a valid email').isEmail(),
  check('password', 'Password must be 6 or more characters').isLength({ min: 6 })
], async (req, res) => {
  // 유효성 검사
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ errors: errors.array() });
  }
  
  // signup 컨트롤러 호출
  await signup(req, res);
});

// 로그인 처리
router.post('/login', login);

// 현재 사용자 정보 가져오기
router.get('/user', getCurrentUser); // 수정된 부분

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

// 아이디 찾기 처리
router.post('/find-username', (req, res) => {
  console.log('find-username route hit');
  findUsername(req, res);
});

// GET /signup 라우트 추가
router.get('/signup', (req, res) => {
  res.send('');
});

// 비밀번호 재설정 요청 처리
router.post('/reset-password-request', resetPasswordRequest);

// 비밀번호 재설정 처리
router.post('/reset-password', resetPassword);

module.exports = router;
