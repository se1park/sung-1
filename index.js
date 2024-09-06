const express = require('express');
const path = require('path');
const cors = require('cors');
const session = require('express-session');
const passport = require('passport');
const mongoose = require('mongoose');
require('dotenv').config();

// Express 앱 생성
const app = express();
const PORT = process.env.PORT || 8000;

// Passport 설정
require('./config/passport')(passport); // passport 설정 불러오기

// CORS 설정
app.use(cors());

// 세션 설정
app.use(session({
  secret: process.env.SESSION_SECRET,
  resave: false,
  saveUninitialized: true
}));

app.use(passport.initialize());
app.use(passport.session());

// JSON 파싱
app.use(express.json());

// 라우터 가져오기
const authRouter = require('./routes/auth');
const userRouters = require('./router/user');
const chickenBreastRouter = require('./router/ChickenBreastRouter'); 
const recipeRouter = require('./router/recipeRouter');

// MongoDB URI를 환경 변수에서 가져오기
const mongoURI = process.env.MONGO_URI || 'mongodb://localhost:27017/ouruser';

// MongoDB 연결
mongoose.connect(mongoURI)
  .then(() => console.log('MongoDB connected'))
  .catch(err => console.log(err));

// 정적 파일 제공
app.use(express.static(path.join(__dirname, 'public')));

// 루트 경로에 대한 핸들러 추가
app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

// 대시보드 경로 추가
app.get('/dashboard', (req, res) => {
  if (req.isAuthenticated()) {
    res.send('<h1>Welcome to your dashboard</h1>');
  } else {
    res.redirect('/');
  }
});

// 추천 로직 엔드포인트
app.use('/api/chicken-breast', chickenBreastRouter);

// API 라우트 설정
app.use('/auth', authRouter);
app.use('/api/users', userRouters);
app.use('/api/recipes', recipeRouter);

// 에러 처리 미들웨어
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({ message: 'Internal Server Error' });
});

// 서버 시작
app.listen(PORT, () => {
  console.log(`Server is running on http://localhost:${PORT}`);
});
