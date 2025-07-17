const path = require('path');
require('dotenv').config({ path: path.resolve(__dirname, '../.env') }); // ✅ Load .env from root

const jwt = require('jsonwebtoken');

const verifyToken = (event) => {
  const authHeader = event.headers['authorization'] || event.headers['Authorization'];
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    throw new Error('Unauthorized: No token provided');
  }

  const token = authHeader.split(' ')[1];

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET); // ✅ JWT_SECRET is now loaded
    return decoded; // { userId, role }
  } catch (err) {
    throw new Error('Unauthorized: Invalid or expired token');
  }
};

module.exports = verifyToken;
