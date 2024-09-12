const express = require('express');
const passport = require('passport');
const { signup, login, findUsername, resetPasswordRequest, resetPassword, getCurrentUser } = require('../controllers/authController'); // getCurrentUser 가져오기
const { check, validationResult } = require('express-validator');
const User = require('../models/User'); // 사용자 모델
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


// 비밀번호 재설정 요청 처리
router.post('/reset-password-request', resetPasswordRequest);

// 비밀번호 재설정 처리
router.post('/reset-password', resetPassword);

// 추천받은 제품 저장
router.post('/save-recommendation', async (req, res) => {
  const { userId, products } = req.body; // 사용자 ID와 추천받은 제품
  try {
      const user = await User.findById(userId);
      if (!user) {
          return res.status(404).json({ message: '사용자를 찾을 수 없습니다.' });
      }
      // 추천받은 제품을 사용자 모델에 저장
      user.recommendations = products;
      await user.save();
      res.status(200).json({ message: '추천 제품이 저장되었습니다.' });
  } catch (error) {
      res.status(500).json({ message: '서버 오류가 발생했습니다.' });
  }
});


module.exports = router;
