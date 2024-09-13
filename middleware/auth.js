const jwt = require('jsonwebtoken');
const User = require("../models/User")
require('dotenv').config(); // .env 파일의 환경 변수를 로드


// 인증 미드웨어
const protect = async (req, res, next) => {
  let token

  if (!token) {
    return res.status(401).json({ message: '토큰이 없습니다. 인증이 거부되었습니다.' });
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    req.user = decoded;
    next();
  } catch (err) {
    res.status(400).json({ message: 'Token is not valid' });
  }
}

module.exports = auth;
