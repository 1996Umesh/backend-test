const verifyToken = require('./verifyToken');

exports.handler = async (event) => {
  try {
    const { userId, role } = verifyToken(event);

    // ✅ Protected logic here (example: return user info)
    return {
      statusCode: 200,
      body: JSON.stringify({ message: 'You are authorized', userId, role })
    };
  } catch (err) {
    return {
      statusCode: 401,
      body: JSON.stringify({ error: err.message })
    };
  }
};
