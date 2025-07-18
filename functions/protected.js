require('dotenv').config(); // 👈 make sure this is present
const verifyToken = require('./verifyToken');

exports.handler = async (event) => {
  try {
    const { userId, role } = verifyToken(event);

    return {
      statusCode: 200,
      body: JSON.stringify({ message: 'Authorized', userId, role })
    };
  } catch (err) {
    return {
      statusCode: 401,
      body: JSON.stringify({ error: err.message })
    };
  }
};
