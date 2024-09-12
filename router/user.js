const User = require('../models/User'); // 이미 정의된 User 모델을 사용
// const bcrypt = require('bcryptjs');
const express = require('express');
const router = express.Router();

// 회원가입 라우트 
router.post('/signup', async (req, res) => {
    try {
        const { username, email, password } = req.body;
        const newUser = new User({ username, email, password });
        await newUser.save();
        res.status(201).json({ message: 'User created successfully' });
    } catch (err) {
        res.status(500).json({ message: 'Error creating user', error: err });
    }
});

// 로그인 라우트 
router.post('/login', async (req, res) => {
    try {
        const { email, password } = req.body;
        const user = await User.findOne({ email });
        if (!user || !(await user.comparePassword(password))) {
            return res.status(401).json({ message: 'Invalid email or password' });
        }
        // 로그인 성공 처리
        res.status(200).json({ message: 'Login successful', user });
    } catch (err) {
        res.status(500).json({ message: 'Login error', error: err });
    }
});

module.exports = router;