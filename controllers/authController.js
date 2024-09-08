const passport = require('passport')
const User = require('../models/User');
const bcrypt = require('bcryptjs');
const nodemailer = require('nodemailer');
const { validationResult } = require('express-validator');

// 회원가입 처리
exports.signup = async (req, res) => {
    console.log(req.body);

    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() });
    }

    const { username, email, password, provider = 'local' } = req.body;

    try {
        const existingUser = await User.findOne({ $or: [{ email }, { username }] });
        if (existingUser) {
            return res.status(400).json({ message: 'Email or Username already exists' });
        }

        const user = new User({
            username,
            email,
            password, // 비밀번호 평문
            provider
        });

        // 비밀번호 해싱
        await user.save();
        res.status(201).json({ message: 'User created successfully' });
    } catch (err) {
        res.status(500).json({ message: 'Server error', error: err.message });
    }
};

// 사용자 로그인 처리
exports.login = (req, res, next) => {
    passport.authenticate('local', async (err, user, info) => {
        if (err) {
            console.error('Authentication error:', err);
            return next(err);
        }
        if (!user || !(await user.comparePassword(req.body.password))) {
            return res.status(400).json({ message: 'Invalid credentials' });
        }

        req.logIn(user, (err) => {
            if (err) {
                console.error('Login error:', err);
                return next(err);
            }
            console.log('User logged in:', user);
            req.session.user = user; 
            return res.json({ 
                message: 'Logged in successfully',
                user: {
                    _id: user._id,
                    username: user.username,
                    email: user.email
                }
            });
        });
    })(req, res, next);
};



  
// 현재 로그인된 사용자 정보 반환
exports.getCurrentUser = (req, res) => {
    if (req.isAuthenticated()) {
        return res.json({
            email: req.user.email,
            username: req.user.username,
            chickens: req.user.recommendedChickens // 사용자에게 추천된 닭가슴살 목록
        });
    } else {
        return res.status(401).json({ message: 'Unauthorized' });
    }
};
// 이메일로 사용자 이름 찾기
exports.findUsername = async (req, res) => {
    const { email } = req.body;

    try {
        const user = await User.findOne({ email });
        if (!user) {
            return res.status(404).json({ message: 'No user found with this email' });
        }

        res.status(200).json({ username: user.username });
    } catch (err) {
        console.error('Error in findUsername:', err); // 에러 메시지 전체 출력
        res.status(500).json({ message: 'Server error', error: err.message });
    }
};

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
        const user = await User.findOne({ email });
        if (!user) {
            return res.status(404).json({ message: 'No user found with this email' });
        }

        // 비밀번호 재설정 토큰 생성
        const token = jwt.sign({ id: user._id }, process.env.JWT_SECRET, { expiresIn: '1h' });
        const resetLink = `http://localhost:8000/auth/reset-password/${token}`;

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
        console.error('Error in resetPasswordRequest:', err); // 에러 메시지 전체 출력
        res.status(500).json({ message: 'Server error', error: err.message });
    }
};

// 비밀번호 재설정 처리
exports.resetPassword = async (req, res) => {
    const { token, newPassword } = req.body;

    try {
        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        const user = await User.findById(decoded.id);

        if (!user) {
            return res.status(404).json({ message: 'Invalid or expired token' });
        }

        const hashedPassword = await bcrypt.hash(newPassword, 10);
        console.log('Hashed password at signup:', hashedPassword);  // 해싱된 비밀번호 로그 출력
        user.password = hashedPassword;
        await user.save();

        res.status(200).json({ message: 'Password has been reset successfully' });
    } catch (err) {
        console.error('Error in resetPassword:', err); // 에러 메시지 전체 출력
        res.status(500).json({ message: 'Server error', error: err.message });
    }
};