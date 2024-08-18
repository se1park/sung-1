const express = require('express');
const mongoose = require('mongoose');
const passport = require('passport'); 
const path = require('path');
const session = require('express-session'); 
const cors = require('cors');  

const app = express();
const PORT = process.env.PORT || 8000;

require('dotenv').config();
require('./config/passport')(passport); // passport 설정 불러오기

// 세션 설정 (필수)
app.use(session({
  secret: process.env.SESSION_SECRET,  // 세션 암호화 키
  resave: false,
  saveUninitialized: true
}));

app.use(passport.initialize());
app.use(passport.session());  // 세션에 passport 연결

app.use(express.json());
app.use(cors());

const authRouter = require('./routes/auth');
const profileRouter = require('./routes/profile');
const userRouters = require('./router/user');
const chickenBreastRouter = require('./router/ChickenBreastRouter');
const recipeRouter = require('./router/recipeRouter');

// MongoDB 연결
mongoose.connect('mongodb+srv://tjdwns8083:12345@cluster0.yfjlzuv.mongodb.net/ouruser?retryWrites=true&w=majority')
  .then(() => console.log('mongodb connected'))
  .catch(err => console.log('MongoDB connection error:', err));

// 정적 파일 제공 (필요할 경우)
app.use(express.static(path.join(__dirname, 'public')));

// 루트 경로에 대한 핸들러 추가
app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

// 대시보드 경로 추가
app.get('/dashboard', (req, res) => {
  if (req.isAuthenticated()) {
    res.send('<h1>Welcome to your dashboard</h1>');  // 로그인 성공 시 표시할 내용
  } else {
    res.redirect('/');  // 로그인되지 않은 경우 루트로 리다이렉트
  }
});

// API 라우트 설정
app.use('/auth', authRouter); // auth 라우트 추가
app.use('/api/profile', profileRouter);
app.use('/api/users', userRouters);
app.use('/api/chickenBreasts', chickenBreastRouter);
app.use('/api/recipes', recipeRouter);

// 에러 처리 미들웨어 (선택 사항)
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({ message: 'Internal Server Error' });
});

// 서버 시작
app.listen(PORT, () => {
  console.log(`Server is running on http://localhost:${PORT}`);
});
