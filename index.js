const express = require('express');
const mongoose = require('mongoose');
const path = require('path');
const app = express();
const PORT = process.env.PORT || 3000;

app.use(express.json());

const authRouter = require('./routes/auth');
const profileRouter = require('./routes/profile');
const userRouters = require('./router/user');
const chickenBreastRouter = require('./router/ChickenBreastRouter');
const recipeRouter = require('./router/recipeRouter');

// MongoDB 연결
mongoose.connect('mongodb+srv://tjdwns8083:12345@cluster0.yfjlzuv.mongodb.net/myDatabaseName?retryWrites=true&w=majority')
  .then(() => console.log('mongodb connected'))
  .catch(err => console.log('MongoDB connection error:', err));

// 정적 파일 제공 (필요할 경우)
app.use(express.static(path.join(__dirname, 'public')));

// 루트 경로에 대한 핸들러 추가
app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

// API 라우트 설정
app.use('/api/auth', authRouter);
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
