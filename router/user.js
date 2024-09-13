const User = require('../models/User'); // 이미 정의된 User 모델을 사용
// const bcrypt = require('bcryptjs');
const express = require('express');
const { check, validationResult } = require('express-validator');
const router = express.Router();

// 회원가입 라우트 
router.post('/signup', [
    check('username', '사용자 이름은 필수입니다.').notEmpty(),
    check('email', '유효한 이메일 주소를 입력해 주세요.').isEmail(),
    check('password', '비밀번호는 6자 이상이어야 합니다.').isLength({ min: 6 })
  ], async (req, res) => {
    // 유효성 검사
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }
    
    // signup 컨트롤러 호출
    await signup(req, res);
  });
  

// 로그인 라우트 
router.post('/login', async (req, res) => {
    try {
        const { email, password } = req.body;
        const user = await User.findOne({ email });
        if (!user || !(await user.comparePassword(password))) {
            return res.status(401).json({ message: '이메일 또는 비밀번호가 잘못되었습니다.' });
        }
        // 로그인 성공 처리
        res.status(200).json({ message: '로그인 성공 했습니다.', user });
    } catch (err) {
        res.status(500).json({ message: '로그인 에러가 발생했습니다.', error: err });
    }
});

module.exports = router;