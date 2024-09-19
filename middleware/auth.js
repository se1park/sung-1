const jwt = require('jsonwebtoken');
require('dotenv').config();

// 인증 미들웨어
const protect = async (req, res, next) => {
  const token = req.cookies.accessToken || req.headers['authorization']?.split(' ')[1];

  if (!token) {
    return res.status(401).json({ message: '토큰이 없습니다. 인증이 거부되었습니다.' });
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    req.user = decoded; 

    next();
  } catch (err) {
    res.status(400).json({ message: '유효하지 않은 토큰입니다.' });
  }
}

module.exports = protect;
