const User = require('../models/User');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const nodemailer = require('nodemailer');
const { validationResult } = require('express-validator');

// 회원가입 처리
exports.signup = async (req, res) => {
    console.log(req.body); // 요청 데이터를 로그로 출력하여 디버깅

    // 입력값 검증 결과 확인
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        console.log('Validation errors:', errors.array());  // 검증 오류 로그 출력
        return res.status(400).json({ errors: errors.array() });
    }

    const { username, email, password, provider = 'local' } = req.body;

    try {
        // 이미 존재하는 이메일 또는 사용자 이름 확인
        const existingUser = await User.findOne({ $or: [{ email }, { username }] });
        if (existingUser) {
            console.log('User already exists:', existingUser);  // 이미 존재하는 사용자 로그 출력
            return res.status(400).json({ message: 'Email or Username already exists' });
        }

        // 비밀번호 해싱
        const hashedPassword = await bcrypt.hash(password, 10);
        console.log('Hashed password:', hashedPassword);  // 해싱된 비밀번호 로그 출력

        // 새 사용자 생성 및 저장
        const user = new User({
            username,
            email,
            password: hashedPassword,
            provider
        });

        await user.save();
        console.log('User created successfully:', user);  // 생성된 사용자 로그 출력

        res.status(201).json({ message: 'User created successfully' });
    } catch (err) {
        console.error('Server error:', err);  // 서버 에러 로그 출력
        res.status(500).json({ message: 'Server error', error: err.message });
    }
};

// 사용자 로그인 처리
exports.login = async (req, res) => {
    // 입력값 검증
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() });
    }

    const { email, password } = req.body;

    try {
        // 사용자 이메일로 찾기
        const user = await User.findOne({ email });
        if (!user) {
            return res.status(400).json({ message: 'Invalid email or password' });
        }

        // 비밀번호 비교
        const isMatch = await bcrypt.compare(password, user.password);
        if (!isMatch) {
            return res.status(400).json({ message: 'Invalid email or password' });
        }

    } catch (err) {
        res.status(500).json({ message: 'Server error', error: err.message });
    }
};

// 이메일로 사용자 이름 찾기
exports.findUsername = async (req, res) => {
    const { email } = req.body;

    try {
        // 이메일로 사용자 찾기
        const user = await User.findOne({ email });
        if (!user) {
            return res.status(404).json({ message: 'No user found with this email' });
        }

        res.status(200).json({ username: user.username });
    } catch (err) {
        console.error('Error in findUsername:', err); // 에러 메시지 전체 출력
        res.status(500).json({ message: 'Server error', error: err.message });
    }
}


// 이메일 설정 가져오기
function getEmailConfig(index) {
    const emailService = process.env[`EMAIL_SERVICE_${index}`];
    const emailUser = process.env[`EMAIL_USER_${index}`];
    const emailPass = process.env[`EMAIL_PASS_${index}`];

    if (!emailService || !emailUser || !emailPass) {
        throw new Error(`Email configuration for index ${index} is missing`);
    }

    return { emailService, emailUser, emailPass };
}

// 비밀번호 재설정 요청 처리
exports.resetPasswordRequest = async (req, res) => {
    const { email } = req.body;

    try {
        // 이메일로 사용자 찾기
        const user = await User.findOne({ email });
        if (!user) {
            return res.status(404).json({ message: 'No user found with this email' });
        }

        // 비밀번호 재설정 토큰 생성
        const token = jwt.sign({ id: user._id }, process.env.JWT_SECRET, { expiresIn: '1h' });
        const resetLink = `http://localhost:8000/auth/reset-password/${token}`;

        // 이메일 전송 설정
        const { emailService, emailUser, emailPass } = getEmailConfig(1);

        const transporter = nodemailer.createTransport({
            service: emailService,
            auth: {
                user: emailUser,
                pass: emailPass
            }
        });

        const mailOptions = {
            from: emailUser,
            to: email,
            subject: 'Password Reset Request',
            html: `<p>Click the link below to reset your password:</p>
                   <a href="${resetLink}">${resetLink}</a>`
        };

        await transporter.sendMail(mailOptions);

        res.status(200).json({ message: 'Password reset link has been sent to your email' });
    } catch (err) {
        res.status(500).json({ message: 'Server error', error: err.message });
    }
};

// 비밀번호 재설정 처리
exports.resetPassword = async (req, res) => {
    const { token, newPassword } = req.body;

    try {
        // 토큰 검증 및 사용자 찾기
        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        const user = await User.findById(decoded.id);

        if (!user) {
            return res.status(404).json({ message: 'Invalid or expired token' });
        }

        // 새 비밀번호 해싱 및 저장
        const hashedPassword = await bcrypt.hash(newPassword, 10);
        user.password = hashedPassword;
        await user.save();

        res.status(200).json({ message: 'Password has been reset successfully' });
    } catch (err) {
        res.status(500).json({ message: 'Server error', error: err.message });
    }
};
