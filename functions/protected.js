const path = require('path');
require('dotenv').config({ path: path.resolve(__dirname, '../.env') });

const verifyToken = require('./verifyToken');

exports.handler = async (event) => {
  try {
    const { userId, role } = verifyToken(event);

    // ✅ Authorized access logic here
    return {
      statusCode: 200,
      headers: {
        'Access-Control-Allow-Origin': process.env.FRONTEND_URL || '*',
        'Access-Control-Allow-Headers': 'Content-Type, Authorization',
        'Access-Control-Allow-Credentials': 'true',
      },
      body: JSON.stringify({
        message: '✅ You are authorized',
        userId,
        role,
      }),
    };
  } catch (err) {
    return {
      statusCode: 401,
      headers: {
        'Access-Control-Allow-Origin': process.env.FRONTEND_URL || '*',
        'Access-Control-Allow-Headers': 'Content-Type, Authorization',
        'Access-Control-Allow-Credentials': 'true',
      },
      body: JSON.stringify({
        error: err.message,
      }),
    };
  }
};
