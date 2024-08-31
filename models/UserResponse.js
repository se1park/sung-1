// models/UserResponse.js
const mongoose = require('mongoose');

const UserResponseSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  answers: [{ question: String, answer: String }],
  createdAt: { type: Date, default: Date.now }
});

const UserResponse = mongoose.model('UserResponse', UserResponseSchema, 'userresponses');

module.exports = UserResponse;
