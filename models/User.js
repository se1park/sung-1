const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const userSchema = new mongoose.Schema({
    username: { type: String, required: true, unique: true }, // 필수 필드로 설정
    email: { type: String, required: true, unique: true },
    password: { type: String },  // 비밀번호는 소셜 로그인 시 없을 수 있음
    provider: { type: String, default: 'local' }  // 가입 경로: 'local', 'kakao', 'google'
});

// 비밀번호가 존재할 때만 해싱 처리
userSchema.pre('save', async function(next) {
    if (!this.password || !this.isModified('password')) {
        return next();  // 비밀번호가 없거나 변경되지 않았으면 해싱하지 않음
    }
    try {
        this.password = await bcrypt.hash(this.password, 10);
        next();
    } catch (err) {
        next(err);
    }
});

module.exports = mongoose.model('User', userSchema);
