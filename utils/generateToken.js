const jwt = require("jsonwebtoken");

const getnerateToken = (id) => {
    return jwt.sign({ id }, process.env.JWT_SECRET, { expiresIn: '1h'})
}

module.exports = getnerateToken