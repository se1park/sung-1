// const express = require('express');
// const mongoose = require('mongoose');
// const cors = require('cors');
// const chickenBreastRouter = require('./router/ChickenBreastRouter');

// const app = express();

// app.use(express.json()); // JSON 요청을 처리하도록 설정
// app.use(cors({ origin: '*' })); // CORS 설정

// // MongoDB 연결
// mongoose.connect('mongodb://localhost:27017/ouruser') 
//   .then(() => console.log('MongoDB connected'))
//   .catch(err => console.log(err));

// const db = mongoose.connection;
// db.on('error', console.error.bind(console, 'connection error:'));
// db.once('open', function() {
//   console.log('Connected to MongoDB');
// });

// // API 라우터 등록
// app.use('/api/chicken-breast', chickenBreastRouter);

// // 에러 핸들링 미들웨어
// app.use((err, req, res, next) => {
//     console.error(err.stack);
//     res.status(500).send('Something broke!');
// });

// // 서버 시작
// const PORT = process.env.PORT || 8000;
// app.listen(PORT, () => {
//     console.log(`Server is running on port ${PORT}`);
// });

// module.exports = app; // 서버 시작 파일에서 app을 사용할 수 있도록 export
