const jwt = require('jsonwebtoken')
const User = require('../models/User')

// 인증 미들웨어
const protect = async (req, res, next) => {
  let token

  if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
    try {
      token = req.headers.authorization.split(' ')[1]
      const decoded = jwt.verify(token, process.env.JWT_SECRET)

      req.user = await User.findById(decoded.id).select('-password')
      console.log("Authenticated user:", req.user)
      next();
    } catch (error) {
      res.status(401).json({ message: '인증에 실패했습니다. 토큰이 유효하지 않습니다.' })
    }
  }

  if (!token) {
    res.status(401).json({ message: '토큰이 없습니다. 인증이 거부되었습니다.' })
  }
}

module.exports = protect