const jwt = require('jsonwebtoken');

const verifyToken = (event) => {
  const authHeader = event.headers['authorization'] || event.headers['Authorization'];

  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    throw new Error('Unauthorized: No token provided');
  }

  const token = authHeader.split(' ')[1];

  try {
    // ✅ VERIFY the JWT using the same secret
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    return decoded; // { userId, role }
  } catch (err) {
    throw new Error('Unauthorized: Invalid or expired token');
  }
};

module.exports = verifyToken;
