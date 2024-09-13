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
            return res.status(400).json({ message: '이메일 또는 사용자 이름이 존재하지 않습니다.' });
        }

        const user = new User({
            username,
            email,
            password, // 비밀번호 평문
            provider
        });

        // 비밀번호 해싱
        await user.save();
        res.status(201).json({ message: '사용자가 성공적으로 생성되었습니다.' });
    } catch (err) {
        res.status(500).json({ message: '서버 오류가 발생했습니다.', error: err.message });
    }
};

// 사용자 로그인 처리
exports.login = (req, res, next) => {
    passport.authenticate('local', async (err, user, info) => {
        if (err) {
            console.error('인증 오류:', err);
            return next(err);
        }
        if (!user || !(await user.comparePassword(req.body.password))) {
            return res.status(400).json({ message: '유효하지 않은 자격 증명입니다.' });
        }

        req.logIn(user, (err) => {
            if (err) {
                console.error('로그인 오류:', err);
                return next(err);
            }
            console.log('사용자 로그인됨:', user);
            req.session.user = user; 
            return res.json({ 
                message: '성공적으로 로그인 되었습니다.',
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
        return res.status(401).json({ message: '인증되지 않았습니다.' });
    }
};
// 이메일로 사용자 이름 찾기
exports.findUsername = async (req, res) => {
    const { email } = req.body;

    try {
        const user = await User.findOne({ email });
        if (!user) {
            return res.status(404).json({ message: '이 이메일로 등록된 사용자가 없습니다.' });
        }

        res.status(200).json({ username: user.username });
    } catch (err) {
        console.error('findUsername 오류:', err); // 에러 메시지 전체 출력
        res.status(500).json({ message: '서버 오류가 발생했습니다.', error: err.message });
    }
};

// 이메일 설정 가져오기
function getEmailConfig(index) {
    const emailService = process.env[`EMAIL_SERVICE_${index}`];
    const emailUser = process.env[`EMAIL_USER_${index}`];
    const emailPass = process.env[`EMAIL_PASS_${index}`];

    if (!emailService || !emailUser || !emailPass) {
        throw new Error(`인덱스 ${index}에 대한 이메일 설정이 없습니다.`);
    }

    return { emailService, emailUser, emailPass };
}

// 비밀번호 재설정 요청 처리
exports.resetPasswordRequest = async (req, res) => {
    const { email } = req.body;

    try {
        const user = await User.findOne({ email });
        if (!user) {
            return res.status(404).json({ message: '이 이메일로 등록된 사용자가 없습니다.' });
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
            subject: '비밀번호 재설정 요청',
            html: `<p>아래 링크를 클릭하여 비밀번호를 재설정하세요:</p>
                   <a href="${resetLink}">${resetLink}</a>`
        };

        await transporter.sendMail(mailOptions);

        res.status(200).json({ message: '비밀번호 재설정 링크가 이메일로 발송되었습니다.' });
    } catch (err) {
        console.error('resetPassWordRequest 오류:', err); // 에러 메시지 전체 출력
        res.status(500).json({ message: '서버 오류가 발생했습니다.', error: err.message });
    }
};

// 비밀번호 재설정 처리
exports.resetPassword = async (req, res) => {
    const { token, newPassword } = req.body;

    try {
        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        const user = await User.findById(decoded.id);

        if (!user) {
            return res.status(404).json({ message: '유효하지 않거나 만료된 토큰입니다.' });
        }

        const hashedPassword = await bcrypt.hash(newPassword, 10);
        console.log('회원가입 시 해싱된 비밀번호:', hashedPassword);  // 해싱된 비밀번호 로그 출력
        user.password = hashedPassword;
        await user.save();

        res.status(200).json({ message: '비밀번호가 성공적으로 재설정되었습니다.' });
    } catch (err) {
        console.error('resetPassword 오류:', err); // 에러 메시지 전체 출력
        res.status(500).json({ message: '서버 오류가 발생했습니다.', error: err.message });
    }
};