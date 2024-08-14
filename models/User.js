// models/User.js
const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const userSchema = new mongoose.Schema({
    username: { type: String, required: true, unique: true }, // 필수 필드로 설정
    email: { type: String, required: true, unique: true },
    password: { type: String, required: true },
    preferences: [String], 
     // 예: ['high-protein', 'low-fat']
});

userSchema.pre('save', async function(next) {
    if (!this.isModified('password')) return next();
    this.password = await bcrypt.hash(this.password, 10);
    next();
});

module.exports = mongoose.model('User', userSchema);
